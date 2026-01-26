<script lang="ts">
	export let animationDelay: number = 0;
</script>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.skeleton-cell {
		animation: fadeIn 200ms ease-out forwards;
		animation-delay: var(--animation-delay);
		opacity: 0;
	}
</style>

<div
	class="skeleton-cell relative rounded-lg border border-base-300 bg-base-100 p-4 pt-6"
	style="min-height: 150px; --animation-delay: {animationDelay}ms;"
>
	<!-- Pick number badge skeleton -->
	<div class="skeleton absolute -top-2 -left-2 z-10 h-6 w-10 rounded-md"></div>

	<!-- Content skeleton -->
	<div class="mt-4 flex flex-col items-center">
		<!-- Image placeholder -->
		<div class="skeleton mb-2 h-12 w-12 rounded-md"></div>
		<!-- Name placeholder -->
		<div class="skeleton mb-1 h-4 w-20"></div>
		<!-- Position/team placeholder -->
		<div class="skeleton h-3 w-16"></div>
	</div>
</div>
