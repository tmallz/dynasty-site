import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import { RostersStore, IsRostersLoaded, LoadRosters } from '$lib/Stores/RosterStore';
import { UsersStore, IsUsersLoaded, LoadUsers } from '$lib/Stores/UserStores';
import { get } from 'svelte/store';
import { MatchupHelper } from './MatchupHelper';

export interface StandingTeam {
	rank: number;
	teamName: string;
	avatarUrl: string;
	wins: number;
	losses: number;
	ties: number;
	pointsFor: number;
}

export interface MatchupPreviewDto {
	matchupId: number;
	team1Name: string;
	team1Avatar: string;
	team1Score: number;
	team2Name: string;
	team2Avatar: string;
	team2Score: number;
}

export interface MatchupsPreviewResult {
	matchups: MatchupPreviewDto[];
	week: number;
	isOffseason: boolean;
}

export class HomepageHelper {
	/**
	 * Get league standings sorted by wins, ties, then points for
	 * @param limit Number of teams to return (default 5)
	 * @returns Array of StandingTeam objects
	 */
	public static async GetStandings(limit: number = 5): Promise<StandingTeam[]> {
		const leagueId = import.meta.env.VITE_LEAGUE_ID;

		// Ensure stores are loaded
		if (!IsRostersLoaded()) {
			await LoadRosters(leagueId);
		}
		if (!IsUsersLoaded()) {
			await LoadUsers(leagueId);
		}

		const rosters = get(RostersStore) ?? [];
		const users = get(UsersStore) ?? [];

		// Sort rosters by wins DESC, ties DESC, pointsFor DESC
		const sortedRosters = [...rosters].sort((a, b) => {
			// First by wins
			if (b.settings.wins !== a.settings.wins) {
				return b.settings.wins - a.settings.wins;
			}
			// Then by ties
			if (b.settings.ties !== a.settings.ties) {
				return b.settings.ties - a.settings.ties;
			}
			// Then by points for (combine fpts and fpts_decimal)
			const aPoints = a.settings.fpts + (a.settings.fpts_decimal || 0) / 100;
			const bPoints = b.settings.fpts + (b.settings.fpts_decimal || 0) / 100;
			return bPoints - aPoints;
		});

		// Map to StandingTeam objects
		return sortedRosters.slice(0, limit).map((roster, index) => {
			const user = users.find((u) => u.user_id === roster.owner_id);
			const avatarId = user?.avatar || '';
			const pointsFor = roster.settings.fpts + (roster.settings.fpts_decimal || 0) / 100;

			return {
				rank: index + 1,
				teamName: user?.display_name ?? `Team ${roster.roster_id}`,
				avatarUrl: avatarId ? `https://sleepercdn.com/avatars/${avatarId}` : '',
				wins: roster.settings.wins,
				losses: roster.settings.losses,
				ties: roster.settings.ties,
				pointsFor: Math.round(pointsFor * 100) / 100
			};
		});
	}

	/**
	 * Get current week matchups preview for the homepage
	 * @returns Object with matchups array, current week, and offseason flag
	 */
	public static async GetCurrentWeekMatchupsPreview(): Promise<MatchupsPreviewResult> {
		const leagueId = import.meta.env.VITE_LEAGUE_ID;

		// Ensure stores are loaded
		if (!IsRostersLoaded()) {
			await LoadRosters(leagueId);
		}
		if (!IsUsersLoaded()) {
			await LoadUsers(leagueId);
		}

		const rosters = get(RostersStore) ?? [];
		const users = get(UsersStore) ?? [];

		// Get current week info
		const { week, isPlayoffs, usePreviousLeague } = await MatchupHelper.GetTargetWeekForDisplay();

		// Check if we're in offseason (no meaningful matchups to show)
		const isOffseason = usePreviousLeague && isPlayoffs;

		// Get matchups for the page (without player details for preview)
		const pageMatchups = await MatchupHelper.GetPageMatchups(rosters, users, false);

		// Group matchups by matchup_id to pair teams
		const matchupPairs = new Map<number, typeof pageMatchups>();
		for (const matchup of pageMatchups) {
			if (matchup.MatchupId) {
				const existing = matchupPairs.get(matchup.MatchupId) || [];
				existing.push(matchup);
				matchupPairs.set(matchup.MatchupId, existing);
			}
		}

		// Convert to MatchupPreviewDto array
		const previews: MatchupPreviewDto[] = [];
		for (const [matchupId, teams] of matchupPairs) {
			if (teams.length >= 2) {
				const team1 = teams[0];
				const team2 = teams[1];

				previews.push({
					matchupId,
					team1Name: team1.TeamName ?? 'Unknown',
					team1Avatar: team1.AvatarUrl ?? '',
					team1Score: team1.Score ?? 0,
					team2Name: team2.TeamName ?? 'Unknown',
					team2Avatar: team2.AvatarUrl ?? '',
					team2Score: team2.Score ?? 0
				});
			}
		}

		// Sort by matchup ID for consistent ordering
		previews.sort((a, b) => a.matchupId - b.matchupId);

		return {
			matchups: previews,
			week,
			isOffseason
		};
	}
}
