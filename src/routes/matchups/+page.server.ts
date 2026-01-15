import type { PageServerLoad } from './$types';
import { MatchupHelper } from '$lib/Utilities/MatchupHelper';

export const load: PageServerLoad = async () => {
	// Stream matchup data for instant page load
	// Players will be available from parent layout automatically
	const matchupDataPromise = MatchupHelper.GetMatchupPageData();
	
	return {
		streamed: {
			matchupData: matchupDataPromise
		}
	};
};
