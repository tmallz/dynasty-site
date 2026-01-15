import type { PageServerLoad } from './$types';
import { DraftsHelper } from '$lib/Utilities/DraftsHelper';
import { LoadDrafts, AreDraftsLoaded } from '$lib/Stores/DraftStore';
import { LoadRosters, IsRostersLoaded } from '$lib/Stores/RosterStore';
import { LoadUsers, IsUsersLoaded } from '$lib/Stores/UserStores';
import { LoadTransactions, IsTransactionsLoaded } from '$lib/Stores/TransactionStore';
import type { DraftPageDto } from '$lib/Utilities/Dtos/DraftPageDto';

export const load: PageServerLoad = async () => {
	const leagueId = import.meta.env.VITE_LEAGUE_ID;

	// Stream drafts data to client for instant page load
	const draftsPromise = (async () => {
		// Load only the stores needed for drafts page (not Players which causes issues server-side)
		if (!IsTransactionsLoaded()) {
			await LoadTransactions();
		}

		if (!AreDraftsLoaded()) {
			await LoadDrafts();
		}

		if (!IsRostersLoaded()) {
			await LoadRosters(leagueId);
		}

		if (!IsUsersLoaded()) {
			await LoadUsers(leagueId);
		}

		const pageDrafts: DraftPageDto[] = await DraftsHelper.GetAllDrafts();
		return pageDrafts;
	})();

	return {
		streamed: {
			pageDrafts: draftsPromise
		}
	};
};
