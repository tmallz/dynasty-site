import type { PageServerLoad } from './$types';
import { LeagueStatsHelper } from '$lib/Utilities/LeagueStatsHelper';

export const load: PageServerLoad = async () => {
	const stats = await LeagueStatsHelper.GetLeagueStats();
	return { stats };
};
