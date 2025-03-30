import { writable } from 'svelte/store';

// Writable store to hold player data
export const PlayersStore = writable<Record<string, any>>({});
let isLoaded = false; // Tracks whether players have been loaded

// Function to load players into the store
export async function LoadPlayers(): Promise<void> {
	if (isLoaded) return; // Skip API call if already loaded

	try {
		// Fetch player data from the server-side endpoint
		const response = await fetch('/api/players');
		if (!response.ok) {
			throw new Error('Failed to fetch players');
		}

		const players = await response.json();
		PlayersStore.set(players); // Update the store with the data
		isLoaded = true;
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
