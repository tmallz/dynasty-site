export interface Player {
	player_id: string;
	first_name: string;
	last_name: string;
	position: string;
	team: string | null;
	age: number | null;
	height: string | null;
	weight: string | null;
	college: string | null;
	status: string;
	fantasy_positions: string[];
	depth_chart_position: number | null;
	depth_chart_order: number | null;
	practice_participation: string | null;
	injury_status: string | null;
	injury_start_date: string | null;
	search_full_name: string;
	search_first_name: string;
	search_last_name: string;
	years_exp: number | null;
	birth_country: string | null;
	rotoworld_id: number | null;
	espn_id: string | null;
	yahoo_id: string | null;
}
