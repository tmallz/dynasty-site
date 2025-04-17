import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
import { UsersStore } from '$lib/Stores/UserStores';
import { get } from 'svelte/store';
import { StoresHelper } from './StoresHelper';
import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster';
import type { League } from '$lib/api/dtos/LeagueDtos/League';

export class AvatarHelper {
	public static async GetUserAvatarUrl(roster: Roster): Promise<string> {
		await StoresHelper.EnsureStoresLoaded();
		let users = get(UsersStore) ?? [];
		let avatarId = users.find((u) => u.user_id === roster.owner_id)?.avatar || '';
		return `https://sleepercdn.com/avatars/${avatarId}`;
	}

	public static GetPlayerAvatarUrl(PlayerId: string): string {
		return `https://sleepercdn.com/content/nfl/players/${PlayerId}.jpg`;
	}

	public static GetPlayerTeamAvatarUrl(team: string): string {
		return `https://sleepercdn.com/images/team_logos/nfl/${team.toLowerCase()}.png`;
	}

	public static GetLeagueAvatarUrl(league: League): string {
		return `https://sleepercdn.com/avatars/${league.avatar}`;
	}
}
