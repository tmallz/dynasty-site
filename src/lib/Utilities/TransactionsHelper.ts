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

export class TransactionsHelper {
	public static async GetAllTransactions(): Promise<TransactionsPageDto[]> {
		// Ensure all stores are loaded
		await StoresHelper.EnsureStoresLoaded();

		// Load all transactions, league users, and player data for the league for 2025
		let transactions: Transaction[] = get(TransactionsStore); //(await SleeperClient.GetTransactions(leagueId, 1)) ?? [];
		let users: LeagueUser[] = get(UsersStore) ?? [];
		let players: Record<string, Player> = get(PlayersStore) ?? {};
		let rosters: Roster[] = get(RostersStore) ?? {};

		// Filter out transactions with a status of failed
		transactions = transactions.filter((t) => t.status === TransactionStatus.Complete);

		// Method to map transactions to new dto, add player name, and username
		// You can call the private method here if needed
		return TransactionsHelper.MapTransaction(transactions, users, players, rosters);
	}

	private static MapTransaction(
		transactions: Transaction[],
		users: LeagueUser[],
		players: Record<string, Player>,
		rosters: Roster[]
	): TransactionsPageDto[] {
		return transactions.map((t) => {
			switch (t.type) {
				case TransactionType.Waiver:
				case TransactionType.FreeAgent:
					return this.MapWaiverOrFreeAgentTransaction(t, users, rosters, players);
				case TransactionType.Trade:
					return this.MapTradeTransaction(t, users, players, rosters);
				default:
					console.warn(`Unknown transaction type: ${t.type}`);
					return {} as TransactionsPageDto;
			}
		});
	}

	private static MapWaiverOrFreeAgentTransaction(
		t: Transaction,
		users: LeagueUser[],
		rosters: Roster[],
		players: Record<string, Player>
	): TransactionsPageDto {
		const transaction: TransactionsPageDto = {
			TransactionType: t.type,
			TransactionDate: new Date(t.created).toLocaleDateString(),
			WaiverFreeAgent: {
				InitiatorAvatarUrl: users.find((u) => u.user_id === t.creator)?.avatar ?? '',
				UserName: users.find((u) => u.user_id === t.creator)?.display_name ?? '',
				Adds: t.adds ? this.MapPlayerInfo(t, rosters, players, AddDropType.WaiverAdd) : [],
				Drops: t.drops ? this.MapPlayerInfo(t, rosters, players, AddDropType.WaiverDrop) : []
			}
		};
		return transaction;
	}

	private static MapTradeTransaction(
		t: Transaction,
		users: LeagueUser[],
		players: Record<string, Player>,
		rosters: Roster[]
	): TransactionsPageDto {
		const transaction: TransactionsPageDto = {
			TransactionType: t.type,
			TransactionDate: new Date(t.created).toLocaleDateString(),
			Trade: {
				InitiatorName: users.find((u) => u.user_id === t.creator)?.display_name ?? '',
				RecieverName:
					this.GetUserFromRosterId(
						t.roster_ids.find(
							(r) => r !== rosters.find((r) => r.owner_id === t.creator)?.roster_id
						) ?? 0,
						rosters,
						users
					).display_name ?? '',
				InitiatorDraftPicks: this.MapDraftPicks(t, rosters, true),
				RecieverDraftPicks: this.MapDraftPicks(t, rosters, false),
				InitiatorPlayersRecieved: TransactionsHelper.MapPlayerInfo(
					t,
					rosters,
					players,
					AddDropType.TradeInitiator
				),
				RecieverPlayersRecieved: TransactionsHelper.MapPlayerInfo(
					t,
					rosters,
					players,
					AddDropType.TradeReciver
				),
				InitiatorAvatarUrl: users.find((u) => u.user_id === t.creator)?.avatar ?? '',
				RecieverAvatarUrl:
					this.GetUserFromRosterId(
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

	private static GetPlayerName(playerId: string, players: Record<string, Player>): string {
		let mappedPlayers = RostersHelper.MapPlayerNames(players, [playerId]);

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
		rosters: Roster[],
		players: Record<string, Player>,
		addDropType: AddDropType
	): TradedPlayerDto[] {
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
			tradedPlayer.PlayerName = this.GetPlayerName(playerId, players);
			tradedPlayer.PlayerId = playerId;
			tradedPlayer.PlayerPosition = players[playerId]?.position ?? '';
			tradedPlayer.PlayerTeam = players[playerId]?.team ?? '';
			tradedPlayers.push(tradedPlayer);
		});

		return tradedPlayers;
	}

	private static MapDraftPicks(
		transaction: Transaction,
		rosters: Roster[],
		isInitiator: boolean
	): TradedPickDto[] {
		let tradedPicks: TradedPickDto[] = [] as TradedPickDto[];

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
