<script lang="ts">
	// Skeleton loading component for homepage matching final layout
</script>

<div class="animate-pulse">
	<!-- Hero Section Skeleton -->
	<div
		class="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-6 md:p-12 mb-6 md:mb-8"
		style="animation-delay: 0ms"
	>
		<div class="text-center space-y-4">
			<div class="h-10 md:h-14 bg-base-300 rounded w-3/4 mx-auto"></div>
			<div class="h-5 bg-base-300 rounded w-1/2 mx-auto"></div>
			<div class="h-8 bg-base-300 rounded-full w-32 mx-auto"></div>
		</div>
	</div>

	<!-- Two Column Layout -->
	<div class="flex flex-col lg:flex-row gap-4 md:gap-6">
		<!-- Main Column -->
		<div class="flex-[2] space-y-4 md:space-y-6">
			<!-- Standings Preview Skeleton -->
			<div
				class="card bg-base-200 shadow-lg"
				style="animation-delay: 100ms"
			>
				<div class="card-body p-4 md:p-6">
					<div class="flex items-center justify-between mb-4">
						<div class="h-6 bg-base-300 rounded w-40"></div>
						<div class="h-4 bg-base-300 rounded w-28"></div>
					</div>
					<!-- Standings Rows -->
					{#each Array(5) as _, i}
						<div
							class="flex items-center gap-3 py-3 border-b border-base-content/5 last:border-b-0"
							style="animation-delay: {100 + i * 30}ms"
						>
							<div class="w-7 h-7 bg-base-300 rounded-full"></div>
							<div class="w-8 h-8 bg-base-300 rounded-full"></div>
							<div class="flex-1 space-y-1">
								<div class="h-4 bg-base-300 rounded w-32"></div>
							</div>
							<div class="h-4 bg-base-300 rounded w-16 hidden md:block"></div>
							<div class="h-4 bg-base-300 rounded w-12"></div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Matchups Preview Skeleton -->
			<div
				class="card bg-base-200 shadow-lg"
				style="animation-delay: 200ms"
			>
				<div class="card-body p-4 md:p-6">
					<div class="flex items-center justify-between mb-4">
						<div class="h-6 bg-base-300 rounded w-44"></div>
						<div class="h-4 bg-base-300 rounded w-32"></div>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						{#each Array(5) as _, i}
							<div
								class="bg-base-100 rounded-lg p-3"
								style="animation-delay: {200 + i * 30}ms"
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<div class="w-8 h-8 bg-base-300 rounded-full"></div>
										<div class="h-4 bg-base-300 rounded w-20"></div>
									</div>
									<div class="h-5 bg-base-300 rounded w-10"></div>
								</div>
								<div class="text-center my-2">
									<div class="h-3 bg-base-300 rounded w-8 mx-auto"></div>
								</div>
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<div class="w-8 h-8 bg-base-300 rounded-full"></div>
										<div class="h-4 bg-base-300 rounded w-20"></div>
									</div>
									<div class="h-5 bg-base-300 rounded w-10"></div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Champion Card Skeleton - Mobile Only -->
			<div
				class="card bg-base-200 shadow-lg lg:hidden"
				style="animation-delay: 250ms"
			>
				<div class="card-body p-6 text-center">
					<div class="h-4 bg-base-300 rounded w-32 mx-auto mb-4"></div>
					<div class="w-16 h-16 bg-base-300 rounded-full mx-auto mb-4"></div>
					<div class="h-6 bg-base-300 rounded w-36 mx-auto mb-2"></div>
					<div class="h-16 bg-base-300 rounded w-16 mx-auto"></div>
				</div>
			</div>

			<!-- Trending Players Skeleton -->
			<div
				class="card bg-base-200 shadow-lg"
				style="animation-delay: 300ms"
			>
				<div class="card-body p-4 md:p-6">
					<div class="h-6 bg-base-300 rounded w-56 mb-4"></div>
					<div class="space-y-3">
						{#each Array(5) as _, i}
							<div
								class="bg-base-300 rounded-lg p-4"
								style="animation-delay: {300 + i * 30}ms"
							>
								<div class="flex items-center gap-4">
									<div class="w-14 h-14 bg-base-100 rounded-full"></div>
									<div class="flex-1 space-y-2">
										<div class="h-4 bg-base-100 rounded w-32"></div>
										<div class="h-3 bg-base-100 rounded w-20"></div>
									</div>
									<div class="w-8 h-8 bg-base-100 rounded"></div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="flex-[1] space-y-4 md:space-y-6">
			<!-- Champion Card Skeleton - Desktop Only -->
			<div
				class="card bg-base-200 shadow-lg hidden lg:block"
				style="animation-delay: 100ms"
			>
				<div class="card-body p-6 text-center">
					<div class="h-4 bg-base-300 rounded w-32 mx-auto mb-4"></div>
					<div class="w-16 h-16 bg-base-300 rounded-full mx-auto mb-4"></div>
					<div class="h-6 bg-base-300 rounded w-36 mx-auto mb-2"></div>
					<div class="h-16 bg-base-300 rounded w-16 mx-auto"></div>
				</div>
			</div>

			<!-- Recent Trades Skeleton -->
			<div
				class="card bg-base-200 shadow-lg"
				style="animation-delay: 200ms"
			>
				<div class="card-body p-4 md:p-6">
					<div class="h-6 bg-base-300 rounded w-32 mb-4"></div>
					{#each Array(3) as _, i}
						<div
							class="bg-base-300 rounded-lg p-3 mb-3 last:mb-0"
							style="animation-delay: {200 + i * 30}ms"
						>
							<div class="flex items-center gap-2 mb-2">
								<div class="w-6 h-6 bg-base-100 rounded-full"></div>
								<div class="h-4 bg-base-100 rounded w-20"></div>
							</div>
							<div class="h-3 bg-base-100 rounded w-full"></div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Recent Waivers Skeleton -->
			<div
				class="card bg-base-200 shadow-lg"
				style="animation-delay: 250ms"
			>
				<div class="card-body p-4 md:p-6">
					<div class="h-6 bg-base-300 rounded w-36 mb-4"></div>
					{#each Array(3) as _, i}
						<div
							class="bg-base-300 rounded-lg p-3 mb-3 last:mb-0"
							style="animation-delay: {250 + i * 30}ms"
						>
							<div class="flex items-center gap-2 mb-2">
								<div class="w-6 h-6 bg-base-100 rounded-full"></div>
								<div class="h-4 bg-base-100 rounded w-24"></div>
							</div>
							<div class="h-3 bg-base-100 rounded w-full"></div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
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
