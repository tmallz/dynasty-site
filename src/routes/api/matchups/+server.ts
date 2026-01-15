import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MatchupHelper } from '$lib/Utilities/MatchupHelper';
import { SleeperClient } from '$lib/api/services/SleeperClient';

export const GET: RequestHandler = async ({ url }) => {
	const week = url.searchParams.get('week');
	
	if (!week) {
		return json({ error: 'Missing week parameter' }, { status: 400 });
	}
	
	try {
		const weekNumber = parseInt(week, 10);
		const leagueId = import.meta.env.VITE_LEAGUE_ID;
		
		// Load rosters and users directly (not from stores, which are client-side only)
		const rosters = await SleeperClient.GetRosters(leagueId);

		// Some environments or older code paths might reference different method names;
		// try the modern `GetLeagueUsers`, fall back to `GetUsers` if present.
		let users;
		if (typeof (SleeperClient as any).GetLeagueUsers === 'function') {
			users = await (SleeperClient as any).GetLeagueUsers(leagueId);
		} else if (typeof (SleeperClient as any).GetUsers === 'function') {
			users = await (SleeperClient as any).GetUsers(leagueId);
		} else {
			// Last resort: attempt to call GetLeagueUsers and let any error bubble up
			users = await (SleeperClient as any).GetLeagueUsers(leagueId);
		}
		
		// Pass rosters and users to avoid store loading
		// Set includePlayerDetails to false since we'll load players client-side
		const matchupData = await MatchupHelper.GetPageMatchups(rosters, users, false, weekNumber);
		return json(matchupData);
	} catch (error) {
		console.error('Error fetching matchups:', error);
		return json({ error: 'Failed to fetch matchups' }, { status: 500 });
	}
};
