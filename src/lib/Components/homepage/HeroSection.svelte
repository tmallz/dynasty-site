<script lang="ts">
	export let seasonYear: string = '';
	export let seasonType: string = '';
	export let leagueName: string = 'The League of Extraordinary Armchair GMs';
	export let animationDelay: number = 0;

	function getSeasonTypeText(type: string): string {
		switch (type) {
			case 'pre':
				return 'Preseason';
			case 'off':
				return 'Offseason';
			case 'regular':
				return 'Regular Season';
			case 'post':
				return 'Playoffs';
			default:
				return 'Season';
		}
	}

	function getSeasonBadgeClass(type: string): string {
		switch (type) {
			case 'regular':
				return 'badge-success';
			case 'post':
				return 'badge-warning';
			case 'pre':
			case 'off':
				return 'badge-info';
			default:
				return 'badge-neutral';
		}
	}
</script>

<div
	class="bg-gradient-to-br from-primary/20 via-base-200 to-secondary/20 rounded-xl p-6 md:p-12 shadow-lg fade-in"
	style="animation-delay: {animationDelay}ms"
>
	<div class="text-center space-y-4">
		<h1 class="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
			{leagueName}
		</h1>
		<p class="text-base-content/70 text-lg md:text-xl">
			Fantasy Football Dynasty League
		</p>
		{#if seasonYear || seasonType}
			<div class="flex items-center justify-center gap-2 flex-wrap">
				{#if seasonYear}
					<span class="badge badge-lg badge-outline">
						{seasonYear} NFL
					</span>
				{/if}
				{#if seasonType}
					<span class="badge badge-lg {getSeasonBadgeClass(seasonType)}">
						{getSeasonTypeText(seasonType)}
					</span>
				{/if}
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
