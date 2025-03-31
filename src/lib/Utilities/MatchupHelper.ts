import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import type { Matchup } from '$lib/api/dtos/LeagueDtos/Matchup';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import { IsPlayersLoaded, LoadPlayers, PlayersStore } from '$lib/Stores/PlayerStore';
import { get } from 'svelte/store';
import type { MatchupPageDto } from './Dtos/MatchupPageDto';
import { RostersHelper } from './RostersHelper';
import { IsRostersLoaded, LoadRosters, RostersStore } from '$lib/Stores/RosterStore';
import { IsUsersLoaded, LoadUsers, UsersStore } from '$lib/Stores/UserStores';
import { StoresHelper } from './StoresHelper';

export class MatchupHelper {
	public static async GetPageMatchups(): Promise<MatchupPageDto[]> {
		let leagueId = import.meta.env.VITE_LEAGUE_ID;
		let week: number = 1;
		let matchups: Matchup[] = [];
		let rosters: Roster[] = [];
		let players: Record<string, Player> | null = null;
		let users: LeagueUser[] = [];

		let nflState = await SleeperClient.GetSportState();
		if (nflState.season_type == 'regular') {
			week = nflState.display_week;
		} else if (nflState.season_type == 'post') {
			week = 18;
		}

		// Ensure stores are loaded before accessing them
		await StoresHelper.EnsureStoresLoaded();
		players = get(PlayersStore) ?? {};
		rosters = get(RostersStore) ?? [];
		users = get(UsersStore) ?? [];

		matchups = await SleeperClient.GetMatchups(leagueId, week);

		let pageMatchups: MatchupPageDto[] = [];

		matchups.forEach((m) => {
			let currentRoster = rosters.find((r) => r.roster_id === m.roster_id) ?? ({} as Roster);
			let pageMatchup = MatchupHelper.MapMatchupToPageDto(m, currentRoster, players, users);
			pageMatchups.push(pageMatchup);
		});

		return pageMatchups;
	}

	private static MapMatchupToPageDto(
		matchup: Matchup,
		roster: Roster,
		players: Record<string, Player>,
		users: LeagueUser[]
	): MatchupPageDto {
		let pageMatchup: MatchupPageDto = {};
		let avatarId = users.find((u) => u.user_id === roster.owner_id)?.avatar || '';
		pageMatchup.MatchupId = matchup.matchup_id;
		pageMatchup.TeamName = users.find((u) => u.user_id === roster.owner_id)?.display_name ?? '';
		pageMatchup.Starters = RostersHelper.MapPlayerNames(players, roster.starters);
		pageMatchup.Score = matchup.points;
		pageMatchup.AvatarUrl = avatarId
			? `https://sleepercdn.com/avatars/${avatarId}`
			: 'https://via.placeholder.com/50';
		return pageMatchup;
	}
}
