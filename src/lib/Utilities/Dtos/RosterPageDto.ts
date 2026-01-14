import type { Player } from '$lib/api/dtos/PlayerDtos/Player';

export interface RosterPageDto {
	roster_id: number;
	TeamName: string;
	OwnerId: string;
	AvatarUrl: string;
	Starters: Record<string, Player>; //key is player name
	Bench: Record<string, Player>; //key is player name
}
