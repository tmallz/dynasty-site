import { SleeperClient } from '../api/services/SleeperClient';
import type { Transaction } from '../api/dtos/LeagueDtos/Transaction';
import type { LeagueUser } from '../api/dtos/LeagueDtos/LeagueUser';
import type { Player } from '../api/dtos/PlayerDtos/Player';
import type { TransactionsPageDto } from './Dtos/TransactionsPageDto';
import { TransactionStatus } from '$lib/api/Enums/TransactionStatus';
import { PlayersStore } from '$lib/Stores/PlayerStore';
import { get } from 'svelte/store';
import { TransactionType } from '$lib/api/Enums/TransactionType';
import { RostersHelper } from './RostersHelper';
import { UsersStore } from '$lib/Stores/UserStores';
import { StoresHelper } from './StoresHelper';
import { RostersStore } from '$lib/Stores/RosterStore';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';

export class TransactionsHelper {
	public static async GetAllTransactions(): Promise<TransactionsPageDto[]> {
		let leagueId: string = import.meta.env.VITE_LEAGUE_ID;

		// Ensure all stores are loaded
		await StoresHelper.EnsureStoresLoaded();

		// Load all transactions, league users, and player data for the league for 2024
		let transactions: Transaction[] = (await SleeperClient.GetTransactions(leagueId, 1)) ?? [];
		let users: LeagueUser[] = get(UsersStore) ?? [];
		let players: Record<string, Player> = get(PlayersStore) ?? {};
		let rosters: Roster[] = get(RostersStore) ?? {};

		//console.log('Transactions:', transactions);
		//console.log('Users:', users);
		//console.log('Players:', players);

		// Filter out transactions with a status of failed
		transactions = transactions.filter((t) => t.status === TransactionStatus.COMPLETE);

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
		let pageTransactions: TransactionsPageDto[] = [];
		transactions.forEach((t) => {
			let transaction: TransactionsPageDto = {};
			let initiatorUser = users.find((u) => u.user_id === t.creator);
			if (t.type === TransactionType.WAIVER || t.type === TransactionType.FREE_AGENT) {
				transaction.TransactionType = t.type;
				transaction.WaiverFreeAgent = {};
				transaction.WaiverFreeAgent.UserName = initiatorUser?.display_name ?? '';
				transaction.TransactionDate = new Date(t.created).toLocaleDateString();

				if (t.adds) {
					transaction.WaiverFreeAgent.Adds = [];
					Object.keys(t.adds).forEach((add) => {
						if (transaction.WaiverFreeAgent) {
							const playerName = TransactionsHelper.GetPlayerName(add, players);
							(transaction.WaiverFreeAgent.Adds ??= []).push(playerName);
						}
					});
				}

				if (t.drops) {
					transaction.WaiverFreeAgent.Drops = [];
					Object.keys(t.drops).forEach((add) => {
						if (transaction.WaiverFreeAgent) {
							const playerName = TransactionsHelper.GetPlayerName(add, players);
							(transaction.WaiverFreeAgent.Drops ??= []).push(playerName);
						}
					});
				}
			}

			if (t.type === TransactionType.TRADE) {
				// Add logic for trade transactions
				transaction.TransactionType = t.type;
				transaction.Trade = {};
				transaction.Trade.initiatorName = initiatorUser?.display_name ?? '';
				transaction.TransactionDate = new Date(t.created).toLocaleDateString();

				let userId = initiatorUser?.user_id ?? '';
				let initiatorRosterId = rosters.find((r) => r.owner_id === userId)?.roster_id ?? 0;
				let receiverRosterId = t.roster_ids.find((r) => r !== initiatorRosterId) ?? 0;
				transaction.Trade.recieverName =
					TransactionsHelper.GetUserNameFromRosterId(receiverRosterId, rosters, users) ?? '';

				let initiatorAdds: Record<string, number> = {};
				if (t.adds) {
					// Filter adds where the value matches initiatorRosterId
					initiatorAdds = Object.fromEntries(
						Object.entries(t.adds).filter(([playerId, rosterId]) => rosterId === initiatorRosterId)
					);

					console.log('Initiator Adds:', initiatorAdds);
				}

				let receiverAdds: Record<string, number> = {};
				if (t.adds) {
					// Filter adds where the value matches initiatorRosterId
					receiverAdds = Object.fromEntries(
						Object.entries(t.adds).filter(([playerId, rosterId]) => rosterId === receiverRosterId)
					);

					console.log('reciever Adds:', receiverAdds);
				}

				if (initiatorAdds) {
					transaction.Trade.intiatorPlayersRecieved = [];
					Object.keys(initiatorAdds).forEach((add) => {
						if (transaction.Trade) {
							const playerName = TransactionsHelper.GetPlayerName(add, players);
							(transaction.Trade.intiatorPlayersRecieved ??= []).push(playerName);
						}
					});
				}

				if (receiverAdds) {
					transaction.Trade.recieverPlayersRecieved = [];
					Object.keys(receiverAdds).forEach((add) => {
						if (transaction.Trade) {
							const playerName = TransactionsHelper.GetPlayerName(add, players);
							(transaction.Trade.recieverPlayersRecieved ??= []).push(playerName);
						}
					});
				}

				console.log('Draft Picks:', t.draft_picks);
				console.log('Initiator Roster ID:', initiatorRosterId);
				console.log('Receiver Roster ID:', receiverRosterId);

				let initiatorPicksRecieved = t.draft_picks.filter((p) => p.owner_id === initiatorRosterId);
				let receiverPicksRecieved = t.draft_picks.filter((p) => p.owner_id === receiverRosterId);
				console.log('Initiator Picks:', initiatorPicksRecieved);
				console.log('Receiver Picks:', receiverPicksRecieved);

				if (initiatorPicksRecieved) {
					transaction.Trade.initiatorDraftPicks = [];
					initiatorPicksRecieved.forEach((p) => {
						(transaction.Trade.initiatorDraftPicks ??= []).push(p.round);
					});
				}

				if (receiverPicksRecieved) {
					transaction.Trade.recieverDraftPicks = [];
					receiverPicksRecieved.forEach((p) => {
						(transaction.Trade.recieverDraftPicks ??= []).push(p.round);
					});
				}
			}

			pageTransactions.push(transaction);
		});
		return pageTransactions;
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

	private static GetUserNameFromRosterId(
		rosterId: number,
		rosters: Roster[],
		users: LeagueUser[]
	): string {
		let roster = rosters.find((r) => r.roster_id === rosterId);
		if (!roster) {
			console.warn(`Roster with ID ${rosterId} not found in rosters.`);
			return 'Unknown User';
		}

		let user = users.find((u) => u.user_id === roster.owner_id);
		if (!user) {
			console.warn(`User with ID ${roster.owner_id} not found in users.`);
			return 'Unknown User';
		}

		return user.display_name;
	}
}
