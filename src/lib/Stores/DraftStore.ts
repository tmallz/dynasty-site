import { writable } from 'svelte/store';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import type { DraftAndDetail } from '$lib/Utilities/Dtos/DraftAndDetail';
import type { League } from '$lib/api/dtos/LeagueDtos/League';

export const DraftsStore = writable<DraftAndDetail[]>([]);
let isLoaded = false; // Tracks whether drafts have been loaded

export async function LoadDrafts(): Promise<void> {
	if (isLoaded) return; // Skip API call if already loaded

	try {
		let draftInfo: DraftAndDetail[] = [];
		let userId = (await SleeperClient.GetUser('tmallz')).user_id;
		let currentYear = new Date(Date.now()).getFullYear();
		let allCurrentUserLeagues: League[] = await SleeperClient.GetUserLeagues(
			userId,
			'nfl',
			currentYear.toString()
		);
		let currentLeague = allCurrentUserLeagues.find(
			(l) => l.name === import.meta.env.VITE_LEAGUE_NAME
		);

		let currentLeagueId = currentLeague?.league_id ?? '0';
		let drafts = await SleeperClient.GetLeagueDrafts(currentLeagueId);
		for (const draft of drafts) {
			let draftDetail = await SleeperClient.GetDraft(draft.draft_id ?? '');
			draftInfo.push({
				draft: draft,
				detail: draftDetail
			});
		}

		let previousLeagues: League[] = [];
		let previousLeagueId = currentLeague?.previous_league_id;
		if (previousLeagueId !== '0') {
			while (previousLeagueId !== '0') {
				if (!previousLeagueId) {
					console.warn('previousLeagueId is undefined');
					break;
				}
				let league = await SleeperClient.GetLeague(previousLeagueId);
				previousLeagues.push(league);
				previousLeagueId = league.previous_league_id ?? '0';
			}
		}

		for (const league of previousLeagues) {
			let leagueId = league?.league_id ?? '0';
			let drafts = await SleeperClient.GetLeagueDrafts(leagueId);
			drafts.forEach(async (draft) => {
				let draftDetail = await SleeperClient.GetDraft(draft.draft_id ?? '');
				draftInfo.push({
					draft: draft,
					detail: draftDetail
				});
			});
		}
		DraftsStore.set(draftInfo);
		isLoaded = true; // Mark as loaded after fetching drafts
	} catch (error) {
		console.error('Error loading drafts:', error);
	}
}

// Function to check if transactions are loaded
export function AreDraftsLoaded(): boolean {
	return isLoaded;
}
