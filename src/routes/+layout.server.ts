import type { LayoutServerLoad } from './$types';
import { SleeperClient } from '$lib/api/services/SleeperClient';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const leagueId = import.meta.env.VITE_LEAGUE_ID as string;

	const [playersRes, users, rosters, transactions] = await Promise.all([
		// Use existing cached players API route
		fetch('/api/players').then(async (r) => {
			if (!r.ok) throw new Error('Failed to fetch players');
			return r.json();
		}),
		SleeperClient.GetLeagueUsers(leagueId),
		SleeperClient.GetRosters(leagueId),
		SleeperClient.GetTransactions(leagueId, 0)
	]);

	return {
		players: playersRes,
		users,
		rosters,
		transactions
	};
};
