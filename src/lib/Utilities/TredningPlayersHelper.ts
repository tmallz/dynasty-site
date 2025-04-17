import type { TrendingPlayer } from '$lib/api/dtos/PlayerDtos/TrendingPlayer';
import { SleeperClient } from '$lib/api/services/SleeperClient';
import type { TrendingPlayerPageDto } from './Dtos/TrendingPlayerPageDto';
import { PlayersHelper } from './PlayersHelper';
import type { Player } from '$lib/api/dtos/PlayerDtos/Player';

export class TrendingPlayersHelper {
	// Generic method to fetch trending players (up or down)
	private static async GetTrendingPlayers(type: 'add' | 'drop'): Promise<TrendingPlayerPageDto[]> {
		const trendingPlayers: TrendingPlayer[] = await SleeperClient.GetTrendingPlayers(
			'nfl',
			type,
			24,
			10
		);

		// Map each trending player to a DTO
		return Promise.all(
			trendingPlayers.map((player) => TrendingPlayersHelper.MapTrendingPlayerToDto(player))
		);
	}

	// Public method to get trending up players
	public static async GetTrendingUpPlayers(): Promise<TrendingPlayerPageDto[]> {
		return this.GetTrendingPlayers('add');
	}

	// Public method to get trending down players
	public static async GetTrendingDownPlayers(): Promise<TrendingPlayerPageDto[]> {
		return this.GetTrendingPlayers('drop');
	}

	// Maps a trending player to a DTO
	private static async MapTrendingPlayerToDto(
		trendingPlayer: TrendingPlayer
	): Promise<TrendingPlayerPageDto> {
		const player: Player | null = await PlayersHelper.GetPlayerFromId(trendingPlayer.player_id);

		return {
			playerName: `${player?.first_name ?? ''} ${player?.last_name ?? ''}`.trim(),
			playerId: player?.player_id,
			playerPosition: player?.position,
			playerTeam: player?.team ?? undefined,
			timesWaived: trendingPlayer.count
		};
	}
}
