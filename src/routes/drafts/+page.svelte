<script lang="ts">
	import { onMount } from 'svelte';
	import { DraftsHelper } from '$lib/Utilities/DraftsHelper';
	import type { DraftPageDto, DraftPagePicks } from '$lib/Utilities/Dtos/DraftPageDto';
	import DraftTeamHeader from '$lib/Components/drafts/DraftTeamHeader.svelte';
	import DraftCell from '$lib/Components/drafts/DraftCell.svelte';
	import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
	import { UsersStore } from '$lib/Stores/UserStores';
	import { get } from 'svelte/store';
	import { StoresHelper } from '$lib/Utilities/StoresHelper';
	import { DraftStatus } from '$lib/api/Enums/DraftStatus';
	let pageDrafts: DraftPageDto[] | null = null;
	let users: LeagueUser[] = get(UsersStore);

	let getUsernameFromUserId = (userId: string): string => {
		if (users.length === 0) {
			users = get(UsersStore);
		}
		return users.find((user) => user.user_id === userId)?.display_name ?? '';
	};

	let getAvatarFromUserId = (userId: string): string => {
		if (users.length === 0) {
			users = get(UsersStore);
		}
		return users.find((user) => user.user_id === userId)?.avatar ?? '';
	};

	let getOrderedPicks = (draft: DraftPageDto): DraftPagePicks[] => {
		// If the draft already has picks, simply order them.
		if (draft.DraftPagePicks && draft.DraftPagePicks.length > 0) {
			if (draft.DraftType === 'snake') {
				// Group picks by round.
				const rounds: Record<number, DraftPagePicks[]> = {};
				draft.DraftPagePicks.forEach((pick) => {
					const rnd = pick.round;
					if (!rounds[rnd]) {
						rounds[rnd] = [];
					}
					rounds[rnd].push(pick);
				});
				let ordered: DraftPagePicks[] = [];
				// Sort rounds in ascending order.
				Object.keys(rounds)
					.map(Number)
					.sort((a, b) => a - b)
					.forEach((rnd) => {
						let roundPicks = rounds[rnd];
						// Reverse the picks for even rounds.
						if (rnd % 2 === 0) {
							roundPicks = roundPicks.slice().reverse();
						}
						ordered.push(...roundPicks);
					});
				return ordered;
			} else {
				// Linear: sort by the draft_slot property.
				return draft.DraftPagePicks.sort((a, b) => a.draft_slot - b.draft_slot);
			}
		}

		// If there are no picks, generate placeholder picks (pre_draft state).
		// You can adjust numRounds and other logic as needed.
		if (draft.DraftStatus === 'pre_draft') {
			const numRounds = 5;
			const draftOrder = draft.DraftOrder ?? {};
			const numTeams = Object.keys(draftOrder).length;
			let picks: DraftPagePicks[] = [];
			// Sort the teams by their draft order value.
			let orderedTeams = Object.entries(draftOrder).sort(([, a], [, b]) => a - b);

			if (draft.DraftType === 'snake') {
				// For snake drafts, reverse the team order on even rounds.
				for (let round = 1; round <= numRounds; round++) {
					let roundOrder = round % 2 === 0 ? orderedTeams.slice().reverse() : orderedTeams;
					for (let i = 0; i < roundOrder.length; i++) {
						let teamId = roundOrder[i][0];
						let pickPlaceholder: DraftPagePicks = {
							round: round,
							draft_slot: i + 1,
							ownerId: teamId,
							owner: getUsernameFromUserId(teamId),
							PlayerName:
								getUsernameFromUserId(teamId) + ` ${round}.${(i + 1).toString().padStart(2, '0')}`,
							PlayerPosition: '',
							PlayerTeam: ''
						};
						picks.push(pickPlaceholder);
					}
				}
			} else {
				// Linear draft: keep the same order every round.
				for (let round = 1; round <= numRounds; round++) {
					for (let i = 0; i < orderedTeams.length; i++) {
						let teamId = orderedTeams[i][0];
						let pickPlaceholder: DraftPagePicks = {
							round: round,
							draft_slot: i + 1,
							owner: getUsernameFromUserId(teamId),
							ownerId: teamId,
							PlayerName:
								getUsernameFromUserId(teamId) + ` ${round}.${(i + 1).toString().padStart(2, '0')}`,
							PlayerPosition: '',
							PlayerTeam: ''
						};
						picks.push(pickPlaceholder);
					}
				}
			}
			return picks;
		}

		return [];
	};

	onMount(async () => {
		pageDrafts = await DraftsHelper.GetAllDrafts();
		await StoresHelper.EnsureStoresLoaded();
		console.log('Drafts loaded:', pageDrafts);
	});
</script>

<main class="p-8">
	{#if !pageDrafts}
		<p>Loading...</p>
	{:else}
		{#each pageDrafts as draft}
			<section class="mb-8">
				<!-- Draft Header -->
				<h1 class="mb-6 text-4xl font-bold">
					Draft: {draft.DraftId} - Season {draft.Season}
				</h1>

				<!-- Team header row: number of columns based on amount of teams -->
				<div
					class="mb-6 grid gap-4"
					style="grid-template-columns: repeat({Object.keys(draft.DraftOrder ?? {})
						.length}, minmax(0, 1fr))"
				>
					{#each Object.keys(draft.DraftOrder ?? {}) as team}
						<DraftTeamHeader
							teamName={getUsernameFromUserId(team)}
							teamLogo={`https://sleepercdn.com/avatars/${getAvatarFromUserId(team)}`}
						/>
					{/each}
				</div>

				<!-- Draft board: Each cell gets one team column -->
				<div
					class="grid gap-4"
					style="grid-template-columns: repeat({Object.keys(draft.DraftOrder ?? {})
						.length}, minmax(0, 1fr))"
				>
					{#each getOrderedPicks(draft) as pick, index}
						<!-- Toggle preDraft or postDraft by changing the preDraft flag -->
						<DraftCell
							{pick}
							preDraft={draft.DraftStatus === DraftStatus.PRE_DRAFT}
							playerImage={`https://sleepercdn.com/content/nfl/players/${pick.playerId}.jpg`}
							pickNumber={index + 1}
							teamsCount={Object.keys(draft.DraftOrder ?? {}).length}
							ownerName={getUsernameFromUserId(pick.ownerId ?? '')}
						/>
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</main>
