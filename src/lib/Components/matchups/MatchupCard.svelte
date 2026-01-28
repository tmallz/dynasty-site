<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { MatchupPageDto } from '$lib/Utilities/Dtos/MatchupPageDto';
	import { RosterSorter } from '$lib/Utilities/RosterSorter';
	import TeamHeader from '$lib/Components/rosters/TeamHeader.svelte';
	import RosterSpot from '$lib/Components/rosters/RosterSpot.svelte';

	export let team1: MatchupPageDto;
	export let team2: MatchupPageDto;
	export let matchupId: string;
	export let displayWeek: number | undefined;
	export let rosterPositions: string[] = [];
	export let animationDelay: number = 0;

	// Expanded state
	let expandedRoster = false;
	let expandedStats = false;
	let expandedBench: Record<number, boolean> = {};

	// Season rank data (lazy loaded)
	let seasonRankData: { team1Rank: number; team2Rank: number; totalWeeks: number } | null = null;
	let loadingSeasonRank = false;

	// Track failed avatar loads
	let failedAvatars = new Set<string>();

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	function toggleRoster() {
		expandedRoster = !expandedRoster;
	}

	function toggleStats() {
		expandedStats = !expandedStats;
	}

	function toggleBench(teamIdx: number) {
		expandedBench[teamIdx] = !expandedBench[teamIdx];
		expandedBench = expandedBench;
	}

	function getBenchPoints(matchup: MatchupPageDto): string {
		if (!matchup.Bench || !matchup.PlayersPoints) return '0.00';

		let total = 0;
		Object.keys(matchup.Bench).forEach((playerId) => {
			total += matchup.PlayersPoints?.[playerId] || 0;
		});

		return total.toFixed(2);
	}

	function getTopScorer(group: MatchupPageDto[]) {
		let topPlayer: any = null;
		let topScore = 0;

		group.forEach((matchup) => {
			Object.values(matchup.Starters ?? {}).forEach((player: any) => {
				const score = player.stats?.pts_half_ppr || player.stats?.pts_ppr || 0;
				if (score > topScore) {
					topScore = score;
					topPlayer = player;
				}
			});
		});

		return topPlayer
			? {
					name: `${topPlayer.first_name} ${topPlayer.last_name}`,
					score: topScore
				}
			: null;
	}

	function computeManagerAccuracy(matchup: MatchupPageDto) {
		if (!matchup.Starters || !matchup.PlayersPoints) return null;

		const allMap: Record<string, any> = { ...(matchup.Starters || {}), ...(matchup.Bench || {}) };
		const allPlayers = Object.keys(allMap).map((id) => ({
			id,
			points: Number(matchup.PlayersPoints?.[id] ?? 0),
			player: allMap[id],
			pos: (allMap[id]?.position || '').toUpperCase(),
			first_name: allMap[id]?.first_name || '',
			last_name: allMap[id]?.last_name || ''
		}));

		const basePositions = ['QB', 'RB', 'WR', 'TE'];
		const flexEligible = new Set(['RB', 'WR', 'TE']);
		const superFlexEligible = new Set(['QB', 'RB', 'WR', 'TE']);
		const fixedCounts: Record<string, number> = {};
		let flexCount = 0;
		let superFlexCount = 0;
		const validSlots = (rosterPositions || []).filter((pos) => {
			const p = String(pos).toUpperCase();
			if (p === 'FLEX' || p === 'WR/RB/TE') {
				flexCount++;
				return true;
			} else if (p === 'SUPER_FLEX' || p === 'SUPERFLEX' || p === 'QB/RB/WR/TE') {
				superFlexCount++;
				return true;
			} else if (basePositions.includes(p)) {
				fixedCounts[p] = (fixedCounts[p] || 0) + 1;
				return true;
			} else if (p === 'K' || p === 'DEF' || p === 'DST') {
				return false;
			}
			return false;
		});

		if (validSlots.length === 0) {
			Object.values(matchup.Starters || {}).forEach((starter: any) => {
				const pos = (starter?.position || '').toUpperCase();
				if (basePositions.includes(pos)) fixedCounts[pos] = (fixedCounts[pos] || 0) + 1;
			});
		}

		let available = allPlayers.slice();
		let optimalPlayers: any[] = [];

		for (const pos of basePositions) {
			const count = fixedCounts[pos] || 0;
			for (let i = 0; i < count; i++) {
				const candidates = available.filter((p) => p.pos === pos);
				if (candidates.length === 0) break;
				candidates.sort((a, b) => b.points - a.points);
				const pick = candidates[0];
				if (pick) {
					optimalPlayers.push(pick);
					available = available.filter((p) => p.id !== pick.id);
				}
			}
		}

		for (let i = 0; i < flexCount; i++) {
			const candidates = available.filter((p) => flexEligible.has(p.pos));
			if (candidates.length === 0) break;
			candidates.sort((a, b) => b.points - a.points);
			const pick = candidates[0];
			if (pick) {
				optimalPlayers.push(pick);
				available = available.filter((p) => p.id !== pick.id);
			}
		}

		for (let i = 0; i < superFlexCount; i++) {
			const candidates = available.filter((p) => superFlexEligible.has(p.pos));
			if (candidates.length === 0) break;
			candidates.sort((a, b) => b.points - a.points);
			const pick = candidates[0];
			if (pick) {
				optimalPlayers.push(pick);
				available = available.filter((p) => p.id !== pick.id);
			}
		}

		const optimalTotal = optimalPlayers.reduce((sum, p) => sum + p.points, 0);

		const actualStarters = Object.keys(matchup.Starters ?? {}).map((id) => ({
			id,
			...(matchup.Starters?.[id] || {}),
			points: Number(matchup.PlayersPoints?.[id] ?? 0)
		}));
		const actualTotal = actualStarters.reduce((sum, p) => sum + p.points, 0);

		const missedTotal = Math.max(0, optimalTotal - actualTotal);

		return {
			actualTotal,
			optimalTotal,
			missedTotal
		};
	}

	function getBiggestMiss(matchup: MatchupPageDto) {
		if (!matchup || !matchup.Starters || !matchup.Bench || !matchup.PlayersPoints) return null;
		let biggestMiss: any = null;
		let maxDiff = 0;

		for (const benchId in matchup.Bench) {
			const benchPlayer = matchup.Bench[benchId];
			const benchPoints = Number(matchup.PlayersPoints[benchId] ?? 0);
			const pos = (benchPlayer.position || '').toUpperCase();
			for (const starterId in matchup.Starters) {
				const starter = matchup.Starters[starterId];
				if ((starter.position || '').toUpperCase() !== pos) continue;
				const starterPoints = Number(matchup.PlayersPoints[starterId] ?? 0);
				const diff = benchPoints - starterPoints;
				if (diff > maxDiff) {
					maxDiff = diff;
					biggestMiss = {
						benchPlayer,
						benchPoints,
						starter,
						starterPoints,
						pos,
						diff
					};
				}
			}
		}
		return biggestMiss && maxDiff > 0 ? biggestMiss : null;
	}

	function getTopHeavyStat(matchup: MatchupPageDto) {
		if (!matchup || !matchup.Starters || !matchup.PlayersPoints) return null;
		const starters = Object.values(matchup.Starters ?? {});
		const pointsArr = starters.map((player: any) => ({
			name: (player.first_name || '') + ' ' + (player.last_name || ''),
			points: Number(matchup.PlayersPoints?.[player.player_id] ?? 0)
		}));
		if (pointsArr.length === 0) return null;
		const sorted = pointsArr.slice().sort((a, b) => b.points - a.points);
		const top3Arr = sorted.slice(0, 3);
		const top3 = top3Arr.reduce((a, b) => a + b.points, 0);
		const total = sorted.reduce((a, b) => a + b.points, 0);
		const pct = total > 0 ? (top3 / total) * 100 : 0;
		return { pct, top3, total, top3Arr };
	}

	// NEW STAT: Star Dependency - % of points from top scorer
	function getStarDependency(matchup: MatchupPageDto) {
		if (!matchup || !matchup.Starters || !matchup.PlayersPoints) return null;
		const starters = Object.values(matchup.Starters ?? {});
		const pointsArr = starters.map((player: any) => ({
			name: (player.first_name || '') + ' ' + (player.last_name || ''),
			points: Number(matchup.PlayersPoints?.[player.player_id] ?? 0)
		}));
		if (pointsArr.length === 0) return null;
		const sorted = pointsArr.slice().sort((a, b) => b.points - a.points);
		const topScorer = sorted[0];
		const total = sorted.reduce((a, b) => a + b.points, 0);
		const pct = total > 0 ? (topScorer.points / total) * 100 : 0;
		return { name: topScorer.name, points: topScorer.points, pct, total };
	}

	// NEW STAT: Positional Breakdown - Who won at each position
	function getPositionalBreakdown(t1: MatchupPageDto, t2: MatchupPageDto) {
		if (!t1?.Starters || !t2?.Starters || !t1?.PlayersPoints || !t2?.PlayersPoints) return null;

		const positions = ['QB', 'RB', 'WR', 'TE'];
		const breakdown: Array<{
			pos: string;
			team1Points: number;
			team2Points: number;
			winner: 1 | 2 | 0;
		}> = [];

		for (const pos of positions) {
			let team1Points = 0;
			let team2Points = 0;

			Object.values(t1.Starters).forEach((player: any) => {
				if ((player.position || '').toUpperCase() === pos) {
					team1Points += Number(t1.PlayersPoints?.[player.player_id] ?? 0);
				}
			});

			Object.values(t2.Starters).forEach((player: any) => {
				if ((player.position || '').toUpperCase() === pos) {
					team2Points += Number(t2.PlayersPoints?.[player.player_id] ?? 0);
				}
			});

			breakdown.push({
				pos,
				team1Points,
				team2Points,
				winner: team1Points > team2Points ? 1 : team2Points > team1Points ? 2 : 0
			});
		}

		const team1Wins = breakdown.filter((b) => b.winner === 1).length;
		const team2Wins = breakdown.filter((b) => b.winner === 2).length;

		return { breakdown, team1Wins, team2Wins };
	}

	// NEW STAT: Optimal Lineup Outcome - Would optimal lineups change the result?
	function getOptimalOutcome(t1: MatchupPageDto, t2: MatchupPageDto) {
		const accuracy1 = computeManagerAccuracy(t1);
		const accuracy2 = computeManagerAccuracy(t2);

		if (!accuracy1 || !accuracy2) return null;

		const actualWinner = (t1.Score ?? 0) > (t2.Score ?? 0) ? 1 : (t2.Score ?? 0) > (t1.Score ?? 0) ? 2 : 0;
		const optimalWinner =
			accuracy1.optimalTotal > accuracy2.optimalTotal
				? 1
				: accuracy2.optimalTotal > accuracy1.optimalTotal
					? 2
					: 0;

		const wouldChange = actualWinner !== optimalWinner && actualWinner !== 0 && optimalWinner !== 0;

		return {
			team1Optimal: accuracy1.optimalTotal,
			team2Optimal: accuracy2.optimalTotal,
			actualWinner,
			optimalWinner,
			wouldChange
		};
	}

	// NEW STAT: Season Rank - Load historical data to determine rank
	async function loadSeasonRank() {
		if (seasonRankData || loadingSeasonRank || !displayWeek) return;

		loadingSeasonRank = true;
		try {
			const allScores: { rosterId: number; week: number; score: number }[] = [];

			// Fetch all weeks up to current week
			const weekPromises = [];
			for (let week = 1; week <= displayWeek; week++) {
				weekPromises.push(
					fetch(`/api/matchups?week=${week}`)
						.then((r) => r.json())
						.then((data) => ({ week, data }))
						.catch(() => ({ week, data: [] }))
				);
			}

			const weekResults = await Promise.all(weekPromises);

			for (const { week, data } of weekResults) {
				if (Array.isArray(data)) {
					for (const matchup of data) {
						if (matchup.RosterId && matchup.Score !== undefined) {
							allScores.push({
								rosterId: matchup.RosterId,
								week,
								score: matchup.Score
							});
						}
					}
				}
			}

			// Get all scores for each team sorted descending
			const team1Scores = allScores
				.filter((s) => s.rosterId === team1?.RosterId)
				.map((s) => s.score)
				.sort((a, b) => b - a);

			const team2Scores = allScores
				.filter((s) => s.rosterId === team2?.RosterId)
				.map((s) => s.score)
				.sort((a, b) => b - a);

			// Find rank (1-indexed)
			const team1CurrentScore = team1?.Score ?? 0;
			const team2CurrentScore = team2?.Score ?? 0;

			const team1Rank = team1Scores.findIndex((s) => s === team1CurrentScore) + 1 || team1Scores.length;
			const team2Rank = team2Scores.findIndex((s) => s === team2CurrentScore) + 1 || team2Scores.length;

			seasonRankData = {
				team1Rank,
				team2Rank,
				totalWeeks: displayWeek
			};
		} catch (error) {
			console.error('Failed to load season rank:', error);
		} finally {
			loadingSeasonRank = false;
		}
	}

	// Load season rank when stats are expanded
	$: if (expandedStats && !seasonRankData && !loadingSeasonRank) {
		loadSeasonRank();
	}

	$: isWinner1 = team1 && team2 && (team1.Score ?? 0) > (team2.Score ?? 0);
	$: isWinner2 = team1 && team2 && (team2.Score ?? 0) > (team1.Score ?? 0);
	$: pointDiff = team1 && team2 ? Math.abs((team1.Score ?? 0) - (team2.Score ?? 0)) : 0;
	$: group = [team1, team2].filter(Boolean);
</script>

<section class="mt-4 mb-4 md:mt-8 md:mb-8 fade-in" style="animation-delay: {animationDelay}ms">
	<div class="border-base-content/10 bg-base-300 rounded-none md:rounded-lg border-y md:border p-3 md:p-6">
		<!-- Header: Team Names and Week -->
		<div class="text-center mb-4 md:mb-6">
			<h2 class="text-lg md:text-xl font-bold text-base-content/70">
				{team1?.TeamName ?? 'Team 1'} vs {team2?.TeamName ?? 'Team 2'} - Week {displayWeek}
			</h2>
		</div>

		<!-- Compact Score Display -->
		<div class="flex items-center justify-center gap-3 md:gap-8 mb-4 md:mb-6">
			<!-- Team 1 -->
			<div class="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
				<div class="avatar">
					<div
						class="w-14 md:w-20 rounded-full ring ring-base-content/20 {isWinner1
							? 'ring-success ring-4'
							: ''}"
					>
						{#if team1?.AvatarUrl && !failedAvatars.has(team1.AvatarUrl)}
							<img
								src={team1.AvatarUrl}
								alt={team1?.TeamName ?? 'Team 1'}
								on:error={() => {
									if (team1?.AvatarUrl) failedAvatars.add(team1.AvatarUrl);
									failedAvatars = failedAvatars;
								}}
							/>
						{:else}
							<div
								class="w-full h-full rounded-full bg-primary flex items-center justify-center font-bold text-primary-content text-lg md:text-2xl"
							>
								{getInitials(team1?.TeamName ?? 'T1')}
							</div>
						{/if}
					</div>
				</div>
				<div class="text-center">
					<div class="font-bold text-xs md:text-base truncate max-w-[120px] md:max-w-[150px]">
						{team1?.TeamName ?? 'Team 1'}
					</div>
					<div class="text-2xl md:text-4xl font-bold {isWinner1 ? 'text-success' : ''}">
						{team1?.Score?.toFixed(2) ?? '0.00'}
					</div>
					{#if isWinner1}
						<div class="badge badge-success badge-sm mt-1">Winner</div>
					{/if}
				</div>
			</div>

			<!-- VS Divider -->
			<div class="flex flex-col items-center gap-1">
				<div class="text-lg md:text-2xl font-bold opacity-50">VS</div>
				<div class="h-px w-8 md:w-12 bg-base-content/20"></div>
				<div class="text-xs md:text-base font-semibold opacity-70">
					+{pointDiff.toFixed(2)}
				</div>
			</div>

			<!-- Team 2 -->
			<div class="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
				<div class="avatar">
					<div
						class="w-14 md:w-20 rounded-full ring ring-base-content/20 {isWinner2
							? 'ring-success ring-4'
							: ''}"
					>
						{#if team2?.AvatarUrl && !failedAvatars.has(team2.AvatarUrl)}
							<img
								src={team2.AvatarUrl}
								alt={team2?.TeamName ?? 'Team 2'}
								on:error={() => {
									if (team2?.AvatarUrl) failedAvatars.add(team2.AvatarUrl);
									failedAvatars = failedAvatars;
								}}
							/>
						{:else}
							<div
								class="w-full h-full rounded-full bg-primary flex items-center justify-center font-bold text-primary-content text-lg md:text-2xl"
							>
								{getInitials(team2?.TeamName ?? 'T2')}
							</div>
						{/if}
					</div>
				</div>
				<div class="text-center">
					<div class="font-bold text-xs md:text-base truncate max-w-[120px] md:max-w-[150px]">
						{team2?.TeamName ?? 'Team 2'}
					</div>
					<div class="text-2xl md:text-4xl font-bold {isWinner2 ? 'text-success' : ''}">
						{team2?.Score?.toFixed(2) ?? '0.00'}
					</div>
					{#if isWinner2}
						<div class="badge badge-success badge-sm mt-1">Winner</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Quick Stats Bar (Always Visible) -->
		<div class="bg-base-100 rounded-lg p-3 md:p-4 mb-4">
			<div class="flex items-center gap-2 mb-2 md:mb-3">
				<span class="text-base md:text-lg">&#x1F4CA;</span>
				<span class="font-semibold text-sm md:text-base">Quick Stats</span>
			</div>
			<div class="space-y-1 md:space-y-2 text-xs md:text-sm">
				{#if getTopScorer(group)}
					{@const ts = getTopScorer(group)}
					{#if ts}
						<div class="flex items-center gap-2">
							<span>&#x1F3C6;</span>
							<span
								><strong>Top Scorer:</strong>
								{ts.name} ({ts.score.toFixed(2)} pts)</span
							>
						</div>
					{/if}
				{/if}
				<div class="flex items-center gap-2">
					<span>&#x1F4A4;</span>
					<span
						><strong>Bench Points:</strong>
						{team1?.TeamName}: {getBenchPoints(team1)} | {team2?.TeamName}: {getBenchPoints(team2)}</span
					>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2 justify-center flex-wrap">
			<button class="btn btn-xs md:btn-sm btn-outline" on:click={toggleRoster}>
				<span>{expandedRoster ? '▲' : '▼'}</span>
				{expandedRoster ? 'Hide' : 'View'} Full Rosters
			</button>
			<button class="btn btn-xs md:btn-sm btn-outline" on:click={toggleStats}>
				<span>&#x1F4C8;</span>
				{expandedStats ? 'Hide' : 'More'} Stats
			</button>
		</div>

		<!-- Expanded Full Rosters -->
		{#if expandedRoster}
			<div
				class="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-base-content/10"
				transition:slide={{ duration: 300 }}
			>
				<div class="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-start md:justify-center">
					{#each group as matchup, i}
						<div class="bg-base-100 rounded-xl p-3 md:p-6 shadow-lg">
							<TeamHeader
								teamName={matchup.TeamName ?? 'Unknown Team'}
								teamLogo={matchup.AvatarUrl ?? 'https://via.placeholder.com/150'}
							/>
							<div class="text-center my-2 md:my-3">
								<div class="text-xl md:text-2xl font-bold">
									{matchup.Score?.toFixed(2) ?? '0.00'}
								</div>
								<div class="text-xs opacity-60">Total Points</div>
							</div>
							<ul class="mt-3 md:mt-4 space-y-1 md:space-y-2">
								{#each RosterSorter.assignRoles(Object.values(matchup.Starters ?? {})) as player}
									<RosterSpot
										position={player.role}
										badgeClass={RosterSorter.getBadgeClass(player.role)}
										playerName={player.first_name + ' ' + player.last_name}
										playerTeam={player.team ?? ''}
										playerImage={player.playerAvatarUrl ?? 'https://via.placeholder.com/150'}
										PlayerTeamLogo={player.playerTeamAvatarUrl ?? 'https://via.placeholder.com/150'}
										playerPoints={matchup.PlayersPoints?.[player.player_id]}
									/>
								{/each}
							</ul>

							<!-- Bench Section -->
							<div class="mt-3 md:mt-4">
								<button class="btn btn-xs btn-outline" on:click={() => toggleBench(i)}>
									{expandedBench[i] ? 'Hide Bench' : 'Show Bench'}
									&nbsp;({getBenchPoints(matchup)} pts)
								</button>
								{#if expandedBench[i]}
									<div class="mt-2 md:mt-3 p-2 md:p-3 rounded bg-base-200" transition:slide={{ duration: 200 }}>
										<div class="font-semibold mb-2 text-sm">Bench</div>
										<ul class="space-y-1 md:space-y-2">
											{#each Object.values(matchup.Bench ?? {}) as player}
												<RosterSpot
													position="BN"
													badgeClass={RosterSorter.getBadgeClass('Bench')}
													playerName={player.first_name + ' ' + player.last_name}
													playerTeam={player.team ?? ''}
													playerImage={player.playerAvatarUrl ?? 'https://via.placeholder.com/150'}
													PlayerTeamLogo={player.playerTeamAvatarUrl ??
														'https://via.placeholder.com/150'}
													playerPoints={matchup.PlayersPoints?.[player.player_id]}
												/>
											{/each}
										</ul>
									</div>
								{/if}
							</div>
						</div>

						{#if i < group.length - 1}
							<div class="flex items-center justify-center text-xl font-bold opacity-30">VS</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<!-- Expanded More Stats -->
		{#if expandedStats}
			<div
				class="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-base-content/10"
				transition:slide={{ duration: 300 }}
			>
				<div class="bg-base-100 rounded-xl p-4 md:p-5 shadow-sm space-y-4 md:space-y-6">
					<h3 class="font-semibold text-base md:text-lg flex items-center gap-2">
						<span>&#x1F4C8;</span>
						<span>Advanced Stats</span>
					</h3>

					<!-- Optimal Lineup Outcome -->
					{#if getOptimalOutcome(team1, team2)}
						{@const optimal = getOptimalOutcome(team1, team2)}
						<div class="bg-base-200 rounded-xl p-4 shadow-sm">
							<div class="flex items-center gap-2 mb-3">
								<span>&#x1F3AF;</span>
								<span class="font-medium text-sm">Optimal Lineup Outcome</span>
							</div>
							<div class="flex items-center justify-between gap-4 text-sm">
								<div class="text-center flex-1">
									<div class="text-xs opacity-70 mb-1">{team1?.TeamName}</div>
									<div class="font-bold">{optimal.team1Optimal.toFixed(2)}</div>
								</div>
								<div class="text-center">
									{#if optimal.wouldChange}
										<div class="badge badge-warning badge-sm">Result Would Change!</div>
									{:else}
										<div class="badge badge-success badge-sm">Same Result</div>
									{/if}
								</div>
								<div class="text-center flex-1">
									<div class="text-xs opacity-70 mb-1">{team2?.TeamName}</div>
									<div class="font-bold">{optimal.team2Optimal.toFixed(2)}</div>
								</div>
							</div>
							{#if optimal.wouldChange}
								<div class="text-xs text-center mt-2 text-warning">
									{optimal.optimalWinner === 1 ? team1?.TeamName : team2?.TeamName} would have won with optimal lineup
								</div>
							{/if}
						</div>
					{/if}

					<!-- Season Rank -->
					<div class="bg-base-200 rounded-xl p-4 shadow-sm">
						<div class="flex items-center gap-2 mb-3">
							<span>&#x1F4C5;</span>
							<span class="font-medium text-sm">Season Rank</span>
							{#if loadingSeasonRank}
								<span class="loading loading-spinner loading-xs"></span>
							{/if}
						</div>
						{#if seasonRankData}
							<div class="flex items-center justify-between gap-4 text-sm">
								<div class="text-center flex-1">
									<div class="text-xs opacity-70 mb-1">{team1?.TeamName}</div>
									<div class="font-bold text-lg">
										#{seasonRankData.team1Rank}
										<span class="text-xs opacity-70 font-normal">/ {seasonRankData.totalWeeks}</span>
									</div>
									<div class="text-xs opacity-70">
										{seasonRankData.team1Rank === 1 ? 'Season High!' : seasonRankData.team1Rank <= 3 ? 'Top 3 Week' : ''}
									</div>
								</div>
								<div class="text-center flex-1">
									<div class="text-xs opacity-70 mb-1">{team2?.TeamName}</div>
									<div class="font-bold text-lg">
										#{seasonRankData.team2Rank}
										<span class="text-xs opacity-70 font-normal">/ {seasonRankData.totalWeeks}</span>
									</div>
									<div class="text-xs opacity-70">
										{seasonRankData.team2Rank === 1 ? 'Season High!' : seasonRankData.team2Rank <= 3 ? 'Top 3 Week' : ''}
									</div>
								</div>
							</div>
						{:else if !loadingSeasonRank}
							<div class="text-xs opacity-70 text-center">Loading season data...</div>
						{/if}
					</div>

					<!-- Positional Breakdown -->
					{#if getPositionalBreakdown(team1, team2)}
						{@const posBreakdown = getPositionalBreakdown(team1, team2)}
						<div class="bg-base-200 rounded-xl p-4 shadow-sm">
							<div class="flex items-center justify-between mb-3">
								<div class="flex items-center gap-2">
									<span>&#x1F3C8;</span>
									<span class="font-medium text-sm">Position Battle</span>
								</div>
								<div class="text-xs">
									<span class="text-success font-bold">{posBreakdown.team1Wins}</span>
									<span class="opacity-50 mx-1">-</span>
									<span class="text-error font-bold">{posBreakdown.team2Wins}</span>
								</div>
							</div>
							<div class="space-y-2">
								{#each posBreakdown.breakdown as pos}
									{@const total = pos.team1Points + pos.team2Points}
									{@const t1Pct = total > 0 ? (pos.team1Points / total) * 100 : 50}
									<div class="flex items-center gap-2 text-xs">
										<div class="w-8 font-bold opacity-70">{pos.pos}</div>
										<div class="flex-1">
											<div class="relative h-4 bg-base-300 rounded-full overflow-hidden">
												<div
													class="absolute left-0 top-0 h-full {pos.winner === 1 ? 'bg-success' : 'bg-primary/50'}"
													style="width: {t1Pct}%"
												></div>
												<div
													class="absolute right-0 top-0 h-full {pos.winner === 2 ? 'bg-success' : 'bg-secondary/50'}"
													style="width: {100 - t1Pct}%"
												></div>
											</div>
										</div>
										<div class="w-20 flex justify-between text-xs">
											<span class="{pos.winner === 1 ? 'text-success font-bold' : ''}">{pos.team1Points.toFixed(1)}</span>
											<span class="{pos.winner === 2 ? 'text-success font-bold' : ''}">{pos.team2Points.toFixed(1)}</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Star Dependency + Manager Accuracy Grid -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#if team1}
							<div class="bg-base-200 rounded-xl p-4 space-y-2 shadow-sm">
								<div class="flex items-center justify-between">
									<div class="text-xs uppercase tracking-wide opacity-70">Team Stats</div>
									<div class="badge badge-outline text-xs">
										{team1.TeamName}
									</div>
								</div>

								<!-- Star Dependency -->
								{#if getStarDependency(team1)}
									{@const star = getStarDependency(team1)}
									<div class="flex items-center justify-between">
										<span class="text-xs opacity-70">Star Dependency:</span>
										<span class="text-sm font-bold {star.pct > 30 ? 'text-warning' : 'text-success'}">
											{star.pct.toFixed(0)}%
										</span>
									</div>
									<div class="text-xs opacity-60">
										{star.name.trim()} - {star.points.toFixed(2)} pts
									</div>
								{/if}

								<div class="divider my-1"></div>

								<!-- Manager Accuracy -->
								<div class="flex items-center justify-between">
									<span class="text-xs opacity-70">Manager Accuracy:</span>
									<span class="text-sm font-bold">
										{(() => {
											const a = computeManagerAccuracy(team1);
											return a ? (100 - (a.missedTotal / (a.optimalTotal || 1)) * 100).toFixed(1) + '%' : 'N/A';
										})()}
									</span>
								</div>
								<div class="text-xs opacity-60">
									Missed {(() => {
										const a = computeManagerAccuracy(team1);
										return a ? a.missedTotal.toFixed(2) : '0.00';
									})()} pts
								</div>

								{#if getBiggestMiss(team1)}
									{@const miss = getBiggestMiss(team1)}
									<div class="divider my-1"></div>
									<div class="text-xs">
										<span class="font-medium">Biggest Miss:</span>
										<span class="opacity-70 ml-1">
											{miss.benchPlayer.first_name} {miss.benchPlayer.last_name} ({miss.benchPoints.toFixed(2)} pts on bench)
										</span>
									</div>
								{/if}
							</div>
						{/if}

						{#if team2}
							<div class="bg-base-200 rounded-xl p-4 space-y-2 shadow-sm">
								<div class="flex items-center justify-between">
									<div class="text-xs uppercase tracking-wide opacity-70">Team Stats</div>
									<div class="badge badge-outline text-xs">
										{team2.TeamName}
									</div>
								</div>

								<!-- Star Dependency -->
								{#if getStarDependency(team2)}
									{@const star = getStarDependency(team2)}
									<div class="flex items-center justify-between">
										<span class="text-xs opacity-70">Star Dependency:</span>
										<span class="text-sm font-bold {star.pct > 30 ? 'text-warning' : 'text-success'}">
											{star.pct.toFixed(0)}%
										</span>
									</div>
									<div class="text-xs opacity-60">
										{star.name.trim()} - {star.points.toFixed(2)} pts
									</div>
								{/if}

								<div class="divider my-1"></div>

								<!-- Manager Accuracy -->
								<div class="flex items-center justify-between">
									<span class="text-xs opacity-70">Manager Accuracy:</span>
									<span class="text-sm font-bold">
										{(() => {
											const a = computeManagerAccuracy(team2);
											return a ? (100 - (a.missedTotal / (a.optimalTotal || 1)) * 100).toFixed(1) + '%' : 'N/A';
										})()}
									</span>
								</div>
								<div class="text-xs opacity-60">
									Missed {(() => {
										const a = computeManagerAccuracy(team2);
										return a ? a.missedTotal.toFixed(2) : '0.00';
									})()} pts
								</div>

								{#if getBiggestMiss(team2)}
									{@const miss = getBiggestMiss(team2)}
									<div class="divider my-1"></div>
									<div class="text-xs">
										<span class="font-medium">Biggest Miss:</span>
										<span class="opacity-70 ml-1">
											{miss.benchPlayer.first_name} {miss.benchPlayer.last_name} ({miss.benchPoints.toFixed(2)} pts on bench)
										</span>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.fade-in {
		animation: fade-in 0.4s ease-out forwards;
		opacity: 0;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
