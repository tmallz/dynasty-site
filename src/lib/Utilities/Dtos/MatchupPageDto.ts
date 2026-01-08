import type { Player } from '$lib/api/dtos/PlayerDtos/Player';

export interface MatchupPageDto {
	MatchupId?: number;
	RosterId?: number;
	TeamName?: string;
	Starters?: Record<string, Player>;
	Score?: number;
	AvatarUrl?: string;
}
