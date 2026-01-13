<script lang="ts">
	import type { RosterPageDto } from '$lib/Utilities/Dtos/RosterPageDto';
	import TeamHeader from '$lib/Components/rosters/TeamHeader.svelte';
	import RosterSpot from '$lib/Components/rosters/RosterSpot.svelte';
	import { RosterSorter } from '$lib/Utilities/RosterSorter';

	export let data;
	$: rosters = data.rosters;
	let expandedBenches: Record<string, boolean> = {};
	let allBenchesExpanded = false;

	// Initialize expanded benches when rosters are loaded
	$: if (rosters.length > 0 && Object.keys(expandedBenches).length === 0) {
		rosters.forEach((roster) => {
			expandedBenches[roster.TeamName] = false;
		});
	}

	function toggleBench(teamName: string) {
		expandedBenches[teamName] = !expandedBenches[teamName];
	}

	function toggleAllBenches() {
		allBenchesExpanded = !allBenchesExpanded;
		Object.keys(expandedBenches).forEach((teamName) => {
			expandedBenches[teamName] = allBenchesExpanded;
		});
	}
</script>

<main class="grid grid-cols-1 gap-8 p-6 md:grid-cols-3">
	<div class="col-span-full mb-4 text-center">
		<button class="btn btn-primary" on:click={toggleAllBenches}>
			{allBenchesExpanded ? 'Collapse All Benches' : 'Expand All Benches'}
		</button>
	</div>

		{#each rosters as roster}
			<div class="bg-base-100 rounded-lg p-6 shadow-lg">
				<!-- Team Header -->
				<TeamHeader teamName={roster.TeamName} teamLogo={roster.AvatarUrl} />

				<!-- Player List -->
				<ul class="space-y-2">
					{#each RosterSorter.assignRoles(Object.values(roster.Starters)) as player}
						<RosterSpot
							position={player.role}
							badgeClass={RosterSorter.getBadgeClass(player.role)}
							playerName={player.first_name + ' ' + player.last_name}
							playerTeam={player.team ?? ''}
							playerImage={player.playerAvatarUrl ?? 'https://via.placeholder.com/150'}
							PlayerTeamLogo={player.playerTeamAvatarUrl ?? 'https://via.placeholder.com/150'}
						/>
					{/each}
				</ul>

				<div
					class="bg-base-100 hover:background-secondary dark:hover:bg-base-300 mt-4 flex cursor-pointer items-center justify-between rounded-lg p-2"
					role="button"
					tabindex="0"
					on:click={() => toggleBench(roster.TeamName)}
					on:keydown={(e) => e.key === 'Enter' && toggleBench(roster.TeamName)}
				>
					<span class="font-semibold">
						{expandedBenches[roster.TeamName] ? 'Collapse Bench' : 'Expand to See Bench'}
					</span>
					<i class={`fas ${expandedBenches[roster.TeamName] ? 'fa-chevron-up' : 'fa-chevron-down'}`}
					></i>
				</div>

				<!-- Bench Players -->
				{#if expandedBenches[roster.TeamName]}
					<ul class="mt-4 space-y-2">
						{#each Object.values(roster.Bench) as player}
							<RosterSpot
								position="BN"
								badgeClass={RosterSorter.getBadgeClass('BN')}
								playerName={player.first_name + ' ' + player.last_name}
								playerTeam={player.team ?? ''}
								playerImage={player.playerAvatarUrl ?? 'https://via.placeholder.com/150'}
								PlayerTeamLogo={player.playerTeamAvatarUrl ?? 'https://via.placeholder.com/150'}
							/>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
</main>
