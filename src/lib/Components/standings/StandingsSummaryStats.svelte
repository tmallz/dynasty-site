<script lang="ts">
	import type { StandingsSummary } from '$lib/Utilities/StandingsHelper';

	export let summary: StandingsSummary;
</script>

<div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
	<!-- Total Teams -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 fade-in"
		style="animation-delay: 0ms"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				<div
					class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg"
				>
					👥
				</div>
				<div>
					<p class="text-xs text-base-content/70 uppercase tracking-wide">Teams</p>
					<p class="text-lg font-bold">{summary.totalTeams}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Games Played -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 fade-in"
		style="animation-delay: 50ms"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				<div
					class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary/20 flex items-center justify-center text-lg"
				>
					🏈
				</div>
				<div>
					<p class="text-xs text-base-content/70 uppercase tracking-wide">Games</p>
					<p class="text-lg font-bold">{summary.totalGamesPlayed}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Top Scorer -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 fade-in col-span-2 md:col-span-1"
		style="animation-delay: 100ms"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				<div
					class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-success/20 flex items-center justify-center text-lg"
				>
					🔥
				</div>
				<div class="min-w-0 flex-1">
					<p class="text-xs text-base-content/70 uppercase tracking-wide">Top Scorer</p>
					<p class="text-lg font-bold truncate">{summary.highestScorer.name}</p>
					<p class="text-xs text-base-content/60">{summary.highestScorer.points.toFixed(1)} pts</p>
				</div>
			</div>
		</div>
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
