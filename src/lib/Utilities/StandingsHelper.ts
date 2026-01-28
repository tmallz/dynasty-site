import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { BracketMatchup } from '$lib/api/dtos/LeagueDtos/BracketMatchup';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { get } from 'svelte/store';
import { RostersStore } from '$lib/Stores/RosterStore';
import { UsersStore } from '$lib/Stores/UserStores';
import { StoresHelper } from './StoresHelper';

export interface FullStandingTeam {
	rank: number;
	rosterId: number;
	teamName: string;
	avatarUrl: string;
	wins: number;
	losses: number;
	ties: number;
	pointsFor: number;
	pointsAgainst: number;
	pointsDiff: number;
	winPercentage: number;
}

export interface StandingsSummary {
	totalTeams: number;
	totalGamesPlayed: number;
	highestScorer: { name: string; points: number };
}

export interface StandingsPageData {
	standings: FullStandingTeam[];
	summary: StandingsSummary;
	season: string;
	isCurrentSeason: boolean;
}

export class StandingsHelper {
	/**
	 * Get full standings data, handling offseason by showing previous season
	 */
	public static async GetStandingsPageData(): Promise<StandingsPageData> {
		const leagueId = import.meta.env.VITE_LEAGUE_ID;
		const nflState = await SleeperClient.GetSportState('nfl');
		const currentLeague = await SleeperClient.GetLeague(leagueId);

		const isOffseason = nflState.season_type === 'off' || nflState.season_type === 'pre';
		const leagueSeason = currentLeague.season;
		const nflSeason = nflState.season;

		// Determine if we should use previous league data
		let targetLeagueId = leagueId;
		let season = leagueSeason ?? nflSeason ?? new Date().getFullYear().toString();
		let isCurrentSeason = true;

		// If offseason or league season doesn't match NFL season, use previous league
		if (isOffseason || leagueSeason !== nflSeason) {
			if (currentLeague.previous_league_id) {
				targetLeagueId = currentLeague.previous_league_id;
				const previousLeague = await SleeperClient.GetLeague(targetLeagueId);
				season = previousLeague.season ?? season;
				isCurrentSeason = false;
			}
		}

		// Fetch rosters, users, and brackets for the target league
		const [rosters, users, winnersBracket, losersBracket] = await Promise.all([
			SleeperClient.GetRosters(targetLeagueId),
			SleeperClient.GetLeagueUsers(targetLeagueId),
			SleeperClient.GetWinnersBracket(targetLeagueId).catch(() => []),
			SleeperClient.GetLosersBracket(targetLeagueId).catch(() => [])
		]);

		// Get playoff placements from brackets
		const playoffPlacements = StandingsHelper.getPlayoffPlacements(winnersBracket, losersBracket);

		const standings = StandingsHelper.calculateStandings(rosters, users, playoffPlacements);
		const summary = StandingsHelper.calculateSummary(standings);

		return {
			standings,
			summary,
			season,
			isCurrentSeason
		};
	}

	/**
	 * Extract final placements from playoff brackets
	 * Returns a map of rosterId -> final placement (1st, 2nd, etc.)
	 *
	 * Only uses the winners bracket since that determines actual championship standings.
	 * The losers/consolation bracket is typically for draft order and doesn't represent
	 * true standings (teams compete to lose in "toilet bowl" formats).
	 */
	private static getPlayoffPlacements(
		winnersBracket: BracketMatchup[],
		_losersBracket: BracketMatchup[]
	): Map<number, number> {
		const placements = new Map<number, number>();

		// Only process winners bracket - these determine actual standings
		for (const match of winnersBracket) {
			// Only process completed matches with placement info
			if (match.p !== undefined && match.w !== undefined && match.l !== undefined) {
				// The placement field (p) indicates what place this match determines
				// Winner gets the placement, loser gets placement + 1
				const winnerRosterId = match.w;
				const loserRosterId = match.l;

				// For championship match (p=1), winner is 1st, loser is 2nd
				// For 3rd place match (p=3), winner is 3rd, loser is 4th
				if (!placements.has(winnerRosterId)) {
					placements.set(winnerRosterId, match.p);
				}
				if (!placements.has(loserRosterId)) {
					placements.set(loserRosterId, match.p + 1);
				}
			}
		}

		return placements;
	}

	/**
	 * Calculate full standings from rosters and users, incorporating playoff placements
	 */
	private static calculateStandings(
		rosters: Roster[],
		users: LeagueUser[],
		playoffPlacements: Map<number, number> = new Map()
	): FullStandingTeam[] {
		// Build team data first
		const teams = rosters.map((roster) => {
			const user = users.find((u) => u.user_id === roster.owner_id);
			const avatarId = user?.avatar || '';
			const pointsFor = roster.settings.fpts + (roster.settings.fpts_decimal || 0) / 100;
			const pointsAgainst =
				roster.settings.fpts_against + (roster.settings.fpts_against_decimal || 0) / 100;
			const totalGames = roster.settings.wins + roster.settings.losses + roster.settings.ties;
			const winPercentage = totalGames > 0 ? roster.settings.wins / totalGames : 0;

			return {
				rosterId: roster.roster_id,
				teamName: user?.display_name ?? `Team ${roster.roster_id}`,
				avatarUrl: avatarId ? `https://sleepercdn.com/avatars/${avatarId}` : '',
				wins: roster.settings.wins,
				losses: roster.settings.losses,
				ties: roster.settings.ties,
				pointsFor: Math.round(pointsFor * 100) / 100,
				pointsAgainst: Math.round(pointsAgainst * 100) / 100,
				pointsDiff: Math.round((pointsFor - pointsAgainst) * 100) / 100,
				winPercentage: Math.round(winPercentage * 1000) / 10,
				playoffPlacement: playoffPlacements.get(roster.roster_id)
			};
		});

		// Sort: teams with playoff placements first (by placement), then by regular season record
		const sortedTeams = teams.sort((a, b) => {
			// Both have playoff placements - sort by placement
			if (a.playoffPlacement !== undefined && b.playoffPlacement !== undefined) {
				return a.playoffPlacement - b.playoffPlacement;
			}
			// Only a has playoff placement - a comes first
			if (a.playoffPlacement !== undefined) {
				return -1;
			}
			// Only b has playoff placement - b comes first
			if (b.playoffPlacement !== undefined) {
				return 1;
			}
			// Neither has playoff placement - sort by regular season record
			if (b.wins !== a.wins) {
				return b.wins - a.wins;
			}
			if (b.ties !== a.ties) {
				return b.ties - a.ties;
			}
			return b.pointsFor - a.pointsFor;
		});

		// Assign final ranks
		return sortedTeams.map((team, index) => ({
			rank: index + 1,
			rosterId: team.rosterId,
			teamName: team.teamName,
			avatarUrl: team.avatarUrl,
			wins: team.wins,
			losses: team.losses,
			ties: team.ties,
			pointsFor: team.pointsFor,
			pointsAgainst: team.pointsAgainst,
			pointsDiff: team.pointsDiff,
			winPercentage: team.winPercentage
		}));
	}

	/**
	 * Calculate summary stats from standings
	 */
	private static calculateSummary(standings: FullStandingTeam[]): StandingsSummary {
		const totalTeams = standings.length;
		const totalGamesPlayed = standings.reduce(
			(sum, team) => sum + team.wins + team.losses + team.ties,
			0
		) / 2; // Divide by 2 since each game has 2 teams

		const highestScorer = standings.reduce(
			(highest, team) => (team.pointsFor > highest.points ? { name: team.teamName, points: team.pointsFor } : highest),
			{ name: '', points: 0 }
		);

		return {
			totalTeams,
			totalGamesPlayed: Math.round(totalGamesPlayed),
			highestScorer
		};
	}
}
