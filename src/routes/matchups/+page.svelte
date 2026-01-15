<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { MatchupPageDto } from '$lib/Utilities/Dtos/MatchupPageDto';
	import { RosterSorter } from '$lib/Utilities/RosterSorter';
	import { RostersHelper } from '$lib/Utilities/RostersHelper';
	import TeamHeader from '$lib/Components/rosters/TeamHeader.svelte';
	import RosterSpot from '$lib/Components/rosters/RosterSpot.svelte';
	import { PlayersStore } from '$lib/Stores/PlayerStore';
	import { RostersStore } from '$lib/Stores/RosterStore';
	import { get } from 'svelte/store';

	export let data: PageData;
	
	let currentWeek: number | undefined;
	let isPlayoffs: boolean = false;
	let matchups: MatchupPageDto[] = [];
	let regularSeasonMatchups: MatchupPageDto[] = []; // For week 14 view during playoffs
	let winnersBracket: any[] = [];
	let losersBracket: any[] = [];
	let consolationBracket: any[] = [];
	let isLoading = true;
	let loadingRegularSeason = false;

	// Handle streamed data
	$: if (data.streamed?.matchupData) {
		data.streamed.matchupData.then((result: any) => {
			currentWeek = result.currentWeek;
			isPlayoffs = result.isPlayoffs;
			matchups = result.matchups || [];
			winnersBracket = result.winnersBracket || [];
			losersBracket = result.losersBracket || [];
			consolationBracket = result.consolationBracket || [];
			isLoading = false;
			
			// Load player data after matchup data arrives
			if (!isPlayoffs) {
				ensurePlayerDataLoaded();
			}
		});
	}

	// Toggle state for playoff view (true = brackets, false = matchups)
	let showBrackets = true;
	let showLosersBracket = false;
	let playersLoaded = false;
	let selectedBracketMatchup: any = null;
	let viewingRegularSeasonDuringPlayoffs = false;
	
	// Function to load week 14 matchups during playoffs
	async function loadRegularSeasonMatchups() {
		if (regularSeasonMatchups.length > 0) {
			// Already loaded
			viewingRegularSeasonDuringPlayoffs = true;
			showBrackets = false;
			showLosersBracket = false;
			ensurePlayerDataLoaded();
			return;
		}
		
		loadingRegularSeason = true;
		try {
			// Fetch week 14 matchups (last regular season week)
			const week14Matchups = await fetch(`/api/matchups?week=14`).then(r => r.json());
			
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
	
	// State for collapsible matchup sections
	let expandedRosters: Record<string, boolean> = {};
	let expandedStats: Record<string, boolean> = {};
	
	function toggleRoster(matchupId: string) {
		expandedRosters[matchupId] = !expandedRosters[matchupId];
		expandedRosters = expandedRosters; // Trigger reactivity
	}
	
	function toggleStats(matchupId: string) {
		expandedStats[matchupId] = !expandedStats[matchupId];
		expandedStats = expandedStats; // Trigger reactivity
	}
	
	function getTopScorer(group: MatchupPageDto[]) {
		let topPlayer: any = null;
		let topScore = 0;
		
		group.forEach(matchup => {
			Object.values(matchup.Starters ?? {}).forEach((player: any) => {
				const score = player.stats?.pts_half_ppr || player.stats?.pts_ppr || 0;
				if (score > topScore) {
					topScore = score;
					topPlayer = player;
				}
			});
		});
		
		return topPlayer ? {
			name: `${topPlayer.first_name} ${topPlayer.last_name}`,
			score: topScore
		} : null;
	}
	
	function getBenchPoints(matchup: MatchupPageDto) {
		if (!matchup.Bench || !matchup.PlayersPoints) return '0.00';

		let total = 0;
		Object.keys(matchup.Bench).forEach(playerId => {
			total += matchup.PlayersPoints?.[playerId] || 0;
		});

		// Return as a formatted string with 2 decimal places
		return total.toFixed(2);
	}

	/**
	 * Computes manager accuracy vs an "optimal" lineup for a matchup.
	 * Uses historical starters (matchup.Starters) and all available players (Starters+Bench)
	 * Returns totals and per-position missed points.
	 */
	function computeManagerAccuracy(matchup: MatchupPageDto) {
		if (!matchup.Starters || !matchup.PlayersPoints) return null;

		// Build list of all players (starters + bench)
		const allMap: Record<string, any> = { ...(matchup.Starters || {}), ...(matchup.Bench || {}) };
		const allPlayers = Object.keys(allMap).map(id => ({
			id,
			pos: (allMap[id]?.position || allMap[id]?.position?.toUpperCase?.() || '').toUpperCase(),
			points: Number(matchup.PlayersPoints?.[id] ?? 0),
			player: allMap[id]
		}));

		// Starter counts by position
		const starterCounts: Record<string, number> = {};
		Object.keys(matchup.Starters).forEach(id => {
			const pos = (matchup.Starters?.[id]?.position || '').toUpperCase();
			starterCounts[pos] = (starterCounts[pos] || 0) + 1;
		});

		const positions = Object.keys(starterCounts);

		// Helper to sum top N by position
		function topSumByPos(pos: string, n: number) {
			const candidates = allPlayers.filter(p => p.pos === pos).sort((a,b) => b.points - a.points);
			return candidates.slice(0, n).reduce((s, p) => s + p.points, 0);
		}

		let actualTotal = 0;
		let optimalTotal = 0;
		const perPosition: Record<string, { actual: number; optimal: number; missed: number }> = {};

			positions.forEach(pos => {
			const count = starterCounts[pos] || 0;
			const actual = Object.keys(matchup.Starters ?? {}).filter(id => (matchup.Starters?.[id]?.position || '').toUpperCase() === pos).reduce((s, id) => s + (Number(matchup.PlayersPoints?.[id] ?? 0)), 0);
			const optimal = topSumByPos(pos, count);
			perPosition[pos] = { actual, optimal, missed: Math.max(0, optimal - actual) };
			actualTotal += actual;
			optimalTotal += optimal;
		});

		// In case there are starters at positions not listed above (rare), account for them
		const totalStarterSlots = Object.keys(matchup.Starters).length;
		const accountedSlots = positions.reduce((s,p) => s + (starterCounts[p]||0), 0);
		const remainingSlots = totalStarterSlots - accountedSlots;
		if (remainingSlots > 0) {
			// Fill remaining slots with highest scoring remaining players regardless of pos
			const picked = new Set<string>();
			positions.forEach(pos => {
				Object.keys(matchup.Starters ?? {}).forEach(id => picked.add(id));
			});
			const remainingCandidates = allPlayers.filter(p => !picked.has(p.id)).sort((a,b) => b.points - a.points);
			const remOptimal = remainingCandidates.slice(0, remainingSlots).reduce((s,p) => s + p.points, 0);
			optimalTotal += remOptimal;
		}

		const missedTotal = Math.max(0, optimalTotal - actualTotal);
		const accuracyPct = optimalTotal > 0 ? ((optimalTotal - missedTotal) / optimalTotal) * 100 : 100;

		return {
			actualTotal,
			optimalTotal,
			missedTotal,
			accuracyPct,
			perPosition
		};
	}

	// Group matchups by MatchupId for regular season - make reactive
	$: groupedMatchups = (viewingRegularSeasonDuringPlayoffs ? regularSeasonMatchups : matchups) ? (viewingRegularSeasonDuringPlayoffs ? regularSeasonMatchups : matchups).reduce(
		(groups, matchup) => {
			const key = matchup.MatchupId ?? 'unknown';
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(matchup);
			return groups;
		},
		{} as Record<string, MatchupPageDto[]>
	) : {};

	// Populate player store with data from layout (already loaded server-side)
	function ensurePlayerDataLoaded() {
		// Access players from parent layout data (automatically inherited)
		const players = $page.data?.players;
		if (!players || players.length === 0) return;
		
		// Set players store only once
		if (!playersLoaded) {
			PlayersStore.set(players);
			playersLoaded = true;
		}
		
		// Re-populate Starters and Bench using historical lineup data from the matchup (not current roster)
		const hydrate = (list: MatchupPageDto[]) => {
			list.forEach((matchup: MatchupPageDto) => {
				// Use the historical lineup from the matchup API (StarterIds and PlayerIds)
				// instead of the current roster which may have changed
				if (matchup.StarterIds && matchup.PlayerIds) {
					matchup.Starters = RostersHelper.MapPlayerNames(matchup.StarterIds);
					const benchIds = matchup.PlayerIds.filter((p: string) => !matchup.StarterIds!.includes(p));
					matchup.Bench = RostersHelper.MapPlayerNames(benchIds) as Record<string, any>;
				}
			});
		};
		hydrate(matchups || []);
		hydrate(regularSeasonMatchups || []);
	}

	function handleBracketMatchupClick(bracketMatchup: any) {
		// Ensure player data is loaded first
		ensurePlayerDataLoaded();
		
		console.log('Bracket matchup clicked:', bracketMatchup);
		console.log('Available matchups:', matchups);
		
		// Find the corresponding detailed matchups by roster IDs
		const team1Matchup = matchups.find(m => m.RosterId === bracketMatchup.team1RosterId);
		const team2Matchup = matchups.find(m => m.RosterId === bracketMatchup.team2RosterId);
		
		console.log('Team 1 matchup found:', team1Matchup);
		console.log('Team 2 matchup found:', team2Matchup);
		
		if (team1Matchup && team2Matchup) {
			selectedBracketMatchup = {
				bracketInfo: bracketMatchup,
				team1: team1Matchup,
				team2: team2Matchup
			};
			
			console.log('Selected bracket matchup set:', selectedBracketMatchup);
			
			// Scroll to the detailed view
			setTimeout(() => {
				document.getElementById('selected-matchup-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 100);
		} else {
			console.warn('Could not find matching detailed matchups');
		}
	}

	// Load player data when viewing matchup details
	$: if (!isLoading && (!showBrackets || !isPlayoffs)) {
		ensurePlayerDataLoaded();
	}

	onMount(() => {
		// Load player data if we're in regular season (not showing brackets)
		if (!isLoading && !isPlayoffs) {
			ensurePlayerDataLoaded();
		}
	});
</script>

<main class="mx-0 p-2 md:mx-4 md:p-6 md:mx-auto {isPlayoffs ? 'max-w-none' : 'md:max-w-7xl'}">
	{#if isLoading}
		<!-- Loading State -->
		<div class="flex flex-col items-center justify-center py-20">
			<span class="loading loading-spinner loading-lg text-primary mb-4"></span>
			<p class="text-lg font-semibold">Loading matchups...</p>
			<p class="text-sm text-base-content/70 mt-2">This may take a moment</p>
		</div>
	{:else}
		<h1 class="mb-4 md:mb-6 text-center text-3xl md:text-4xl font-bold">
			Week {viewingRegularSeasonDuringPlayoffs ? 14 : currentWeek} {isPlayoffs && !viewingRegularSeasonDuringPlayoffs ? '- PLAYOFFS' : 'Matchups'}
		</h1>

		{#if isPlayoffs}
		<!-- Toggle button for playoffs -->
		<div class="mb-6 flex justify-center">
			<div class="btn-group">
				<button 
					class="btn {showBrackets && !showLosersBracket ? 'btn-active' : ''}" 
					on:click={() => { showBrackets = true; showLosersBracket = false; }}
				>
					Playoff Brackets
				</button>
				<button 
					class="btn {showBrackets && showLosersBracket ? 'btn-active' : ''}" 
					on:click={() => { showBrackets = true; showLosersBracket = true; }}
				>
					Losers Bracket
				</button>
				<button 
					class="btn {!showBrackets ? 'btn-active' : ''}" 
					on:click={loadRegularSeasonMatchups}
					disabled={loadingRegularSeason}
				>
					{loadingRegularSeason ? 'Loading...' : 'Week 14 Matchups'}
				</button>
			</div>
		</div>
	{/if}

	{#if isPlayoffs && showBrackets && !showLosersBracket}
		<!-- Display processed bracket data -->
		<div class="space-y-12">
			<!-- Winners Bracket -->
			<div class="rounded-lg bg-base-200 p-3 md:p-6">
				<h2 class="mb-4 md:mb-6 text-center text-2xl md:text-3xl font-bold">Winners Bracket</h2>
				
			<!-- Combined scrollable container for labels and bracket -->
			<div class="overflow-x-auto">
				<!-- Week Labels Row -->
				<div class="flex items-center justify-start mb-4 gap-2 md:gap-0 md:justify-evenly">
					<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">Round 1 (Week 15)</div>
					<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">Round 2 (Week 16)</div>
					<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">Championship (Week 17)</div>
					<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-80 flex-shrink-0 opacity-0">Placeholder</div>
				</div>
				
				<!-- Bracket Flow: 4 Columns (Round 1, Round 2, Round 3, Champion Card) -->
				<div class="flex items-center justify-start md:justify-evenly min-h-[500px] md:min-h-[800px] gap-4 md:gap-0">
				<!-- Round 1 (Week 15) - 4 matchups -->
				<div class="flex flex-col justify-around flex-shrink-0 min-h-[500px] md:min-h-[800px] w-64 md:w-72">
						{#each (winnersBracket ?? []).filter(m => m.round === 1) as matchup, i}
					<div 
						class="rounded-lg bg-base-300 border-2 border-base-content/20 w-64 md:w-72 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
						on:click={() => handleBracketMatchupClick(matchup)}
						on:keydown={(e) => e.key === 'Enter' && handleBracketMatchupClick(matchup)}
						role="button"
						tabindex="0"
					>
									<!-- Team 1 -->
									<div class="p-3 {matchup.winnerName === matchup.team1Name ? 'border-l-4 border-success bg-success/5' : ''} border-b border-base-content/10">
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2 flex-1 min-w-0">
											{#if matchup.team1Avatar}
												<img src={matchup.team1Avatar} alt={matchup.team1Name} class="w-8 h-8 rounded-full" />
											{/if}
											<span class="truncate {matchup.winnerName === matchup.team1Name ? 'font-bold text-success' : ''}">
												{matchup.team1Name}
											</span>
										</div>
										<span class="font-semibold {matchup.winnerName === matchup.team1Name ? 'text-success' : ''}">
											{matchup.team1Name === 'TBD' ? '' : matchup.team1Score.toFixed(2)}
										</span>
									</div>
								</div>
								<!-- Team 2 -->
								<div class="p-3 {matchup.winnerName === matchup.team2Name ? 'border-l-4 border-success bg-success/5' : ''}">
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2 flex-1 min-w-0">
											{#if matchup.team2Avatar}
												<img src={matchup.team2Avatar} alt={matchup.team2Name} class="w-8 h-8 rounded-full" />
											{/if}
											<span class="truncate {matchup.winnerName === matchup.team2Name ? 'font-bold text-success' : matchup.team2Name === 'BYE' ? 'text-gray-500 italic' : ''}">
												{matchup.team2Name}
											</span>
										</div>
										<span class="font-semibold {matchup.winnerName === matchup.team2Name ? 'text-success' : ''}">
											{matchup.team2Name === 'BYE' || matchup.team2Name === 'TBD' ? '' : matchup.team2Score.toFixed(2)}
										</span>
									</div>
								</div>
							</div>

					{/each}
				</div>

				<!-- Round 2 (Week 16) - 2 matchups -->
				<div class="flex flex-col justify-around flex-shrink-0 min-h-[500px] md:min-h-[800px] w-64 md:w-72">
						{#each (winnersBracket ?? []).filter(m => m.round === 2) as matchup, i}
					<div 
						class="rounded-lg bg-base-300 border-2 border-base-content/20 w-64 md:w-72 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
						on:click={() => handleBracketMatchupClick(matchup)}
						on:keydown={(e) => e.key === 'Enter' && handleBracketMatchupClick(matchup)}
						role="button"
						tabindex="0"
					>
								<!-- Team 1 -->
								<div class="p-3 {matchup.winnerName === matchup.team1Name ? 'border-l-4 border-success bg-success/5' : ''} border-b border-base-content/10">
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2 flex-1 min-w-0">
											{#if matchup.team1Avatar}
												<img src={matchup.team1Avatar} alt={matchup.team1Name} class="w-8 h-8 rounded-full" />
											{/if}
											<span class="truncate {matchup.winnerName === matchup.team1Name ? 'font-bold text-success' : ''}">
												{matchup.team1Name}
											</span>
										</div>
										<span class="font-semibold {matchup.winnerName === matchup.team1Name ? 'text-success' : ''}">
											{matchup.team1Name === 'TBD' ? '' : matchup.team1Score.toFixed(2)}
										</span>
									</div>
								</div>
								<!-- Team 2 -->
								<div class="p-3 {matchup.winnerName === matchup.team2Name ? 'border-l-4 border-success bg-success/5' : ''}">
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2 flex-1 min-w-0">
											{#if matchup.team2Avatar}
												<img src={matchup.team2Avatar} alt={matchup.team2Name} class="w-8 h-8 rounded-full" />
											{/if}
											<span class="truncate {matchup.winnerName === matchup.team2Name ? 'font-bold text-success' : ''}">
												{matchup.team2Name}
											</span>
										</div>
										<span class="font-semibold {matchup.winnerName === matchup.team2Name ? 'text-success' : ''}">
											{matchup.team2Name === 'TBD' ? '' : matchup.team2Score.toFixed(2)}
										</span>
									</div>
								</div>
							</div>

					{/each}
				</div>

				<!-- Round 3 (Week 17) - Championship -->
				<div class="flex flex-col justify-center flex-shrink-0 min-h-[500px] md:min-h-[800px] w-64 md:w-72">
						{#each (winnersBracket ?? []).filter(m => m.round === 3) as matchup}
					<div 
						class="rounded-lg bg-base-300 border-2 border-base-content/20 w-64 md:w-72 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
						on:click={() => handleBracketMatchupClick(matchup)}
						on:keydown={(e) => e.key === 'Enter' && handleBracketMatchupClick(matchup)}
						role="button"
						tabindex="0"
					>
								<!-- Team 1 -->
								<div class="p-3 {matchup.winnerName === matchup.team1Name ? 'border-l-4 border-success bg-success/5' : ''} border-b border-base-content/10">
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2 flex-1 min-w-0">
											{#if matchup.team1Avatar}
												<img src={matchup.team1Avatar} alt={matchup.team1Name} class="w-8 h-8 rounded-full" />
											{/if}
											<span class="truncate {matchup.winnerName === matchup.team1Name ? 'font-bold text-success' : ''}">
												{matchup.team1Name}
											</span>
										</div>
										<span class="font-semibold {matchup.winnerName === matchup.team1Name ? 'text-success' : ''}">
											{matchup.team1Name === 'TBD' ? '' : matchup.team1Score.toFixed(2)}
										</span>
									</div>
								</div>
								<!-- Team 2 -->
								<div class="p-3 {matchup.winnerName === matchup.team2Name ? 'border-l-4 border-success bg-success/5' : ''}">
									<div class="flex items-center justify-between gap-2">
										<div class="flex items-center gap-2 flex-1 min-w-0">
											{#if matchup.team2Avatar}
												<img src={matchup.team2Avatar} alt={matchup.team2Name} class="w-8 h-8 rounded-full" />
											{/if}
											<span class="truncate {matchup.winnerName === matchup.team2Name ? 'font-bold text-success' : ''}">
												{matchup.team2Name}
											</span>
										</div>
										<span class="font-semibold {matchup.winnerName === matchup.team2Name ? 'text-success' : ''}">
											{matchup.team2Name === 'TBD' ? '' : matchup.team2Score.toFixed(2)}
										</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
					
					<!-- Champion Card (4th Column) -->
				<div class="flex flex-col justify-center flex-shrink-0 min-h-[500px] md:min-h-[800px] w-64 md:w-80">
						{#each (winnersBracket ?? []).filter(m => m.round === 3) as matchup}
							{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
						<div class="rounded-lg bg-base-300 border-2 border-base-content/20 p-6 md:p-8 w-64 md:w-80 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
									<div class="text-6xl mb-4">🏆</div>
									<div class="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Champion</div>
									<div class="flex items-center justify-center gap-3 mb-2">
										{#if matchup.team1Avatar && matchup.winnerName === matchup.team1Name}
											<img src={matchup.team1Avatar} alt={matchup.winnerName} class="w-16 h-16 rounded-full" />
										{:else if matchup.team2Avatar && matchup.winnerName === matchup.team2Name}
											<img src={matchup.team2Avatar} alt={matchup.winnerName} class="w-16 h-16 rounded-full" />
										{/if}
									</div>
									<div class="font-bold text-2xl">{matchup.winnerName}</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>		</div>
			<!-- Consolation Bracket -->
			{#if consolationBracket && consolationBracket.length > 0}
			<div class="rounded-lg bg-base-200 p-6 overflow-x-auto">
				<h2 class="mb-6 text-center text-3xl font-bold">Consolation Bracket</h2>
				
				<!-- Week Labels Row -->
				<div class="flex items-center justify-evenly mb-4 overflow-x-auto">
					<div class="text-center text-sm font-semibold text-gray-400 w-72 flex-shrink-0 opacity-0">Placeholder</div>
					<div class="text-center text-sm font-semibold text-gray-400 w-72 flex-shrink-0">5th Place (Week 16)</div>
					<div class="text-center text-sm font-semibold text-gray-400 w-72 flex-shrink-0">3rd Place (Week 17)</div>
					<div class="text-center text-sm font-semibold text-gray-400 w-80 flex-shrink-0 opacity-0">Placeholder</div>
				</div>
				
				<!-- Bracket Flow: 4 Columns (Empty, Round 2, Round 3, 3rd Place Card) -->
				<div class="flex items-center justify-evenly overflow-x-auto">
						<!-- Empty Column 1 for alignment -->
					<div class="flex flex-col justify-center flex-shrink-0 min-h-[800px] w-72 opacity-0 pointer-events-none">
							<!-- Invisible placeholder -->
						</div>
						
						<!-- Round 2 (Week 16) - 5th place game -->
					<div class="flex flex-col justify-center flex-shrink-0 min-h-[800px] w-72">
							{#each (consolationBracket ?? []).filter(m => m.round === 2) as matchup}
					<div 
						class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
						on:click={() => handleBracketMatchupClick(matchup)}
						on:keydown={(e) => e.key === 'Enter' && handleBracketMatchupClick(matchup)}
						role="button"
						tabindex="0"
					>
									<!-- Team 1 -->
									<div class="p-3 {matchup.winnerName === matchup.team1Name ? 'border-l-4 border-success bg-success/5' : ''} border-b border-base-content/10">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team1Avatar}
													<img src={matchup.team1Avatar} alt={matchup.team1Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team1Name ? 'font-bold text-success' : ''}">
													{matchup.team1Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team1Name ? 'text-success' : ''}">
												{matchup.team1Name === 'TBD' ? '' : matchup.team1Score.toFixed(2)}
											</span>
										</div>
									</div>
									<!-- Team 2 -->
									<div class="p-3 {matchup.winnerName === matchup.team2Name ? 'border-l-4 border-success bg-success/5' : ''}">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team2Avatar}
													<img src={matchup.team2Avatar} alt={matchup.team2Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team2Name ? 'font-bold text-success' : ''}">
													{matchup.team2Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team2Name ? 'text-success' : ''}">
												{matchup.team2Name === 'TBD' ? '' : matchup.team2Score.toFixed(2)}
											</span>
										</div>
									</div>
								</div>

						{/each}
					</div>

					<!-- Round 3 (Week 17) - 3rd Place Game -->
					<div class="flex flex-col justify-center flex-shrink-0 min-h-[800px] w-72">
							{#each (consolationBracket ?? []).filter(m => m.round === 3) as matchup}
					<div 
						class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
						on:click={() => handleBracketMatchupClick(matchup)}
						on:keydown={(e) => e.key === 'Enter' && handleBracketMatchupClick(matchup)}
						role="button"
						tabindex="0"
					>
									<!-- Team 1 -->
									<div class="p-3 {matchup.winnerName === matchup.team1Name ? 'border-l-4 border-success bg-success/5' : ''} border-b border-base-content/10">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team1Avatar}
													<img src={matchup.team1Avatar} alt={matchup.team1Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team1Name ? 'font-bold text-success' : ''}">
													{matchup.team1Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team1Name ? 'text-success' : ''}">
												{matchup.team1Name === 'TBD' ? '' : matchup.team1Score.toFixed(2)}
											</span>
										</div>
									</div>
									<!-- Team 2 -->
									<div class="p-3 {matchup.winnerName === matchup.team2Name ? 'border-l-4 border-success bg-success/5' : ''}">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team2Avatar}
													<img src={matchup.team2Avatar} alt={matchup.team2Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team2Name ? 'font-bold text-success' : ''}">
													{matchup.team2Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team2Name ? 'text-success' : ''}">
												{matchup.team2Name === 'TBD' ? '' : matchup.team2Score.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
						
					<!-- 3rd Place Card (4th Column) -->
					<div class="flex flex-col justify-center flex-shrink-0 min-h-[800px] w-80">
							{#each (consolationBracket ?? []).filter(m => m.round === 3) as matchup}
								{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
						<div class="rounded-lg bg-base-300 border-2 border-base-content/20 p-8 w-80 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
										<div class="text-6xl mb-4">🥉</div>
										<div class="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">3rd Place</div>
										<div class="flex items-center justify-center gap-3 mb-2">
											{#if matchup.team1Avatar && matchup.winnerName === matchup.team1Name}
												<img src={matchup.team1Avatar} alt={matchup.winnerName} class="w-16 h-16 rounded-full" />
											{:else if matchup.team2Avatar && matchup.winnerName === matchup.team2Name}
												<img src={matchup.team2Avatar} alt={matchup.winnerName} class="w-16 h-16 rounded-full" />
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
		<!-- Display losers bracket (teams that didn't make playoffs) -->
		<div class="space-y-12">
			<div class="rounded-lg bg-base-200 p-3 md:p-6">
				<h2 class="mb-4 md:mb-6 text-center text-2xl md:text-3xl font-bold">Losers Bracket</h2>
				
			<!-- Combined scrollable container for labels and bracket -->
			<div class="overflow-x-auto">
				<!-- Week Labels Row -->
				<div class="flex items-center justify-start mb-4 gap-4 md:gap-8">
					<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">Round 1 (Week 15)</div>
					<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-72 flex-shrink-0">7th Place (Week 16)</div>
					<div class="text-center text-xs md:text-sm font-semibold text-gray-400 w-64 md:w-80 flex-shrink-0 opacity-0">Placeholder</div>
				</div>
					
					<!-- Bracket Flow: Left to Right -->
					<div class="flex items-center justify-start gap-4 md:gap-8">
					<!-- Round 1 (Week 15) - 2 matchups -->
					{#if (losersBracket ?? []).filter(m => m.round === 1).length > 0}
						<div class="flex flex-col justify-center gap-4 md:gap-8">
							{#each (losersBracket ?? []).filter(m => m.round === 1) as matchup}
						<div 
							class="rounded-lg bg-base-300 border-2 border-base-content/20 w-64 md:w-72 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
							on:click={() => handleBracketMatchupClick(matchup)}
							on:keydown={(e) => e.key === 'Enter' && handleBracketMatchupClick(matchup)}
							role="button"
							tabindex="0"
						>
									<!-- Team 1 -->
									<div class="p-3 {matchup.winnerName === matchup.team1Name ? 'border-l-4 border-error bg-error/5' : ''} border-b border-base-content/10">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team1Avatar}
													<img src={matchup.team1Avatar} alt={matchup.team1Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team1Name ? 'font-bold text-error' : ''}">
													{matchup.team1Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team1Name ? 'text-error' : ''}">
												{matchup.team1Name === 'TBD' ? '' : matchup.team1Score.toFixed(2)}
											</span>
										</div>
									</div>
									<!-- Team 2 -->
									<div class="p-3 {matchup.winnerName === matchup.team2Name ? 'border-l-4 border-error bg-error/5' : ''}">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team2Avatar}
													<img src={matchup.team2Avatar} alt={matchup.team2Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team2Name ? 'font-bold text-error' : ''}">
													{matchup.team2Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team2Name ? 'text-error' : ''}">
												{matchup.team2Name === 'TBD' ? '' : matchup.team2Score.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Round 2 (Week 16) - 7th place game -->
					{#if (losersBracket ?? []).filter(m => m.round === 2).length > 0}
						<div class="flex flex-col justify-center">
							{#each (losersBracket ?? []).filter(m => m.round === 2).slice(0, 1) as matchup}
						<div 
							class="rounded-lg bg-base-300 border-2 border-base-content/20 w-64 md:w-72 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
							on:click={() => handleBracketMatchupClick(matchup)}
							on:keydown={(e) => e.key === 'Enter' && handleBracketMatchupClick(matchup)}
							role="button"
							tabindex="0"
						>
									<!-- Team 1 -->
									<div class="p-3 {matchup.winnerName === matchup.team1Name ? 'border-l-4 border-error bg-error/5' : ''} border-b border-base-content/10">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team1Avatar}
													<img src={matchup.team1Avatar} alt={matchup.team1Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team1Name ? 'font-bold text-error' : ''}">
													{matchup.team1Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team1Name ? 'text-error' : ''}">
												{matchup.team1Name === 'TBD' ? '' : matchup.team1Score.toFixed(2)}
											</span>
										</div>
									</div>
									<!-- Team 2 -->
									<div class="p-3 {matchup.winnerName === matchup.team2Name ? 'border-l-4 border-error bg-error/5' : ''}">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team2Avatar}
													<img src={matchup.team2Avatar} alt={matchup.team2Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team2Name ? 'font-bold text-error' : ''}">
													{matchup.team2Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team2Name ? 'text-error' : ''}">
												{matchup.team2Name === 'TBD' ? '' : matchup.team2Score.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
					
					<!-- Toilet Bowl Champion Card -->
					<div class="flex flex-col justify-center flex-shrink-0 w-64 md:w-80">
						{#each (losersBracket ?? []).filter(m => m.round === 2).slice(0, 1) as matchup}
							{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
						<div class="rounded-lg bg-base-300 border-2 border-base-content/20 p-6 md:p-8 w-64 md:w-80 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
									<div class="text-6xl mb-4">💩</div>
									<div class="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">Toilet Bowl Champion</div>
									<div class="flex items-center justify-center gap-3 mb-2">
										{#if matchup.team1Avatar && matchup.winnerName === matchup.team1Name}
											<img src={matchup.team1Avatar} alt={matchup.winnerName} class="w-16 h-16 rounded-full" />
										{:else if matchup.team2Avatar && matchup.winnerName === matchup.team2Name}
											<img src={matchup.team2Avatar} alt={matchup.winnerName} class="w-16 h-16 rounded-full" />
										{/if}
									</div>
									<div class="font-bold text-2xl">{matchup.winnerName}</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>		</div>
			<!-- Consolation Bracket for Losers Bracket (9th place) -->
			{#if (losersBracket ?? []).filter(m => m.round === 2).length > 1}
				<div class="rounded-lg bg-base-200 p-6">
					<h2 class="mb-6 text-center text-3xl font-bold">9th Place Game</h2>
					
					<div class="flex items-center justify-center">
						<div class="flex flex-col justify-center">
							<div class="text-center text-sm font-semibold text-gray-400 mb-2">9th Place (Week 16)</div>
							{#each (losersBracket ?? []).filter(m => m.round === 2).slice(1, 2) as matchup}
						<div 
							class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
							on:click={() => handleBracketMatchupClick(matchup)}
							on:keydown={(e) => e.key === 'Enter' && handleBracketMatchupClick(matchup)}
							role="button"
							tabindex="0"
						>
									<!-- Team 1 -->
									<div class="p-3 {matchup.winnerName === matchup.team1Name ? 'border-l-4 border-error bg-error/5' : ''} border-b border-base-content/10">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team1Avatar}
													<img src={matchup.team1Avatar} alt={matchup.team1Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team1Name ? 'font-bold text-error' : ''}">
													{matchup.team1Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team1Name ? 'text-error' : ''}">
												{matchup.team1Name === 'TBD' ? '' : matchup.team1Score.toFixed(2)}
											</span>
										</div>
									</div>
									<!-- Team 2 -->
									<div class="p-3 {matchup.winnerName === matchup.team2Name ? 'border-l-4 border-error bg-error/5' : ''}">
										<div class="flex items-center justify-between gap-2">
											<div class="flex items-center gap-2 flex-1 min-w-0">
												{#if matchup.team2Avatar}
													<img src={matchup.team2Avatar} alt={matchup.team2Name} class="w-8 h-8 rounded-full" />
												{/if}
												<span class="truncate {matchup.winnerName === matchup.team2Name ? 'font-bold text-error' : ''}">
													{matchup.team2Name}
												</span>
											</div>
											<span class="font-semibold {matchup.winnerName === matchup.team2Name ? 'text-error' : ''}">
												{matchup.team2Name === 'TBD' ? '' : matchup.team2Score.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

		{/if}
	</div>
	
	{:else if !matchups || matchups.length === 0}
		<p>Loading...</p>
	{:else}
		<!-- Regular Season or Non-Bracket View -->
		{#if !playersLoaded}
			<div class="flex justify-center items-center min-h-[400px]">
				<div class="text-center">
					<span class="loading loading-spinner loading-lg"></span>
					<p class="mt-4 text-lg">Loading player data...</p>
				</div>
			</div>
		{:else}
			<!-- Regular season matchups display (also used for playoff matchups toggle) -->
			{#each Object.entries(groupedMatchups) as [matchupId, group], matchupIndex}
				{@const team1 = group[0]}
				{@const team2 = group[1]}
			{@const isWinner1 = team1 && team2 && (team1.Score ?? 0) > (team2.Score ?? 0)}
			{@const isWinner2 = team1 && team2 && (team2.Score ?? 0) > (team1.Score ?? 0)}
			{@const pointDiff = team1 && team2 ? Math.abs((team1.Score ?? 0) - (team2.Score ?? 0)) : 0}
				{@const benchPoints2 = getBenchPoints(team2)}
				
				<section class="mt-4 mb-4 md:mt-8 md:mb-8">
					<!-- Compact Matchup Card -->
					<div class="border-base-content/10 bg-base-300 rounded-none md:rounded-lg border-y md:border p-4 md:p-6">
						<!-- Header: Team Names and Week -->
						<div class="text-center mb-6">
							<h2 class="text-lg md:text-xl font-bold text-base-content/70">
								{team1?.TeamName ?? 'Team 1'} vs {team2?.TeamName ?? 'Team 2'} - Week {currentWeek}
							</h2>
						</div>
						
						<!-- Compact Score Display -->
						<div class="flex items-center justify-center gap-4 md:gap-8 mb-6">
							<!-- Team 1 -->
							<div class="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
								<div class="avatar">
									<div class="w-16 md:w-20 rounded-full ring ring-base-content/20 {isWinner1 ? 'ring-success ring-4' : ''}">
										<img src={team1?.AvatarUrl ?? 'https://via.placeholder.com/150'} alt={team1?.TeamName ?? 'Team 1'} />
									</div>
								</div>
								<div class="text-center">
									<div class="font-bold text-sm md:text-base truncate max-w-[150px]">{team1?.TeamName ?? 'Team 1'}</div>
									<div class="text-3xl md:text-4xl font-bold {isWinner1 ? 'text-success' : ''}">
										{team1?.Score?.toFixed(2) ?? '0.00'}
									</div>
									{#if isWinner1}
										<div class="badge badge-success badge-sm mt-1">👑 Winner</div>
									{/if}
								</div>
							</div>
							
							<!-- VS Divider -->
							<div class="flex flex-col items-center gap-1">
								<div class="text-xl md:text-2xl font-bold opacity-50">VS</div>
								<div class="h-px w-12 bg-base-content/20"></div>
								<div class="text-sm md:text-base font-semibold opacity-70">
									+{pointDiff.toFixed(2)}
								</div>
							</div>
							
							<!-- Team 2 -->
							<div class="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
								<div class="avatar">
									<div class="w-16 md:w-20 rounded-full ring ring-base-content/20 {isWinner2 ? 'ring-success ring-4' : ''}">
										<img src={team2?.AvatarUrl ?? 'https://via.placeholder.com/150'} alt={team2?.TeamName ?? 'Team 2'} />
									</div>
								</div>
								<div class="text-center">
									<div class="font-bold text-sm md:text-base truncate max-w-[150px]">{team2?.TeamName ?? 'Team 2'}</div>
									<div class="text-3xl md:text-4xl font-bold {isWinner2 ? 'text-success' : ''}">
										{team2?.Score?.toFixed(2) ?? '0.00'}
									</div>
									{#if isWinner2}
										<div class="badge badge-success badge-sm mt-1">👑 Winner</div>
									{/if}
								</div>
							</div>
						</div>
						
						<!-- Quick Stats Bar (Always Visible) -->
						<div class="bg-base-100 rounded-lg p-4 mb-4">
							<div class="flex items-center gap-2 mb-3">
								<span class="text-lg">📊</span>
								<span class="font-semibold">Quick Stats</span>
							</div>
							<div class="space-y-2 text-sm">
								{#if getTopScorer(group)}
									{@const ts = getTopScorer(group)}
									{#if ts}
										<div class="flex items-center gap-2">
											<span>🏆</span>
											<span><strong>Top Scorer:</strong> {ts.name} ({ts.score.toFixed(2)} pts)</span>
										</div>
									{/if}
								{/if}
								<div class="flex items-center gap-2">
									<span>💤</span>
									<span><strong>Bench Points:</strong> {team1?.TeamName}: {getBenchPoints(team1)} | {team2?.TeamName}: {getBenchPoints(team2)}</span>
								</div>
							</div>
						</div>
						
						<!-- Action Buttons -->
						<div class="flex gap-2 justify-center flex-wrap">
							<button 
								class="btn btn-sm btn-outline"
								on:click={() => toggleRoster(matchupId)}
							>
								<span>{expandedRosters[matchupId] ? '▲' : '▼'}</span>
								{expandedRosters[matchupId] ? 'Hide' : 'View'} Full Rosters
							</button>
							<button 
								class="btn btn-sm btn-outline"
								on:click={() => toggleStats(matchupId)}
							>
								<span>📈</span>
								{expandedStats[matchupId] ? 'Hide' : 'More'} Stats
							</button>
						</div>
						
						<!-- Expanded Full Rosters -->
						{#if expandedRosters[matchupId]}
							<div class="mt-6 pt-6 border-t border-base-content/10">
								<div class="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-start md:justify-center">
									{#each group as matchup, i}
										<div class="bg-base-100 rounded-xl p-4 md:p-6 shadow-lg">
											<TeamHeader
												teamName={matchup.TeamName ?? 'Unknown Team'}
												teamLogo={matchup.AvatarUrl ?? 'https://via.placeholder.com/150'}
											/>
											<div class="text-center my-3">
												<div class="text-2xl font-bold">
													{matchup.Score?.toFixed(2) ?? '0.00'}
												</div>
												<div class="text-xs opacity-60">Total Points</div>
											</div>
											<ul class="mt-4 space-y-2">
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
										</div>
										
										{#if i < group.length - 1}
											<div class="flex items-center justify-center text-xl font-bold opacity-30">VS</div>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
						
						<!-- Expanded More Stats -->
						{#if expandedStats[matchupId]}
							<div class="mt-6 pt-6 border-t border-base-content/10">
								<div class="bg-base-100 rounded-lg p-4">
									<h3 class="font-semibold text-lg mb-4">📈 Advanced Stats</h3>
                                    
									<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div class="stat bg-base-200 rounded-lg p-4">
											<div class="stat-title text-xs">Total Score</div>
											<div class="stat-value text-2xl">{team1?.Score?.toFixed(2) ?? 'N/A'}</div>
											<div class="stat-desc">{team1?.TeamName}</div>
										</div>
										<div class="stat bg-base-200 rounded-lg p-4">
											<div class="stat-title text-xs">Total Score</div>
											<div class="stat-value text-2xl">{team2?.Score?.toFixed(2) ?? 'N/A'}</div>
											<div class="stat-desc">{team2?.TeamName}</div>
										</div>
										{#if team1}
											<div class="stat bg-base-200 rounded-lg p-4">
												<div class="stat-title text-xs">Manager Accuracy</div>
												<div class="stat-value text-2xl">{(() => { const a = computeManagerAccuracy(team1); return a ? (100 - (a.missedTotal / (a.optimalTotal || 1) * 100)).toFixed(1) + '%' : 'N/A'; })()}</div>
												<div class="stat-desc">{team1?.TeamName} • Missed {(() => { const a = computeManagerAccuracy(team1); return a ? a.missedTotal.toFixed(2) : '0.00'; })()} pts</div>
											</div>
										{/if}
										{#if team2}
											<div class="stat bg-base-200 rounded-lg p-4">
												<div class="stat-title text-xs">Manager Accuracy</div>
												<div class="stat-value text-2xl">{(() => { const a = computeManagerAccuracy(team2); return a ? (100 - (a.missedTotal / (a.optimalTotal || 1) * 100)).toFixed(1) + '%' : 'N/A'; })()}</div>
												<div class="stat-desc">{team2?.TeamName} • Missed {(() => { const a = computeManagerAccuracy(team2); return a ? a.missedTotal.toFixed(2) : '0.00'; })()} pts</div>
											</div>
										{/if}
									</div>
										{#if team1 || team2}
											<div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
												{#if team1}
													{@const acc1Local = computeManagerAccuracy(team1)}
													{#if acc1Local}
														{@const entries1 = Object.entries(acc1Local.perPosition || {}) as Array<[string, any]>}
														<div class="text-sm p-3 bg-base-200 rounded">
															<div class="font-semibold">{team1.TeamName} Breakdown</div>
															<ul class="text-xs mt-2">
																{#each entries1 as [pos, vals]}
																	<li>{pos}: Missed {vals.missed.toFixed(2)} pts (Optimal {vals.optimal.toFixed(2)}, Actual {vals.actual.toFixed(2)})</li>
																{/each}
															</ul>
														</div>
													{/if}
												{/if}
												{#if team2}
													{@const acc2Local = computeManagerAccuracy(team2)}
													{#if acc2Local}
														{@const entries2 = Object.entries(acc2Local.perPosition || {}) as Array<[string, any]>}
														<div class="text-sm p-3 bg-base-200 rounded">
															<div class="font-semibold">{team2.TeamName} Breakdown</div>
															<ul class="text-xs mt-2">
																{#each entries2 as [pos, vals]}
																	<li>{pos}: Missed {vals.missed.toFixed(2)} pts (Optimal {vals.optimal.toFixed(2)}, Actual {vals.actual.toFixed(2)})</li>
																{/each}
															</ul>
														</div>
													{/if}
												{/if}
											</div>
										{/if}
								</div>
							</div>
						{/if}
					</div>
				</section>
			{/each}
		{/if}
	{/if}
{/if}

<!-- Selected Bracket Matchup Detail View - Always at bottom -->
	{#if selectedBracketMatchup}
		<div id="selected-matchup-detail" class="mt-8 mb-8">
			<div class="border-base-content/10 bg-base-300 rounded-lg border p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl md:text-3xl font-bold">
						{selectedBracketMatchup.bracketInfo.round === 1 ? 'Round 1' : selectedBracketMatchup.bracketInfo.round === 2 ? 'Round 2' : 'Championship'} Matchup Details
					</h2>
					<button 
						class="btn btn-sm btn-circle btn-ghost"
						on:click={() => selectedBracketMatchup = null}
						aria-label="Close matchup details"
					>✕</button>
				</div>
				
				<!-- Container for the two teams, centered on larger screens -->
				<div class="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-center md:justify-center">
					<!-- Team 1 -->
					<div class="bg-base-100 rounded-xl p-4 md:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<TeamHeader
							teamName={selectedBracketMatchup.team1.TeamName ?? 'Unknown Team'}
							teamLogo={selectedBracketMatchup.team1.AvatarUrl ?? 'https://via.placeholder.com/150'}
						/>
						<div class="text-center mt-2 mb-3">
							<span class="text-3xl font-bold {selectedBracketMatchup.bracketInfo.winnerName === selectedBracketMatchup.bracketInfo.team1Name ? 'text-success' : ''}">
								{selectedBracketMatchup.bracketInfo.team1Score.toFixed(2)}
							</span>
							{#if selectedBracketMatchup.bracketInfo.winnerName === selectedBracketMatchup.bracketInfo.team1Name}
								<div class="badge badge-success mt-2">Winner</div>
							{/if}
						</div>
						<ul class="mt-4 space-y-2 md:space-y-3">
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
					
					<!-- VS divider -->
					<div class="flex items-center justify-center text-2xl md:text-3xl font-bold">VS</div>
					
					<!-- Team 2 -->
					<div class="bg-base-100 rounded-xl p-4 md:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<TeamHeader
							teamName={selectedBracketMatchup.team2.TeamName ?? 'Unknown Team'}
							teamLogo={selectedBracketMatchup.team2.AvatarUrl ?? 'https://via.placeholder.com/150'}
						/>
						<div class="text-center mt-2 mb-3">
							<span class="text-3xl font-bold {selectedBracketMatchup.bracketInfo.winnerName === selectedBracketMatchup.bracketInfo.team2Name ? 'text-success' : ''}">
								{selectedBracketMatchup.bracketInfo.team2Score.toFixed(2)}
							</span>
							{#if selectedBracketMatchup.bracketInfo.winnerName === selectedBracketMatchup.bracketInfo.team2Name}
								<div class="badge badge-success mt-2">Winner</div>
							{/if}
						</div>
						<ul class="mt-4 space-y-2 md:space-y-3">
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
			</div>
		</div>
	{/if}
</main>
