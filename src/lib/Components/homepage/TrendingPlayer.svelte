<script lang="ts">
	export let upOrDown: boolean; // 'up' is true or 'down'
	export let playerName: string = '';
	export let playerPosition: string = '';
	export let playerTeam: string = '';
	export let playerAvatar: string = ''; // URL for the player's avatar
	export let teamAvatar: string = ''; // URL for the team's avatar
	export let numWaivers: number = 0; // Number of waivers for the player
</script>

<div class="trending-player bg-base-100 flex items-center gap-4 rounded-lg p-4 shadow">
	<!-- Player Avatar -->
	<div class="player-avatar h-16 w-16 overflow-hidden rounded-full bg-gray-200">
		{#if playerAvatar}
			<img src={playerAvatar} alt="{playerName} Avatar" class="h-full w-full object-cover" />
		{:else}
			<div class="flex h-full w-full items-center justify-center text-gray-500">No Avatar</div>
		{/if}
	</div>

	<!-- Player Info -->
	<div class="flex-1">
		<h3 class="text-lg font-bold">{playerName}</h3>
		<p class="text-sm text-gray-500">{playerPosition} - {playerTeam}</p>
		<p class="text-sm font-medium">
			<span class={upOrDown ? 'text-green-500' : 'text-red-500'}>
				{upOrDown ? '+' : '-'}{numWaivers}
			</span>
		</p>
	</div>

	<!-- Team Avatar -->
	<div class="team-avatar h-12 w-12 overflow-hidden rounded-full bg-gray-200">
		{#if playerTeam}
			<img src={teamAvatar} alt="{playerTeam} Logo" class="h-full w-full object-cover" />
		{:else}
			<div class="flex h-full w-full items-center justify-center text-gray-500">FA</div>
		{/if}
	</div>
</div>

<style>
	.trending-player {
		display: flex;
		align-items: center;
		gap: 1rem;
		background-color: var(--color-base-100);
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
	.player-avatar,
	.team-avatar {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		overflow: hidden;
		background-color: var(--color-gray-200);
	}
	.text-green-500 {
		color: #22c55e; /* Tailwind green for positive numbers */
	}
	.text-red-500 {
		color: #ef4444; /* Tailwind red for negative numbers */
	}
</style>
