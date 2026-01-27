import { SleeperClient } from '../api/services/SleeperClient';
import type { Transaction } from '../api/dtos/LeagueDtos/Transaction';
import type { LeagueUser } from '../api/dtos/LeagueDtos/LeagueUser';
import type { Player } from '../api/dtos/PlayerDtos/Player';
import type {
	TradedPickDto,
	TradedPlayerDto,
	TransactionsPageDto
} from './Dtos/TransactionsPageDto';
import { TransactionStatus } from '$lib/api/Enums/TransactionStatus';
import { PlayersStore } from '$lib/Stores/PlayerStore';
import { get } from 'svelte/store';
import { TransactionType } from '$lib/api/Enums/TransactionType';
import { RostersHelper } from './RostersHelper';
import { UsersStore } from '$lib/Stores/UserStores';
import { StoresHelper } from './StoresHelper';
import { RostersStore } from '$lib/Stores/RosterStore';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { League } from '$lib/api/dtos/LeagueDtos/League';
import { TransactionsStore } from '$lib/Stores/TransactionStore';
import { AddDropType } from '$lib/api/Enums/AddDropType';
import { LeagueHistoryHelper } from '$lib/Utilities/LeagueHistoryHelper';

export class TransactionsHelper {
	public static async GetAllTransactions(): Promise<TransactionsPageDto[]> {
		await StoresHelper.EnsureStoresLoaded();

		let transactions: Transaction[] = get(TransactionsStore);

		transactions = transactions.filter((t) => t.status === TransactionStatus.Complete);

		return TransactionsHelper.MapTransaction(transactions);
	}

	/**
	 * Returns recent transactions across all leagues, limited to a specific count.
	 * This is optimized for fast page loads by stopping once we have enough transactions.
	 */
	public static async GetRecentTransactions(limit: number = 50, offset: number = 0): Promise<TransactionsPageDto[]> {
		const leagues: League[] = await LeagueHistoryHelper.GetLeagueChainFromCurrent();
		if (!leagues.length) return [];

		// Determine current season's max week
		let currentMaxWeek = 18;
		try {
			const nflState = await SleeperClient.GetSportState();
			if (nflState.season_type === 'regular') {
				currentMaxWeek = nflState.display_week ?? 18;
			} else if (nflState.season_type === 'post') {
				currentMaxWeek = 18;
			}
		} catch (error) {
			console.error('Failed to fetch sport state for transactions; defaulting weeks to 18', error);
		}

		// Preload players once for all mapping
		let allPlayers: Record<string, Player> = {};
		try {
			allPlayers = await SleeperClient.GetAllPlayers();
		} catch (error) {
			console.error('Failed to fetch all players for transactions mapping', error);
		}

		const rostersByLeague = new Map<string, Roster[]>();
		const usersByLeague = new Map<string, LeagueUser[]>();
		const all: { transaction: Transaction; league: League }[] = [];

		// Start from most recent league and work backwards
		for (const league of leagues) {
			// Fetch rosters and users once per league
			try {
				const [rosters, users] = await Promise.all([
					SleeperClient.GetRosters(league.league_id),
					SleeperClient.GetLeagueUsers(league.league_id)
				]);
				rostersByLeague.set(league.league_id, rosters);
				usersByLeague.set(league.league_id, users);
			} catch (error) {
				console.error('Failed to fetch rosters/users for league', league.league_id, error);
				continue;
			}

			// Use currentMaxWeek for the current league, 18 for older ones
			const isCurrentLeague = league.league_id === (import.meta.env.VITE_LEAGUE_ID as string);
			const maxWeek = isCurrentLeague ? currentMaxWeek : 18;

			// Fetch weeks from most recent to oldest
			for (let week = maxWeek; week > 0; week--) {
				try {
					const tx = await SleeperClient.GetTransactions(league.league_id, week);
					for (const t of tx) {
						if (t.status === TransactionStatus.Complete) {
							all.push({ transaction: t, league });
						}
					}

					// Sort and check if we have enough transactions (including offset)
					all.sort((a, b) => (b.transaction.created ?? 0) - (a.transaction.created ?? 0));
					
					// Stop early if we have enough transactions plus offset
					if (all.length >= limit + offset) {
						break;
					}
				} catch (error) {
					console.error(
						'Failed to fetch transactions for league/week',
						league.league_id,
						week,
						error
					);
				}
			}

			// If we have enough transactions, stop fetching from older leagues
			if (all.length >= limit + offset) {
				break;
			}
		}

		// Final sort and apply offset + limit
		all.sort((a, b) => (b.transaction.created ?? 0) - (a.transaction.created ?? 0));
		const limitedTransactions = all.slice(offset, offset + limit);

		// Map into TransactionsPageDto using preloaded players/rosters/users
		return limitedTransactions.map(({ transaction, league }) => {
			const users = usersByLeague.get(league.league_id) ?? [];
			const rosters = rostersByLeague.get(league.league_id) ?? [];
			const season = String((league as any).season ?? '');

			const base: TransactionsPageDto = {
				TransactionType: transaction.type as TransactionType,
				TransactionDate: new Date(transaction.created).toLocaleDateString(),
				Season: season,
				Week: transaction.leg
			};

			if (
				transaction.type === TransactionType.Waiver ||
				transaction.type === TransactionType.FreeAgent
			) {
				const initiator = users.find((u) => u.user_id === transaction.creator);
				const addsIds = Object.keys(transaction.adds ?? {});
				const dropsIds = Object.keys(transaction.drops ?? {});

				const mapPlayers = (ids: string[]): TradedPlayerDto[] => {
					return ids.map((playerId) => {
						const p = allPlayers[playerId];
						return {
							PlayerId: playerId,
							PlayerName: p
								? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Unknown Player'
								: 'Unknown Player',
							PlayerPosition: p?.position ?? '',
							PlayerTeam: p?.team ?? ''
						};
					});
				};

				base.WaiverFreeAgent = {
					InitiatorAvatarUrl: initiator?.avatar ?? '',
					UserName: initiator?.display_name ?? '',
					Adds: mapPlayers(addsIds),
					Drops: mapPlayers(dropsIds)
				};
			} else if (transaction.type === TransactionType.Trade) {
				const initiator = users.find((u) => u.user_id === transaction.creator);
				const initiatorRosterId = rosters.find((r) => r.owner_id === transaction.creator)?.roster_id;
				const receiverRosterId = transaction.roster_ids.find(
					(r) => r !== initiatorRosterId
				);
				const receiverRoster = rosters.find((r) => r.roster_id === receiverRosterId);
				const receiver = users.find((u) => u.user_id === receiverRoster?.owner_id);

				const playerIds = Object.keys(transaction.adds ?? {});

				const mapTradePlayers = (forInitiator: boolean): TradedPlayerDto[] => {
					return playerIds
						.filter((playerId) => {
							const toRosterId = (transaction.adds ?? {})[playerId];
							if (!initiatorRosterId) return false;
							return forInitiator
								? toRosterId === initiatorRosterId
								: toRosterId !== initiatorRosterId;
						})
						.map((playerId) => {
							const p = allPlayers[playerId];
							return {
								PlayerId: playerId,
								PlayerName: p
									? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Unknown Player'
									: 'Unknown Player',
								PlayerPosition: p?.position ?? '',
								PlayerTeam: p?.team ?? ''
							};
						});
				};

				const mapDraftPicks = (forInitiator: boolean): TradedPickDto[] => {
					if (!initiatorRosterId) return [];
					return (transaction.draft_picks ?? [])
						.filter((pick) =>
							forInitiator
								? pick.previous_owner_id !== initiatorRosterId
								: pick.previous_owner_id === initiatorRosterId
						)
						.map((pick) => ({
							Year: new Date(pick.season).getFullYear() + 1,
							Round: pick.round
						}));
				};

				base.Trade = {
					InitiatorName: initiator?.display_name ?? '',
					RecieverName: receiver?.display_name ?? '',
					InitiatorPlayersRecieved: mapTradePlayers(true),
					RecieverPlayersRecieved: mapTradePlayers(false),
					InitiatorDraftPicks: mapDraftPicks(true),
					RecieverDraftPicks: mapDraftPicks(false),
					InitiatorAvatarUrl: initiator?.avatar ?? '',
					RecieverAvatarUrl: receiver?.avatar ?? ''
				};
			}

			return base;
		});
	}

	/**
	 * Returns transactions across all leagues in the history chain,
	 * ordered from most recent league/transaction to oldest.
	 */
	public static async GetAllTransactionsAcrossLeagues(): Promise<TransactionsPageDto[]> {
		const leagues: League[] = await LeagueHistoryHelper.GetLeagueChainFromCurrent();
		if (!leagues.length) return [];
		// Determine current season's max week using sport state,
		// fall back to 18 weeks if needed (for past seasons).
		let currentMaxWeek = 18;
		try {
			const nflState = await SleeperClient.GetSportState();
			if (nflState.season_type === 'regular') {
				currentMaxWeek = nflState.display_week ?? 18;
			} else if (nflState.season_type === 'post') {
				currentMaxWeek = 18;
			}
		} catch (error) {
			console.error('Failed to fetch sport state for transactions; defaulting weeks to 18', error);
		}

		// Preload players once for all mapping
		let allPlayers: Record<string, Player> = {};
		try {
			allPlayers = await SleeperClient.GetAllPlayers();
		} catch (error) {
			console.error('Failed to fetch all players for transactions mapping', error);
		}

		const rostersByLeague = new Map<string, Roster[]>();
		const usersByLeague = new Map<string, LeagueUser[]>();
		const all: { transaction: Transaction; league: League }[] = [];

		for (const league of leagues) {
			// Fetch rosters and users once per league
			try {
				const [rosters, users] = await Promise.all([
					SleeperClient.GetRosters(league.league_id),
					SleeperClient.GetLeagueUsers(league.league_id)
				]);
				rostersByLeague.set(league.league_id, rosters);
				usersByLeague.set(league.league_id, users);
			} catch (error) {
				console.error('Failed to fetch rosters/users for league', league.league_id, error);
				continue;
			}

			// Use currentMaxWeek for the current league, 18 for older ones.
			const isCurrentLeague = league.league_id === (import.meta.env.VITE_LEAGUE_ID as string);
			const maxWeek = isCurrentLeague ? currentMaxWeek : 18;

			for (let week = maxWeek; week > 0; week--) {
				try {
					const tx = await SleeperClient.GetTransactions(league.league_id, week);
					for (const t of tx) {
						if (t.status === TransactionStatus.Complete) {
							all.push({ transaction: t, league });
						}
					}
				} catch (error) {
					console.error(
						'Failed to fetch transactions for league/week',
						league.league_id,
						week,
						error
					);
				}
			}
		}

		// Sort newest to oldest by created timestamp across all leagues
		all.sort((a, b) => (b.transaction.created ?? 0) - (a.transaction.created ?? 0));

		// Map into TransactionsPageDto using preloaded players/rosters/users
		return all.map(({ transaction, league }) => {
			const users = usersByLeague.get(league.league_id) ?? [];
			const rosters = rostersByLeague.get(league.league_id) ?? [];
			const season = String((league as any).season ?? '');

			const base: TransactionsPageDto = {
				TransactionType: transaction.type as TransactionType,
				TransactionDate: new Date(transaction.created).toLocaleDateString(),
				Season: season,
				Week: transaction.leg
			};

			if (
				transaction.type === TransactionType.Waiver ||
				transaction.type === TransactionType.FreeAgent
			) {
				const initiator = users.find((u) => u.user_id === transaction.creator);
				const addsIds = Object.keys(transaction.adds ?? {});
				const dropsIds = Object.keys(transaction.drops ?? {});

				const mapPlayers = (ids: string[]): TradedPlayerDto[] => {
					return ids.map((playerId) => {
						const p = allPlayers[playerId];
						return {
							PlayerId: playerId,
							PlayerName: p
								? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Unknown Player'
								: 'Unknown Player',
							PlayerPosition: p?.position ?? '',
							PlayerTeam: p?.team ?? ''
						};
					});
				};

				base.WaiverFreeAgent = {
					InitiatorAvatarUrl: initiator?.avatar ?? '',
					UserName: initiator?.display_name ?? '',
					Adds: mapPlayers(addsIds),
					Drops: mapPlayers(dropsIds)
				};
			} else if (transaction.type === TransactionType.Trade) {
				const initiator = users.find((u) => u.user_id === transaction.creator);
				const initiatorRosterId = rosters.find((r) => r.owner_id === transaction.creator)?.roster_id;
				const receiverRosterId = transaction.roster_ids.find(
					(r) => r !== initiatorRosterId
				);
				const receiverRoster = rosters.find((r) => r.roster_id === receiverRosterId);
				const receiver = users.find((u) => u.user_id === receiverRoster?.owner_id);

				const playerIds = Object.keys(transaction.adds ?? {});

				const mapTradePlayers = (forInitiator: boolean): TradedPlayerDto[] => {
					return playerIds
						.filter((playerId) => {
							const toRosterId = (transaction.adds ?? {})[playerId];
							if (!initiatorRosterId) return false;
							return forInitiator
								? toRosterId === initiatorRosterId
								: toRosterId !== initiatorRosterId;
						})
						.map((playerId) => {
							const p = allPlayers[playerId];
							return {
								PlayerId: playerId,
								PlayerName: p
									? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Unknown Player'
									: 'Unknown Player',
								PlayerPosition: p?.position ?? '',
								PlayerTeam: p?.team ?? ''
							};
						});
				};

				const mapDraftPicks = (forInitiator: boolean): TradedPickDto[] => {
					if (!initiatorRosterId) return [];
					return (transaction.draft_picks ?? [])
						.filter((pick) =>
							forInitiator
								? pick.previous_owner_id !== initiatorRosterId
								: pick.previous_owner_id === initiatorRosterId
						)
						.map((pick) => ({
							Year: new Date(pick.season).getFullYear() + 1,
							Round: pick.round
						}));
				};

				base.Trade = {
					InitiatorName: initiator?.display_name ?? '',
					RecieverName: receiver?.display_name ?? '',
					InitiatorPlayersRecieved: mapTradePlayers(true),
					RecieverPlayersRecieved: mapTradePlayers(false),
					InitiatorDraftPicks: mapDraftPicks(true),
					RecieverDraftPicks: mapDraftPicks(false),
					InitiatorAvatarUrl: initiator?.avatar ?? '',
					RecieverAvatarUrl: receiver?.avatar ?? ''
				};
			}

			return base;
		});
	}

	private static MapTransaction(transactions: Transaction[]): TransactionsPageDto[] {
		return transactions.map((t) => {
			switch (t.type) {
				case TransactionType.Waiver:
				case TransactionType.FreeAgent:
					return TransactionsHelper.MapWaiverOrFreeAgentTransaction(t);
				case TransactionType.Trade:
					return TransactionsHelper.MapTradeTransaction(t);
				default:
					console.warn(`Unknown transaction type: ${t.type}`);
					return {} as TransactionsPageDto;
			}
		});
	}

	private static MapWaiverOrFreeAgentTransaction(t: Transaction): TransactionsPageDto {
		let users: LeagueUser[] = get(UsersStore) ?? [];
		const transaction: TransactionsPageDto = {
			TransactionType: t.type,
			TransactionDate: new Date(t.created).toLocaleDateString(),
			Week: t.leg,
			WaiverFreeAgent: {
				InitiatorAvatarUrl: users.find((u) => u.user_id === t.creator)?.avatar ?? '',
				UserName: users.find((u) => u.user_id === t.creator)?.display_name ?? '',
				Adds: t.adds ? TransactionsHelper.MapPlayerInfo(t, AddDropType.WaiverAdd) : [],
				Drops: t.drops ? TransactionsHelper.MapPlayerInfo(t, AddDropType.WaiverDrop) : []
			}
		};
		return transaction;
	}

	private static MapTradeTransaction(t: Transaction): TransactionsPageDto {
		let users: LeagueUser[] = get(UsersStore) ?? [];
		let rosters: Roster[] = get(RostersStore) ?? [];
		const transaction: TransactionsPageDto = {
			TransactionType: t.type,
			TransactionDate: new Date(t.created).toLocaleDateString(),
			Week: t.leg,
			Trade: {
				InitiatorName: users.find((u) => u.user_id === t.creator)?.display_name ?? '',
				RecieverName:
					TransactionsHelper.GetUserFromRosterId(
						t.roster_ids.find(
							(r) => r !== rosters.find((r) => r.owner_id === t.creator)?.roster_id
						) ?? 0,
						rosters,
						users
					).display_name ?? '',
				InitiatorDraftPicks: TransactionsHelper.MapDraftPicks(t, true),
				RecieverDraftPicks: TransactionsHelper.MapDraftPicks(t, false),
				InitiatorPlayersRecieved: TransactionsHelper.MapPlayerInfo(t, AddDropType.TradeInitiator),
				RecieverPlayersRecieved: TransactionsHelper.MapPlayerInfo(t, AddDropType.TradeReciver),
				InitiatorAvatarUrl: users.find((u) => u.user_id === t.creator)?.avatar ?? '',
				RecieverAvatarUrl:
					TransactionsHelper.GetUserFromRosterId(
						t.roster_ids.find(
							(r) => r !== rosters.find((r) => r.owner_id === t.creator)?.roster_id
						) ?? 0,
						rosters,
						users
					).avatar ?? ''
			}
		};

		return transaction;
	}

	private static GetPlayerName(playerId: string): string {
		let mappedPlayers = RostersHelper.MapPlayerNames([playerId]);

		// Safeguard against missing players
		if (!mappedPlayers[playerId]) {
			console.warn(`Player with ID ${playerId} not found in players.`);
			return 'Unknown Player';
		}

		// Return the player's full name
		const player = mappedPlayers[playerId];
		return `${player.first_name ?? ''} ${player.last_name ?? ''}`.trim();
	}

	private static GetUserFromRosterId(
		rosterId: number,
		rosters: Roster[],
		users: LeagueUser[]
	): LeagueUser {
		let roster = rosters.find((r) => r.roster_id === rosterId);
		if (!roster) {
			console.warn(`Roster with ID ${rosterId} not found in rosters.`);
			return {} as LeagueUser; // Return an empty object or handle as needed
		}

		let user = users.find((u) => u.user_id === roster.owner_id);
		if (!user) {
			console.warn(`User with ID ${roster.owner_id} not found in users.`);
			return {} as LeagueUser; // Return an empty object or handle as needed
		}

		return user;
	}

	private static MapPlayerInfo(
		transaction: Transaction,
		addDropType: AddDropType
	): TradedPlayerDto[] {
		let players: Record<string, Player> = get(PlayersStore) ?? {};
		let rosters: Roster[] = get(RostersStore) ?? [];

		let tradedPlayers: TradedPlayerDto[] = [] as TradedPlayerDto[];

		let playerIds: string[] = Object.keys(transaction.adds ?? {});

		let filteredPlayerIds: string[] = [] as string[];
		if (addDropType === AddDropType.TradeInitiator) {
			filteredPlayerIds = playerIds.filter(
				(playerId) =>
					(transaction.adds?.[playerId] ?? 0) ===
					rosters.find((r) => r.owner_id === transaction.creator)?.roster_id
			);
		} else if (addDropType === AddDropType.TradeReciver) {
			filteredPlayerIds = playerIds.filter(
				(playerId) =>
					(transaction.adds ?? {})[playerId] !==
					rosters.find((r) => r.owner_id === transaction.creator)?.roster_id
			);
		} else if (addDropType === AddDropType.WaiverAdd) {
			filteredPlayerIds = playerIds;
		} else if (addDropType === AddDropType.WaiverDrop) {
			filteredPlayerIds = Object.keys(transaction.drops ?? {});
		} else {
			console.warn(`Unknown add/drop type: ${addDropType}`);
		}

		filteredPlayerIds.forEach((playerId) => {
			let tradedPlayer: TradedPlayerDto = {} as TradedPlayerDto;
			tradedPlayer.PlayerName = TransactionsHelper.GetPlayerName(playerId);
			tradedPlayer.PlayerId = playerId;
			tradedPlayer.PlayerPosition = players[playerId]?.position ?? '';
			tradedPlayer.PlayerTeam = players[playerId]?.team ?? '';
			tradedPlayers.push(tradedPlayer);
		});

		return tradedPlayers;
	}

	private static MapDraftPicks(transaction: Transaction, isInitiator: boolean): TradedPickDto[] {
		let tradedPicks: TradedPickDto[] = [] as TradedPickDto[];
		let rosters: Roster[] = get(RostersStore) ?? [];

		let filteredDraftPicks = transaction.draft_picks.filter((pick) => {
			if (isInitiator) {
				return (
					pick.previous_owner_id !==
					rosters.find((r) => r.owner_id === transaction.creator)?.roster_id
				);
			} else {
				return (
					pick.previous_owner_id ===
					rosters.find((r) => r.owner_id === transaction.creator)?.roster_id
				);
			}
		});

		filteredDraftPicks.forEach((pick) => {
			let tradedPick: TradedPickDto = {} as TradedPickDto;
			tradedPick.Year = new Date(pick.season).getFullYear() + 1;
			tradedPick.Round = pick.round;
			tradedPicks.push(tradedPick);
		});

		return tradedPicks;
	}
}
