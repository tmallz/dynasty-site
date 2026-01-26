<script lang="ts">
	export let position: string;
	export let badgeClass: string;
	export let playerName: string;
	export let playerTeam: string;
	export let playerImage: string;
	export let PlayerTeamLogo: string;
	export let playerPoints: number | undefined = undefined;

	// Fallback placeholder SVG for player images
	const playerFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

	// Fallback for team logos
	const teamFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E";

	let playerImageError = false;
	let teamLogoError = false;

	function handlePlayerImageError() {
		playerImageError = true;
	}

	function handleTeamLogoError() {
		teamLogoError = true;
	}

	$: playerImageSrc = playerImageError || !playerImage ? playerFallback : playerImage;
	$: teamLogoSrc = teamLogoError || !PlayerTeamLogo ? teamFallback : PlayerTeamLogo;
</script>

<li class="flex items-center justify-between rounded-lg bg-base-200 p-2 md:p-3 transition-all duration-150 hover:bg-base-300 hover:shadow-lg hover:-translate-y-0.5">
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
		<img
			src={playerImageSrc}
			alt={playerName}
			class="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover shadow-sm flex-shrink-0 bg-base-300"
			loading="lazy"
			on:error={handlePlayerImageError}
		/>

		<!-- Team Logo -->
		<img
			src={teamLogoSrc}
			alt={playerTeam}
			class="h-5 w-5 md:h-7 md:w-7 rounded-md object-cover flex-shrink-0 bg-base-300"
			loading="lazy"
			on:error={handleTeamLogoError}
		/>

		<!-- Player Info -->
		<div class="flex-1 min-w-0">
			<p class="font-semibold text-sm md:text-base truncate">{playerName}</p>
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
		width: 50px;
		height: 28px;
		display: grid;
		align-items: center;
		justify-items: center;
		border-radius: 4px;
		overflow: hidden;
		font-size: 13px;
		flex-shrink: 0;
		padding: 0;
		margin: 0;
		box-sizing: border-box;
	}

	@media (min-width: 768px) {
		.badge {
			width: 60px;
			height: 30px;
			font-size: 15px;
		}
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
		grid-template-columns: 16px 16px 16px;
		gap: 0;
		width: 50px;
		height: 28px;
		background: linear-gradient(90deg, #58a7ff 33%, #00ceb8 33% 66%, #ffae58 66%);
		background-size: 50px 28px;
		color: white;
	}

	@media (min-width: 768px) {
		.bg-wrt {
			grid-template-columns: 20px 20px 20px;
			width: 60px;
			height: 30px;
			background-size: 60px 30px;
		}
	}

	.bg-wrtq {
		display: grid;
		grid-template-columns: 12px 12px 12px 12px;
		gap: 0;
		width: 50px;
		height: 28px;
		background: linear-gradient(90deg, #58a7ff 25%, #00ceb8 25% 50%, #ffae58 50% 75%, #ff2a6d 75%);
		background-size: 50px 28px;
		color: white;
	}

	@media (min-width: 768px) {
		.bg-wrtq {
			grid-template-columns: 15px 15px 15px 15px;
			width: 60px;
			height: 30px;
			background-size: 60px 30px;
		}
	}

	.badge > span {
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		padding: 0;
		font-size: 11px;
		line-height: 28px;
	}

	@media (min-width: 768px) {
		.badge > span {
			font-size: 12px;
			line-height: 30px;
		}
	}
</style>
