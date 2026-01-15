import type { PageServerLoad } from './$types';
import { MatchupHelper } from '$lib/Utilities/MatchupHelper';

export const load: PageServerLoad = async ({ parent }) => {
	// Get players from parent layout to avoid reload issues
	const layoutData = await parent();
	
	const matchupData = await MatchupHelper.GetMatchupPageData();
	
	return { 
		matchupData,
		players: layoutData.players // Pass players through
	};
};
