<script lang="ts">
	import type {
		DraftPageDto,
		DraftPagePicks,
		DraftPageTradedPicks
	} from '$lib/Utilities/Dtos/DraftPageDto';
	import DraftTeamHeader from '$lib/Components/drafts/DraftTeamHeader.svelte';
	import DraftCell from '$lib/Components/drafts/DraftCell.svelte';
	import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
	import { UsersStore } from '$lib/Stores/UserStores';
	import { DraftStatus } from '$lib/api/Enums/DraftStatus';
	import { DraftType } from '$lib/api/Enums/DraftType';

	export let data;
	let pageDrafts: DraftPageDto[] = [];
	let isLoading = true;

	// Handle streamed data
	$: if (data.streamed?.pageDrafts) {
		data.streamed.pageDrafts.then((result: DraftPageDto[]) => {
			pageDrafts = result;
			isLoading = false;
		});
	}

	let getUsernameFromUserId = (userId: string): string => {
		return $UsersStore.find((user) => user.user_id === userId)?.display_name ?? '';
	};

	let getAvatarFromUserId = (userId: string): string => {
		return $UsersStore.find((user) => user.user_id === userId)?.avatar ?? '';
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
		if (draft.DraftStatus === 'pre_draft') {
			const numRounds = 5;
			const draftOrder = draft.DraftOrder ?? {};
			const numTeams = Object.keys(draftOrder).length;
			let picks: DraftPagePicks[] = [];
			let tradedPicks = draft.TradedPicks ?? [];
			let draftToSlotOrder = draft.SlotToRosterMap;

			// Sort the teams by their draft order value.
			let orderedTeams = Object.entries(draftOrder).sort(([, a], [, b]) => a - b);

			// should almost never have a snake rookie draft but yolo

			if (draft.DraftType === DraftType.Snake) {
				// For snake drafts, reverse the team order on even rounds.
				for (let round = 1; round <= numRounds; round++) {
					let roundOrder = round % 2 === 0 ? orderedTeams.slice().reverse() : orderedTeams;
					for (let i = 0; i < roundOrder.length; i++) {
						let teamId = roundOrder[i][0];
						let draftSlot = i + 1;

						// Get the roster ID for the current draft slot
						let currentPickRosterId = draftToSlotOrder?.[draftSlot] ?? null;
						// Find the traded pick
						let tradedPick = tradedPicks.find(
							(pick) =>
								pick.round === round &&
								pick.origionalOwnerRosterId === currentPickRosterId &&
								pick.currentOwner !== getUsernameFromUserId(teamId)
						);

						// Determine the owner and other details based on whether the pick is traded
						let ownerId = tradedPick ? tradedPick.currentOwner : teamId;
						let ownerName = tradedPick ? tradedPick.currentOwner : getUsernameFromUserId(teamId);
						let isOriginalOwner =
							!tradedPick || tradedPick.currentOwner === getUsernameFromUserId(teamId);

						// Create the placeholder picks for upcoming draft
						let pickPlaceholder: DraftPagePicks = {
							round: round,
							draft_slot: draftSlot,
							ownerId: ownerId,
							owner: ownerName ?? '',
							PlayerName: `${ownerName} ${round}.${draftSlot.toString().padStart(2, '0')}`,
							PlayerPosition: '',
							PlayerTeam: '',
							isOriginalOwner: isOriginalOwner
						};

						picks.push(pickPlaceholder);
					}
				}
			} else {
				// Linear draft: keep the same order every round.
				for (let round = 1; round <= numRounds; round++) {
					for (let i = 0; i < orderedTeams.length; i++) {
						let teamId = orderedTeams[i][0];
						let draftSlot = i + 1;

						// Get the roster ID for the current draft slot
						let currentPickRosterId = draftToSlotOrder?.[draftSlot] ?? null;
						// Find the traded pick
						let tradedPick = tradedPicks.find(
							(pick) =>
								pick.round === round &&
								pick.origionalOwnerRosterId === currentPickRosterId &&
								pick.currentOwner !== getUsernameFromUserId(teamId)
						);

						// Determine the owner and other details based on whether the pick is traded
						let ownerId = tradedPick ? tradedPick.currentOwner : teamId;
						let ownerName = tradedPick ? tradedPick.currentOwner : getUsernameFromUserId(teamId);
						let isOriginalOwner =
							!tradedPick || tradedPick.currentOwner === getUsernameFromUserId(teamId);

						// Create the placeholder picks for upcoming draft
						let pickPlaceholder: DraftPagePicks = {
							round: round,
							draft_slot: draftSlot,
							ownerId: ownerId,
							owner: ownerName ?? '',
							PlayerName: `${ownerName} ${round}.${draftSlot.toString().padStart(2, '0')}`,
							PlayerPosition: '',
							PlayerTeam: '',
							isOriginalOwner: isOriginalOwner
						};

						picks.push(pickPlaceholder);
					}
				}
			}

			return picks;
		}

		return [];
	};
</script>

<main class="p-8">
	{#if isLoading}
		<!-- Loading State -->
		<div class="flex flex-col items-center justify-center py-20">
			<span class="loading loading-spinner loading-lg text-primary mb-4"></span>
			<p class="text-lg font-semibold">Loading drafts...</p>
			<p class="text-sm text-base-content/70 mt-2">This may take a few seconds</p>
		</div>
	{:else}
		<!-- Upcoming Draft -->
		{#if pageDrafts.find((draft) => draft.DraftStatus === DraftStatus.PRE_DRAFT)}
			<section class="mb-12">
				{#each pageDrafts.filter((draft) => draft.DraftStatus === DraftStatus.PRE_DRAFT) as draft}
					<section class="mb-8">
						<!-- Draft Header -->
						<h1 class="mb-6 text-center text-4xl font-bold">
							Upcoming {draft.Season} Draft
						</h1>

						<!-- Scrollable container for team headers and draft board -->
						<div class="overflow-x-auto">
							<!-- Team header row -->
							<div
								class="mb-6 grid gap-4"
								style="grid-template-columns: repeat({Object.keys(draft.DraftOrder ?? {})
									.length}, minmax(125px, 1fr))"
							>
								{#each Object.keys(draft.DraftOrder ?? {}) as team}
									<DraftTeamHeader
										teamName={getUsernameFromUserId(team)}
										teamLogo={`https://sleepercdn.com/avatars/${getAvatarFromUserId(team)}`}
									/>
								{/each}
							</div>

							<!-- Draft board -->
							<div
								class="grid gap-4"
								style="grid-template-columns: repeat({Object.keys(draft.DraftOrder ?? {})
									.length}, minmax(125px, 1fr))"
							>
								{#each getOrderedPicks(draft) as pick, index}
									<DraftCell
										{pick}
										preDraft={draft.DraftStatus === DraftStatus.PRE_DRAFT}
										playerImage={`https://sleepercdn.com/content/nfl/players/${pick.playerId}.jpg`}
										pickNumber={index + 1}
										teamsCount={Object.keys(draft.DraftOrder ?? {}).length}
										ownerName={getUsernameFromUserId(pick.ownerId ?? '')}
										draftType={draft.DraftType ?? DraftType.Linear}
									/>
								{/each}
							</div>
						</div>
					</section>
				{/each}
			</section>
		{/if}

		<div class="divider my-8"></div>

		<!-- Previous Drafts -->
		<section>
			<h2 class="mb-4 text-center text-4xl font-bold">Previous Drafts</h2>
			{#each pageDrafts.filter((draft) => draft.DraftStatus !== DraftStatus.PRE_DRAFT) as draft}
				<section class="mb-8">
					<!-- Draft Header -->
					<h1 class="mb-6 text-center text-2xl font-bold">
						{draft.Season} Draft
					</h1>

					<!-- Scrollable container for team headers and draft board -->
					<div class="overflow-x-auto">
						<!-- Team header row -->
						<div
							class="mb-6 grid gap-4"
							style="grid-template-columns: repeat({Object.keys(draft.DraftOrder ?? {})
								.length}, minmax(125px, 1fr))"
						>
							{#each Object.keys(draft.DraftOrder ?? {}) as team}
								<DraftTeamHeader
									teamName={getUsernameFromUserId(team)}
									teamLogo={`https://sleepercdn.com/avatars/${getAvatarFromUserId(team)}`}
								/>
							{/each}
						</div>

						<!-- Draft board -->
						<div
							class="grid gap-4"
							style="grid-template-columns: repeat({Object.keys(draft.DraftOrder ?? {})
								.length}, minmax(125px, 1fr))"
						>
							{#each getOrderedPicks(draft) as pick, index}
								<DraftCell
									{pick}
									preDraft={draft.DraftStatus === DraftStatus.PRE_DRAFT}
									playerImage={`https://sleepercdn.com/content/nfl/players/${pick.playerId}.jpg`}
									pickNumber={index + 1}
									teamsCount={Object.keys(draft.DraftOrder ?? {}).length}
									ownerName={getUsernameFromUserId(pick.ownerId ?? '')}
									draftType={draft.DraftType ?? DraftType.Linear}
								/>
							{/each}
						</div>
					</div>
				</section>
			{/each}
		</section>
	{/if}
</main>
