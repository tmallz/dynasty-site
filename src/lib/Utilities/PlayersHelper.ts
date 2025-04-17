import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
import { PlayersStore } from '$lib/Stores/PlayerStore';
import { get } from 'svelte/store';

export class PlayersHelper {
	public static async GetPlayerFromId(playerId: string): Promise<Player | null> {
		let players: Record<string, Player> = {};
		players = get(PlayersStore);

		if (players && players[playerId]) {
			return players[playerId];
		}
		return null;
	}
}
