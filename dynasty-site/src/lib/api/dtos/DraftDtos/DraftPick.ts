import type { DraftPickMetadata } from './DraftPickMetaData';

export interface DraftPick {
	player_id: string;
	picked_by: string;
	roster_id: string;
	round: number;
	draft_slot: number;
	pick_no: number;
	metadata: DraftPickMetadata;
	is_keeper: boolean | null;
	draft_id: string;
}
