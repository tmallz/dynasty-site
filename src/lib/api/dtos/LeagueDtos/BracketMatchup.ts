export interface BracketMatchup {
	r: number; // Round number
	m: number; // Match ID
	t1?: number | { w: number }; // Team 1 (roster_id or reference to previous winner)
	t2?: number | { l: number }; // Team 2 (roster_id or reference to previous loser)
	w?: number; // Winner roster_id (if match is complete)
	l?: number; // Loser roster_id (if match is complete)
	t1_from?: { w?: number; l?: number }; // Where t1 comes from
	t2_from?: { w?: number; l?: number }; // Where t2 comes from
	p?: number; // Placement (for consolation bracket)
}
