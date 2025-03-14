// src/dtos/league.dto.ts

export interface League {
	total_rosters: number;
	status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
	sport: 'nfl';
	settings: object; // You can further define the structure if needed
	season_type: 'regular' | 'postseason';
	season: string;
	scoring_settings: object; // You can define the structure for this too
	roster_positions: Array<object>; // Define this structure as needed
	previous_league_id: string;
	name: string;
	league_id: string;
	draft_id: string;
	avatar: string;
}
