import type { PageServerLoad } from './$types';
import { StandingsHelper } from '$lib/Utilities/StandingsHelper';

export const load: PageServerLoad = async () => {
	const standingsPromise = StandingsHelper.GetStandingsPageData();

	return {
		streamed: {
			standingsData: standingsPromise
		}
	};
};
