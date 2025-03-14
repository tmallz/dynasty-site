export interface TransactionsPageDto {
	TransactionType: string;
	UserName: string;
	PlayerName?: string;
	TransactionDate: string;
	Adds: Record<string, number>;
	Drops: Record<string, number>;
}

interface WaiverTransaction {
	TransactionId: string; // for mapping
	Adds: Record<string, number>; // player_id -> roster_id
	Drops: Record<string, number>; // player_id -> roster_id
}

interface TradeTransaction {}
