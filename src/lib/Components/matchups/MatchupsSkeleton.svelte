<script lang="ts">
	// Skeleton loading component for matchups page
</script>

<div class="animate-pulse">
	<!-- Summary Stats Skeleton -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
		{#each Array(4) as _, i}
			<div
				class="card bg-base-200 shadow-md"
				style="animation-delay: {i * 50}ms"
			>
				<div class="card-body p-3 md:p-4">
					<div class="flex items-center gap-2 md:gap-3">
						<div class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-base-300"></div>
						<div class="flex-1">
							<div class="h-3 bg-base-300 rounded w-16 mb-2"></div>
							<div class="h-6 bg-base-300 rounded w-12"></div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Week Selector and Filter Tabs Skeleton -->
	<div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 md:mb-8">
		<!-- Week Selector Skeleton -->
		<div class="h-10 w-40 bg-base-300 rounded-lg"></div>

		<!-- Filter Tabs Skeleton -->
		<div class="join">
			<div class="join-item btn btn-ghost w-24 h-10 bg-base-300"></div>
			<div class="join-item btn btn-ghost w-28 h-10 bg-base-300"></div>
			<div class="join-item btn btn-ghost w-32 h-10 bg-base-300"></div>
		</div>
	</div>

	<!-- Matchup Cards Skeleton -->
	<div class="space-y-4 md:space-y-6">
		{#each Array(5) as _, i}
			<div
				class="card bg-base-200 border-y md:border md:rounded-lg border-base-content/10"
				style="animation-delay: {150 + i * 100}ms"
			>
				<div class="card-body p-4 md:p-6">
					<!-- Header Skeleton -->
					<div class="text-center mb-6">
						<div class="h-6 bg-base-300 rounded w-64 mx-auto"></div>
					</div>

					<!-- Score Display Skeleton -->
					<div class="flex items-center justify-center gap-4 md:gap-8 mb-6">
						<!-- Team 1 -->
						<div class="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
							<div class="w-16 md:w-20 h-16 md:h-20 rounded-full bg-base-300"></div>
							<div class="text-center">
								<div class="h-4 bg-base-300 rounded w-24 mb-2"></div>
								<div class="h-10 bg-base-300 rounded w-20"></div>
							</div>
						</div>

						<!-- VS Divider -->
						<div class="flex flex-col items-center gap-1">
							<div class="h-6 bg-base-300 rounded w-8"></div>
							<div class="h-px w-12 bg-base-300"></div>
							<div class="h-4 bg-base-300 rounded w-12"></div>
						</div>

						<!-- Team 2 -->
						<div class="flex flex-col items-center gap-2 flex-1 max-w-[200px]">
							<div class="w-16 md:w-20 h-16 md:h-20 rounded-full bg-base-300"></div>
							<div class="text-center">
								<div class="h-4 bg-base-300 rounded w-24 mb-2"></div>
								<div class="h-10 bg-base-300 rounded w-20"></div>
							</div>
						</div>
					</div>

					<!-- Quick Stats Bar Skeleton -->
					<div class="bg-base-100 rounded-lg p-4 mb-4">
						<div class="flex items-center gap-2 mb-3">
							<div class="w-6 h-6 bg-base-300 rounded"></div>
							<div class="h-4 bg-base-300 rounded w-24"></div>
						</div>
						<div class="space-y-2">
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 bg-base-300 rounded"></div>
								<div class="h-4 bg-base-300 rounded w-48"></div>
							</div>
							<div class="flex items-center gap-2">
								<div class="w-4 h-4 bg-base-300 rounded"></div>
								<div class="h-4 bg-base-300 rounded w-56"></div>
							</div>
						</div>
					</div>

					<!-- Action Buttons Skeleton -->
					<div class="flex gap-2 justify-center">
						<div class="h-8 bg-base-300 rounded w-36"></div>
						<div class="h-8 bg-base-300 rounded w-28"></div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
