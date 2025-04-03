import type { DraftPick } from '$lib/api/dtos/DraftDtos/DraftPick';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { UsersStore } from '$lib/Stores/UserStores';
import { get } from 'svelte/store';
import type { DraftPageDto, DraftPagePicks } from './Dtos/DraftPageDto';
import { StoresHelper } from './StoresHelper';
import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { DraftAndDetail } from './Dtos/DraftAndDetail';
import { DraftsStore } from '$lib/Stores/DraftStore';
import { DraftStatus } from '$lib/api/Enums/DraftStatus';

export class DraftsHelper {
	/**
	 * Gets the draft information for a specific draft
	 * @param draftId
	 * @returns
	 */
	public static async GetAllDrafts(): Promise<DraftPageDto[]> {
		let PageDrafts: DraftPageDto[] = [];
		let draftPicks: DraftPick[] = [];
		let users: LeagueUser[] = [];
		let draftsAndDetails: DraftAndDetail[] = [];
		let leagueId = import.meta.env.VITE_LEAGUE_ID;

		await StoresHelper.EnsureStoresLoaded();
		users = get(UsersStore) ?? [];
		draftsAndDetails = get(DraftsStore) ?? [];

		for (const item of draftsAndDetails) {
			let picks: DraftPagePicks[] = [];
			let PageDraft: DraftPageDto = {};
			let draft = item.draft;
			let draftDetail = item.detail;

			PageDraft.DraftId = draft.draft_id;
			PageDraft.Season = draft.season;
			PageDraft.DraftType = draft.type;
			PageDraft.DraftStatus = draftDetail.status;
			PageDraft.DraftDate = new Date(draft.created ?? 0).toDateString();
			PageDraft.SlotToRosterMap = draftDetail.slot_to_roster_id ?? {};
			PageDraft.DraftOrder = await DraftsHelper.MapDraftOrder(draft.draft_order ?? {});

			draftPicks = await SleeperClient.GetDraftPicks(draft.draft_id ?? '');
			if (draftPicks.length === 0) {
				//TODO: Handle pre-draft state where we display the draft with who owns the picks
				PageDraft.DraftPagePicks = []; // Set to empty array if no picks found
				PageDrafts.push(PageDraft);
				draftPicks = []; // Reset draftPicks for the next iteration
				continue; // Skip this draft if no picks are found
			}

			let currentround = 1;
			let pickNumber = 1;
			for (let i = 0; i < draftPicks.length; i++) {
				let pick = draftPicks[i];

				if (pick.round > currentround) {
					currentround = pick.round;
					pickNumber = 1; // Reset pick number for the new round
				}
				let pickDto: DraftPagePicks = {
					round: pick.round,
					draft_slot: draftPicks[i].draft_slot,
					ownerId: pick.picked_by,
					owner: users.find((user) => user.user_id === pick.picked_by)?.display_name ?? 'Unknown',
					PlayerName: pick.metadata.first_name + ' ' + pick.metadata.last_name,
					PlayerPosition: pick.metadata.position,
					PlayerTeam: pick.metadata.team,
					playerId: pick.player_id,
					pickNumber: pickNumber,
					rosterId: pick.roster_id
				};

				pickDto.isOriginalOwner = DraftsHelper.IsOriginalOwner(
					pickDto.rosterId ?? '',
					pickDto.draft_slot,
					PageDraft.SlotToRosterMap ?? {}
				);
				pickNumber++;
				picks.push(pickDto);
			}

			draftPicks = []; // Reset draftPicks for the next iteration
			PageDraft.DraftPagePicks = picks;
			PageDrafts.push(PageDraft);
		}

		// Sort the drafts by date
		PageDrafts.sort((a, b) => {
			if (a.DraftDate && b.DraftDate) {
				return new Date(b.DraftDate).getTime() - new Date(a.DraftDate).getTime();
			}
			return 0;
		});

		//remove any drafts that have less than 30 picks and have status of 'complete'
		PageDrafts = PageDrafts.filter((draft) => {
			if (draft.DraftPagePicks && draft.DraftPagePicks.length < 30) {
				return draft.DraftStatus !== DraftStatus.COMPLETE;
			}
			return true;
		});
		return PageDrafts;
	}

	private static async MapDraftOrder(
		draftOrder: Record<string, number>
	): Promise<Record<string, number>> {
		return Object.fromEntries(Object.entries(draftOrder).sort(([, a], [, b]) => a - b));
	}

	private static IsOriginalOwner(
		rosterNumber: string,
		draftSlot: number,
		slotToRosterMap: Record<string, number>
	): boolean {
		//get the roster Id from the slotToRosterMap for corresponding draft slot
		let rosterId = slotToRosterMap[draftSlot.toString()];
		return rosterId === Number(rosterNumber);
	}
}
