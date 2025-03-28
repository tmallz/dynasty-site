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
	InitiatorName?: string;
	RecieverName?: string;
	InitiatorPlayersRecieved?: string[];
	RecieverPlayersRecieved?: string[];
	InitiatorDraftPicks?: number[]; //round number
	RecieverDraftPicks?: number[]; //round number
}
