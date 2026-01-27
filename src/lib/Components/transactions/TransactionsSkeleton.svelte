<script lang="ts">
	// Skeleton loading component for transactions page
</script>

<div class="animate-pulse">
	<!-- Summary Stats Skeleton -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
		{#each Array(4) as _, i}
			<div
				class="card bg-base-200 shadow-md"
				style="animation-delay: {i * 50}ms"
			>
				<div class="card-body p-4">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-full bg-base-300"></div>
						<div class="flex-1">
							<div class="h-3 bg-base-300 rounded w-16 mb-2"></div>
							<div class="h-6 bg-base-300 rounded w-12"></div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Filter Tabs Skeleton -->
	<div class="flex justify-center mb-6 md:mb-8">
		<div class="join">
			<div class="join-item btn btn-ghost w-20 h-10 bg-base-300"></div>
			<div class="join-item btn btn-ghost w-20 h-10 bg-base-300"></div>
			<div class="join-item btn btn-ghost w-28 h-10 bg-base-300"></div>
		</div>
	</div>

	<!-- Week Header Skeleton -->
	<div class="mb-4">
		<div class="h-6 bg-base-300 rounded w-32"></div>
	</div>

	<!-- Transaction Cards Skeleton -->
	<div class="space-y-4 md:space-y-6">
		{#each Array(5) as _, i}
			{@const isTradeType = i % 3 === 0}
			<div
				class="card bg-base-200 shadow-xl"
				style="animation-delay: {150 + i * 50}ms"
			>
				<div class="card-body p-4 md:p-6">
					<!-- Header -->
					<div class="flex items-center justify-between mb-4">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-full bg-base-300"></div>
							<div>
								<div class="h-5 bg-base-300 rounded w-24 mb-2"></div>
								<div class="flex gap-2">
									<div class="h-4 bg-base-300 rounded w-16"></div>
									<div class="h-4 bg-base-300 rounded w-14"></div>
								</div>
							</div>
						</div>
						<div class="h-4 bg-base-300 rounded w-20"></div>
					</div>

					{#if isTradeType}
						<!-- Trade Layout -->
						<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
							<!-- Left side -->
							<div class="flex-1 space-y-3">
								{#each Array(2) as _}
									<div class="flex items-center gap-3 p-3 rounded-lg bg-base-300">
										<div class="w-12 h-12 rounded-full bg-base-100"></div>
										<div class="flex-1">
											<div class="h-4 bg-base-100 rounded w-28 mb-2"></div>
											<div class="h-3 bg-base-100 rounded w-20"></div>
										</div>
									</div>
								{/each}
							</div>
							<!-- Swap Icon -->
							<div class="flex items-center justify-center px-4">
								<div class="w-8 h-8 rounded bg-base-300"></div>
							</div>
							<!-- Right side -->
							<div class="flex-1 space-y-3">
								{#each Array(2) as _}
									<div class="flex items-center gap-3 p-3 rounded-lg bg-base-300">
										<div class="w-12 h-12 rounded-full bg-base-100"></div>
										<div class="flex-1">
											<div class="h-4 bg-base-100 rounded w-28 mb-2"></div>
											<div class="h-3 bg-base-100 rounded w-20"></div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<!-- Waiver Layout -->
						<div class="grid md:grid-cols-2 gap-4 md:gap-6">
							<!-- Adds Section -->
							<div>
								<div class="flex items-center gap-2 mb-3">
									<div class="w-6 h-6 bg-base-300 rounded"></div>
									<div class="h-5 bg-base-300 rounded w-16"></div>
								</div>
								<div class="flex items-center gap-3 p-3 rounded-lg bg-base-300">
									<div class="w-12 h-12 rounded-full bg-base-100"></div>
									<div class="flex-1">
										<div class="h-4 bg-base-100 rounded w-28 mb-2"></div>
										<div class="h-3 bg-base-100 rounded w-20"></div>
									</div>
								</div>
							</div>
							<!-- Drops Section -->
							<div>
								<div class="flex items-center gap-2 mb-3">
									<div class="w-6 h-6 bg-base-300 rounded"></div>
									<div class="h-5 bg-base-300 rounded w-20"></div>
								</div>
								<div class="flex items-center gap-3 p-3 rounded-lg bg-base-300">
									<div class="w-12 h-12 rounded-full bg-base-100"></div>
									<div class="flex-1">
										<div class="h-4 bg-base-100 rounded w-28 mb-2"></div>
										<div class="h-3 bg-base-100 rounded w-20"></div>
									</div>
								</div>
							</div>
						</div>
					{/if}
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
