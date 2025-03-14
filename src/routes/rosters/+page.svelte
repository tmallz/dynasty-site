<script lang="ts">
	import { onMount } from 'svelte';
	import { RostersHelper } from '$lib/Utilities/RostersHelper';
	import type { RosterPageDto } from '$lib/Utilities/Dtos/RosterPageDto';

	let rosters: RosterPageDto[] = [];

	onMount(async () => {
		rosters = await RostersHelper.GetAllRosters();
	});
</script>

<main>
	{#each rosters as roster}
		<p>{roster.TeamName}</p>
		<p>{roster.OwnerId}</p>
		<ul>
			{#each Object.entries(roster.Starters) as [playerId, player]}
				<li>{player.first_name} {player.last_name} - {player.position}</li>
			{/each}
		</ul>
	{/each}
</main>
