import type { PageServerLoad } from './$types';
import { LeagueStatsHelper } from '$lib/Utilities/LeagueStatsHelper';
import { IsUsersLoaded, LoadUsers, UsersStore } from '$lib/Stores/UserStores';
import { get } from 'svelte/store';

export const load: PageServerLoad = async () => {
	const leagueId = import.meta.env.VITE_LEAGUE_ID;
	
	// Load data asynchronously and stream to client
	const dataPromise = (async () => {
		// Load users for avatars
		if (!IsUsersLoaded()) {
			await LoadUsers(leagueId);
		}
		
		const stats = await LeagueStatsHelper.GetLeagueStatsCached();
		const users = get(UsersStore);
		
		return { stats, users };
	})();
	
	// Return promise wrapped for streaming
	return {
		streamed: {
			leagueData: dataPromise
		}
	};
};

