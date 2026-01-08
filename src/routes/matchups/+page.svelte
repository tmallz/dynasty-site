<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { MatchupPageDto } from '$lib/Utilities/Dtos/MatchupPageDto';
	import { RosterSorter } from '$lib/Utilities/RosterSorter';
	import { RostersHelper } from '$lib/Utilities/RostersHelper';
	import TeamHeader from '$lib/Components/rosters/TeamHeader.svelte';
	import RosterSpot from '$lib/Components/rosters/RosterSpot.svelte';
	import { LoadPlayers, IsPlayersLoaded } from '$lib/Stores/PlayerStore';
	import { RostersStore } from '$lib/Stores/RosterStore';
	import { get } from 'svelte/store';

	export let data: PageData;
	const { currentWeek, isPlayoffs, matchups, winnersBracket, losersBracket, consolationBracket } = data.matchupData;

	// Toggle state for playoff view (true = brackets, false = matchups)
	let showBrackets = true;
	let showLosersBracket = false;
	let playersLoaded = false;

	// Group matchups by MatchupId for regular season
	let groupedMatchups: Record<string, MatchupPageDto[]> = {};
	if (matchups) {
		groupedMatchups = matchups.reduce(
			(groups, matchup) => {
				const key = matchup.MatchupId ?? 'unknown';
				if (!groups[key]) {
					groups[key] = [];
				}
				groups[key].push(matchup);
				return groups;
			},
			{} as Record<string, MatchupPageDto[]>
		);
	}

	// Lazy load player details when viewing matchups
	async function ensurePlayerDataLoaded() {
		if (!playersLoaded && !IsPlayersLoaded()) {
			await LoadPlayers();
			playersLoaded = true;
			
			// Re-populate Starters for each matchup
			const rosters = get(RostersStore);
			matchups.forEach(matchup => {
				const roster = rosters.find(r => r.roster_id === matchup.RosterId);
				if (roster) {
					matchup.Starters = RostersHelper.MapPlayerNames(roster.starters);
				}
			});
			
			// Re-group matchups after adding player data
			groupedMatchups = matchups.reduce(
				(groups, matchup) => {
					const key = matchup.MatchupId ?? 'unknown';
					if (!groups[key]) {
						groups[key] = [];
					}
					groups[key].push(matchup);
					return groups;
				},
				{} as Record<string, MatchupPageDto[]>
			);
		}
	}

	// Load player data when viewing matchup details
	$: if (!showBrackets || !isPlayoffs) {
		ensurePlayerDataLoaded();
	}

	onMount(() => {
		// Load player data if we're in regular season (not showing brackets)
		if (!isPlayoffs) {
			ensurePlayerDataLoaded();
		}
	});
</script>

<main class="mx-4 p-6 md:mx-auto md:max-w-7xl">
	<h1 class="mb-6 text-center text-4xl font-bold">
		Week {currentWeek} {isPlayoffs ? '- PLAYOFFS' : 'Matchups'}
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
					on:click={() => { showBrackets = false; showLosersBracket = false; }}
				>
					Week 14 Matchups
				</button>
			</div>
		</div>
	{/if}

	{#if isPlayoffs && showBrackets && !showLosersBracket}
		<!-- Display processed bracket data -->
		<div class="space-y-12">
			<!-- Winners Bracket -->
			<div class="rounded-lg bg-base-200 p-6">
				<h2 class="mb-6 text-center text-3xl font-bold">Winners Bracket</h2>
				
				<!-- Bracket Flow: Left to Right -->
				<div class="flex items-center justify-center gap-8">
					<!-- Round 1 (Week 15) - 4 matchups -->
					<div class="flex flex-col justify-center gap-8">
						<div class="text-center text-sm font-semibold text-gray-400 mb-2">Round 1 (Week 15)</div>
						{#each (winnersBracket ?? []).filter(m => m.round === 1) as matchup}
							<div class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden">
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
					<div class="flex flex-col justify-center gap-16">
						<div class="text-center text-sm font-semibold text-gray-400 mb-2">Round 2 (Week 16)</div>
						{#each (winnersBracket ?? []).filter(m => m.round === 2) as matchup}
							<div class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden">
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
					<div class="flex flex-col justify-center">
						<div class="text-center text-sm font-semibold text-gray-400 mb-2">Championship (Week 17)</div>
						{#each (winnersBracket ?? []).filter(m => m.round === 3) as matchup}
							<div class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden">
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
								{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
									<div class="border-t border-gray-600 p-3 text-center bg-base-200">
										<div class="text-xs text-gray-400 mb-1">🏆 Champion</div>
										<div class="font-bold text-success text-lg">{matchup.winnerName}</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Consolation Bracket -->
			{#if consolationBracket && consolationBracket.length > 0}
				<div class="rounded-lg bg-base-200 p-6">
					<h2 class="mb-6 text-center text-3xl font-bold">Consolation Bracket</h2>
					
					<!-- Bracket Flow: Left to Right -->
					<div class="flex items-center justify-center gap-8">
						<!-- Round 2 (Week 16) - 5th place game -->
						<div class="flex flex-col justify-center">
							<div class="text-center text-sm font-semibold text-gray-400 mb-2">5th Place (Week 16)</div>
							{#each (consolationBracket ?? []).filter(m => m.round === 2) as matchup}
								<div class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden">
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
						<div class="flex flex-col justify-center">
							<div class="text-center text-sm font-semibold text-gray-400 mb-2">3rd Place (Week 17)</div>
							{#each (consolationBracket ?? []).filter(m => m.round === 3) as matchup}
								<div class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden">
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
									{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
										<div class="border-t border-gray-600 p-3 text-center bg-base-200">
											<div class="text-xs text-gray-400 mb-1">🥉 3rd Place</div>
											<div class="font-bold text-success">{matchup.winnerName}</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else if isPlayoffs && showBrackets && showLosersBracket}
		<!-- Display losers bracket (teams that didn't make playoffs) -->
		<div class="space-y-12">
			<div class="rounded-lg bg-base-200 p-6">
				<h2 class="mb-6 text-center text-3xl font-bold">Losers Bracket</h2>
				<p class="mb-6 text-center text-gray-400">Teams competing for 7th place</p>
				
				<!-- Bracket Flow: Left to Right -->
				<div class="flex items-center justify-center gap-8">
					<!-- Round 1 (Week 15) - 2 matchups -->
					{#if (losersBracket ?? []).filter(m => m.round === 1).length > 0}
						<div class="flex flex-col justify-center gap-8">
							<div class="text-center text-sm font-semibold text-gray-400 mb-2">Round 1 (Week 15)</div>
							{#each (losersBracket ?? []).filter(m => m.round === 1) as matchup}
								<div class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden">
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
					{/if}

					<!-- Round 2 (Week 16) - 7th place game -->
					{#if (losersBracket ?? []).filter(m => m.round === 2).length > 0}
						<div class="flex flex-col justify-center">
							<div class="text-center text-sm font-semibold text-gray-400 mb-2">7th Place (Week 16)</div>
							{#each (losersBracket ?? []).filter(m => m.round === 2).slice(0, 1) as matchup}
								<div class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden">
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
					{/if}
				</div>
			</div>

			<!-- Consolation Bracket for Losers Bracket (9th place) -->
			{#if (losersBracket ?? []).filter(m => m.round === 2).length > 1}
				<div class="rounded-lg bg-base-200 p-6">
					<h2 class="mb-6 text-center text-3xl font-bold">9th Place Game</h2>
					<p class="mb-6 text-center text-gray-400">Losers of Round 1</p>
					
					<div class="flex items-center justify-center">
						<div class="flex flex-col justify-center">
							<div class="text-center text-sm font-semibold text-gray-400 mb-2">9th Place (Week 16)</div>
							{#each (losersBracket ?? []).filter(m => m.round === 2).slice(1, 2) as matchup}
								<div class="rounded-lg bg-base-300 border-2 border-base-content/20 w-72 overflow-hidden">
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
					</div>
				</div>
			{/if}
		</div>
	{:else if !matchups || matchups.length === 0}
		<p>Loading...</p>
	{:else}
		<!-- Regular season matchups display (also used for playoff matchups toggle) -->
		{#each Object.entries(groupedMatchups) as [matchupId, group], matchupIndex}
			<section class="mt-8 mb-8">
				<!-- Box wrapping the entire matchup group with a light gray background in light mode -->
				<div class="border-base-content/10 bg-base-300 rounded-lg border p-6">
					<h2 class="mb-4 text-center text-3xl font-bold">Matchup #{matchupIndex + 1}</h2>
					<!-- Container that stacks vertically on mobile and becomes a 3-column grid on desktop, centered on larger screens -->
					<div class="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-center md:justify-center">
						{#each group as matchup, i}
							<div class="bg-base-100 rounded-lg p-6 shadow-lg">
								<!-- TeamHeader displays team info -->
								<TeamHeader
									teamName={matchup.TeamName ?? 'Unknown Team'}
									teamLogo={matchup.AvatarUrl ?? 'https://via.placeholder.com/150'}
								/>
								<!-- Sorted roster starters using RosterSorter.assignRoles -->
								<ul class="mt-4 space-y-2">
									{#each RosterSorter.assignRoles(Object.values(matchup.Starters ?? {})) as player}
										<RosterSpot
											position={player.role}
											badgeClass={RosterSorter.getBadgeClass(player.role)}
											playerName={player.first_name + ' ' + player.last_name}
											playerTeam={player.team ?? ''}
											playerImage={player.playerAvatarUrl ?? 'https://via.placeholder.com/150'}
											PlayerTeamLogo={player.playerTeamAvatarUrl ??
												'https://via.placeholder.com/150'}
										/>
									{/each}
								</ul>
							</div>

							{#if i < group.length - 1}
								<!-- VS divider inserted between matchup cards -->
								<div class="flex items-center justify-center text-3xl font-bold">VS</div>
							{/if}
						{/each}
					</div>
				</div>
			</section>
		{/each}
	{/if}
</main>
