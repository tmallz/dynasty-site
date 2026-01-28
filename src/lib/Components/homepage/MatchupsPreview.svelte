<script lang="ts">
	import type { MatchupPreviewDto } from '$lib/Utilities/HomepageHelper';

	export let matchups: MatchupPreviewDto[] = [];
	export let currentWeek: number = 1;
	export let isOffseason: boolean = false;
	export let animationDelay: number = 0;

	let avatarErrors: Record<string, boolean> = {};

	function handleAvatarError(key: string) {
		avatarErrors[key] = true;
	}

	function getInitials(name: string): string {
		if (!name) return '?';
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	}

	function isWinner(team1Score: number, team2Score: number, isTeam1: boolean): boolean {
		if (team1Score === team2Score) return false;
		return isTeam1 ? team1Score > team2Score : team2Score > team1Score;
	}
</script>

<div
	class="card bg-base-200 shadow-lg fade-in"
	style="animation-delay: {animationDelay}ms"
>
	<div class="card-body p-4 md:p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="card-title text-lg md:text-xl">Week {currentWeek} Matchups</h2>
			<a href="/matchups" class="link link-primary text-sm hover:link-hover">
				View All Matchups
			</a>
		</div>

		{#if isOffseason}
			<div class="text-center py-8 text-base-content/60">
				<div class="text-4xl mb-3">🏈</div>
				<p class="font-medium">Season starting soon!</p>
				<p class="text-sm mt-1">Check back when the regular season begins.</p>
			</div>
		{:else if matchups.length === 0}
			<div class="text-center py-8 text-base-content/50">
				No matchups available
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				{#each matchups as matchup (matchup.matchupId)}
					<div
						class="bg-base-100 rounded-lg p-3 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
					>
						<!-- Team 1 -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 min-w-0 flex-1">
								<div class="w-8 h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
									{#if matchup.team1Avatar && !avatarErrors[`${matchup.matchupId}-1`]}
										<img
											src={matchup.team1Avatar}
											alt={matchup.team1Name}
											class="w-full h-full object-cover"
											on:error={() => handleAvatarError(`${matchup.matchupId}-1`)}
										/>
									{:else}
										<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 text-[10px] font-bold text-base-content/70">
											{getInitials(matchup.team1Name)}
										</div>
									{/if}
								</div>
								<span class="font-medium text-sm truncate {isWinner(matchup.team1Score, matchup.team2Score, true) ? 'text-success' : ''}">
									{matchup.team1Name}
								</span>
							</div>
							<span class="font-bold text-base {isWinner(matchup.team1Score, matchup.team2Score, true) ? 'text-success' : 'text-base-content/70'}">
								{matchup.team1Score.toFixed(1)}
							</span>
						</div>

						<!-- VS Divider -->
						<div class="text-center my-1.5">
							<span class="text-xs text-base-content/40 font-medium">vs</span>
						</div>

						<!-- Team 2 -->
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2 min-w-0 flex-1">
								<div class="w-8 h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
									{#if matchup.team2Avatar && !avatarErrors[`${matchup.matchupId}-2`]}
										<img
											src={matchup.team2Avatar}
											alt={matchup.team2Name}
											class="w-full h-full object-cover"
											on:error={() => handleAvatarError(`${matchup.matchupId}-2`)}
										/>
									{:else}
										<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 text-[10px] font-bold text-base-content/70">
											{getInitials(matchup.team2Name)}
										</div>
									{/if}
								</div>
								<span class="font-medium text-sm truncate {isWinner(matchup.team1Score, matchup.team2Score, false) ? 'text-success' : ''}">
									{matchup.team2Name}
								</span>
							</div>
							<span class="font-bold text-base {isWinner(matchup.team1Score, matchup.team2Score, false) ? 'text-success' : 'text-base-content/70'}">
								{matchup.team2Score.toFixed(1)}
							</span>
						</div>
					</div>
				{/each}
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
