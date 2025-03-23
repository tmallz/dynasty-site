import { writable } from 'svelte/store';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';

// Writable store to hold user data
export const UsersStore = writable<LeagueUser[]>([]);
let isLoaded = false; // Tracks whether users have been loaded

// Function to load users into the store
export async function LoadUsers(leagueId: string): Promise<void> {
	if (isLoaded) return; // Skip API call if already loaded

	try {
		const users = await SleeperClient.GetLeagueUsers(leagueId);
		UsersStore.set(users); // Update the store with fetched users
		isLoaded = true; // Mark as loaded
	} catch (error) {
		console.error('Failed to load users:', error);
		throw new Error('Failed to load users.'); // Optionally rethrow the error
	}
}

// Function to check if users are loaded
export function IsUsersLoaded(): boolean {
	return isLoaded;
}
