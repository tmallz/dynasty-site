import type { League } from '$lib/api/dtos/LeagueDtos/League';
import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { RostersHelper } from './RostersHelper';

export class PodiumHelper {
	private static async getPreviousLeague(): Promise<League | null> {
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

		if (mostRecentLeagueId === '0') {
			return null; // No previous league found
		}

		return await SleeperClient.GetLeague(mostRecentLeagueId);
	}

	private static async getBracket(leagueId: string, type: 'winners' | 'losers'): Promise<any[]> {
		if (type === 'winners') {
			return await SleeperClient.GetWinnersBracket(leagueId);
		} else {
			return await SleeperClient.GetLosersBracket(leagueId);
		}
	}

	private static getFinalsMatchup(bracket: any[], type: 'winner' | 'runnerUp' | 'loser'): number {
		const playoffRounds = bracket[bracket.length - 1].r;

		if (type === 'winner') {
			return bracket.find((m) => m.r === playoffRounds && m.t1_from?.w)?.w ?? 0;
		} else if (type === 'runnerUp') {
			return bracket.find((m) => m.r === playoffRounds && m.t1_from?.w)?.l ?? 0;
		} else {
			return bracket.find((m) => m.r === playoffRounds && (!m.t1_from || m.t1_from.w))?.w ?? 0;
		}
	}

	private static async getUserFromRosterId(rosterId: number): Promise<LeagueUser> {
		return RostersHelper.GetUserFromRosterId(rosterId || 0);
	}

	static async GetMostRecentWinner(): Promise<LeagueUser> {
		const previousLeague = await this.getPreviousLeague();
		if (!previousLeague) return {} as LeagueUser;

		const winnersBracket = await this.getBracket(previousLeague.league_id, 'winners');
		const winnerRosterId = this.getFinalsMatchup(winnersBracket, 'winner');
		return await this.getUserFromRosterId(winnerRosterId);
	}

	static async GetMostRecentRunnerUp(): Promise<LeagueUser> {
		const previousLeague = await this.getPreviousLeague();
		if (!previousLeague) return {} as LeagueUser;

		const winnersBracket = await this.getBracket(previousLeague.league_id, 'winners');
		const runnerUpRosterId = this.getFinalsMatchup(winnersBracket, 'runnerUp');
		return await this.getUserFromRosterId(runnerUpRosterId);
	}

	static async GetMostRecentLoser(): Promise<LeagueUser> {
		const previousLeague = await this.getPreviousLeague();
		if (!previousLeague) return {} as LeagueUser;

		const losersBracket = await this.getBracket(previousLeague.league_id, 'losers');
		const loserRosterId = this.getFinalsMatchup(losersBracket, 'loser');
		return await this.getUserFromRosterId(loserRosterId);
	}
}
