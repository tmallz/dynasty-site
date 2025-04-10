<script lang="ts">
	import type { DraftPagePicks } from '$lib/Utilities/Dtos/DraftPageDto';

	/* 
      When in pre-draft mode, the cell shows a placeholder draft pick.
      When in post-draft mode, the cell displays the picked player details.
    */
	export let pick: DraftPagePicks;
	export let preDraft: boolean = true;
	// New prop for the player's picture URL
	export let playerImage: string = 'https://via.placeholder.com/150';
	export let ownerName: string = '';
	export let pickNumber: number;
	export let teamsCount: number;
	export let draftType: string;

	// Reactive statement to calculate the pick number for the round
	$: pickNumberForRound = (() => {
		if (draftType === 'snake') {
			const round = Math.ceil(pickNumber / teamsCount); // Determine the current round
			const positionInRound = pickNumber % teamsCount === 0 ? teamsCount : pickNumber % teamsCount;

			// Reverse the order for even rounds
			return round % 2 === 0 ? teamsCount - positionInRound + 1 : positionInRound;
		} else {
			// Linear draft logic
			return pickNumber % teamsCount === 0 ? teamsCount : pickNumber % teamsCount;
		}
	})();

	// Function to determine the background color based on the player's position
	function getPositionColor(position: string): string {
		switch (position) {
			case 'QB':
				return 'bg-[#ff2a6d]'; // QB color
			case 'RB':
				return 'bg-[#00ceb8]'; // RB color
			case 'WR':
				return 'bg-[#58a7ff]'; // WR color
			case 'TE':
				return 'bg-[#ffae58]'; // TE color
			default:
				return 'bg-white'; // Default background color
		}
	}
</script>

<div
	class="relative rounded-lg border p-4 text-center {preDraft
		? !pick.isOriginalOwner
			? 'bg-base-300'
			: 'bg-base'
		: getPositionColor(pick.PlayerPosition ?? '')} {preDraft ? 'pre-draft' : ''}"
	style="min-height: 150px;"
>
	<!-- Top-left container for pick number and (if present) owner name -->
	<div
		class="absolute top-2 left-2 flex flex-col items-start space-y-1 md:flex-row md:items-center md:space-y-0 md:space-x-1"
	>
		<!-- Pick number -->
		<div class="rounded-full px-2 py-1 text-xs md:px-1 md:text-sm">
			{#if preDraft}
				{pick.round}-{pickNumberForRound}
			{:else}
				{pick.round}-{pick.pickNumber}
			{/if}
		</div>

		<!-- Owner name (only for traded picks and not pre-draft) -->
		{#if !pick.isOriginalOwner && !preDraft}
			<div class="overflow-hidden text-xs text-ellipsis whitespace-nowrap md:text-sm">
				{ownerName}
			</div>
		{/if}
	</div>

	{#if preDraft}
		{#if !pick.isOriginalOwner}
			<!-- Pre-draft state with a placeholder draft pick -->
			<div
				class="mt-8 overflow-hidden text-xs text-ellipsis whitespace-nowrap text-gray-500 sm:text-sm"
			>
				{pick.owner}
			</div>
		{/if}
	{:else}
		<!-- Post-draft state -->
		<div class="mt-10 flex flex-col items-center md:mt-6">
			<!-- Player picture above the player name -->
			<img src={playerImage} alt={pick.PlayerName} class="mb-2 h-12 w-12 rounded-md object-cover" />
			<div class="text-xs font-bold sm:text-sm">{pick.PlayerName}</div>
			<div class="text-xs sm:text-sm">{pick.PlayerPosition} – {pick.PlayerTeam}</div>
		</div>
	{/if}
</div>
