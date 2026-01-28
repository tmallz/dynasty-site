import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
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

		// Fetch rosters and users for the target league
		const [rosters, users] = await Promise.all([
			SleeperClient.GetRosters(targetLeagueId),
			SleeperClient.GetLeagueUsers(targetLeagueId)
		]);

		const standings = StandingsHelper.calculateStandings(rosters, users);
		const summary = StandingsHelper.calculateSummary(standings);

		return {
			standings,
			summary,
			season,
			isCurrentSeason
		};
	}

	/**
	 * Calculate full standings from rosters and users
	 */
	private static calculateStandings(rosters: Roster[], users: LeagueUser[]): FullStandingTeam[] {
		// Sort rosters by wins DESC, ties DESC, pointsFor DESC
		const sortedRosters = [...rosters].sort((a, b) => {
			if (b.settings.wins !== a.settings.wins) {
				return b.settings.wins - a.settings.wins;
			}
			if (b.settings.ties !== a.settings.ties) {
				return b.settings.ties - a.settings.ties;
			}
			const aPoints = a.settings.fpts + (a.settings.fpts_decimal || 0) / 100;
			const bPoints = b.settings.fpts + (b.settings.fpts_decimal || 0) / 100;
			return bPoints - aPoints;
		});

		return sortedRosters.map((roster, index) => {
			const user = users.find((u) => u.user_id === roster.owner_id);
			const avatarId = user?.avatar || '';
			const pointsFor = roster.settings.fpts + (roster.settings.fpts_decimal || 0) / 100;
			const pointsAgainst =
				roster.settings.fpts_against + (roster.settings.fpts_against_decimal || 0) / 100;
			const totalGames = roster.settings.wins + roster.settings.losses + roster.settings.ties;
			const winPercentage = totalGames > 0 ? roster.settings.wins / totalGames : 0;

			return {
				rank: index + 1,
				rosterId: roster.roster_id,
				teamName: user?.display_name ?? `Team ${roster.roster_id}`,
				avatarUrl: avatarId ? `https://sleepercdn.com/avatars/${avatarId}` : '',
				wins: roster.settings.wins,
				losses: roster.settings.losses,
				ties: roster.settings.ties,
				pointsFor: Math.round(pointsFor * 100) / 100,
				pointsAgainst: Math.round(pointsAgainst * 100) / 100,
				pointsDiff: Math.round((pointsFor - pointsAgainst) * 100) / 100,
				winPercentage: Math.round(winPercentage * 1000) / 10 // e.g., 75.0%
			};
		});
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
