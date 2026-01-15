import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Matchup } from '$lib/api/dtos/LeagueDtos/Matchup';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
import type { League } from '$lib/api/dtos/LeagueDtos/League';
import type { BracketMatchup } from '$lib/api/dtos/LeagueDtos/BracketMatchup';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { IsPlayersLoaded, LoadPlayers, PlayersStore } from '$lib/Stores/PlayerStore';
import { get } from 'svelte/store';
import type { MatchupPageDto } from './Dtos/MatchupPageDto';
import { RostersHelper } from './RostersHelper';
import { IsRostersLoaded, LoadRosters, RostersStore } from '$lib/Stores/RosterStore';
import { IsUsersLoaded, LoadUsers, UsersStore } from '$lib/Stores/UserStores';
import { StoresHelper } from './StoresHelper';
import { AvatarHelper } from './AvatarHelper';

export interface ProcessedBracketMatchup {
	round: number;
	matchId: number;
	team1Name: string;
	team1Score: number;
	team1Avatar?: string;
	team2Name: string;
	team2Score: number;
	team2Avatar?: string;
	winnerName: string;
}

export interface MatchupPageData {
	currentWeek: number;
	isPlayoffs: boolean;
	matchups: MatchupPageDto[];
	winnersBracket?: ProcessedBracketMatchup[];
	losersBracket?: ProcessedBracketMatchup[];
	consolationBracket?: ProcessedBracketMatchup[];
}

export class MatchupHelper {
	public static async GetPageMatchups(
		providedRosters?: Roster[],
		providedUsers?: LeagueUser[],
		includePlayerDetails: boolean = true,
		overrideWeek?: number
	): Promise<MatchupPageDto[]> {
		let leagueId = import.meta.env.VITE_LEAGUE_ID;
		let week: number = 1;
		let matchups: Matchup[] = [];
		let rosters: Roster[] = [];
		let users: LeagueUser[] = [];

		// Get target week and determine which league to use (unless overridden)
		if (overrideWeek) {
			week = overrideWeek;
		} else {
			const { week: targetWeek } = await MatchupHelper.GetTargetWeekForDisplay();
			week = targetWeek;
		}
		
		// Check if we need previous league
		const { usePreviousLeague } = await MatchupHelper.GetTargetWeekForDisplay();

		// If we need previous league data, fetch that league ID
		if (usePreviousLeague) {
			const currentLeague = await SleeperClient.GetLeague(leagueId);
			if (currentLeague.previous_league_id) {
				leagueId = currentLeague.previous_league_id;
			}
		}

		// Use provided data or load from stores
		if (providedRosters && providedUsers) {
			rosters = providedRosters;
			users = providedUsers;
		} else {
			// Ensure stores are loaded before accessing them (client-side only)
			await StoresHelper.EnsureStoresLoaded();
			rosters = get(RostersStore) ?? [];
			users = get(UsersStore) ?? [];
		}

		matchups = await SleeperClient.GetMatchups(leagueId, week);

		let pageMatchups: MatchupPageDto[] = [];

		for (const m of matchups) {
			let currentRoster = rosters.find((r) => r.roster_id === m.roster_id) ?? ({} as Roster);
			let pageMatchup = await MatchupHelper.MapMatchupToPageDto(m, currentRoster, users, includePlayerDetails);
			pageMatchups.push(pageMatchup);
		}

		return pageMatchups;
	}

	private static async MapMatchupToPageDto(
		matchup: Matchup,
		roster: Roster,
		providedUsers?: LeagueUser[],
		includePlayerDetails: boolean = true
	): Promise<MatchupPageDto> {
		let users: LeagueUser[] = providedUsers ?? get(UsersStore) ?? [];
		let pageMatchup: MatchupPageDto = {};
		pageMatchup.MatchupId = matchup.matchup_id;
		pageMatchup.RosterId = roster.roster_id;
		pageMatchup.TeamName = users.find((u) => u.user_id === roster.owner_id)?.display_name ?? '';
		
		// Include players_points from matchup API response
		pageMatchup.PlayersPoints = matchup.players_points || {};
		
		// Store the historical lineup from this matchup (not current roster)
		pageMatchup.StarterIds = matchup.starters;
		pageMatchup.PlayerIds = matchup.players;

		// Only include player details if requested (requires PlayersStore which may not be available server-side)
		if (includePlayerDetails) {
			pageMatchup.Starters = RostersHelper.MapPlayerNames(matchup.starters);
			const benchIds = matchup.players.filter((p) => !matchup.starters.includes(p));
			pageMatchup.Bench = RostersHelper.MapPlayerNames(benchIds) as Record<string, Player>;
		}

		pageMatchup.Score = matchup.points;

		// Get avatar URL directly without loading stores
		const user = users.find((u) => u.user_id === roster.owner_id);
		const avatarId = user?.avatar || '';
		pageMatchup.AvatarUrl = `https://sleepercdn.com/avatars/${avatarId}`;
		
		return pageMatchup;
	}

	/**
	 * Determines what week to display and whether we're in playoffs
	 * @returns Object with week number, isPlayoffs flag, and usePreviousLeague flag
	 */
	public static async GetTargetWeekForDisplay(): Promise<{ 
		week: number; 
		isPlayoffs: boolean;
		usePreviousLeague: boolean;
	}> {
		const leagueId = import.meta.env.VITE_LEAGUE_ID;
		const nflState = await SleeperClient.GetSportState('nfl');
		const currentLeague = await SleeperClient.GetLeague(leagueId);
		const currentNflSeason = nflState.season;
		const leagueSeason = currentLeague.season;

		// Check if the league season matches the current NFL season
		const isCurrentSeason = leagueSeason === currentNflSeason;

		if (nflState.season_type === 'regular' && isCurrentSeason) {
			// Regular season - show current week
			return {
				week: nflState.display_week ?? 1,
				isPlayoffs: false,
				usePreviousLeague: false
			};
		} else if (nflState.season_type === 'post') {
			// NFL Playoffs - fantasy season ends at week 17, so show week 17 (championship week)
			return {
				week: 17,
				isPlayoffs: true,
				usePreviousLeague: !isCurrentSeason
			};
		} else {
			// Offseason (preseason) - search backwards for last completed week
			// Start with the league that matches the most recent completed season
			const searchLeagueId = isCurrentSeason ? leagueId : currentLeague.previous_league_id;

			if (!searchLeagueId) {
				// No previous league, default to week 1
				return {
					week: 1,
					isPlayoffs: false,
					usePreviousLeague: false
				};
			}

			// Search from week 18 down to 1 to find the last week with data
			// Note: Fantasy season is weeks 1-17 (regular season 1-14, playoffs 15-17)
			for (let week = 17; week >= 1; week--) {
				try {
					const matchups = await SleeperClient.GetMatchups(searchLeagueId, week);
					if (matchups && matchups.length > 0) {
						// Found data! Determine if this was playoffs (weeks 15-17)
						const isPlayoffs = week >= 15;
						return {
							week,
							isPlayoffs,
							usePreviousLeague: searchLeagueId !== leagueId
						};
					}
				} catch (error) {
					// No data for this week, continue searching
					continue;
				}
			}

			// No data found, default to week 1 regular season
			return {
				week: 1,
				isPlayoffs: false,
				usePreviousLeague: false
			};
		}
	}

	/**
	 * Gets all data needed for the matchups page (regular season or playoffs)
	 */
	public static async GetMatchupPageData(): Promise<MatchupPageData> {
		let leagueId = import.meta.env.VITE_LEAGUE_ID;
		
		// Get target week and playoff status
		const { week, isPlayoffs, usePreviousLeague } = await MatchupHelper.GetTargetWeekForDisplay();

		if (isPlayoffs) {
			// Get the correct league ID (current or previous)
			if (usePreviousLeague) {
				const currentLeague = await SleeperClient.GetLeague(leagueId);
				if (currentLeague.previous_league_id) {
					leagueId = currentLeague.previous_league_id;
				}
			}

			// Load rosters and users for bracket processing
			await LoadRosters(leagueId);
			await LoadUsers(leagueId);
			const rosters = get(RostersStore);
			const users = get(UsersStore);

			// Fetch bracket data
			const allBrackets = await SleeperClient.GetWinnersBracket(leagueId);
			const actualLosersBracket = await SleeperClient.GetLosersBracket(leagueId);
			
			// Separate winners bracket (no p field or p === 1) from consolation bracket (p > 1)
			const winnersBracket = allBrackets.filter(b => !b.p || b.p === 1);
			const consolationBracket = allBrackets.filter(b => b.p && b.p > 1);

			// Process brackets
			const processedWinnersBracket = await MatchupHelper.ProcessBrackets(
				winnersBracket,
				leagueId,
				rosters,
				users
			);
			
			// Add bye matchups for top 2 seeds in round 2 that didn't play in round 1
			const round2Matchups = processedWinnersBracket.filter(m => m.round === 2);
			round2Matchups.forEach(r2Match => {
				// Check if team1 didn't play in round 1 (they had a bye)
				const team1InRound1 = processedWinnersBracket.some(r1 => 
					r1.round === 1 && (r1.winnerName === r2Match.team1Name)
				);
				if (!team1InRound1 && r2Match.team1Name !== 'TBD') {
					processedWinnersBracket.push({
						round: 1,
						matchId: 100 + r2Match.matchId,
						team1Name: r2Match.team1Name,
						team1Score: 0,
						team1Avatar: r2Match.team1Avatar,
						team2Name: 'BYE',
						team2Score: 0,
						team2Avatar: undefined,
						winnerName: r2Match.team1Name
					});
				}
				
				// Check if team2 didn't play in round 1 (they had a bye)
				const team2InRound1 = processedWinnersBracket.some(r1 => 
					r1.round === 1 && (r1.winnerName === r2Match.team2Name)
				);
				if (!team2InRound1 && r2Match.team2Name !== 'TBD') {
					processedWinnersBracket.push({
						round: 1,
						matchId: 101 + r2Match.matchId,
						team1Name: r2Match.team2Name,
						team1Score: 0,
						team1Avatar: r2Match.team2Avatar,
						team2Name: 'BYE',
						team2Score: 0,
						team2Avatar: undefined,
						winnerName: r2Match.team2Name
					});
				}
			});
			
			const processedConsolationBracket = await MatchupHelper.ProcessBrackets(
				consolationBracket,
				leagueId,
				rosters,
				users
			);
			
			const processedLosersBracket = await MatchupHelper.ProcessBrackets(
				actualLosersBracket,
				leagueId,
				rosters,
				users
			);

			// Also fetch regular matchups for toggle view (without player details for server-side)
			// During playoffs, show the last regular season week (week 14) for matchup toggle
			const matchups = await MatchupHelper.GetPageMatchups(rosters, users, false, 14);

			return {
				currentWeek: week,
				isPlayoffs: true,
				matchups,
				winnersBracket: processedWinnersBracket,
				losersBracket: processedLosersBracket,
				consolationBracket: processedConsolationBracket
			};
		} else {
			// Regular season - load rosters and users first
			await LoadRosters(leagueId);
			await LoadUsers(leagueId);
			const rosters = get(RostersStore);
			const users = get(UsersStore);
			
			// For regular season, use current week
			const matchups = await MatchupHelper.GetPageMatchups(rosters, users, false);
			
			return {
				currentWeek: week,
				isPlayoffs: false,
				matchups
			};
		}
	}

	private static GetTeamName(rosterId: number | null, rosters: Roster[], users: LeagueUser[]): string {
		if (!rosterId) return 'TBD';
		const roster = rosters.find(r => r.roster_id === rosterId);
		if (!roster) return `Team ${rosterId}`;
		const user = users.find(u => u.user_id === roster.owner_id);
		return user?.display_name ?? `Team ${rosterId}`;
	}

	private static GetTeamAvatar(rosterId: number | null, rosters: Roster[], users: LeagueUser[]): string | undefined {
		if (!rosterId) return undefined;
		const roster = rosters.find(r => r.roster_id === rosterId);
		if (!roster) return undefined;
		const user = users.find(u => u.user_id === roster.owner_id);
		if (!user?.avatar) return undefined;
		return `https://sleepercdn.com/avatars/${user.avatar}`;
	}

	private static GetMatchupScore(rosterId: number | null, allMatchups: Matchup[]): number {
		if (!rosterId) return 0;
		const matchup = allMatchups.find(m => m.roster_id === rosterId);
		return matchup?.points ?? 0;
	}

	private static async ProcessBrackets(
		brackets: BracketMatchup[],
		leagueId: string,
		rosters: Roster[],
		users: LeagueUser[]
	): Promise<ProcessedBracketMatchup[]> {
		// Fetch matchups for playoff weeks (15, 16, 17)
		const [week15Matchups, week16Matchups, week17Matchups] = await Promise.all([
			SleeperClient.GetMatchups(leagueId, 15),
			SleeperClient.GetMatchups(leagueId, 16),
			SleeperClient.GetMatchups(leagueId, 17)
		]);

		const processed: ProcessedBracketMatchup[] = [];

		for (const bracket of brackets) {
			// Map round to week (round 1 = week 15, round 2 = week 16, round 3 = week 17)
			const week = 14 + bracket.r;
			let weekMatchups: Matchup[] = [];
			if (week === 15) weekMatchups = week15Matchups;
			else if (week === 16) weekMatchups = week16Matchups;
			else if (week === 17) weekMatchups = week17Matchups;

			// Extract roster IDs (t1/t2 can be number or object)
			const team1RosterId = typeof bracket.t1 === 'number' ? bracket.t1 : null;
			const team2RosterId = typeof bracket.t2 === 'number' ? bracket.t2 : null;

			// Check for bye weeks (when t2 is an object or null in round 1)
			const isByeWeek = bracket.r === 1 && typeof bracket.t2 === 'object';

			const team1Name = MatchupHelper.GetTeamName(team1RosterId, rosters, users);
			const team2Name = isByeWeek ? 'BYE' : MatchupHelper.GetTeamName(team2RosterId, rosters, users);
			const team1Score = MatchupHelper.GetMatchupScore(team1RosterId, weekMatchups);
			const team2Score = isByeWeek ? 0 : MatchupHelper.GetMatchupScore(team2RosterId, weekMatchups);
			const winnerName = isByeWeek ? team1Name : MatchupHelper.GetTeamName(bracket.w ?? null, rosters, users);
			const team1Avatar = MatchupHelper.GetTeamAvatar(team1RosterId, rosters, users);
			const team2Avatar = isByeWeek ? undefined : MatchupHelper.GetTeamAvatar(team2RosterId, rosters, users);

			processed.push({
				round: bracket.r,
				matchId: bracket.m,
				team1Name,
				team1Score,
				team1Avatar,
				team1RosterId,
				team2Name,
				team2Score,
				team2Avatar,
				team2RosterId,
				winnerName
			});
		}

		// Sort by round then matchId
		return processed.sort((a, b) => {
			if (a.round !== b.round) return a.round - b.round;
			return a.matchId - b.matchId;
		});
	}
}
