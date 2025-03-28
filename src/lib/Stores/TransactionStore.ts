import { writable } from 'svelte/store';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import type { Transaction } from '$lib/api/dtos/LeagueDtos/Transaction';
import type { League } from '$lib/api/dtos/LeagueDtos/League';

// Writable store to hold transaction data
export const TransactionsStore = writable<Transaction[]>([]);
let isLoaded = false; // Tracks whether transactions have been loaded

// Function to load all transactions into the store
export async function LoadTransactions(): Promise<void> {
	if (isLoaded) return; // Skip API call if already loaded

	try {
		let transactions: Transaction[] = [];

		// Get current state of NFL and loop over each week to get all transactions
		let week: number = 1;
		let nflState = await SleeperClient.GetSportState();
		if (nflState.season_type === 'regular') {
			week = nflState.display_week;
		} else if (nflState.season_type === 'post') {
			week = 18;
		}

		while (week > 0) {
			transactions.push(
				...(await SleeperClient.GetTransactions(import.meta.env.VITE_LEAGUE_ID, week))
			);
			week--;
		}

		// Get all league IDs from past years of the league
		let userId = (await SleeperClient.GetUser('tmallz')).user_id;
		let currentYear = new Date(Date.now()).getFullYear();
		let allCurrentUserLeagues: League[] = await SleeperClient.GetUserLeagues(
			userId,
			'nfl',
			currentYear.toString()
		);
		let currentLeague = allCurrentUserLeagues.find(
			(l) => l.name === import.meta.env.VITE_LEAGUE_NAME
		);

		let previousLeagues: League[] = [];
		let previousLeagueId = currentLeague?.previous_league_id;

		if (previousLeagueId !== '0') {
			while (previousLeagueId !== '0') {
				if (!previousLeagueId) {
					console.warn('previousLeagueId is undefined');
					break;
				}
				let league = await SleeperClient.GetLeague(previousLeagueId);
				previousLeagues.push(league);
				previousLeagueId = league.previous_league_id ?? '0';
			}

			// Fetch transactions for previous leagues
			for (const league of previousLeagues) {
				let previousLeagueWeek = 18;
				while (previousLeagueWeek > 0) {
					transactions.push(
						...(await SleeperClient.GetTransactions(league.league_id, previousLeagueWeek))
					);
					previousLeagueWeek--;
				}
			}
		}

		// Update the store with all fetched transactions
		TransactionsStore.set(transactions);
		isLoaded = true; // Mark as loaded
	} catch (error) {
		console.error('Failed to load transactions:', error);
		throw new Error('Failed to load transactions.');
	}
}

// Function to check if transactions are loaded
export function IsTransactionsLoaded(): boolean {
	console.log('IsTransactionsLoaded:', isLoaded);
	return isLoaded;
}
