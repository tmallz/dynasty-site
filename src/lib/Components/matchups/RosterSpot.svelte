<script lang="ts">
	export let position: string;
	export let badgeClass: string;
	export let playerName: string;
	export let playerTeam: string;
	export let playerImage: string;
	export let PlayerTeamLogo: string;
</script>

<li class="flex items-center justify-between">
	<!-- Position Badge -->
	<span class={`badge ${badgeClass}`}>
		{#if position === 'WRT'}
			<span>W</span><span>R</span><span>T</span>
		{:else if position === 'WRTQ'}
			<span>W</span><span>R</span><span>T</span><span>Q</span>
		{:else}
			{position}
		{/if}
	</span>

	<!-- Player Details -->
	<div class="ml-4 flex w-full items-center space-x-2">
		<!-- Player Image -->
		<img src={playerImage} alt={playerName} class="h-10 w-10 rounded-full" />

		<!-- Team Logo -->
		<img src={PlayerTeamLogo} alt={playerTeam} class="h-6 w-6 rounded-full" />

		<!-- Player Info -->
		<div>
			<p class="font-semibold">{playerName}</p>
			<p class="text-sm text-gray-500">{playerTeam}</p>
		</div>
	</div>
</li>

<style>
	.badge {
		width: 60px; /* Fixed width */
		height: 20px; /* Fixed height */
		display: grid;
		align-items: center;
		justify-items: center;
		border-radius: 4px;
		overflow: hidden;
		font-size: 10px;
		flex-shrink: 0;
		padding: 0;
		margin: 0;
		box-sizing: border-box;
	}

	/* For standard positions */
	.bg-qb {
		background-color: #ff2a6d;
		color: white;
	}
	.bg-rb {
		background-color: #00ceb8;
		color: white;
	}
	.bg-wr {
		background-color: #58a7ff;
		color: white;
	}
	.bg-te {
		background-color: #ffae58;
		color: white;
	}

	/* For FLEX (WRT) with 3 fixed 20px columns */
	.bg-wrt {
		display: grid;
		grid-template-columns: 20px 20px 20px;
		gap: 0;
		width: 60px;
		height: 20px;
		background: linear-gradient(90deg, #58a7ff 33%, #00ceb8 33% 66%, #ffae58 66%);
		background-size: 60px 20px;
		color: white;
	}

	/* For SUPER-FLEX (WRTQ) with 4 fixed 15px columns */
	.bg-wrtq {
		display: grid;
		grid-template-columns: 15px 15px 15px 15px;
		gap: 0;
		width: 60px;
		height: 20px;
		background: linear-gradient(90deg, #58a7ff 25%, #00ceb8 25% 50%, #ffae58 50% 75%, #ff2a6d 75%);
		background-size: 60px 20px;
		color: white;
	}

	/* Remove forced sizing on each inner span and set line-height */
	.badge > span {
		display: flex;
		align-items: center;
		justify-content: center;
		/* Remove width/height so that each grid cell defines its size */
		margin: 0;
		padding: 0;
		font-size: 10px;
		line-height: 20px; /* Match cell height for vertical centering */
	}
</style>
