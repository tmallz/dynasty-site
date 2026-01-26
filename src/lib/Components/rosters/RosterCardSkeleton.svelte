<script lang="ts">
	export let animationDelay: number = 0;
</script>

<div
	class="bg-base-100 rounded-xl p-6 shadow-xl animate-fade-in"
	style="animation-delay: {animationDelay}ms"
>
	<!-- Team Header Skeleton -->
	<div class="mb-6 flex items-center gap-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent p-4">
		<div class="skeleton h-16 w-16 rounded-full"></div>
		<div class="skeleton h-7 w-40"></div>
	</div>

	<!-- Starters Label Skeleton -->
	<div class="skeleton h-4 w-16 mb-3"></div>

	<!-- Starter Roster Spots Skeleton -->
	<ul class="space-y-3">
		{#each Array(10) as _, i}
			<li class="flex items-center rounded-lg bg-base-200 p-2 md:p-3">
				<!-- Position Badge -->
				<div class="skeleton h-[30px] w-[50px] md:w-[60px] rounded"></div>

				<!-- Player Details -->
				<div class="ml-2 md:ml-4 flex w-full items-center space-x-2 md:space-x-3">
					<!-- Player Image -->
					<div class="skeleton h-10 w-10 md:h-12 md:w-12 rounded-lg flex-shrink-0"></div>

					<!-- Team Logo -->
					<div class="skeleton h-5 w-5 md:h-7 md:w-7 rounded-md flex-shrink-0"></div>

					<!-- Player Info -->
					<div class="flex-1 space-y-1">
						<div class="skeleton h-4 w-28 md:w-36"></div>
						<div class="skeleton h-3 w-16"></div>
					</div>
				</div>
			</li>
		{/each}
	</ul>

	<!-- Divider -->
	<div class="my-6 border-t border-base-content/10"></div>

	<!-- Bench Button Skeleton -->
	<div class="skeleton h-12 w-full rounded-lg"></div>
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
