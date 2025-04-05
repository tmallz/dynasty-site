import type { TradedPick } from '$lib/api/dtos/LeagueDtos/TradedPick';
import type { DraftStatus } from '$lib/api/Enums/DraftStatus';

export interface DraftPageDto {
	DraftId?: string;
	Season?: string;
	DraftType?: string;
	DraftOrder?: Record<string, number>; //team name/roster id
	DraftStatus?: DraftStatus;
	DraftDate?: string;
	SlotToRosterMap?: Record<string, number>;
	DraftPagePicks?: DraftPagePicks[];
	TradedPicks?: DraftPageTradedPicks[];
}

export interface DraftPagePicks {
	round: number;
	draft_slot: number;
	owner: string;
	ownerId?: string;
	PlayerName?: string;
	PlayerPosition?: string;
	PlayerTeam?: string;
	playerId?: string;
	pickNumber?: number;
	rosterId?: string;
	isOriginalOwner?: boolean; // Indicates if the pick is from the original owner
}

export interface DraftPageTradedPicks {
	round?: number;
	currentOwner?: string;
	previousOwner?: string;
	rosterId?: number;
}
