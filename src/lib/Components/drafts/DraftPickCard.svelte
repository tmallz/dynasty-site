<script lang="ts">
	import type { DraftPagePicks } from '$lib/Utilities/Dtos/DraftPageDto';

	export let pick: DraftPagePicks;
	export let preDraft: boolean = true;
	export let playerImage: string = 'https://via.placeholder.com/150';
	export let ownerName: string = '';
	export let pickNumber: number;
	export let teamsCount: number;
	export let draftType: string;
	export let animationDelay: number = 0;

	// For mobile card list, we show chronological pick order (no snake reversal needed)
	// The position is simply the sequential pick within the round
	$: pickNumberForRound = ((pickNumber - 1) % teamsCount) + 1;

	// Format pick number as "1.01" style - chronological order for mobile list view
	$: formattedPickNumber = `${pick.round}.${pickNumberForRound.toString().padStart(2, '0')}`;

	// Function to determine the border color based on the player's position
	function getPositionBorderColor(position: string): string {
		switch (position) {
			case 'QB':
				return 'border-l-[#ff2a6d]';
			case 'RB':
				return 'border-l-[#00ceb8]';
			case 'WR':
				return 'border-l-[#58a7ff]';
			case 'TE':
				return 'border-l-[#ffae58]';
			default:
				return 'border-l-base-300';
		}
	}

	// Get badge color based on position
	function getBadgeColor(position: string): string {
		switch (position) {
			case 'QB':
				return 'bg-[#ff2a6d] text-white';
			case 'RB':
				return 'bg-[#00ceb8] text-white';
			case 'WR':
				return 'bg-[#58a7ff] text-white';
			case 'TE':
				return 'bg-[#ffae58] text-white';
			default:
				return 'bg-base-300 text-base-content';
		}
	}

	$: isTraded = !pick.isOriginalOwner;
</script>

<style>
	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateX(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.pick-card {
		animation: fadeSlideIn 300ms ease-out forwards;
		animation-delay: var(--animation-delay);
		opacity: 0;
	}
</style>

<div
	class="pick-card flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 p-3 border-l-4 {preDraft
		? isTraded
			? 'border-l-warning border-dashed'
			: 'border-l-primary'
		: getPositionBorderColor(pick.PlayerPosition ?? '')}"
	style="--animation-delay: {animationDelay}ms;"
>
	<!-- Pick number badge -->
	<div
		class="flex-shrink-0 rounded-md px-2 py-1 text-sm font-bold {preDraft
			? 'bg-primary text-primary-content'
			: getBadgeColor(pick.PlayerPosition ?? '')}"
	>
		{formattedPickNumber}
	</div>

	{#if preDraft}
		<!-- Pre-draft state -->
		<div class="flex flex-1 items-center gap-2">
			<span class="font-semibold text-base-content">{pick.owner}</span>
			{#if isTraded}
				<div
					class="ml-auto flex items-center gap-1 rounded-md bg-warning px-2 py-1 text-xs font-semibold text-warning-content"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-3 w-3"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
						/>
					</svg>
					<span>Traded</span>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Post-draft state -->
		<img
			src={playerImage}
			alt={pick.PlayerName}
			class="h-10 w-10 flex-shrink-0 rounded-md object-cover"
		/>
		<div class="flex flex-1 flex-col">
			<span class="font-semibold">{pick.PlayerName}</span>
			<span class="text-sm text-base-content/70">{pick.PlayerPosition} - {pick.PlayerTeam}</span>
		</div>
		{#if isTraded}
			<span class="text-xs text-base-content/60">{ownerName}</span>
		{/if}
	{/if}
</div>
