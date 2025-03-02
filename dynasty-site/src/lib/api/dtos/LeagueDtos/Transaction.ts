import type { DraftPick } from './DraftPick';
import type { WaiverBudget } from './WaiverBudget';

export interface Transaction {
	type: 'trade' | 'waiver' | 'free_agent';
	transaction_id: string;
	status_updated: number;
	status: 'complete' | 'pending' | 'failed';
	settings?: { waiver_bid?: number } | null;
	roster_ids: number[];
	metadata?: Record<string, unknown> | null;
	leg: number; // Week of the transaction
	drops?: Record<string, number> | null; // player_id -> roster_id
	adds?: Record<string, number> | null; // player_id -> roster_id
	draft_picks: DraftPick[];
	creator: string; // user_id of initiator
	created: number;
	consenter_ids: number[]; // roster_ids who agreed
	waiver_budget: WaiverBudget[];
}
