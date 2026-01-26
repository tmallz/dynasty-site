<script lang="ts">
	import type { RosterPageDto } from '$lib/Utilities/Dtos/RosterPageDto';
	import TeamHeader from '$lib/Components/rosters/TeamHeader.svelte';
	import RosterSpot from '$lib/Components/rosters/RosterSpot.svelte';
	import RosterCardSkeleton from '$lib/Components/rosters/RosterCardSkeleton.svelte';
	import { RosterSorter } from '$lib/Utilities/RosterSorter';
	import { slide, fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	export let data;
	$: rosters = data.rosters;
	let expandedBenches: Record<string, boolean> = {};
	let allBenchesExpanded = false;
	let isLoading = true;
	let mounted = false;

	onMount(() => {
		mounted = true;
		// Simulate minimum loading time to show skeleton
		setTimeout(() => {
			isLoading = false;
		}, 300);
	});

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

<main class="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
	<div class="col-span-full mb-4 text-center">
		<button class="btn btn-primary btn-lg" on:click={toggleAllBenches}>
			<i class={`fas ${allBenchesExpanded ? 'fa-eye-slash' : 'fa-eye'}`}></i>
			{allBenchesExpanded ? 'Collapse All Benches' : 'Expand All Benches'}
		</button>
	</div>

	{#if isLoading}
		<!-- Skeleton Loading State -->
		{#each Array(6) as _, i}
			<RosterCardSkeleton animationDelay={i * 100} />
		{/each}
	{:else}
		{#each rosters as roster, cardIndex}
			<div
				class="roster-card bg-base-100 rounded-xl p-6 shadow-xl"
				style="animation-delay: {cardIndex * 100}ms"
			>
				<!-- Team Header -->
				<TeamHeader teamName={roster.TeamName} teamLogo={roster.AvatarUrl} />

				<!-- Starters Section -->
				<div class="section-label text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">
					Starters
				</div>

				<!-- Player List -->
				<ul class="space-y-3">
					{#each RosterSorter.assignRoles(Object.values(roster.Starters)) as player, playerIndex}
						<div
							class="player-row"
							style="animation-delay: {cardIndex * 100 + playerIndex * 30}ms"
						>
							<RosterSpot
								position={player.role}
								badgeClass={RosterSorter.getBadgeClass(player.role)}
								playerName={player.first_name + ' ' + player.last_name}
								playerTeam={player.team ?? ''}
								playerImage={player.playerAvatarUrl ?? ''}
								PlayerTeamLogo={player.playerTeamAvatarUrl ?? ''}
							/>
						</div>
					{/each}
				</ul>

				<!-- Divider -->
				<div class="my-6 border-t border-base-content/10"></div>

				<div
					class="btn btn-outline w-full justify-between hover:btn-primary"
					role="button"
					tabindex="0"
					on:click={() => toggleBench(roster.TeamName)}
					on:keydown={(e) => e.key === 'Enter' && toggleBench(roster.TeamName)}
				>
					<span class="flex items-center gap-2 font-semibold">
						<i class={`fas ${expandedBenches[roster.TeamName] ? 'fa-users-slash' : 'fa-users'}`}></i>
						{expandedBenches[roster.TeamName] ? 'Hide Bench' : 'Show Bench'}
						<span class="badge badge-sm">{Object.values(roster.Bench).length} Players</span>
					</span>
					<i
						class={`fas ${expandedBenches[roster.TeamName] ? 'fa-chevron-up' : 'fa-chevron-down'} text-lg transition-transform duration-300`}
					></i>
				</div>

				<!-- Bench Players with Slide Animation -->
				{#if expandedBenches[roster.TeamName]}
					<div transition:slide={{ duration: 300 }}>
						<!-- Bench Section Label -->
						<div class="section-label text-xs font-semibold uppercase tracking-wider text-base-content/50 mt-4 mb-2">
							Bench
						</div>

						<ul class="space-y-3 bg-base-200/30 rounded-lg p-2">
							{#each Object.values(roster.Bench) as player, benchIndex}
								<div
									class="bench-player-row"
									style="animation-delay: {benchIndex * 30}ms"
									in:fade={{ duration: 200, delay: benchIndex * 30 }}
								>
									<RosterSpot
										position="BN"
										badgeClass={RosterSorter.getBadgeClass('BN')}
										playerName={player.first_name + ' ' + player.last_name}
										playerTeam={player.team ?? ''}
										playerImage={player.playerAvatarUrl ?? ''}
										PlayerTeamLogo={player.playerTeamAvatarUrl ?? ''}
									/>
								</div>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</main>

<style>
	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.roster-card {
		animation: fadeSlideIn 400ms ease-out forwards;
		opacity: 0;
	}

	.player-row {
		animation: fadeIn 300ms ease-out forwards;
		opacity: 0;
	}

	.bench-player-row {
		animation: fadeIn 200ms ease-out forwards;
	}

	.section-label {
		letter-spacing: 0.05em;
	}
</style>
