import type { PageServerLoad } from './$types';
import { SleeperClient } from '$lib/api/services/SleeperClient';

export const load: PageServerLoad = async () => {
	// Just load the Sleeper state server-side for quick access
	// Let client handle the complex transaction/player data
	const sleeperStatePromise = SleeperClient.GetSportState('nfl');

	return {
		streamed: {
			sleeperState: sleeperStatePromise
		}
	};
};
