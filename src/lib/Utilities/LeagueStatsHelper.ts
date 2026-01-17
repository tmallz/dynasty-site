import type { League } from '$lib/api/dtos/LeagueDtos/League';
import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Matchup } from '$lib/api/dtos/LeagueDtos/Matchup';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { LeagueHistoryHelper } from '$lib/Utilities/LeagueHistoryHelper';
import type {
	LeagueScoreRecordDto,
	LeagueStatsPageDto,
	LeagueWinnerDto,
	MatchResultRecordDto,
	WinningPercentageRecordDto
} from '$lib/Utilities/Dtos/LeagueStatsPageDto';
import { BracketHelper } from '$lib/Utilities/BracketHelper';

export class LeagueStatsHelper {
	private static getMaxWeeks(): number {
		// Reasonable upper bound to cover regular season + playoffs
		return 22;
	}

	private static getFinalWinnerRosterId(bracket: any[]): number {
		return BracketHelper.getFinalWinnerRosterId(bracket);
	}

	private static async getAllWinners(leagues: League[]): Promise<LeagueWinnerDto[]> {
		const winners: LeagueWinnerDto[] = [];

		for (const league of leagues) {
			try {
				const bracket = await SleeperClient.GetWinnersBracket(league.league_id);
				const winnerRosterId = LeagueStatsHelper.getFinalWinnerRosterId(bracket as any[]);
				if (!winnerRosterId) continue;

				const rosters: Roster[] = await SleeperClient.GetRosters(league.league_id);
				const users: LeagueUser[] = await SleeperClient.GetLeagueUsers(league.league_id);

				const winnerRoster = rosters.find((r) => r.roster_id === winnerRosterId);
				if (!winnerRoster) continue;

				const winnerUser = users.find((u) => u.user_id === winnerRoster.owner_id);

				winners.push({
					Season: String((league as any).season ?? ''),
					LeagueId: league.league_id,
					RosterId: winnerRosterId,
					UserId: winnerUser?.user_id,
					DisplayName: winnerUser?.display_name
				});
			} catch (error) {
				console.error('Failed to compute winner for league', league.league_id, error);
			}
		}

		return winners;
	}

 	// --- Matchup-based stats ---

	private static async getScoreAndGameStats(
		leagues: League[]
	): Promise<{
		highestWeek: LeagueScoreRecordDto | null;
		lowestWeek: LeagueScoreRecordDto | null;
		highestSeason: LeagueScoreRecordDto | null;
		lowestSeason: LeagueScoreRecordDto | null;
		topWeeks: LeagueScoreRecordDto[];
		bottomWeeks: LeagueScoreRecordDto[];
		topSeasons: LeagueScoreRecordDto[];
		bottomSeasons: LeagueScoreRecordDto[];
		highestWinPcts: WinningPercentageRecordDto[];
		lowestWinPcts: WinningPercentageRecordDto[];
		largestBlowouts: MatchResultRecordDto[];
		closestVictories: MatchResultRecordDto[];
	}> {
		let highestWeek: LeagueScoreRecordDto | null = null;
		let lowestWeek: LeagueScoreRecordDto | null = null;
		const allWeeks: LeagueScoreRecordDto[] = [];

		const seasonTotals = new Map<
			string,
			{
				league: League;
				rosterId: number;
				points: number;
				user?: LeagueUser;
			}
		>();

		// Per-user win/loss tracking
		const userWinLoss = new Map<
			string,
			{
				user: LeagueUser;
				wins: number;
				losses: number;
				games: number;
			}
		>();

		// Game records by matchup id for blowouts / close games
		const games: MatchResultRecordDto[] = [];

		const TOP_WEEKS = 10; // top 10 highest scoring weeks
		const TOP_GAMES = 10;
		const TOP_SEASONS = 3;
		const TOP_USERS = 3;

		for (const league of leagues) {
			let rosters: Roster[] = [];
			let users: LeagueUser[] = [];

			try {
				rosters = await SleeperClient.GetRosters(league.league_id);
				users = await SleeperClient.GetLeagueUsers(league.league_id);
			} catch (error) {
				console.error('Failed to load rosters/users for league', league.league_id, error);
				continue;
			}

			const rosterOwnerMap = new Map<number, LeagueUser | undefined>();
			for (const roster of rosters) {
				const owner = users.find((u) => u.user_id === roster.owner_id);
				rosterOwnerMap.set(roster.roster_id, owner);
			}

			// Build per-week, per-matchup games to determine winners/losers
			for (let week = 1; week <= LeagueStatsHelper.getMaxWeeks(); week++) {
				if(week > 17) {
					break;
				}
				let weekMatchups: Matchup[] = [];
				try {
					weekMatchups = await SleeperClient.GetMatchups(league.league_id, week);
				} catch (error) {
					// If a week is missing or fails, skip it.
					continue;
				}

				if (!Array.isArray(weekMatchups) || weekMatchups.length === 0) continue;

				// Group by matchup_id within this league/season/week
				const matchupGroups = new Map<
					string,
					{
						season: string;
						leagueId: string;
						week: number;
						matchupId: number;
						entries: {
							rosterId: number;
							points: number;
							user?: LeagueUser;
						}[];
					}
				>();

				for (const matchup of weekMatchups) {
					const rosterId = Number((matchup as any).roster_id ?? 0);
					const points = Number((matchup as any).points ?? 0);
					if (!rosterId || Number.isNaN(points)) continue;

					const season = String((league as any).season ?? '');
					const leagueId = league.league_id;
					const user = rosterOwnerMap.get(rosterId);
					const matchupId = Number((matchup as any).matchup_id ?? 0);
					const key = `${leagueId}:${season}:${week}:${matchupId}`;

					// Highest week (single best) and list of all weeks
					const weekRecord: LeagueScoreRecordDto = {
						Season: season,
						LeagueId: leagueId,
						RosterId: rosterId,
						UserId: user?.user_id,
						DisplayName: user?.display_name,
						Week: week,
						MatchupId: matchupId,
						Points: points
					};

					allWeeks.push(weekRecord);

					if (!highestWeek || points > (highestWeek.Points ?? 0)) {
						highestWeek = weekRecord;
					}

					if (!lowestWeek || points < (lowestWeek.Points ?? Number.POSITIVE_INFINITY)) {
						lowestWeek = weekRecord;
					}

					// Season totals
					const seasonKey = `${leagueId}:${rosterId}`;
					const existingSeason = seasonTotals.get(seasonKey);
					if (existingSeason) {
						existingSeason.points += points;
					} else {
						seasonTotals.set(seasonKey, {
							league,
							rosterId,
							points,
							user
						});
					}

					// Group into matchup for win/loss, blowouts, close games
					if (!matchupId) {
						continue;
					}

					let group = matchupGroups.get(key);
					if (!group) {
						group = {
							season,
							leagueId,
							week,
							matchupId,
							entries: []
						};
						matchupGroups.set(key, group);
					}

					group.entries.push({ rosterId, points, user });
				}

				// Resolve winners/losers per matchup group
				for (const group of matchupGroups.values()) {
					if (!group.entries.length) continue;
					// Only consider games with at least 2 entries
					if (group.entries.length < 2) continue;

					const sorted = [...group.entries].sort((a, b) => b.points - a.points);
					const winner = sorted[0];
					const loser = sorted[sorted.length - 1];
					const margin = winner.points - loser.points;
					if (!Number.isFinite(margin) || margin <= 0) {
						continue; // skip ties or negative margins just in case
					}

					// Track game record for blowouts / close games
					games.push({
						Season: group.season,
						LeagueId: group.leagueId,
						Week: group.week,
						MatchupId: group.matchupId,
						WinnerUserId: winner.user?.user_id,
						WinnerDisplayName: winner.user?.display_name,
						WinnerPoints: winner.points,
						LoserUserId: loser.user?.user_id,
						LoserDisplayName: loser.user?.display_name,
						LoserPoints: loser.points,
						Margin: margin
					});

					// Update per-user win/loss stats
					if (winner.user?.user_id) {
						const id = winner.user.user_id;
						let record = userWinLoss.get(id);
						if (!record) {
							record = { user: winner.user, wins: 0, losses: 0, games: 0 };
							userWinLoss.set(id, record);
						}
						record.wins += 1;
						record.games += 1;
					}

					if (loser.user?.user_id) {
						const id = loser.user.user_id;
						let record = userWinLoss.get(id);
						if (!record) {
							record = { user: loser.user, wins: 0, losses: 0, games: 0 };
							userWinLoss.set(id, record);
						}
						record.losses += 1;
						record.games += 1;
					}
				}
			}
		}

		let highestSeason: LeagueScoreRecordDto | null = null;
		let lowestSeason: LeagueScoreRecordDto | null = null;
		const seasonRecords: LeagueScoreRecordDto[] = [];

		for (const entry of seasonTotals.values()) {
			const season = String((entry.league as any).season ?? '');
			const leagueId = entry.league.league_id;
			const rosterId = entry.rosterId;
			const total = entry.points;
			const user = entry.user;

			const seasonRecord: LeagueScoreRecordDto = {
				Season: season,
				LeagueId: leagueId,
				RosterId: rosterId,
				UserId: user?.user_id,
				DisplayName: user?.display_name,
				TotalPoints: total
			};
			seasonRecords.push(seasonRecord);

			if (!highestSeason || total > (highestSeason.TotalPoints ?? 0)) {
				highestSeason = seasonRecord;
			}

			if (!lowestSeason || total < (lowestSeason.TotalPoints ?? Number.POSITIVE_INFINITY)) {
				lowestSeason = seasonRecord;
			}
		}

		// Top scoring seasons (highest total points)
		const topSeasons = seasonRecords
			.filter((s) => typeof s.TotalPoints === 'number')
			.sort((a, b) => (b.TotalPoints ?? 0) - (a.TotalPoints ?? 0))
			.slice(0, TOP_SEASONS);

		// Bottom scoring seasons (lowest total points)
		const bottomSeasons = seasonRecords
			.filter((s) => typeof s.TotalPoints === 'number')
			.sort((a, b) => (a.TotalPoints ?? 0) - (b.TotalPoints ?? 0))
			.slice(0, TOP_SEASONS);

		// Top and bottom scoring weeks
		const sortedWeeks = allWeeks
			.filter((w) => typeof w.Points === 'number')
			.sort((a, b) => (b.Points ?? 0) - (a.Points ?? 0));
		const topWeeks = sortedWeeks.slice(0, TOP_WEEKS);
		const bottomWeeks = [...sortedWeeks].reverse().slice(0, TOP_WEEKS);

		// Winning percentage extremes
		const winPctRecords: WinningPercentageRecordDto[] = [];

		for (const record of userWinLoss.values()) {
			if (!record.games) continue;
			const pct = record.wins / record.games;

			const dto: WinningPercentageRecordDto = {
				UserId: record.user.user_id,
				DisplayName: record.user.display_name,
				Wins: record.wins,
				Losses: record.losses,
				Games: record.games,
				WinPercentage: pct
			};
			winPctRecords.push(dto);
		}

		const sortedWin = winPctRecords.sort(
			(a, b) => (b.WinPercentage ?? 0) - (a.WinPercentage ?? 0)
		);
		const highestWinPcts = sortedWin.slice(0, TOP_USERS);
		const lowestWinPcts = [...sortedWin]
			.reverse()
			.slice(0, TOP_USERS);

		// Blowouts and closest games
		const largestBlowouts = [...games]
			.filter((g) => typeof g.Margin === 'number')
			.sort((a, b) => (b.Margin ?? 0) - (a.Margin ?? 0))
			.slice(0, TOP_GAMES);

		const closestVictories = [...games]
			.filter((g) => typeof g.Margin === 'number')
			.sort((a, b) => (a.Margin ?? 0) - (b.Margin ?? 0))
			.slice(0, TOP_GAMES);

		return {
			highestWeek,
			lowestWeek,
			highestSeason,
			lowestSeason,
			topWeeks,
			bottomWeeks,
			topSeasons,
			bottomSeasons,
			highestWinPcts,
			lowestWinPcts,
			largestBlowouts,
			closestVictories
		};
	}

	public static async GetLeagueStats(): Promise<LeagueStatsPageDto> {
		const leagues = await LeagueHistoryHelper.GetLeagueChainFromCurrent();
		if (!leagues.length) {
			return {};
		}

		const winners = await LeagueStatsHelper.getAllWinners(leagues);
		const {
			highestWeek,
			lowestWeek,
			highestSeason,
			lowestSeason,
			topWeeks,
			bottomWeeks,
			topSeasons,
			bottomSeasons,
			highestWinPcts,
			lowestWinPcts,
			largestBlowouts,
			closestVictories
		} = await LeagueStatsHelper.getScoreAndGameStats(leagues);

		return {
			Winners: winners,
			HighestWeek: highestWeek,
			LowestWeek: lowestWeek,
			HighestSeason: highestSeason,
			LowestSeason: lowestSeason,
			TopSeasons: topSeasons,
			BottomSeasons: bottomSeasons,
			HighestWinningPercentages: highestWinPcts,
			LowestWinningPercentages: lowestWinPcts,
			LargestBlowouts: largestBlowouts,
			ClosestVictories: closestVictories,
			TopScoringWeeks: topWeeks,
			BottomScoringWeeks: bottomWeeks
		};
	}

	public static async GetLeagueStatsCached(): Promise<LeagueStatsPageDto> {
		// Use filesystem module that works in both server and build contexts
		const fs = await import('fs');
		const path = await import('path');
		
		const cacheFilePath = path.join(process.cwd(), 'static', 'league-stats.json');
		
		try {
			// Check if cache file exists
			if (fs.existsSync(cacheFilePath)) {
				const fileStats = fs.statSync(cacheFilePath);
				const fileAgeInHours = (Date.now() - fileStats.mtimeMs) / (1000 * 60 * 60);
				
				console.log(`League stats cache age: ${fileAgeInHours.toFixed(2)} hours`);
				
				// If cache is less than 24 hours old, use it
				if (fileAgeInHours < 24) {
					console.log('Loading league stats from cache');
					const cachedData = fs.readFileSync(cacheFilePath, 'utf-8');
					return JSON.parse(cachedData);
				} else {
					console.log('Cache is stale, recomputing league stats');
				}
			} else {
				console.log('No cache file found, computing league stats for first time');
			}
		} catch (error) {
			console.error('Error checking cache file:', error);
		}
		
		// Compute fresh stats
		console.log('Computing league stats (this may take 20-60 seconds)...');
		const stats = await LeagueStatsHelper.GetLeagueStats();
		
		// Save to cache
		try {
			fs.writeFileSync(cacheFilePath, JSON.stringify(stats, null, 2));
			console.log('League stats cached successfully');
		} catch (error) {
			console.error('Error writing cache file:', error);
		}
		
		return stats;
	}
}
