import type { TransactionType } from '$lib/api/Enums/TransactionType';

export interface TransactionsPageDto {
	TransactionType?: TransactionType;
	TransactionDate?: string;
	WaiverFreeAgent?: WaiverFreeAgentDto;
	Trade?: tradeDto;
}

interface WaiverFreeAgentDto {
	UserName?: string;
	Adds?: TradedPlayerDto[]; //player name
	Drops?: TradedPlayerDto[]; //player name
	InitiatorAvatarUrl?: string;
}

interface tradeDto {
	InitiatorName?: string;
	RecieverName?: string;
	InitiatorPlayersRecieved?: TradedPlayerDto[];
	RecieverPlayersRecieved?: TradedPlayerDto[];
	InitiatorDraftPicks?: TradedPickDto[];
	RecieverDraftPicks?: TradedPickDto[];
	InitiatorAvatarUrl?: string;
	RecieverAvatarUrl?: string;
}

export interface TradedPlayerDto {
	PlayerName?: string;
	PlayerId?: string;
	PlayerPosition?: string;
	PlayerTeam?: string;
}

export interface TradedPickDto {
	Year?: number; //year of the pick
	Round?: number; //round of the pick
}
