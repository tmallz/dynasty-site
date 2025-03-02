export interface TradedPick {
	season: string; // The season the pick is for
	round: number; // Round of the draft
	roster_id: number; // Roster ID of original owner
	previous_owner_id: number; // Roster ID of previous owner
	owner_id: number; // Roster ID of current owner
}
