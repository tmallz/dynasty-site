<script lang="ts">
	import type {
		DraftPageDto,
		DraftPagePicks,
		DraftPageTradedPicks
	} from '$lib/Utilities/Dtos/DraftPageDto';
	import DraftTeamHeader from '$lib/Components/drafts/DraftTeamHeader.svelte';
	import DraftCell from '$lib/Components/drafts/DraftCell.svelte';
	import DraftCellSkeleton from '$lib/Components/drafts/DraftCellSkeleton.svelte';
	import DraftPickCard from '$lib/Components/drafts/DraftPickCard.svelte';
	import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
	import { UsersStore } from '$lib/Stores/UserStores';
	import { DraftStatus } from '$lib/api/Enums/DraftStatus';
	import { DraftType } from '$lib/api/Enums/DraftType';

	export let data;
	let pageDrafts: DraftPageDto[] = [];
	let isLoading = true;

	// Skeleton grid configuration
	const skeletonColumns = 10;
	const skeletonRows = 5;
	const skeletonCells = skeletonColumns * skeletonRows;

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

	// Get picks in chronological order (for mobile list view)
	// Unlike getOrderedPicks which arranges for grid display, this returns true draft order
	let getChronologicalPicks = (draft: DraftPageDto): DraftPagePicks[] => {
		// For completed drafts, sort by round then by pick position within round
		if (draft.DraftPagePicks && draft.DraftPagePicks.length > 0) {
			return [...draft.DraftPagePicks].sort((a, b) => {
				if (a.round !== b.round) return a.round - b.round;
				// For snake drafts, picks in even rounds are in reverse slot order
				if (draft.DraftType === 'snake' && a.round % 2 === 0) {
					return b.draft_slot - a.draft_slot; // Reverse order for even rounds
				}
				return a.draft_slot - b.draft_slot;
			});
		}

		// For pre-draft, getOrderedPicks already generates in chronological order
		// (it applies snake ordering during generation)
		return getOrderedPicks(draft);
	};
</script>

<main class="p-8">
	{#if isLoading}
		<!-- Skeleton Loading State -->
		<section class="mb-12">
			<h1 class="skeleton mb-6 mx-auto h-10 w-64"></h1>

			<div class="overflow-x-auto">
				<div class="hidden px-3 pt-3 md:block">
					<!-- Skeleton team headers -->
					<div
						class="mb-6 grid gap-4"
						style="grid-template-columns: repeat({skeletonColumns}, minmax(125px, 1fr))"
					>
						{#each Array(skeletonColumns) as _, i}
							<div class="flex flex-col items-center gap-2">
								<div class="skeleton h-12 w-12 rounded-full"></div>
								<div class="skeleton h-4 w-16"></div>
							</div>
						{/each}
					</div>

					<!-- Skeleton draft board (desktop) -->
					<div
						class="grid gap-4"
						style="grid-template-columns: repeat({skeletonColumns}, minmax(125px, 1fr))"
					>
						{#each Array(skeletonCells) as _, i}
							<DraftCellSkeleton animationDelay={Math.floor(i / skeletonColumns) * 50 + (i % skeletonColumns) * 20} />
						{/each}
					</div>
				</div>

				<!-- Skeleton mobile cards -->
				<div class="flex flex-col gap-3 md:hidden">
					{#each Array(10) as _, i}
						<div
							class="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 p-3"
							style="animation: fadeIn 200ms ease-out forwards; animation-delay: {i * 50}ms; opacity: 0;"
						>
							<div class="skeleton h-8 w-12 rounded-md"></div>
							<div class="skeleton h-10 w-10 rounded-md"></div>
							<div class="flex flex-1 flex-col gap-1">
								<div class="skeleton h-4 w-24"></div>
								<div class="skeleton h-3 w-16"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{:else}
		<!-- Upcoming Draft -->
		{#if pageDrafts.find((draft) => draft.DraftStatus === DraftStatus.PRE_DRAFT)}
			<section class="mb-12">
				{#each pageDrafts.filter((draft) => draft.DraftStatus === DraftStatus.PRE_DRAFT) as draft}
					{@const teamsCount = Object.keys(draft.DraftOrder ?? {}).length}
					<section class="mb-8">
						<!-- Draft Header -->
						<h1 class="mb-6 text-center text-4xl font-bold">
							Upcoming {draft.Season} Draft
						</h1>

						<!-- Desktop view: Scrollable grid -->
						<div class="hidden overflow-x-auto md:block">
							<div class="px-3 pt-3">
								<!-- Team header row -->
								<div
									class="mb-6 grid gap-4"
									style="grid-template-columns: repeat({teamsCount}, minmax(125px, 1fr))"
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
									style="grid-template-columns: repeat({teamsCount}, minmax(125px, 1fr))"
								>
									{#each getOrderedPicks(draft) as pick, index}
										<DraftCell
											{pick}
											preDraft={draft.DraftStatus === DraftStatus.PRE_DRAFT}
											playerImage={`https://sleepercdn.com/content/nfl/players/${pick.playerId}.jpg`}
											pickNumber={index + 1}
											{teamsCount}
											ownerName={getUsernameFromUserId(pick.ownerId ?? '')}
											draftType={draft.DraftType ?? DraftType.Linear}
											animationDelay={Math.floor(index / teamsCount) * 50 + (index % teamsCount) * 20}
										/>
									{/each}
								</div>
							</div>
						</div>

						<!-- Mobile view: Card list -->
						<div class="flex flex-col gap-3 md:hidden">
							{#each getChronologicalPicks(draft) as pick, index}
								<DraftPickCard
									{pick}
									preDraft={draft.DraftStatus === DraftStatus.PRE_DRAFT}
									playerImage={`https://sleepercdn.com/content/nfl/players/${pick.playerId}.jpg`}
									pickNumber={index + 1}
									{teamsCount}
									ownerName={getUsernameFromUserId(pick.ownerId ?? '')}
									draftType={draft.DraftType ?? DraftType.Linear}
									animationDelay={index * 30}
								/>
							{/each}
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
				{@const teamsCount = Object.keys(draft.DraftOrder ?? {}).length}
				<section class="mb-8">
					<!-- Draft Header -->
					<h1 class="mb-6 text-center text-2xl font-bold">
						{draft.Season} Draft
					</h1>

					<!-- Desktop view: Scrollable grid -->
					<div class="hidden overflow-x-auto md:block">
						<div class="px-3 pt-3">
							<!-- Team header row -->
							<div
								class="mb-6 grid gap-4"
								style="grid-template-columns: repeat({teamsCount}, minmax(125px, 1fr))"
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
								style="grid-template-columns: repeat({teamsCount}, minmax(125px, 1fr))"
							>
								{#each getOrderedPicks(draft) as pick, index}
									<DraftCell
										{pick}
										preDraft={draft.DraftStatus === DraftStatus.PRE_DRAFT}
										playerImage={`https://sleepercdn.com/content/nfl/players/${pick.playerId}.jpg`}
										pickNumber={index + 1}
										{teamsCount}
										ownerName={getUsernameFromUserId(pick.ownerId ?? '')}
										draftType={draft.DraftType ?? DraftType.Linear}
										animationDelay={Math.floor(index / teamsCount) * 50 + (index % teamsCount) * 20}
									/>
								{/each}
							</div>
						</div>
					</div>

					<!-- Mobile view: Card list -->
					<div class="flex flex-col gap-3 md:hidden">
						{#each getChronologicalPicks(draft) as pick, index}
							<DraftPickCard
								{pick}
								preDraft={draft.DraftStatus === DraftStatus.PRE_DRAFT}
								playerImage={`https://sleepercdn.com/content/nfl/players/${pick.playerId}.jpg`}
								pickNumber={index + 1}
								{teamsCount}
								ownerName={getUsernameFromUserId(pick.ownerId ?? '')}
								draftType={draft.DraftType ?? DraftType.Linear}
								animationDelay={index * 30}
							/>
						{/each}
					</div>
				</section>
			{/each}
		</section>
	{/if}
</main>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
