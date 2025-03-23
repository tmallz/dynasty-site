import { writable } from 'svelte/store';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';

// Writable store to hold roster data
export const RostersStore = writable<Roster[]>([]);
let isLoaded = false; // Tracks whether rosters have been loaded

// Function to load rosters into the store
export async function LoadRosters(leagueId: string): Promise<void> {
	if (isLoaded) return; // Skip API call if already loaded

	try {
		const rosters = await SleeperClient.GetRosters(leagueId);
		RostersStore.set(rosters); // Update the store with fetched rosters
		isLoaded = true; // Mark as loaded
	} catch (error) {
		console.error('Failed to load rosters:', error);
		throw new Error('Failed to load rosters.'); // Optionally rethrow the error
	}
}

// Function to check if rosters are loaded
export function IsRostersLoaded(): boolean {
	return isLoaded;
}
