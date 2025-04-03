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
import type { League } from '$lib/api/dtos/LeagueDtos/League';
import { TransactionsStore } from '$lib/Stores/TransactionStore';

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
					return this.MapWaiverOrFreeAgentTransaction(t, users, players);
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
		players: Record<string, Player>
	): TransactionsPageDto {
		const transaction: TransactionsPageDto = {
			TransactionType: t.type,
			TransactionDate: new Date(t.created).toLocaleDateString(),
			WaiverFreeAgent: {
				UserName: users.find((u) => u.user_id === t.creator)?.display_name ?? '',
				Adds: t.adds ? Object.keys(t.adds).map((add) => this.GetPlayerName(add, players)) : [],
				Drops: t.drops ? Object.keys(t.drops).map((drop) => this.GetPlayerName(drop, players)) : []
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
				RecieverName: this.GetUserNameFromRosterId(
					t.roster_ids.find(
						(r) => r !== rosters.find((r) => r.owner_id === t.creator)?.roster_id
					) ?? 0,
					rosters,
					users
				),
				InitiatorDraftPicks: t.draft_picks
					.filter(
						(p) => p.previous_owner_id === rosters.find((r) => r.owner_id === t.creator)?.roster_id
					)
					.map((p) => p.round),
				RecieverDraftPicks: t.draft_picks
					.filter(
						(p) => p.previous_owner_id !== rosters.find((r) => r.owner_id === t.creator)?.roster_id
					)
					.map((p) => p.round),
				InitiatorPlayersRecieved: Object.keys(t.adds || {})
					.filter(
						(playerId) =>
							(t.adds?.[playerId] ?? 0) === rosters.find((r) => r.owner_id === t.creator)?.roster_id
					)
					.map((playerId) => this.GetPlayerName(playerId, players)),
				RecieverPlayersRecieved: Object.keys(t.adds || {})
					.filter(
						(playerId) =>
							(t.adds ?? {})[playerId] !== rosters.find((r) => r.owner_id === t.creator)?.roster_id
					)
					.map((playerId) => this.GetPlayerName(playerId, players))
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
