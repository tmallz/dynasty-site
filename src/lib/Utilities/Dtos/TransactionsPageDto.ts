import type { TransactionType } from '$lib/api/Enums/TransactionType';

export interface TransactionsPageDto {
	TransactionType?: TransactionType;
	UserName?: string;
	PlayerName?: string;
	TransactionDate?: string;
	Adds?: string; //player name
	Drops?: string; //player name
}
