import type { DraftMetadata } from './DraftMetaData';
import type { DraftSettings } from './DraftSettings';

export interface DraftDetail {
	type: string;
	status: string;
	start_time: number;
	sport: string;
	settings: DraftSettings;
	season_type: string;
	season: string;
	metadata: DraftMetadata;
	league_id: string;
	last_picked: number;
	last_message_time: number;
	last_message_id: string;
	draft_order: Record<string, number> | null;
	slot_to_roster_id: Record<string, number> | null;
	draft_id: string;
	creators: string[] | null;
	created: number;
}
