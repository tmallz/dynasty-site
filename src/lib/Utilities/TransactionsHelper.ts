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

		//console.log('Transactions:', transactions);
		//console.log('Users:', users);
		//console.log('Players:', players);

		// Filter out transactions with a status of failed
		transactions = transactions.filter((t) => t.status === TransactionStatus.COMPLETE);

		// Method to map transactions to new dto, add player name, and user name
		// You can call the private method here if needed
		return TransactionsHelper.MapTransaction(transactions, users, players);
	}

	private static MapTransaction(
		transactions: Transaction[],
		users: LeagueUser[],
		players: Record<string, Player>
	): TransactionsPageDto[] {
		let pageTransactions: TransactionsPageDto[] = [];
		transactions.forEach((t) => {
			let transaction: TransactionsPageDto = {};
			if (t.type === TransactionType.WAIVER || t.type === TransactionType.FREE_AGENT) {
				transaction.TransactionType = t.type;
				transaction.UserName = users.find((u) => u.user_id === t.creator)?.display_name ?? '';
				transaction.TransactionDate = new Date(t.created).toLocaleDateString();

				if (t.adds) {
					transaction.Adds = t.adds ? TransactionsHelper.GetPlayerName(t.adds, players) : '';
				}

				if (t.drops) {
					transaction.Drops = TransactionsHelper.GetPlayerName(t.drops, players);
				}
			}

			if (t.type === TransactionType.TRADE) {
				// Add logic for trade transactions
				transaction.TransactionType = t.type;
				transaction.UserName = users.find((u) => u.user_id === t.creator)?.display_name ?? '';
				transaction.TransactionDate = new Date(t.created).toLocaleDateString();

				console.log('usernames:', transaction.UserName);
				console.log('User:', t.creator);
				console.log('Transaction:', t);
			}

			pageTransactions.push(transaction);
		});
		return pageTransactions;
	}

	private static GetPlayerName(
		addDrop: Record<string, number>,
		players: Record<string, Player>
	): string {
		let playerId = Object.keys(addDrop)[0];
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
}
