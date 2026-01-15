<script lang="ts">
	export let position: string;
	export let badgeClass: string;
	export let playerName: string;
	export let playerTeam: string;
	export let playerImage: string;
	export let PlayerTeamLogo: string;
	export let playerPoints: number | undefined = undefined;
</script>

<li class="flex items-center justify-between rounded-lg bg-base-200 p-2 md:p-3 transition-all duration-200 hover:bg-base-300 hover:shadow-md">
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
	<div class="ml-2 md:ml-4 flex w-full items-center space-x-2 md:space-x-3 min-w-0">
		<!-- Player Image -->
		<img src={playerImage} alt={playerName} class="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover shadow-sm flex-shrink-0" />

		<!-- Team Logo -->
		<img src={PlayerTeamLogo} alt={playerTeam} class="h-5 w-5 md:h-7 md:w-7 rounded-md object-cover flex-shrink-0" />

		<!-- Player Info -->
		<div class="flex-1 min-w-0">
			<p class="font-semibold text-sm md:text-base">{playerName}</p>
			<p class="text-xs md:text-sm text-base-content/60">{playerTeam}</p>
		</div>
		
		<!-- Player Points -->
		{#if playerPoints !== undefined}
			<div class="text-right flex-shrink-0 min-w-[3rem]">
				<p class="font-bold text-sm md:text-base">{playerPoints.toFixed(2)}</p>
				<p class="text-xs text-base-content/60">pts</p>
			</div>
		{/if}
	</div>
</li>

<style>
	.badge {
		width: 60px;
		height: 30px;
		display: grid;
		align-items: center;
		justify-items: center;
		border-radius: 4px;
		overflow: hidden;
		font-size: 15px;
		flex-shrink: 0;
		padding: 0;
		margin: 0;
		box-sizing: border-box;
	}

	/* Position Badges match sleeper colors */
	.bg-wr {
		background-color: #58a7ff;
		color: white;
	}
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

	.bg-wrt {
		display: grid;
		grid-template-columns: 20px 20px 20px;
		gap: 0;
		width: 60px;
		height: 30px;
		background: linear-gradient(90deg, #58a7ff 33%, #00ceb8 33% 66%, #ffae58 66%);
		background-size: 60px 30px;
		color: white;
	}

	.bg-wrtq {
		display: grid;
		grid-template-columns: 15px 15px 15px 15px;
		gap: 0;
		width: 60px;
		height: 30px;
		background: linear-gradient(90deg, #58a7ff 25%, #00ceb8 25% 50%, #ffae58 50% 75%, #ff2a6d 75%);
		background-size: 60px 30px;
		color: white;
	}

	.badge > span {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		padding: 0;
		font-size: 12px;
		line-height: 30px;
	}
</style>
