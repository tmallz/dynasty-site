<script lang="ts">
	import type { DraftPagePicks } from '$lib/Utilities/Dtos/DraftPageDto';

	/*
      When in pre-draft mode, the cell shows a placeholder draft pick.
      When in post-draft mode, the cell displays the picked player details.
    */
	export let pick: DraftPagePicks;
	export let preDraft: boolean = true;
	export let playerImage: string = 'https://via.placeholder.com/150';
	export let ownerName: string = '';
	export let pickNumber: number;
	export let teamsCount: number;
	export let draftType: string;
	export let animationDelay: number = 0;

	// Reactive statement to calculate the pick number for the round
	$: pickNumberForRound = (() => {
		if (draftType === 'snake') {
			const round = Math.ceil(pickNumber / teamsCount);
			const positionInRound = pickNumber % teamsCount === 0 ? teamsCount : pickNumber % teamsCount;
			return round % 2 === 0 ? teamsCount - positionInRound + 1 : positionInRound;
		} else {
			return pickNumber % teamsCount === 0 ? teamsCount : pickNumber % teamsCount;
		}
	})();

	// Format pick number as "1.01" style
	$: formattedPickNumber = preDraft
		? `${pick.round}.${pickNumberForRound.toString().padStart(2, '0')}`
		: `${pick.round}.${pick.pickNumber?.toString().padStart(2, '0') ?? pickNumberForRound.toString().padStart(2, '0')}`;

	// Function to determine the background color based on the player's position
	function getPositionColor(position: string): string {
		switch (position) {
			case 'QB':
				return 'bg-[#ff2a6d]';
			case 'RB':
				return 'bg-[#00ceb8]';
			case 'WR':
				return 'bg-[#58a7ff]';
			case 'TE':
				return 'bg-[#ffae58]';
			default:
				return 'bg-base-200';
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
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.draft-cell {
		animation: fadeSlideIn 300ms ease-out forwards;
		animation-delay: var(--animation-delay);
		opacity: 0;
	}
</style>

<div
	class="draft-cell relative rounded-lg border p-4 pt-6 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg {preDraft
		? isTraded
			? 'border-dashed border-2 border-warning bg-base-300'
			: 'bg-base-100'
		: getPositionColor(pick.PlayerPosition ?? '')}"
	style="min-height: 150px; --animation-delay: {animationDelay}ms;"
>
	<!-- Pick number badge - positioned outside -->
	<div
		class="absolute -top-2 -left-2 z-10 rounded-md px-2 py-1 text-xs font-bold shadow-sm {preDraft
			? 'bg-primary text-primary-content'
			: getBadgeColor(pick.PlayerPosition ?? '')}"
	>
		{formattedPickNumber}
	</div>

	<!-- Traded indicator badge -->
	{#if isTraded}
		<div
			class="absolute -top-2 -right-2 z-10 flex items-center gap-1 rounded-md bg-warning px-2 py-1 text-xs font-semibold text-warning-content shadow-sm"
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

	{#if preDraft}
		{#if isTraded}
			<!-- Pre-draft state with traded pick -->
			<div class="mt-4 flex flex-col items-center justify-center">
				<div
					class="mb-1 overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-base-content"
				>
					{pick.owner}
				</div>
				<div class="text-xs text-base-content/60">Acquired pick</div>
			</div>
		{:else}
			<!-- Pre-draft state - original owner (empty cell) -->
			<div class="mt-4 flex items-center justify-center opacity-30">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			</div>
		{/if}
	{:else}
		<!-- Post-draft state -->
		<div class="mt-4 flex flex-col items-center">
			<img src={playerImage} alt={pick.PlayerName} class="mb-2 h-12 w-12 rounded-md object-cover" />
			<div class="text-xs font-bold sm:text-sm">{pick.PlayerName}</div>
			<div class="text-xs sm:text-sm">{pick.PlayerPosition} - {pick.PlayerTeam}</div>
			{#if isTraded}
				<div class="mt-1 text-xs opacity-70">{ownerName}</div>
			{/if}
		</div>
	{/if}
</div>
