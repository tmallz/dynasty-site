<script lang="ts">
	import type { MatchupPageDto } from '$lib/Utilities/Dtos/MatchupPageDto';

	export let matchups: MatchupPageDto[] = [];
	export let groupedMatchups: Record<string, MatchupPageDto[]> = {};

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

	// Find highest scorer team
	$: highestScorer = (() => {
		let best: { teamName: string; score: number; avatarUrl?: string } | null = null;
		matchups.forEach((m) => {
			const score = m.Score ?? 0;
			if (!best || score > best.score) {
				best = {
					teamName: m.TeamName ?? 'Unknown',
					score,
					avatarUrl: m.AvatarUrl
				};
			}
		});
		return best;
	})();

	// Find closest matchup (smallest point differential)
	$: closestMatchup = (() => {
		let closest: { team1: string; team2: string; diff: number } | null = null;
		let smallestDiff = Infinity;

		Object.values(groupedMatchups).forEach((group) => {
			if (group.length >= 2) {
				const team1 = group[0];
				const team2 = group[1];
				const diff = Math.abs((team1.Score ?? 0) - (team2.Score ?? 0));
				if (diff < smallestDiff) {
					smallestDiff = diff;
					closest = {
						team1: team1.TeamName ?? 'Team 1',
						team2: team2.TeamName ?? 'Team 2',
						diff
					};
				}
			}
		});
		return closest;
	})();

	// Find biggest blowout (largest point differential)
	$: biggestBlowout = (() => {
		let blowout: { winner: string; loser: string; diff: number } | null = null;
		let largestDiff = 0;

		Object.values(groupedMatchups).forEach((group) => {
			if (group.length >= 2) {
				const team1 = group[0];
				const team2 = group[1];
				const diff = Math.abs((team1.Score ?? 0) - (team2.Score ?? 0));
				if (diff > largestDiff) {
					largestDiff = diff;
					const winner =
						(team1.Score ?? 0) > (team2.Score ?? 0) ? team1.TeamName : team2.TeamName;
					const loser =
						(team1.Score ?? 0) > (team2.Score ?? 0) ? team2.TeamName : team1.TeamName;
					blowout = {
						winner: winner ?? 'Winner',
						loser: loser ?? 'Loser',
						diff
					};
				}
			}
		});
		return blowout;
	})();

	// Calculate total points scored league-wide
	$: totalPoints = matchups.reduce((sum, m) => sum + (m.Score ?? 0), 0);
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
	<!-- Highest Scorer -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150 fade-in"
		style="animation-delay: 50ms;"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				{#if highestScorer}
					{#if highestScorer.avatarUrl && !failedAvatars.has(highestScorer.avatarUrl)}
						<img
							src={highestScorer.avatarUrl}
							alt={highestScorer.teamName}
							class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-base-300"
							on:error={() => {
								if (highestScorer?.avatarUrl) failedAvatars.add(highestScorer.avatarUrl);
								failedAvatars = failedAvatars;
							}}
						/>
					{:else}
						<div
							class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold text-xs md:text-sm"
						>
							{getInitials(highestScorer.teamName)}
						</div>
					{/if}
					<div class="min-w-0">
						<p class="text-xs md:text-sm text-base-content/70 truncate">Top Scorer</p>
						<p class="text-sm md:text-lg font-bold truncate">{highestScorer.score.toFixed(2)}</p>
					</div>
				{:else}
					<div
						class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-base-300 flex items-center justify-center text-base-content/50"
					>
						?
					</div>
					<div>
						<p class="text-xs md:text-sm text-base-content/70">Top Scorer</p>
						<p class="text-sm md:text-lg font-bold text-base-content/50">N/A</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Closest Matchup -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150 fade-in"
		style="animation-delay: 100ms;"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				<div
					class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning text-lg md:text-xl"
				>
					<span class="text-sm md:text-base">&#x1F525;</span>
				</div>
				<div class="min-w-0">
					<p class="text-xs md:text-sm text-base-content/70 truncate">Closest</p>
					{#if closestMatchup}
						<p class="text-sm md:text-lg font-bold">+{closestMatchup.diff.toFixed(2)}</p>
					{:else}
						<p class="text-sm md:text-lg font-bold text-base-content/50">N/A</p>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Biggest Blowout -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150 fade-in"
		style="animation-delay: 150ms;"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				<div
					class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-error/20 flex items-center justify-center text-error text-lg md:text-xl"
				>
					<span class="text-sm md:text-base">&#x1F4A5;</span>
				</div>
				<div class="min-w-0">
					<p class="text-xs md:text-sm text-base-content/70 truncate">Blowout</p>
					{#if biggestBlowout}
						<p class="text-sm md:text-lg font-bold">+{biggestBlowout.diff.toFixed(2)}</p>
					{:else}
						<p class="text-sm md:text-lg font-bold text-base-content/50">N/A</p>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Total Points -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150 fade-in"
		style="animation-delay: 200ms;"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				<div
					class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg md:text-xl"
				>
					<span class="text-sm md:text-base">&#x1F3C8;</span>
				</div>
				<div class="min-w-0">
					<p class="text-xs md:text-sm text-base-content/70 truncate">Total Pts</p>
					<p class="text-sm md:text-lg font-bold">{totalPoints.toFixed(2)}</p>
				</div>
			</div>
		</div>
	</div>
</div>

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
