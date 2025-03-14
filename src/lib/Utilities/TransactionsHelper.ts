import { SleeperClient } from '../api/services/SleeperClient';
import type { Transaction } from '../api/dtos/LeagueDtos/Transaction';
import type { LeagueUser } from '../api/dtos/LeagueDtos/LeagueUser';
import type { Player } from '../api/dtos/PlayerDtos/Player';
import type { TransactionsPageDto } from './Dtos/TransactionsPageDto';
import { TransactionStatus } from '$lib/api/Enums/TransactionStatus';

export class TransactionsHelper {
	public static async GetAllTransactions(): Promise<TransactionsPageDto[]> {
		let BASE_URL: string = import.meta.env.VITE_SLEEPER_API_URL;
		let LeagueId: string = import.meta.env.VITE_LEAGUE_ID;

		// Load all transactions, league users, and player data for the league for 2024
		let transactions: Transaction[] = (await SleeperClient.GetTransactions(LeagueId, 12)) ?? [];
		let users: LeagueUser[] = (await SleeperClient.GetLeagueUsers(LeagueId)) ?? [];
		let players: Record<string, Player> = (await SleeperClient.GetAllPlayers()) ?? {};

		console.log('Transactions:', transactions);
		console.log('Users:', users);
		console.log('Players:', players);

		// Filter out transactions with a status of failed
		transactions = transactions.filter((t) => t.status === TransactionStatus.COMPLETE);

		// Method to map transactions to new dto, add player name, and user name
		// You can call the private method here if needed
		return TransactionsHelper.MapWaiverTransactions(transactions, users, players);
	}

	private static MapWaiverTransactions(
		transactions: Transaction[],
		users: LeagueUser[],
		players: Record<string, Player>
	): TransactionsPageDto[] {
		let pageTransactions: TransactionsPageDto[] = [];
		//get the first 20 transactions
		transactions = transactions.slice(0, 20);
		transactions.forEach((t) => {
			if (t.type === 'waiver') {
				let transaction: TransactionsPageDto = {
					TransactionType: t.type,
					UserName: users.find((u) => u.user_id === t.creator)?.display_name ?? '',
					TransactionDate: new Date(t.created).toLocaleDateString(),
					// Adds: t.adds.map((p) => TransactionsHelper.MapPlayerName(players, t)),
					// Drops: t.drops.map((p) => TransactionsHelper.MapPlayerName(players, t))
					Adds: {},
					Drops: {}
					// Add other properties as needed
				};
				pageTransactions.push(transaction);
			}
		});
		return pageTransactions;
	}

	private static MapPlayerName(players: Player[], transaction: Transaction): string {
		// Add logic to map player name
		let playerId = transaction?.adds?.[0]?.toString() ?? '';
		let player = players.find((p) => p.player_id === playerId);
		return player?.first_name ?? '' + player?.last_name ?? '';
	}
}
