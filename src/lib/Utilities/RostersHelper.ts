import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { IsPlayersLoaded, LoadPlayers, PlayersStore } from '$lib/Stores/PlayerStores';
import { get } from 'svelte/store';
import type { RosterPageDto } from './Dtos/RosterPageDto';

export class RostersHelper {
	public static async GetAllRosters(): Promise<RosterPageDto[]> {
		let leagueId: string = import.meta.env.VITE_LEAGUE_ID;

		let rosters: Roster[] = await SleeperClient.GetRosters(leagueId);
		let players: Record<string, Player> | null = null;
		let users = await SleeperClient.GetLeagueUsers(leagueId);

		if (!IsPlayersLoaded()) {
			await LoadPlayers();
		}

		players = get(PlayersStore) ?? {};

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
