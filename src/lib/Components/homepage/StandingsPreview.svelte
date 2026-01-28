<script lang="ts">
	import type { StandingTeam } from '$lib/Utilities/HomepageHelper';

	export let standings: StandingTeam[] = [];
	export let season: string = '';
	export let isCurrentSeason: boolean = true;
	export let animationDelay: number = 0;

	let avatarErrors: Record<number, boolean> = {};

	function handleAvatarError(rank: number) {
		avatarErrors[rank] = true;
	}

	function getInitials(name: string): string {
		if (!name) return '?';
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	}

	function getRankBadgeClass(rank: number): string {
		switch (rank) {
			case 1:
				return 'bg-yellow-500 text-yellow-900';
			case 2:
				return 'bg-gray-300 text-gray-700';
			case 3:
				return 'bg-amber-600 text-amber-100';
			default:
				return 'bg-base-300 text-base-content';
		}
	}
</script>

<div
	class="card bg-base-200 shadow-lg fade-in"
	style="animation-delay: {animationDelay}ms"
>
	<div class="card-body p-4 md:p-6">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-2">
				<h2 class="card-title text-lg md:text-xl">League Standings</h2>
				{#if !isCurrentSeason && season}
					<span class="badge badge-sm badge-outline">{season} Final</span>
				{/if}
			</div>
			<a href="/standings" class="link link-primary text-sm hover:link-hover">
				View Full Standings
			</a>
		</div>

		<div class="space-y-1">
			{#each standings as team (team.rank)}
				<div
					class="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-base-300/50 transition-colors border-b border-base-content/5 last:border-b-0"
				>
					<!-- Rank Badge -->
					<div
						class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold {getRankBadgeClass(team.rank)}"
					>
						{team.rank}
					</div>

					<!-- Avatar -->
					<div class="w-8 h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
						{#if team.avatarUrl && !avatarErrors[team.rank]}
							<img
								src={team.avatarUrl}
								alt={team.teamName}
								class="w-full h-full object-cover"
								on:error={() => handleAvatarError(team.rank)}
							/>
						{:else}
							<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-bold text-base-content/70">
								{getInitials(team.teamName)}
							</div>
						{/if}
					</div>

					<!-- Team Name -->
					<div class="flex-1 min-w-0">
						<span class="font-medium truncate block text-sm md:text-base">
							{team.teamName}
						</span>
					</div>

					<!-- Points For (hidden on mobile) -->
					<div class="hidden md:block text-sm text-base-content/60 w-20 text-right">
						{team.pointsFor.toFixed(1)} PF
					</div>

					<!-- Record -->
					<div class="text-sm font-medium text-base-content/80 w-16 text-right">
						{team.wins}-{team.losses}{team.ties > 0 ? `-${team.ties}` : ''}
					</div>
				</div>
			{/each}
		</div>

		{#if standings.length === 0}
			<div class="text-center py-6 text-base-content/50">
				No standings data available
			</div>
		{/if}
	</div>
</div>

<style>
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

	.fade-in {
		animation: fade-in 0.4s ease-out forwards;
		opacity: 0;
	}
</style>
