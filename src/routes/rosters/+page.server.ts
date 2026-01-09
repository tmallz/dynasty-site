import type { PageServerLoad } from './$types';
import { RostersHelper } from '$lib/Utilities/RostersHelper';
import { LoadRosters, IsRostersLoaded } from '$lib/Stores/RosterStore';
import { LoadUsers, IsUsersLoaded } from '$lib/Stores/UserStores';
import { PlayersStore } from '$lib/Stores/PlayerStore';
import type { RosterPageDto } from '$lib/Utilities/Dtos/RosterPageDto';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { promises as fs } from 'fs';
import path from 'path';

export const load: PageServerLoad = async () => {
	const leagueId = import.meta.env.VITE_LEAGUE_ID;

	// Load necessary stores for rosters page
	if (!IsRostersLoaded()) {
		await LoadRosters(leagueId);
	}

	if (!IsUsersLoaded()) {
		await LoadUsers(leagueId);
	}

	// Load players directly without using the PlayerStore's fetch-based LoadPlayers
	try {
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
			// File doesn't exist or is invalid, fetch from API
			players = await SleeperClient.GetAllPlayers();
			await fs.writeFile(DATA_FILE_PATH, JSON.stringify(players, null, 2));
		}

		PlayersStore.set(players);
	} catch (error) {
		console.error('Failed to load players:', error);
	}

	const rosters: RosterPageDto[] = await RostersHelper.GetAllRosters();

	return {
		rosters
	};
};
