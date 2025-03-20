<script lang="ts">
	import { onMount } from 'svelte';
	import { DraftsHelper } from '$lib/Utilities/DraftsHelper';
	import { SleeperClient } from '$lib/api/services/SleeperClient';
	import type { DraftPageDto } from '$lib/Utilities/Dtos/DraftPageDto';

	let leagueId = import.meta.env.VITE_LEAGUE_ID;

	let drafts = [];
	let pageDraft: DraftPageDto | null = null;

	onMount(async () => {
		drafts = await SleeperClient.GetLeagueDrafts(leagueId);

		pageDraft = await DraftsHelper.GetDraft(drafts[0].draft_id);
	});
</script>

<main>
	{#if pageDraft}
		<h1>{pageDraft.DraftId}</h1>
		<p>{pageDraft.Season}</p>
		{#each pageDraft.DraftPagePicks ?? [] as pick}
			<p>{pick.draft_slot}</p>
			<p>{pick.round}</p>
			<p>{pick.PlayerName}</p>
			<p>{pick.PlayerPosition}</p>
			<p>{pick.PlayerTeam}</p>
		{/each}
	{/if}
</main>
