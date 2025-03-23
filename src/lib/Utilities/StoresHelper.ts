import { IsPlayersLoaded, LoadPlayers } from '$lib/Stores/PlayerStore';
import { IsRostersLoaded, LoadRosters } from '$lib/Stores/RosterStore';
import { IsUsersLoaded, LoadUsers } from '$lib/Stores/UserStores';

export class StoresHelper {
	public static async EnsureStoresLoaded(): Promise<void> {
		let leagueId = import.meta.env.VITE_LEAGUE_ID;

		if (!IsPlayersLoaded()) {
			await LoadPlayers();
		}

		if (!IsRostersLoaded()) {
			await LoadRosters(leagueId);
		}

		if (!IsUsersLoaded()) {
			await LoadUsers(leagueId);
		}
	}
}
