import type { PageServerLoad } from './$types';
import { RostersHelper } from '$lib/Utilities/RostersHelper';
import { LeagueHistoryHelper } from '$lib/Utilities/LeagueHistoryHelper';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { LoadRosters, IsRostersLoaded } from '$lib/Stores/RosterStore';
import { LoadUsers, IsUsersLoaded } from '$lib/Stores/UserStores';
import { PlayersStore } from '$lib/Stores/PlayerStore';
import { TransactionStatus } from '$lib/api/Enums/TransactionStatus';
import { promises as fs } from 'fs';
import path from 'path';
import type { Matchup } from '$lib/api/dtos/LeagueDtos/Matchup';
import type { Transaction } from '$lib/api/dtos/LeagueDtos/Transaction';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
import { get } from 'svelte/store';

async function loadRivalriesData() {
	const leagueID = import.meta.env.VITE_LEAGUE_ID;

	// Load necessary stores
	if (!IsRostersLoaded()) {
		await LoadRosters(leagueID);
	}

	if (!IsUsersLoaded()) {
		await LoadUsers(leagueID);
	}

	// Load players
	const DATA_FILE_PATH =
		process.env.NODE_ENV === 'production'
			? path.join('/tmp', 'players.json')
			: path.join(process.cwd(), 'static', 'players.json');

	let players: Record<string, any> = {};

	try {
		const fileData = await fs.readFile(DATA_FILE_PATH, 'utf-8');
		if (fileData.trim() !== '') {
			players = JSON.parse(fileData);
		}
	} catch {
		players = await SleeperClient.GetAllPlayers();
		await fs.writeFile(DATA_FILE_PATH, JSON.stringify(players, null, 2));
	}

	PlayersStore.set(players);

	// Load rosters and basic data
	const rosters = await RostersHelper.GetAllRosters();
	const users = await SleeperClient.GetLeagueUsers(leagueID);

	// Load all historical matchups and transactions organized by season and week
	const matchups: Record<string, Record<number, Matchup[]>> = {};
	const allTransactions: Transaction[] = [];
	const brackets: Record<string, { winners: any[]; losers: any[] }> = {};
	
	// Get all previous league IDs
	const leagues = await LeagueHistoryHelper.GetLeagueChainFromCurrent();
	
	// Iterate through each league/season
	for (const league of leagues) {
		const season = league.season;
		matchups[season] = {};
		
		// Load playoff brackets for this season
		try {
			const [winnersBracket, losersBracket] = await Promise.all([
				SleeperClient.GetWinnersBracket(league.league_id),
				SleeperClient.GetLosersBracket(league.league_id)
			]);
			brackets[season] = {
				winners: winnersBracket || [],
				losers: losersBracket || []
			};
		} catch (error) {
			console.error(`Failed to load brackets for ${season}:`, error);
			brackets[season] = { winners: [], losers: [] };
		}
		
		// Load matchups and transactions for each week (assuming 18 week max regular + playoffs)
		for (let week = 1; week <= 18; week++) {
			try {
				const weekMatchups = await SleeperClient.GetMatchups(league.league_id, week);
				if (weekMatchups && weekMatchups.length > 0) {
					matchups[season][week] = weekMatchups;
				}
			} catch (error) {
				// Week doesn't exist or failed to load, skip it
			}

			try {
				const weekTransactions = await SleeperClient.GetTransactions(league.league_id, week);
				// Filter for completed transactions and add season info
				const completedTx = weekTransactions
					.filter(t => t.status === TransactionStatus.Complete)
					.map(t => ({ ...t, season: season }));
				allTransactions.push(...completedTx);
			} catch (error) {
				// Week doesn't exist or failed to load, skip it
			}
		}
	}

	return {
		rosters: rosters ?? [],
		matchups: matchups ?? {},
		transactions: allTransactions ?? [],
		users: users ?? [],
		brackets: brackets ?? {},
		players: players ?? {}
	};
}

export const load: PageServerLoad = async () => {
	try {
		// Check cache first
		const cacheFilePath = path.join(process.cwd(), 'static', 'rivalries-data.json');
		
		try {
			const fileStats = await fs.stat(cacheFilePath);
			const fileAgeInHours = (Date.now() - fileStats.mtimeMs) / (1000 * 60 * 60);
			
			console.log(`Rivalries cache age: ${fileAgeInHours.toFixed(2)} hours`);
			
			// If cache is less than 24 hours old, use it
			if (fileAgeInHours < 24) {
				console.log('Loading rivalries data from cache');
				const cachedData = await fs.readFile(cacheFilePath, 'utf-8');
				return JSON.parse(cachedData);
			} else {
				console.log('Cache is stale, recomputing rivalries data');
			}
		} catch (error) {
			console.log('No cache file found, computing rivalries data for first time');
		}
		
		// Compute fresh data
		console.log('Computing rivalries data (this may take 20-60 seconds)...');
		const data = await loadRivalriesData();
		
		// Save to cache
		try {
			await fs.writeFile(cacheFilePath, JSON.stringify(data, null, 2));
			console.log('Rivalries data cached successfully');
		} catch (error) {
			console.error('Error writing cache file:', error);
		}
		
		return data;
	} catch (error) {
		console.error('Error loading rivalries data:', error);
		return {
			rosters: [],
			matchups: {},
			transactions: [],
			users: [],
			brackets: {},
			players: {}
		};
	}
};
