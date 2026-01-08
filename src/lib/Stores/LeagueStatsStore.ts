import { writable } from 'svelte/store';
import type { LeagueStatsPageDto } from '$lib/Utilities/Dtos/LeagueStatsPageDto';
import { LeagueStatsHelper } from '$lib/Utilities/LeagueStatsHelper';

export const LeagueStatsStore = writable<LeagueStatsPageDto | null>(null);

let isLoaded = false;

export async function LoadLeagueStats(): Promise<void> {
	if (isLoaded) return;

	const stats = await LeagueStatsHelper.GetLeagueStats();
	LeagueStatsStore.set(stats);
	isLoaded = true;
}

export function IsLeagueStatsLoaded(): boolean {
	return isLoaded;
}
