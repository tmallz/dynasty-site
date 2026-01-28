<script lang="ts">
	// Skeleton loading component for standings page
</script>

<div class="animate-pulse">
	<!-- Summary Stats Skeleton -->
	<div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
		{#each Array(3) as _, i}
			<div class="card bg-base-200 shadow-md" style="animation-delay: {i * 50}ms">
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

	<!-- Table Skeleton -->
	<div class="card bg-base-200 shadow-lg">
		<div class="overflow-x-auto">
			<table class="table">
				<!-- Header -->
				<thead>
					<tr>
						<th><div class="h-4 bg-base-300 rounded w-8"></div></th>
						<th><div class="h-4 bg-base-300 rounded w-16"></div></th>
						<th><div class="h-4 bg-base-300 rounded w-6"></div></th>
						<th><div class="h-4 bg-base-300 rounded w-6"></div></th>
						<th class="hidden md:table-cell"><div class="h-4 bg-base-300 rounded w-6"></div></th>
						<th><div class="h-4 bg-base-300 rounded w-12"></div></th>
						<th class="hidden md:table-cell"><div class="h-4 bg-base-300 rounded w-12"></div></th>
						<th class="hidden md:table-cell"><div class="h-4 bg-base-300 rounded w-10"></div></th>
					</tr>
				</thead>
				<tbody>
					{#each Array(10) as _, i}
						<tr style="animation-delay: {100 + i * 30}ms">
							<!-- Rank -->
							<td>
								<div class="w-7 h-7 bg-base-300 rounded-full"></div>
							</td>
							<!-- Team -->
							<td>
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 bg-base-300 rounded-full"></div>
									<div class="h-4 bg-base-300 rounded w-24"></div>
								</div>
							</td>
							<!-- W -->
							<td><div class="h-4 bg-base-300 rounded w-6"></div></td>
							<!-- L -->
							<td><div class="h-4 bg-base-300 rounded w-6"></div></td>
							<!-- T -->
							<td class="hidden md:table-cell"><div class="h-4 bg-base-300 rounded w-6"></div></td>
							<!-- PF -->
							<td><div class="h-4 bg-base-300 rounded w-14"></div></td>
							<!-- PA -->
							<td class="hidden md:table-cell"><div class="h-4 bg-base-300 rounded w-14"></div></td>
							<!-- +/- -->
							<td class="hidden md:table-cell"><div class="h-4 bg-base-300 rounded w-12"></div></td>
						</tr>
					{/each}
				</tbody>
			</table>
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
