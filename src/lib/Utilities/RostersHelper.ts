import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
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
		let avatarId = users.find((u) => u.user_id === roster.owner_id)?.avatar || '';
		pageRoster.OwnerId = roster.owner_id;
		pageRoster.AvatarUrl = avatarId
			? `https://sleepercdn.com/avatars/${avatarId}`
			: 'https://via.placeholder.com/50';
		pageRoster.TeamName = RostersHelper.GetTeamName(roster, users);
		pageRoster.Starters = RostersHelper.MapPlayerNames(players, roster.starters);
		pageRoster.Bench = RostersHelper.MapPlayerNames(
			players,
			roster.players.filter((p) => !roster.starters.includes(p))
		); //filter out starters

		return pageRoster;
	}

	public static MapPlayerNames(
		allPlayers: Record<string, Player>,
		rosterPlayers: string[]
	): Record<string, Player>;
	public static MapPlayerNames(
		allPlayers: Record<string, Player>,
		rosterPlayer: string
	): Player | null;

	// Implementation
	public static MapPlayerNames(
		allPlayers: Record<string, Player>,
		rosterPlayersOrPlayer: string[] | string
	): Record<string, Player> | Player | null {
		if (Array.isArray(rosterPlayersOrPlayer)) {
			// Handle the array case by looping over the array and calling the single-player version
			let mappedPlayers: Record<string, Player> = {};

			rosterPlayersOrPlayer.forEach((playerId) => {
				const player = RostersHelper.MapPlayerNames(allPlayers, playerId) as Player;
				if (player) {
					player.playerAvatarUrl = `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`;
					player.playerTeamAvatarUrl = `https://sleepercdn.com/images/team_logos/nfl/${player.team?.toLowerCase()}.png`;
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

	private static GetTeamName(roster: Roster, users: LeagueUser[]): string {
		let teamName = users.find((u) => u.user_id === roster.owner_id)?.metadata?.team_name;

		if (teamName === undefined || teamName === null || teamName === '') {
			teamName = 'Team ' + users.find((u) => u.user_id === roster.owner_id)?.display_name;
		}

		return teamName;
	}
}
