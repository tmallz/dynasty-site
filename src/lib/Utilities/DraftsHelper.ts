import type { DraftPick } from '$lib/api/dtos/DraftDtos/DraftPick';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import type { DraftPageDto, DraftPagePicks } from './Dtos/DraftPageDto';

export class DraftsHelper {
	/**
	 * Gets the draft information for a specific draft
	 * @param draftId
	 * @returns
	 */
	public static async GetDraft(draftId: string): Promise<DraftPageDto> {
		let PageDraft: DraftPageDto = {};
		let draft = await SleeperClient.GetDraft(draftId);
		let draftPicks: DraftPick[] = await SleeperClient.GetDraftPicks(draftId);

		PageDraft.DraftId = draft.draft_id;
		PageDraft.Season = draft.season;

		let picks: DraftPagePicks[] = [];

		for (let i = 0; i < draftPicks.length; i++) {
			let pick = draftPicks[i];
			let pickDto: DraftPagePicks = {
				round: pick.round,
				draft_slot: draftPicks[i].draft_slot,
				owner: pick.picked_by,
				PlayerName: pick.metadata.first_name + ' ' + pick.metadata.last_name,
				PlayerPosition: pick.metadata.position,
				PlayerTeam: pick.metadata.team
			};

			picks.push(pickDto);
		}
		PageDraft.DraftPagePicks = picks;
		return PageDraft;
	}
}
