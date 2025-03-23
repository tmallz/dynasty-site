import { writable } from 'svelte/store';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';

// Writable store to hold player data
export const PlayersStore = writable<Record<string, Player>>({});
let isLoaded = false; // Tracks whether players have been loaded

// Function to load players into the store
export async function LoadPlayers(): Promise<void> {
	if (isLoaded) return; // Skip API call if already loaded

	try {
		const players = await SleeperClient.GetAllPlayers();
		PlayersStore.set(players); // Update the store with fetched players
		isLoaded = true; // Mark as loaded
	} catch (error) {
		console.error('Failed to load players:', error);
		throw new Error('Failed to load players.'); // Optionally rethrow the error
	}
}

// Function to check if players are loaded
export function IsPlayersLoaded(): boolean {
	console.log('IsPlayersLoaded:', isLoaded);
	return isLoaded;
}
