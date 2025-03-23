import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { IsPlayersLoaded, LoadPlayers, PlayersStore } from '$lib/Stores/PlayerStore';
import { get } from 'svelte/store';
import type { RosterPageDto } from './Dtos/RosterPageDto';
import { StoresHelper } from './StoresHelper';
import { RostersStore } from '$lib/Stores/RosterStore';
import { UsersStore } from '$lib/Stores/UserStores';

export class RostersHelper {
	public static async GetAllRosters(): Promise<RosterPageDto[]> {
		let rosters: Roster[] = [];
		let players: Record<string, Player> | null = null;
		let users: LeagueUser[] = [];

		if (!IsPlayersLoaded()) {
			await LoadPlayers();
		}

		StoresHelper.EnsureStoresLoaded();
		rosters = get(RostersStore) ?? [];
		players = get(PlayersStore) ?? {};
		users = get(UsersStore) ?? [];

		let pageRosters: RosterPageDto[] = [];

		rosters.forEach((r) => {
			let pageRoster = RostersHelper.MapRoster(r, players, users);
			pageRosters.push(pageRoster);
		});

		return pageRosters;
	}

	private static MapRoster(
		roster: Roster,
		players: Record<string, Player>,
		users: LeagueUser[]
	): RosterPageDto {
		let pageRoster: RosterPageDto = {} as RosterPageDto;
		pageRoster.OwnerId = roster.owner_id;
		pageRoster.TeamName = users.find((u) => u.user_id === roster.owner_id)?.display_name ?? '';
		pageRoster.Starters = RostersHelper.MapPlayerName(players, roster.starters);
		pageRoster.Bench = RostersHelper.MapPlayerName(
			players,
			roster.players.filter((p) => !roster.starters.includes(p))
		); //filter out starters

		return pageRoster;
	}

	public static MapPlayerName(
		allPlayers: Record<string, Player>,
		rosterPlayers: string[]
	): Record<string, Player> {
		let mappedPlayers: Record<string, Player> = {};

		rosterPlayers.forEach((playerId) => {
			const player = allPlayers[playerId];
			if (player) {
				mappedPlayers[playerId] = player;
			} else {
				console.warn(`Player with ID ${playerId} not found in allPlayers.`);
			}
		});

		return mappedPlayers;
	}
}
