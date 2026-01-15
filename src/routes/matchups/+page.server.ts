import type { PageServerLoad } from './$types';
import { MatchupHelper } from '$lib/Utilities/MatchupHelper';

export const load: PageServerLoad = async ({ parent }) => {
	// Get players from parent layout to avoid reload issues
	const layoutData = await parent();
	
	// Stream matchup data for instant page load
	const matchupDataPromise = MatchupHelper.GetMatchupPageData();
	
	return {
		players: layoutData.players, // Pass players through immediately
		streamed: {
			matchupData: matchupDataPromise
		}
	};
};
