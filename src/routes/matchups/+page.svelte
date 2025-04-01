<script lang="ts">
	import { onMount } from 'svelte';
	import { MatchupHelper } from '$lib/Utilities/MatchupHelper';
	import type { MatchupPageDto } from '$lib/Utilities/Dtos/MatchupPageDto';
	import { RosterSorter } from '$lib/Utilities/RosterSorter';
	import TeamHeader from '$lib/Components/rosters/TeamHeader.svelte';
	import RosterSpot from '$lib/Components/rosters/RosterSpot.svelte';

	let matchups: MatchupPageDto[] = [];
	let groupedMatchups: Record<string, MatchupPageDto[]> = {};

	onMount(async () => {
		matchups = await MatchupHelper.GetPageMatchups();
		// Group matchups by MatchupId
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
	});
</script>

<main class="mx-4 p-6 md:mx-auto md:max-w-7xl">
	{#if matchups.length === 0}
		<p>Loading...</p>
	{:else}
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
