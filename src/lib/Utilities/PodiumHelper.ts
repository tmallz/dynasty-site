import type { League } from '$lib/api/dtos/LeagueDtos/League';
import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { RostersHelper } from './RostersHelper';
import { BracketHelper } from './BracketHelper';

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
        if (!Array.isArray(bracket) || bracket.length === 0) return 0;
        const winnerRosterId = BracketHelper.getFinalWinnerRosterId(bracket);
        if (!winnerRosterId) return 0;

        // For winner, we already have the ID
        if (type === 'winner') {
            return winnerRosterId;
        }

        // For runner-up / loser of finals, we still need to identify the other side
        const rounds = bracket.map((m: any) => Number(m.r ?? 0)).filter((n) => !Number.isNaN(n));
        const finalRound = rounds.length ? Math.max(...rounds) : 0;
        const finalMatches = bracket.filter((m: any) => Number(m.r) === finalRound);
        const match = finalMatches.find((m: any) => m.w === winnerRosterId || m.l === winnerRosterId) ?? finalMatches[0];
        if (!match) return 0;

        const resolvedT1 = BracketHelper.resolveRosterId(match.t1 ?? match.t1_from, bracket);
        const resolvedT2 = BracketHelper.resolveRosterId(match.t2 ?? match.t2_from, bracket);

        // Winner: prefer explicit w, else best-effort resolution
        // Runner-up: prefer explicit l, else infer from winner or other resolved side
        if (type === 'runnerUp') {
            if (match.l != null) return Number(match.l);
            if (resolvedT1 != null && resolvedT2 != null) {
                return resolvedT1 === winnerRosterId ? resolvedT2 : resolvedT1;
            }
            return 0;
        }

        // Loser (e.g., losers bracket final): prefer explicit l, else infer non-winner
        if (match.l != null) return Number(match.l);
        if (match.w != null && resolvedT1 != null && resolvedT2 != null) {
            return resolvedT1 === Number(match.w) ? resolvedT2 : resolvedT1;
        }
        return 0;
    }

    private static async getUserFromRosterId(rosterId: number): Promise<LeagueUser> {
        return RostersHelper.GetUserFromRosterId(rosterId || 0);
    }

    static async GetMostRecentWinner(): Promise<LeagueUser> {
        const previousLeague = await this.getPreviousLeague();
        if (!previousLeague) return {} as LeagueUser;

        const winnersBracket = await this.getBracket(previousLeague.league_id, 'winners');
        const winnerRosterId = this.getFinalsMatchup(winnersBracket, 'winner');
        console.log('Winner Roster ID:', winnerRosterId);
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
