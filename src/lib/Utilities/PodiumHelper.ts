import type { League } from '$lib/api/dtos/LeagueDtos/League';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { RostersHelper } from './RostersHelper';

export class PodiumHelper {
	static async GetMostRecentWinner() {
		const userId = (await SleeperClient.GetUser('tmallz')).user_id;
		const currentYear = new Date(Date.now()).getFullYear();
		const allCurrentUserLeagues: League[] = await SleeperClient.GetUserLeagues(
			userId,
			'nfl',
			currentYear.toString()
		);
		const currentLeague = allCurrentUserLeagues.find(
			(l) => l.name === import.meta.env.VITE_LEAGUE_NAME
		);

		const mostRecentLeagueId = currentLeague?.previous_league_id ?? '0';

		let previousLeague = await SleeperClient.GetLeague(mostRecentLeagueId);
		let previousWinnersBracket = await SleeperClient.GetWinnersBracket(
			previousLeague.league_id ?? ''
		);
		let previousLooserBracket = await SleeperClient.GetLosersBracket(
			previousLeague.league_id ?? ''
		);

		let playoffRounds = previousWinnersBracket[previousWinnersBracket.length - 1].r;
		let previousWinnerRosterId = previousWinnersBracket.filter(
			(m) => m.r === playoffRounds && m.t1_from?.w
		)[0].w;

		let previousWinner = RostersHelper.GetUserFromRosterId(
			previousWinnerRosterId || 0
		).display_name;
		console.log('previousWinnersBracket', previousWinnersBracket);
		console.log('previousWinner', previousWinner);
	}
}
