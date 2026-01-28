import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { BracketMatchup } from '$lib/api/dtos/LeagueDtos/BracketMatchup';
import { RostersStore, IsRostersLoaded, LoadRosters } from '$lib/Stores/RosterStore';
import { UsersStore, IsUsersLoaded, LoadUsers } from '$lib/Stores/UserStores';
import { SleeperClient } from '$lib/api/services/SleeperClient';
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

export interface StandingsPreviewResult {
	standings: StandingTeam[];
	season: string;
	isCurrentSeason: boolean;
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
	 * Get league standings sorted by playoff placement, then wins, ties, points for
	 * Handles offseason by showing previous season standings
	 * @param limit Number of teams to return (default 5)
	 * @returns StandingsPreviewResult with standings, season, and current season flag
	 */
	public static async GetStandings(limit: number = 5): Promise<StandingsPreviewResult> {
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

		let rosters: Roster[];
		let users: LeagueUser[];
		let winnersBracket: BracketMatchup[] = [];
		let losersBracket: BracketMatchup[] = [];

		// If using current league, use stores; otherwise fetch directly
		if (isCurrentSeason) {
			if (!IsRostersLoaded()) {
				await LoadRosters(leagueId);
			}
			if (!IsUsersLoaded()) {
				await LoadUsers(leagueId);
			}
			rosters = get(RostersStore) ?? [];
			users = get(UsersStore) ?? [];

			// Fetch brackets for current league
			[winnersBracket, losersBracket] = await Promise.all([
				SleeperClient.GetWinnersBracket(leagueId).catch(() => []),
				SleeperClient.GetLosersBracket(leagueId).catch(() => [])
			]);
		} else {
			// Fetch from previous league directly
			[rosters, users, winnersBracket, losersBracket] = await Promise.all([
				SleeperClient.GetRosters(targetLeagueId),
				SleeperClient.GetLeagueUsers(targetLeagueId),
				SleeperClient.GetWinnersBracket(targetLeagueId).catch(() => []),
				SleeperClient.GetLosersBracket(targetLeagueId).catch(() => [])
			]);
		}

		// Get playoff placements from brackets
		const playoffPlacements = HomepageHelper.getPlayoffPlacements(winnersBracket, losersBracket);

		// Build team data with playoff placements
		const teams = rosters.map((roster) => {
			const user = users.find((u) => u.user_id === roster.owner_id);
			const avatarId = user?.avatar || '';
			const pointsFor = roster.settings.fpts + (roster.settings.fpts_decimal || 0) / 100;

			return {
				rosterId: roster.roster_id,
				teamName: user?.display_name ?? `Team ${roster.roster_id}`,
				avatarUrl: avatarId ? `https://sleepercdn.com/avatars/${avatarId}` : '',
				wins: roster.settings.wins,
				losses: roster.settings.losses,
				ties: roster.settings.ties,
				pointsFor: Math.round(pointsFor * 100) / 100,
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

		// Map to StandingTeam objects with final ranks
		const standings = sortedTeams.slice(0, limit).map((team, index) => ({
			rank: index + 1,
			teamName: team.teamName,
			avatarUrl: team.avatarUrl,
			wins: team.wins,
			losses: team.losses,
			ties: team.ties,
			pointsFor: team.pointsFor
		}));

		return {
			standings,
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
			if (match.p !== undefined && match.w !== undefined && match.l !== undefined) {
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
