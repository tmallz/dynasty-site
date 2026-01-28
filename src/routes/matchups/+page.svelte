<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { MatchupPageDto } from '$lib/Utilities/Dtos/MatchupPageDto';
	import { RosterSorter } from '$lib/Utilities/RosterSorter';
	import { RostersHelper } from '$lib/Utilities/RostersHelper';
	import TeamHeader from '$lib/Components/rosters/TeamHeader.svelte';
	import RosterSpot from '$lib/Components/rosters/RosterSpot.svelte';
	import MatchupsSkeleton from '$lib/Components/matchups/MatchupsSkeleton.svelte';
	import MatchupSummaryStats from '$lib/Components/matchups/MatchupSummaryStats.svelte';
	import MatchupCard from '$lib/Components/matchups/MatchupCard.svelte';
	import BracketMatchupCard from '$lib/Components/matchups/BracketMatchupCard.svelte';
	import { PlayersStore } from '$lib/Stores/PlayerStore';

	export let data: PageData;

	let currentWeek: number | undefined;
	let selectedWeek: number | undefined;
	$: displayWeek = selectedWeek ?? (viewingRegularSeasonDuringPlayoffs ? 14 : currentWeek);
	let isPlayoffs: boolean = false;
	let matchups: MatchupPageDto[] = [];
	let rosterPositions: string[] = [];
	let regularSeasonMatchups: MatchupPageDto[] = [];
	let winnersBracket: any[] = [];
	let losersBracket: any[] = [];
	let consolationBracket: any[] = [];
	let isLoading = true;
	let loadingRegularSeason = false;
	let loadingWeek = false;

	// Available weeks for selector
	$: availableWeeks = Array.from({ length: currentWeek ?? 14 }, (_, i) => i + 1);

	// Handle streamed data
	$: if (data.streamed?.matchupData) {
		data.streamed.matchupData.then((result: any) => {
			currentWeek = result.currentWeek;
			isPlayoffs = result.isPlayoffs;
			matchups = result.matchups || [];
			rosterPositions = result.rosterPositions || [];
			winnersBracket = result.winnersBracket || [];
			losersBracket = result.losersBracket || [];
			consolationBracket = result.consolationBracket || [];
			isLoading = false;

			if (!isPlayoffs) {
				ensurePlayerDataLoaded();
			}
		});
	}

	// Toggle state for playoff view
	let showBrackets = true;
	let showLosersBracket = false;
	let playersLoaded = false;
	let selectedBracketMatchup: any = null;
	let viewingRegularSeasonDuringPlayoffs = false;
	let showPlayoffStats = false;

	// Track failed avatars
	let failedAvatars = new Set<string>();

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}

	// Stat functions for playoff matchup details
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

	function getPositionalBreakdown(t1: MatchupPageDto, t2: MatchupPageDto) {
		if (!t1?.Starters || !t2?.Starters || !t1?.PlayersPoints || !t2?.PlayersPoints) return null;

		const positions = ['QB', 'RB', 'WR', 'TE'];
		const breakdown: Array<{ pos: string; team1Points: number; team2Points: number; winner: 1 | 2 | 0 }> = [];

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

	function computeOptimalLineup(matchup: MatchupPageDto) {
		if (!matchup.Starters || !matchup.PlayersPoints) return null;

		const allMap: Record<string, any> = { ...(matchup.Starters || {}), ...(matchup.Bench || {}) };
		const allPlayers = Object.keys(allMap).map((id) => ({
			id,
			points: Number(matchup.PlayersPoints?.[id] ?? 0),
			pos: (allMap[id]?.position || '').toUpperCase()
		}));

		const basePositions = ['QB', 'RB', 'WR', 'TE'];
		const flexEligible = new Set(['RB', 'WR', 'TE']);
		const superFlexEligible = new Set(['QB', 'RB', 'WR', 'TE']);
		const fixedCounts: Record<string, number> = {};
		let flexCount = 0;
		let superFlexCount = 0;

		(rosterPositions || []).forEach((pos) => {
			const p = String(pos).toUpperCase();
			if (p === 'FLEX' || p === 'WR/RB/TE') flexCount++;
			else if (p === 'SUPER_FLEX' || p === 'SUPERFLEX' || p === 'QB/RB/WR/TE') superFlexCount++;
			else if (basePositions.includes(p)) fixedCounts[p] = (fixedCounts[p] || 0) + 1;
		});

		let available = allPlayers.slice();
		let optimalPlayers: any[] = [];

		for (const pos of basePositions) {
			const count = fixedCounts[pos] || 0;
			for (let i = 0; i < count; i++) {
				const candidates = available.filter((p) => p.pos === pos).sort((a, b) => b.points - a.points);
				if (candidates.length > 0) {
					optimalPlayers.push(candidates[0]);
					available = available.filter((p) => p.id !== candidates[0].id);
				}
			}
		}

		for (let i = 0; i < flexCount; i++) {
			const candidates = available.filter((p) => flexEligible.has(p.pos)).sort((a, b) => b.points - a.points);
			if (candidates.length > 0) {
				optimalPlayers.push(candidates[0]);
				available = available.filter((p) => p.id !== candidates[0].id);
			}
		}

		for (let i = 0; i < superFlexCount; i++) {
			const candidates = available.filter((p) => superFlexEligible.has(p.pos)).sort((a, b) => b.points - a.points);
			if (candidates.length > 0) {
				optimalPlayers.push(candidates[0]);
				available = available.filter((p) => p.id !== candidates[0].id);
			}
		}

		const optimalTotal = optimalPlayers.reduce((sum, p) => sum + p.points, 0);
		const actualTotal = Object.keys(matchup.Starters ?? {}).reduce(
			(sum, id) => sum + Number(matchup.PlayersPoints?.[id] ?? 0),
			0
		);

		return { optimalTotal, actualTotal, missed: Math.max(0, optimalTotal - actualTotal) };
	}

	function getOptimalOutcome(t1: MatchupPageDto, t2: MatchupPageDto) {
		const opt1 = computeOptimalLineup(t1);
		const opt2 = computeOptimalLineup(t2);
		if (!opt1 || !opt2) return null;

		const actualWinner = (t1.Score ?? 0) > (t2.Score ?? 0) ? 1 : (t2.Score ?? 0) > (t1.Score ?? 0) ? 2 : 0;
		const optimalWinner = opt1.optimalTotal > opt2.optimalTotal ? 1 : opt2.optimalTotal > opt1.optimalTotal ? 2 : 0;
		const wouldChange = actualWinner !== optimalWinner && actualWinner !== 0 && optimalWinner !== 0;

		return { team1Optimal: opt1.optimalTotal, team2Optimal: opt2.optimalTotal, actualWinner, optimalWinner, wouldChange };
	}

	// Handle week change
	async function handleWeekChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const week = parseInt(target.value);
		if (week === selectedWeek) return;

		selectedWeek = week;
		loadingWeek = true;
		viewingRegularSeasonDuringPlayoffs = false;
		showBrackets = false;

		try {
			const weekMatchups = await fetch(`/api/matchups?week=${week}`).then((r) => r.json());

			if (weekMatchups && Array.isArray(weekMatchups)) {
				matchups = weekMatchups;
				ensurePlayerDataLoaded();
			}
		} catch (error) {
			console.error(`Failed to load week ${week} matchups:`, error);
		} finally {
			loadingWeek = false;
		}
	}

	// Load week 14 matchups during playoffs
	async function loadRegularSeasonMatchups() {
		if (regularSeasonMatchups.length > 0) {
			viewingRegularSeasonDuringPlayoffs = true;
			showBrackets = false;
			showLosersBracket = false;
			ensurePlayerDataLoaded();
			return;
		}

		loadingRegularSeason = true;
		try {
			const week14Matchups = await fetch(`/api/matchups?week=14`).then((r) => r.json());

			if (week14Matchups && Array.isArray(week14Matchups)) {
				regularSeasonMatchups = week14Matchups;
				viewingRegularSeasonDuringPlayoffs = true;
				showBrackets = false;
				showLosersBracket = false;
				ensurePlayerDataLoaded();
			}
		} catch (error) {
			console.error('Failed to load week 14 matchups:', error);
		} finally {
			loadingRegularSeason = false;
		}
	}

	// Group matchups by MatchupId
	$: groupedMatchups = (viewingRegularSeasonDuringPlayoffs ? regularSeasonMatchups : matchups)
		? (viewingRegularSeasonDuringPlayoffs ? regularSeasonMatchups : matchups).reduce(
				(groups, matchup) => {
					const key = matchup.MatchupId ?? 'unknown';
					if (!groups[key]) {
						groups[key] = [];
					}
					groups[key].push(matchup);
					return groups;
				},
				{} as Record<string, MatchupPageDto[]>
			)
		: {};

	// Active matchups for summary stats
	$: activeMatchups = viewingRegularSeasonDuringPlayoffs ? regularSeasonMatchups : matchups;

	function ensurePlayerDataLoaded() {
		const players = $page.data?.players;
		if (!players || players.length === 0) return;

		if (!playersLoaded) {
			PlayersStore.set(players);
			playersLoaded = true;
		}

		const hydrate = (list: MatchupPageDto[]) => {
			list.forEach((matchup: MatchupPageDto) => {
				if (matchup.StarterIds && matchup.PlayerIds) {
					matchup.Starters = RostersHelper.MapPlayerNames(matchup.StarterIds);
					const benchIds = matchup.PlayerIds.filter(
						(p: string) => !matchup.StarterIds!.includes(p)
					);
					matchup.Bench = RostersHelper.MapPlayerNames(benchIds) as Record<string, any>;
				}
			});
		};
		hydrate(matchups || []);
		hydrate(regularSeasonMatchups || []);
	}

	function handleBracketMatchupClick(bracketMatchup: any) {
		ensurePlayerDataLoaded();

		const team1Matchup = matchups.find((m) => m.RosterId === bracketMatchup.team1RosterId);
		const team2Matchup = matchups.find((m) => m.RosterId === bracketMatchup.team2RosterId);

		if (team1Matchup && team2Matchup) {
			selectedBracketMatchup = {
				bracketInfo: bracketMatchup,
				team1: team1Matchup,
				team2: team2Matchup
			};

			setTimeout(() => {
				document
					.getElementById('selected-matchup-detail')
					?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 100);
		}
	}

	$: if (!isLoading && (!showBrackets || !isPlayoffs)) {
		ensurePlayerDataLoaded();
	}

	onMount(() => {
		if (!isLoading && !isPlayoffs) {
			ensurePlayerDataLoaded();
		}
	});
</script>

<main class="mx-0 px-3 py-4 md:mx-4 md:px-4 md:py-8 md:mx-auto {isPlayoffs ? 'max-w-none' : 'md:max-w-7xl'}">
	{#if isLoading}
		<!-- Skeleton Loading State -->
		<div class="fade-in">
			<h1 class="mb-4 md:mb-6 text-center text-3xl md:text-4xl font-bold">
				<div class="h-10 bg-base-300 rounded w-64 mx-auto animate-pulse"></div>
			</h1>
			<MatchupsSkeleton />
		</div>
	{:else}
		<h1 class="mb-4 md:mb-6 text-center text-3xl md:text-4xl font-bold fade-in">
			Week {displayWeek}
			{isPlayoffs && !viewingRegularSeasonDuringPlayoffs && showBrackets ? '- PLAYOFFS' : 'Matchups'}
		</h1>

		<!-- Summary Stats (for regular season view) -->
		{#if !isPlayoffs || !showBrackets}
			<MatchupSummaryStats matchups={activeMatchups} {groupedMatchups} />
		{/if}

		<!-- Week Selector and Filter Controls -->
		<div class="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8 fade-in" style="animation-delay: 100ms;">
			<!-- Week Selector -->
			{#if !isPlayoffs || !showBrackets}
				<div class="flex items-center gap-2">
					<label for="week-select" class="text-sm font-medium">Week:</label>
					<select
						id="week-select"
						class="select select-bordered select-sm w-32"
						value={displayWeek}
						on:change={handleWeekChange}
						disabled={loadingWeek}
					>
						{#each availableWeeks as week}
							<option value={week}>Week {week}</option>
						{/each}
					</select>
					{#if loadingWeek}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
				</div>
			{:else}
				<div></div>
			{/if}

			<!-- Filter Tabs (Playoffs) -->
			{#if isPlayoffs}
				<div class="join">
					<button
						class="join-item btn btn-sm md:btn-md {showBrackets && !showLosersBracket ? 'btn-primary' : 'btn-ghost'}"
						on:click={() => {
							showBrackets = true;
							showLosersBracket = false;
							viewingRegularSeasonDuringPlayoffs = false;
							selectedWeek = undefined;
						}}
					>
						Playoff Brackets
					</button>
					<button
						class="join-item btn btn-sm md:btn-md {showBrackets && showLosersBracket ? 'btn-primary' : 'btn-ghost'}"
						on:click={() => {
							showBrackets = true;
							showLosersBracket = true;
							viewingRegularSeasonDuringPlayoffs = false;
							selectedWeek = undefined;
						}}
					>
						Losers Bracket
					</button>
					<button
						class="join-item btn btn-sm md:btn-md {!showBrackets ? 'btn-primary' : 'btn-ghost'}"
						on:click={loadRegularSeasonMatchups}
						disabled={loadingRegularSeason}
					>
						{loadingRegularSeason ? 'Loading...' : 'Week 14'}
					</button>
				</div>
			{/if}
		</div>

		{#if isPlayoffs && showBrackets && !showLosersBracket}
			<!-- Winners Bracket -->
			<div class="space-y-8 md:space-y-12 fade-in" style="animation-delay: 150ms;">
				<div class="rounded-lg bg-base-200 p-3 md:p-6">
					<h2 class="mb-4 md:mb-6 text-center text-2xl md:text-3xl font-bold">Winners Bracket</h2>

					<div class="overflow-x-auto">
						<!-- Week Labels Row -->
						<div class="flex items-center justify-start mb-4 gap-2 md:gap-0 md:justify-evenly">
							<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">Round 1 (Week 15)</div>
							<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">Round 2 (Week 16)</div>
							<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">Championship (Week 17)</div>
							<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-80 flex-shrink-0 opacity-0">Placeholder</div>
						</div>

						<!-- Bracket Flow -->
						<div class="flex items-center justify-start md:justify-evenly min-h-[500px] md:min-h-[800px] gap-4 md:gap-0">
							<!-- Round 1 -->
							<div class="flex flex-col justify-around flex-shrink-0 min-h-[500px] md:min-h-[800px] w-64 md:w-72">
								{#each (winnersBracket ?? []).filter((m) => m.round === 1) as matchup, i}
									<BracketMatchupCard
										{matchup}
										variant="winners"
										onClick={() => handleBracketMatchupClick(matchup)}
										animationDelay={200 + i * 50}
									/>
								{/each}
							</div>

							<!-- Round 2 -->
							<div class="flex flex-col justify-around flex-shrink-0 min-h-[500px] md:min-h-[800px] w-64 md:w-72">
								{#each (winnersBracket ?? []).filter((m) => m.round === 2) as matchup, i}
									<BracketMatchupCard
										{matchup}
										variant="winners"
										onClick={() => handleBracketMatchupClick(matchup)}
										animationDelay={400 + i * 50}
									/>
								{/each}
							</div>

							<!-- Round 3 (Championship) -->
							<div class="flex flex-col justify-center flex-shrink-0 min-h-[500px] md:min-h-[800px] w-64 md:w-72">
								{#each (winnersBracket ?? []).filter((m) => m.round === 3) as matchup}
									<BracketMatchupCard
										{matchup}
										variant="winners"
										onClick={() => handleBracketMatchupClick(matchup)}
										animationDelay={600}
									/>
								{/each}
							</div>

							<!-- Champion Card -->
							<div class="flex flex-col justify-center flex-shrink-0 min-h-[500px] md:min-h-[800px] w-64 md:w-80">
								{#each (winnersBracket ?? []).filter((m) => m.round === 3) as matchup}
									{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
										{@const avatarUrl = matchup.winnerName === matchup.team1Name ? matchup.team1Avatar : matchup.team2Avatar}
										<div class="rounded-lg bg-base-300 border-2 border-base-content/20 p-6 md:p-8 w-64 md:w-80 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 fade-in" style="animation-delay: 700ms;">
											<div class="text-6xl mb-4">&#x1F3C6;</div>
											<div class="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Champion</div>
											<div class="flex items-center justify-center gap-3 mb-2">
												{#if avatarUrl && !failedAvatars.has(avatarUrl)}
													<img
														src={avatarUrl}
														alt={matchup.winnerName}
														class="w-16 h-16 rounded-full"
														on:error={() => {
															failedAvatars.add(avatarUrl);
															failedAvatars = failedAvatars;
														}}
													/>
												{:else}
													<div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center font-bold text-primary-content text-xl">
														{getInitials(matchup.winnerName)}
													</div>
												{/if}
											</div>
											<div class="font-bold text-2xl">{matchup.winnerName}</div>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Consolation Bracket -->
				{#if consolationBracket && consolationBracket.length > 0}
					<div class="rounded-lg bg-base-200 p-3 md:p-6 overflow-x-auto fade-in" style="animation-delay: 300ms;">
						<h2 class="mb-4 md:mb-6 text-center text-2xl md:text-3xl font-bold">Consolation Bracket</h2>

						<div class="flex items-center justify-evenly mb-4 overflow-x-auto">
							<div class="text-center text-sm font-semibold text-gray-400 w-72 flex-shrink-0 opacity-0">Placeholder</div>
							<div class="text-center text-sm font-semibold text-gray-400 w-72 flex-shrink-0">5th Place (Week 16)</div>
							<div class="text-center text-sm font-semibold text-gray-400 w-72 flex-shrink-0">3rd Place (Week 17)</div>
							<div class="text-center text-sm font-semibold text-gray-400 w-80 flex-shrink-0 opacity-0">Placeholder</div>
						</div>

						<div class="flex items-center justify-evenly overflow-x-auto">
							<div class="flex flex-col justify-center flex-shrink-0 min-h-[800px] w-72 opacity-0 pointer-events-none"></div>

							<div class="flex flex-col justify-center flex-shrink-0 min-h-[800px] w-72">
								{#each (consolationBracket ?? []).filter((m) => m.round === 2) as matchup, i}
									<BracketMatchupCard
										{matchup}
										variant="consolation"
										onClick={() => handleBracketMatchupClick(matchup)}
										animationDelay={350 + i * 50}
									/>
								{/each}
							</div>

							<div class="flex flex-col justify-center flex-shrink-0 min-h-[800px] w-72">
								{#each (consolationBracket ?? []).filter((m) => m.round === 3) as matchup}
									<BracketMatchupCard
										{matchup}
										variant="consolation"
										onClick={() => handleBracketMatchupClick(matchup)}
										animationDelay={450}
									/>
								{/each}
							</div>

							<div class="flex flex-col justify-center flex-shrink-0 min-h-[800px] w-80">
								{#each (consolationBracket ?? []).filter((m) => m.round === 3) as matchup}
									{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
										{@const avatarUrl = matchup.winnerName === matchup.team1Name ? matchup.team1Avatar : matchup.team2Avatar}
										<div class="rounded-lg bg-base-300 border-2 border-base-content/20 p-8 w-80 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 fade-in" style="animation-delay: 550ms;">
											<div class="text-6xl mb-4">&#x1F949;</div>
											<div class="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">3rd Place</div>
											<div class="flex items-center justify-center gap-3 mb-2">
												{#if avatarUrl && !failedAvatars.has(avatarUrl)}
													<img
														src={avatarUrl}
														alt={matchup.winnerName}
														class="w-16 h-16 rounded-full"
														on:error={() => {
															failedAvatars.add(avatarUrl);
															failedAvatars = failedAvatars;
														}}
													/>
												{:else}
													<div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center font-bold text-primary-content text-xl">
														{getInitials(matchup.winnerName)}
													</div>
												{/if}
											</div>
											<div class="font-bold text-2xl">{matchup.winnerName}</div>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
		{:else if isPlayoffs && showBrackets && showLosersBracket}
			<!-- Losers Bracket -->
			<div class="space-y-8 md:space-y-12 fade-in" style="animation-delay: 150ms;">
				<div class="rounded-lg bg-base-200 p-3 md:p-6">
					<h2 class="mb-4 md:mb-6 text-center text-2xl md:text-3xl font-bold">Losers Bracket</h2>

					<div class="overflow-x-auto">
						<div class="flex items-center justify-start mb-4 gap-4 md:gap-8">
							<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">Round 1 (Week 15)</div>
							<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">7th Place (Week 16)</div>
							<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-80 flex-shrink-0 opacity-0">Placeholder</div>
						</div>

						<div class="flex items-center justify-start gap-4 md:gap-8">
							{#if (losersBracket ?? []).filter((m) => m.round === 1).length > 0}
								<div class="flex flex-col justify-center gap-4 md:gap-8">
									{#each (losersBracket ?? []).filter((m) => m.round === 1) as matchup, i}
										<BracketMatchupCard
											{matchup}
											variant="losers"
											onClick={() => handleBracketMatchupClick(matchup)}
											animationDelay={200 + i * 50}
										/>
									{/each}
								</div>
							{/if}

							{#if (losersBracket ?? []).filter((m) => m.round === 2).length > 0}
								<div class="flex flex-col justify-center">
									{#each (losersBracket ?? []).filter((m) => m.round === 2).slice(0, 1) as matchup}
										<BracketMatchupCard
											{matchup}
											variant="losers"
											onClick={() => handleBracketMatchupClick(matchup)}
											animationDelay={350}
										/>
									{/each}
								</div>
							{/if}

							<div class="flex flex-col justify-center flex-shrink-0 w-64 md:w-80">
								{#each (losersBracket ?? []).filter((m) => m.round === 2).slice(0, 1) as matchup}
									{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
										{@const avatarUrl = matchup.winnerName === matchup.team1Name ? matchup.team1Avatar : matchup.team2Avatar}
										<div class="rounded-lg bg-base-300 border-2 border-base-content/20 p-6 md:p-8 w-64 md:w-80 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 fade-in" style="animation-delay: 450ms;">
											<div class="text-6xl mb-4">&#x1F4A9;</div>
											<div class="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Toilet Bowl Champion</div>
											<div class="flex items-center justify-center gap-3 mb-2">
												{#if avatarUrl && !failedAvatars.has(avatarUrl)}
													<img
														src={avatarUrl}
														alt={matchup.winnerName}
														class="w-16 h-16 rounded-full"
														on:error={() => {
															failedAvatars.add(avatarUrl);
															failedAvatars = failedAvatars;
														}}
													/>
												{:else}
													<div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center font-bold text-primary-content text-xl">
														{getInitials(matchup.winnerName)}
													</div>
												{/if}
											</div>
											<div class="font-bold text-2xl">{matchup.winnerName}</div>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- 9th Place Game -->
				{#if (losersBracket ?? []).filter((m) => m.round === 2).length > 1}
					<div class="rounded-lg bg-base-200 p-3 md:p-6 fade-in" style="animation-delay: 300ms;">
						<h2 class="mb-4 md:mb-6 text-center text-2xl md:text-3xl font-bold">9th Place Game</h2>

						<div class="flex items-center justify-center">
							<div class="flex flex-col justify-center">
								<div class="text-center text-sm font-semibold text-gray-400 mb-2">9th Place (Week 16)</div>
								{#each (losersBracket ?? []).filter((m) => m.round === 2).slice(1, 2) as matchup}
									<BracketMatchupCard
										{matchup}
										variant="losers"
										onClick={() => handleBracketMatchupClick(matchup)}
										animationDelay={350}
									/>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
		{:else if !activeMatchups || activeMatchups.length === 0}
			<div class="flex justify-center items-center min-h-[400px]">
				<p class="text-lg text-base-content/70">No matchups available</p>
			</div>
		{:else}
			<!-- Regular Season or Non-Bracket View -->
			{#if !playersLoaded}
				<div class="flex justify-center items-center min-h-[400px]">
					<div class="text-center">
						<span class="loading loading-spinner loading-lg"></span>
						<p class="mt-4 text-lg">Loading player data...</p>
					</div>
				</div>
			{:else if loadingWeek}
				<MatchupsSkeleton />
			{:else}
				{#each Object.entries(groupedMatchups) as [matchupId, group], matchupIndex}
					{@const team1 = group[0]}
					{@const team2 = group[1]}
					{#if team1 && team2}
						<MatchupCard
							{team1}
							{team2}
							{matchupId}
							{displayWeek}
							{rosterPositions}
							animationDelay={150 + matchupIndex * 100}
						/>
					{/if}
				{/each}
			{/if}
		{/if}
	{/if}

	<!-- Selected Bracket Matchup Detail View -->
	{#if selectedBracketMatchup}
		<div id="selected-matchup-detail" class="mt-6 md:mt-8 mb-6 md:mb-8" transition:slide={{ duration: 300 }}>
			<div class="border-base-content/10 bg-base-300 rounded-lg border p-4 md:p-6">
				<div class="flex items-center justify-between mb-4 md:mb-6">
					<h2 class="text-xl md:text-3xl font-bold">
						{selectedBracketMatchup.bracketInfo.round === 1
							? 'Round 1'
							: selectedBracketMatchup.bracketInfo.round === 2
								? 'Round 2'
								: 'Championship'} Matchup Details
					</h2>
					<button
						class="btn btn-sm btn-circle btn-ghost"
						on:click={() => (selectedBracketMatchup = null)}
						aria-label="Close matchup details"
					>
						&#x2715;
					</button>
				</div>

				<div class="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-center md:justify-center">
					<!-- Team 1 -->
					<div class="bg-base-100 rounded-xl p-3 md:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<TeamHeader
							teamName={selectedBracketMatchup.team1.TeamName ?? 'Unknown Team'}
							teamLogo={selectedBracketMatchup.team1.AvatarUrl ?? 'https://via.placeholder.com/150'}
						/>
						<div class="text-center mt-2 mb-3">
							<span
								class="text-2xl md:text-3xl font-bold {selectedBracketMatchup.bracketInfo.winnerName ===
								selectedBracketMatchup.bracketInfo.team1Name
									? 'text-success'
									: ''}"
							>
								{selectedBracketMatchup.bracketInfo.team1Score.toFixed(2)}
							</span>
							{#if selectedBracketMatchup.bracketInfo.winnerName === selectedBracketMatchup.bracketInfo.team1Name}
								<div class="badge badge-success mt-2">Winner</div>
							{/if}
						</div>
						<ul class="mt-3 md:mt-4 space-y-1 md:space-y-3">
							{#each RosterSorter.assignRoles(Object.values(selectedBracketMatchup.team1.Starters ?? {})) as player}
								<RosterSpot
									position={player.role}
									badgeClass={RosterSorter.getBadgeClass(player.role)}
									playerName={player.first_name + ' ' + player.last_name}
									playerTeam={player.team ?? ''}
									playerImage={player.playerAvatarUrl ?? 'https://via.placeholder.com/150'}
									PlayerTeamLogo={player.playerTeamAvatarUrl ?? 'https://via.placeholder.com/150'}
									playerPoints={selectedBracketMatchup.team1.PlayersPoints?.[player.player_id]}
								/>
							{/each}
						</ul>
					</div>

					<div class="flex items-center justify-center text-xl md:text-3xl font-bold">VS</div>

					<!-- Team 2 -->
					<div class="bg-base-100 rounded-xl p-3 md:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<TeamHeader
							teamName={selectedBracketMatchup.team2.TeamName ?? 'Unknown Team'}
							teamLogo={selectedBracketMatchup.team2.AvatarUrl ?? 'https://via.placeholder.com/150'}
						/>
						<div class="text-center mt-2 mb-3">
							<span
								class="text-2xl md:text-3xl font-bold {selectedBracketMatchup.bracketInfo.winnerName ===
								selectedBracketMatchup.bracketInfo.team2Name
									? 'text-success'
									: ''}"
							>
								{selectedBracketMatchup.bracketInfo.team2Score.toFixed(2)}
							</span>
							{#if selectedBracketMatchup.bracketInfo.winnerName === selectedBracketMatchup.bracketInfo.team2Name}
								<div class="badge badge-success mt-2">Winner</div>
							{/if}
						</div>
						<ul class="mt-3 md:mt-4 space-y-1 md:space-y-3">
							{#each RosterSorter.assignRoles(Object.values(selectedBracketMatchup.team2.Starters ?? {})) as player}
								<RosterSpot
									position={player.role}
									badgeClass={RosterSorter.getBadgeClass(player.role)}
									playerName={player.first_name + ' ' + player.last_name}
									playerTeam={player.team ?? ''}
									playerImage={player.playerAvatarUrl ?? 'https://via.placeholder.com/150'}
									PlayerTeamLogo={player.playerTeamAvatarUrl ?? 'https://via.placeholder.com/150'}
									playerPoints={selectedBracketMatchup.team2.PlayersPoints?.[player.player_id]}
								/>
							{/each}
						</ul>
					</div>
				</div>

				<!-- Stats Toggle Button -->
				<div class="flex justify-center mt-4 md:mt-6">
					<button
						class="btn btn-sm md:btn-md btn-outline gap-2"
						on:click={() => (showPlayoffStats = !showPlayoffStats)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						{showPlayoffStats ? 'Hide Stats' : 'Show Stats'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4 transition-transform duration-200 {showPlayoffStats ? 'rotate-180' : ''}"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</button>
				</div>

				<!-- Advanced Stats Section -->
				{#if showPlayoffStats}
					{@const team1 = selectedBracketMatchup.team1}
					{@const team2 = selectedBracketMatchup.team2}
					{@const optimalOutcome = getOptimalOutcome(team1, team2)}
					{@const positionalBreakdown = getPositionalBreakdown(team1, team2)}
					{@const team1StarDep = getStarDependency(team1)}
					{@const team2StarDep = getStarDependency(team2)}
					<div class="mt-4 md:mt-6 space-y-4" transition:slide={{ duration: 300 }}>
						<!-- Optimal Lineup Outcome -->
						{#if optimalOutcome}
							<div class="bg-base-100 rounded-lg p-4">
								<div class="flex items-center gap-2 mb-3">
									<span class="text-lg">&#x1F4CA;</span>
									<span class="font-semibold text-sm md:text-base">Optimal Lineup Outcome</span>
								</div>
								<div class="grid grid-cols-2 gap-4 text-sm">
									<div class="text-center">
										<p class="text-base-content/70 text-xs">{team1.TeamName}</p>
										<p class="font-bold text-lg">{optimalOutcome.team1Optimal.toFixed(2)}</p>
									</div>
									<div class="text-center">
										<p class="text-base-content/70 text-xs">{team2.TeamName}</p>
										<p class="font-bold text-lg">{optimalOutcome.team2Optimal.toFixed(2)}</p>
									</div>
								</div>
								{#if optimalOutcome.wouldChange}
									<div class="mt-3 text-center">
										<span class="badge badge-warning gap-1">
											<span>&#x26A0;</span> Outcome would flip with optimal lineups!
										</span>
									</div>
								{/if}
							</div>
						{/if}

						<!-- Positional Breakdown -->
						{#if positionalBreakdown}
							<div class="bg-base-100 rounded-lg p-4">
								<div class="flex items-center gap-2 mb-3">
									<span class="text-lg">&#x1F3C8;</span>
									<span class="font-semibold text-sm md:text-base">Positional Breakdown</span>
								</div>
								<div class="space-y-2">
									{#each positionalBreakdown.breakdown as pos}
									{@const total = pos.team1Points + pos.team2Points}
									{@const t1Pct = total > 0 ? (pos.team1Points / total) * 100 : 50}
										<div class="flex items-center justify-between text-sm">
											<span class="badge badge-outline w-10">{pos.pos}</span>
											<div class="flex-1 mx-3">
												<div class="flex justify-between text-xs mb-1">
													<span class={pos.winner === 1 ? 'text-success font-bold' : ''}>{pos.team1Points.toFixed(1)}</span>
													<span class={pos.winner === 2 ? 'text-success font-bold' : ''}>{pos.team2Points.toFixed(1)}</span>
												</div>
												<div class="relative h-2 bg-base-300 rounded-full overflow-hidden">
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
											<span class="w-6 text-center {pos.winner === 1 ? 'text-success' : pos.winner === 2 ? 'text-error' : ''}">
												{pos.winner === 1 ? 'W' : pos.winner === 2 ? 'L' : '-'}
											</span>
										</div>
									{/each}
								</div>
								<div class="mt-3 flex justify-center gap-4 text-sm">
									<span class="text-base-content/70">{team1.TeamName}: <span class="font-bold text-success">{positionalBreakdown.team1Wins}</span></span>
									<span class="text-base-content/50">|</span>
									<span class="text-base-content/70">{team2.TeamName}: <span class="font-bold text-success">{positionalBreakdown.team2Wins}</span></span>
								</div>
							</div>
						{/if}

						<!-- Star Dependency -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#if team1StarDep}
								<div class="bg-base-100 rounded-lg p-4">
									<div class="flex items-center gap-2 mb-2">
										<span class="text-lg">&#x2B50;</span>
										<span class="font-semibold text-sm">{team1.TeamName} Star</span>
									</div>
									<p class="text-sm truncate">{team1StarDep.name}</p>
									<div class="flex items-center gap-2 mt-1">
										<span class="font-bold">{team1StarDep.points.toFixed(1)} pts</span>
										<span class="text-base-content/70 text-xs">({team1StarDep.pct.toFixed(1)}% of total)</span>
									</div>
									<div class="mt-2 h-2 bg-base-300 rounded-full overflow-hidden">
										<div class="h-full bg-warning" style="width: {team1StarDep.pct}%"></div>
									</div>
								</div>
							{/if}
							{#if team2StarDep}
								<div class="bg-base-100 rounded-lg p-4">
									<div class="flex items-center gap-2 mb-2">
										<span class="text-lg">&#x2B50;</span>
										<span class="font-semibold text-sm">{team2.TeamName} Star</span>
									</div>
									<p class="text-sm truncate">{team2StarDep.name}</p>
									<div class="flex items-center gap-2 mt-1">
										<span class="font-bold">{team2StarDep.points.toFixed(1)} pts</span>
										<span class="text-base-content/70 text-xs">({team2StarDep.pct.toFixed(1)}% of total)</span>
									</div>
									<div class="mt-2 h-2 bg-base-300 rounded-full overflow-hidden">
										<div class="h-full bg-warning" style="width: {team2StarDep.pct}%"></div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</main>

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
