import type { TransactionStatus } from '$lib/api/Enums/TransactionStatus';
import type { TransactionType } from '$lib/api/Enums/TransactionType';
import type { DraftPick } from './DraftPick';
import type { WaiverBudget } from './WaiverBudget';

export interface Transaction {
	type: TransactionType;
	transaction_id: string;
	status_updated: number;
	status: TransactionStatus;
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
