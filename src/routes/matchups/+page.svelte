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
	const { currentWeek, isPlayoffs, matchups, winnersBracket, losersBracket } = data.matchupData;

	// Toggle state for playoff view (true = brackets, false = matchups)
	let showBrackets = true;
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
					class="btn {showBrackets ? 'btn-active' : ''}" 
					on:click={() => showBrackets = true}
				>
					Playoff Brackets
				</button>
				<button 
					class="btn {!showBrackets ? 'btn-active' : ''}" 
					on:click={() => showBrackets = false}
				>
					Week 14 Matchups
				</button>
			</div>
		</div>
	{/if}

	{#if isPlayoffs && showBrackets}
		<!-- Display processed bracket data -->
		<div class="space-y-8">
			<!-- Winners Bracket -->
			<div class="rounded-lg bg-base-200 p-6">
				<h2 class="mb-4 text-2xl font-bold">Winners Bracket</h2>
				{#each winnersBracket ?? [] as matchup}
					<div class="mb-4 rounded-lg bg-base-300 p-4">
						<div class="mb-2 text-sm font-semibold text-gray-500">
							Round {matchup.round} (Week {14 + matchup.round})
						</div>
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<span class={matchup.winnerName === matchup.team1Name ? 'font-bold text-success' : ''}>
									{matchup.team1Name}
								</span>
								<span class={matchup.winnerName === matchup.team1Name ? 'font-bold text-success' : ''}>
									{matchup.team1Score.toFixed(2)}
								</span>
							</div>
							<div class="flex items-center justify-between">
								<span class={matchup.winnerName === matchup.team2Name ? 'font-bold text-success' : ''}>
									{matchup.team2Name}
								</span>
								<span class={matchup.winnerName === matchup.team2Name ? 'font-bold text-success' : ''}>
									{matchup.team2Score.toFixed(2)}
								</span>
							</div>
							{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
								<div class="mt-2 border-t border-gray-600 pt-2 text-center text-sm">
									Winner: <span class="font-bold text-success">{matchup.winnerName}</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Losers Bracket -->
			{#if losersBracket && losersBracket.length > 0}
				<div class="rounded-lg bg-base-200 p-6">
					<h2 class="mb-4 text-2xl font-bold">Consolation Bracket</h2>
					{#each losersBracket as matchup}
						<div class="mb-4 rounded-lg bg-base-300 p-4">
							<div class="mb-2 text-sm font-semibold text-gray-500">
								Round {matchup.round} (Week {14 + matchup.round})
							</div>
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<span class={matchup.winnerName === matchup.team1Name ? 'font-bold text-success' : ''}>
										{matchup.team1Name}
									</span>
									<span class={matchup.winnerName === matchup.team1Name ? 'font-bold text-success' : ''}>
										{matchup.team1Score.toFixed(2)}
									</span>
								</div>
								<div class="flex items-center justify-between">
									<span class={matchup.winnerName === matchup.team2Name ? 'font-bold text-success' : ''}>
										{matchup.team2Name}
									</span>
									<span class={matchup.winnerName === matchup.team2Name ? 'font-bold text-success' : ''}>
										{matchup.team2Score.toFixed(2)}
									</span>
								</div>
								{#if matchup.winnerName && matchup.winnerName !== 'TBD'}
									<div class="mt-2 border-t border-gray-600 pt-2 text-center text-sm">
										Winner: <span class="font-bold text-success">{matchup.winnerName}</span>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else if !matchups || matchups.length === 0}
		<p>Loading...</p>
	{:else}
		<!-- Regular season matchups display (also used for playoff matchups toggle) -->
		<!-- Regular season matchups display -->
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
