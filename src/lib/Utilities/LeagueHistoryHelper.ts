import type { League } from '$lib/api/dtos/LeagueDtos/League';
import { SleeperClient } from '$lib/api/services/SleeperClient';

export class LeagueHistoryHelper {
	/**
	 * Returns the chain of leagues starting from the current league id in env,
	 * following previous_league_id back to the first season.
	 *
	 * The array is ordered from most recent league to oldest league.
	 */
	public static async GetLeagueChainFromCurrent(): Promise<League[]> {
		const leagues: League[] = [];
		let currentLeagueId = import.meta.env.VITE_LEAGUE_ID as string | undefined;

		while (currentLeagueId) {
			const league = await SleeperClient.GetLeague(currentLeagueId);
			leagues.push(league);

			const previousLeagueId = (league as any).previous_league_id as string | undefined;
			if (!previousLeagueId || previousLeagueId === '0') {
				break;
			}

			currentLeagueId = previousLeagueId;
		}

		// Most recent to oldest as requested
		return leagues;
	}
}
