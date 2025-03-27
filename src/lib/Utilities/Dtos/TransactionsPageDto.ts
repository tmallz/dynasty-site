import type { TransactionType } from '$lib/api/Enums/TransactionType';

export interface TransactionsPageDto {
	TransactionType?: TransactionType;
	TransactionDate?: string;
	WaiverFreeAgent?: WaiverFreeAgentDto;
	Trade?: tradeDto;
}

interface WaiverFreeAgentDto {
	UserName?: string;
	Adds?: string[]; //player name
	Drops?: string[]; //player name
}

interface tradeDto {
	initiatorName?: string;
	recieverName?: string;
	intiatorPlayersRecieved?: string[];
	recieverPlayersRecieved?: string[];
	initiatorDraftPicks?: number[]; //round number
	recieverDraftPicks?: number[]; //round number
}
