import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
import { IsPlayersLoaded, LoadPlayers, PlayersStore } from '$lib/Stores/PlayerStore';
import { get } from 'svelte/store';
import type { RosterPageDto } from './Dtos/RosterPageDto';
import { StoresHelper } from './StoresHelper';
import { RostersStore } from '$lib/Stores/RosterStore';
import { UsersStore } from '$lib/Stores/UserStores';
import { AvatarHelper } from './AvatarHelper';

export class RostersHelper {
	public static async GetAllRosters(): Promise<RosterPageDto[]> {
		let rosters: Roster[] = [];
		// Get data from stores (assumes stores are already loaded by caller)
		rosters = get(RostersStore) ?? [];

		let pageRosters: RosterPageDto[] = [];

		for (const r of rosters) {
			let pageRoster = await RostersHelper.MapRoster(r);
			pageRosters.push(pageRoster);
		}

		return pageRosters;
	}

	private static async MapRoster(roster: Roster): Promise<RosterPageDto> {
		let pageRoster: RosterPageDto = {} as RosterPageDto;
		let users: LeagueUser[] = get(UsersStore) ?? [];
		pageRoster.OwnerId = roster.owner_id;
		pageRoster.AvatarUrl = await AvatarHelper.GetUserAvatarUrl(roster);
		pageRoster.TeamName = RostersHelper.GetUserFromRosterId(roster.roster_id).display_name;
		pageRoster.Starters = RostersHelper.MapPlayerNames(roster.starters);
		pageRoster.Bench = RostersHelper.MapPlayerNames(
			roster.players.filter((p) => !roster.starters.includes(p))
		);

		return pageRoster;
	}

	public static MapPlayerNames(rosterPlayers: string[]): Record<string, Player>;
	public static MapPlayerNames(rosterPlayer: string): Player | null;

	// Implementation
	public static MapPlayerNames(
		rosterPlayersOrPlayer: string[] | string
	): Record<string, Player> | Player | null {
		let allPlayers: Record<string, Player> = get(PlayersStore) ?? {};
		if (Array.isArray(rosterPlayersOrPlayer)) {
			// Handle the array case by looping over the array and calling the single-player version
			let mappedPlayers: Record<string, Player> = {};

			rosterPlayersOrPlayer.forEach((playerId) => {
				const player = RostersHelper.MapPlayerNames(playerId) as Player;
				if (player) {
					player.playerAvatarUrl = AvatarHelper.GetPlayerAvatarUrl(playerId);
					player.playerTeamAvatarUrl = AvatarHelper.GetPlayerTeamAvatarUrl(player.team || '');
					mappedPlayers[playerId] = player;
				}
			});

			return mappedPlayers;
		} else {
			// Handle the single-player case
			const player = allPlayers[rosterPlayersOrPlayer];
			if (!player) {
				//console.warn(`Player with ID ${rosterPlayersOrPlayer} not found in allPlayers.`);
				return null;
			}
			return player;
		}
	}

	public static GetUserFromRosterId(rosterId: number): LeagueUser {
		// Assumes stores are already loaded by caller
		// Get the latest data from the stores
		const rosters = get(RostersStore) ?? [];
		const users = get(UsersStore) ?? [];

		// Find the roster
		let roster = rosters.find((r) => r.roster_id === rosterId);
		if (!roster) {
			console.warn(`Roster with ID ${rosterId} not found in rosters.`);
			return {} as LeagueUser; // Return an empty object or handle as needed
		}

		// Find the user
		let user = users.find((u) => u.user_id === roster.owner_id);
		if (!user) {
			console.warn(`User with ID ${roster.owner_id} not found in users.`);
			return {} as LeagueUser; // Return an empty object or handle as needed
		}

		return user;
	}
}
