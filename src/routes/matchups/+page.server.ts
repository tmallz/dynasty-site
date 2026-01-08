import type { PageServerLoad } from './$types';
import { MatchupHelper } from '$lib/Utilities/MatchupHelper';

export const load: PageServerLoad = async () => {
	const matchupData = await MatchupHelper.GetMatchupPageData();
	return { matchupData };
};
