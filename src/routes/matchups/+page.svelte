<script lang="ts">
	import { onMount } from 'svelte';
	import { MatchupHelper } from '$lib/Utilities/MatchupHelper';
	import type { MatchupPageDto } from '$lib/Utilities/Dtos/MatchupPageDto';

	let matchups: MatchupPageDto[] = [];

	onMount(async () => {
		matchups = await MatchupHelper.GetPageMatchups();
	});
</script>

<main>
	{#if matchups.length === 0}
		<p>Loading...</p>
	{/if}

	{#each matchups as matchup}
		<p>{matchup.TeamName}</p>
		<p>{matchup.MatchupId}</p>
		<p>{matchup.Score}</p>
		<ul>
			{#each Object.entries(matchup.Starters ?? {}) as [playerId, player]}
				<li>{player.first_name} {player.last_name} - {player.position}</li>
			{/each}
		</ul>
		<br />
		<br />
	{/each}
</main>
