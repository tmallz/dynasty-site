<script lang="ts">
	import Link from '$lib/Components/resources/link.svelte';

	const today = new Date();
	const resources = [
		{
			href: `https://www.fantasypros.com/${today.getFullYear()}/${today.getMonth() + 1}/fantasy-football-rankings-dynasty-trade-value-chart-${today.toLocaleString('default', { month: 'long' }).toLowerCase()}-${today.getFullYear()}-update/`,
			text: 'FantasyPros Dynasty Trade Value Chart',
			icon: 'fas fa-chart-bar',
			paywall: false
		},
		{
			href: 'https://www.fantasypros.com/nfl/rankings/dynasty-overall.php',
			text: 'FantasyPros Dynasty Consensus Rankings',
			icon: 'fas fa-chart-bar',
			paywall: false
		},
		{
			href: 'https://www.ftnfantasy.com/',
			text: 'FTN Fantasy',
			icon: 'fas fa-chart-line',
			paywall: true
		},
		{
			href: 'https://www.thefantasyfootballers.com/',
			text: 'The Fantasy Footballers',
			icon: 'fas fa-podcast',
			paywall: true
		},
		{
			href: 'https://dynastyprocess.com/calculator',
			text: 'DynastyProcess Trade Calculator',
			icon: 'fas fa-calculator',
			paywall: false
		},
		{
			href: 'https://dynastyleaguefootball.com/',
			text: 'Dynasty League Football',
			icon: 'fas fa-chart-line',
			paywall: true
		},
		{
			href: 'https://www.reddit.com/r/DynastyFF/',
			text: 'Reddit Dynasty Fantasy Football',
			icon: 'fas fa-file-alt',
			paywall: false
		},
		{
			href: 'https://dynasty101.com/trade-calculator/',
			text: 'Dynasty 101 Trade Calculator',
			icon: 'fas fa-calculator',
			paywall: false
		},
		{
			href: 'https://gm.dynastynerds.com/',
			text: 'Dynasty Nerds GM',
			icon: 'fas fa-chart-line',
			paywall: true
		},
		{
			href: 'https://www.reddit.com/r/Fantasy_Football/',
			text: 'Reddit FF Trade Analyzer',
			icon: 'fas fa-chart-bar',
			paywall: false
		},
		{
			href: 'https://fantasycalc.com/trade-calculator',
			text: 'FantasyCalc Trade Calculator',
			icon: 'fas fa-calculator',
			paywall: false
		}
	];
</script>

<div class="mx-auto max-w-4xl p-6">
	<h1 class="mb-6 text-center text-3xl font-bold animate-fade-in">Helpful Dynasty Resources</h1>
	<div class="card bg-base-100 shadow-lg animate-fade-in-delay-1">
		<div class="card-body">
			{#each resources as resource, i}
				<Link
					href={resource.href}
					text={resource.text}
					icon={resource.icon}
					paywall={resource.paywall}
				/>
				{#if i < resources.length - 1}
					<hr class="my-1 border-base-300" />
				{/if}
			{/each}
		</div>
	</div>
	<p class="mt-4 text-center text-sm text-base-content/70 animate-fade-in-delay-2">
		*Some or all content is behind a paywall
	</p>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fadeIn 0.5s ease-out forwards;
	}

	.animate-fade-in-delay-1 {
		animation: fadeIn 0.5s ease-out 0.1s forwards;
		opacity: 0;
	}

	.animate-fade-in-delay-2 {
		animation: fadeIn 0.5s ease-out 0.2s forwards;
		opacity: 0;
	}
</style>
