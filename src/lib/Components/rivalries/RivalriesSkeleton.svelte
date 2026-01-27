<script lang="ts">
	export let animationDelay: number = 0;
</script>

<div
	class="animate-fade-in"
	style="animation-delay: {animationDelay}ms"
>
	<!-- Team Selection Hero Section Skeleton -->
	<div class="card bg-base-100 shadow-xl mb-8" style="animation-delay: 0ms">
		<div class="card-body p-4 md:p-6">
			<div class="skeleton h-8 w-64 mx-auto mb-6"></div>

			<div class="flex flex-col lg:flex-row items-center justify-center gap-6">
				<!-- Team 1 Selection Skeleton -->
				<div class="flex flex-col items-center gap-3 w-full lg:w-auto">
					<div class="skeleton w-12 h-12 md:w-16 md:h-16 rounded-full"></div>
					<div class="skeleton h-12 w-full max-w-xs"></div>
				</div>

				<!-- VS Divider -->
				<div class="skeleton h-10 w-10 rounded-full hidden lg:block"></div>
				<div class="skeleton h-8 w-8 rounded-full lg:hidden"></div>

				<!-- Team 2 Selection Skeleton -->
				<div class="flex flex-col items-center gap-3 w-full lg:w-auto">
					<div class="skeleton w-12 h-12 md:w-16 md:h-16 rounded-full"></div>
					<div class="skeleton h-12 w-full max-w-xs"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Matchup Card Skeleton -->
	<div
		class="card bg-base-100 shadow-xl mb-8 animate-fade-in"
		style="animation-delay: 50ms"
	>
		<div class="card-body p-4 md:p-6">
			<div class="skeleton h-6 w-48 mb-4"></div>
			<div class="flex items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="skeleton w-10 h-10 rounded-full"></div>
					<div class="skeleton h-8 w-16"></div>
				</div>
				<div class="skeleton h-6 w-20"></div>
				<div class="flex items-center gap-3">
					<div class="skeleton h-8 w-16"></div>
					<div class="skeleton w-10 h-10 rounded-full"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Head-to-Head Record Skeleton -->
	<div
		class="card bg-gradient-to-br from-base-200 to-base-300 shadow-2xl mb-8 animate-fade-in"
		style="animation-delay: 100ms"
	>
		<div class="card-body items-center text-center p-4 md:p-6">
			<div class="skeleton h-8 w-56 mb-4"></div>
			<div class="flex items-center justify-center gap-8 flex-wrap">
				<div class="text-center">
					<div class="skeleton w-16 h-16 rounded-full mb-2 mx-auto"></div>
					<div class="skeleton h-4 w-24 mb-2 mx-auto"></div>
					<div class="skeleton h-16 w-16 mx-auto"></div>
				</div>
				<div class="skeleton h-12 w-4"></div>
				<div class="text-center">
					<div class="skeleton w-16 h-16 rounded-full mb-2 mx-auto"></div>
					<div class="skeleton h-4 w-24 mb-2 mx-auto"></div>
					<div class="skeleton h-16 w-16 mx-auto"></div>
				</div>
			</div>
			<div class="divider">
				<div class="skeleton h-4 w-28"></div>
			</div>
			<div class="flex gap-8 mt-4 justify-center">
				<div class="text-center">
					<div class="skeleton h-3 w-16 mb-1 mx-auto"></div>
					<div class="skeleton h-6 w-20 mx-auto"></div>
				</div>
				<div class="text-center">
					<div class="skeleton h-3 w-16 mb-1 mx-auto"></div>
					<div class="skeleton h-6 w-20 mx-auto"></div>
				</div>
			</div>
		</div>
	</div>

	<!-- Season Breakdown Skeleton -->
	<div
		class="card bg-base-100 shadow-xl mb-8 animate-fade-in"
		style="animation-delay: 200ms"
	>
		<div class="card-body p-4 md:p-6">
			<div class="skeleton h-7 w-64 mb-4"></div>
			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th><div class="skeleton h-4 w-16"></div></th>
							<th class="text-center"><div class="skeleton h-4 w-20 mx-auto"></div></th>
							<th class="text-center"><div class="skeleton h-4 w-20 mx-auto"></div></th>
						</tr>
					</thead>
					<tbody>
						{#each Array(5) as _, i}
							<tr>
								<td><div class="skeleton h-4 w-12"></div></td>
								<td class="text-center"><div class="skeleton h-6 w-8 mx-auto rounded"></div></td>
								<td class="text-center"><div class="skeleton h-6 w-8 mx-auto rounded"></div></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<!-- Stats Grid Skeleton -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
		{#each [300, 350, 400] as delay, i}
			<div
				class="card bg-base-100 shadow-xl animate-fade-in"
				style="animation-delay: {delay}ms"
			>
				<div class="card-body p-4 md:p-6">
					<div class="skeleton h-6 w-40 mb-4"></div>
					<div class="divider my-1"></div>
					<div class="space-y-4">
						<div>
							<div class="flex items-center gap-2 mb-2">
								<div class="skeleton w-8 h-8 rounded-full"></div>
								<div class="skeleton h-4 w-24"></div>
							</div>
							<div class="skeleton h-20 w-full rounded-lg"></div>
						</div>
						<div>
							<div class="flex items-center gap-2 mb-2">
								<div class="skeleton w-8 h-8 rounded-full"></div>
								<div class="skeleton h-4 w-24"></div>
							</div>
							<div class="skeleton h-20 w-full rounded-lg"></div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Chart Skeleton -->
	<div
		class="card bg-base-100 shadow-xl mt-8 animate-fade-in"
		style="animation-delay: 450ms"
	>
		<div class="card-body p-4 md:p-6">
			<div class="skeleton h-7 w-72 mb-4"></div>
			<div class="skeleton h-80 w-full rounded-lg"></div>
			<div class="flex justify-center gap-6 mt-4">
				<div class="skeleton h-20 w-32 rounded-lg"></div>
				<div class="skeleton h-20 w-32 rounded-lg"></div>
				<div class="skeleton h-20 w-32 rounded-lg"></div>
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

	.animate-fade-in {
		animation: fade-in 400ms ease-out forwards;
		opacity: 0;
	}
</style>
