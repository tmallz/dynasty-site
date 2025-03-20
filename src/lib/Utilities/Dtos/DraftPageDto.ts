export interface DraftPageDto {
	DraftId?: string;
	Season?: string;
	DraftPagePicks?: DraftPagePicks[];
}

export interface DraftPagePicks {
	round: number;
	draft_slot: number;
	owner: string;
	previousOwner?: string;
	PlayerName?: string;
	PlayerPosition?: string;
	PlayerTeam?: string;
}
