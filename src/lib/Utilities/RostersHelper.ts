import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import type { RosterPageDto } from './Dtos/RosterPageDto';

export class RostersHelper {
	public static async GetAllRosters(): Promise<RosterPageDto[]> {
		let LeagueId: string = import.meta.env.VITE_LEAGUE_ID;

		let rosters: Roster[] = await SleeperClient.GetRosters(LeagueId);
		let players = await SleeperClient.GetAllPlayers();
		let users = await SleeperClient.GetLeagueUsers(LeagueId);

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

	private static MapPlayerName(
		allPLayers: Record<string, Player>,
		rosterPlayers: string[]
	): Record<string, Player> {
		let players: Record<string, Player> = {};
		rosterPlayers.forEach((p) => {
			let player = allPLayers[p];
			let name: string = player.first_name + ' ' + player.last_name;
			players[name] = player;
		});

		return players;
	}
}
