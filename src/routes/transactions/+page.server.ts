import type { PageServerLoad } from './$types';
import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';

export const load: PageServerLoad = async () => {
	// Load only the first 50 transactions for faster initial page load
	const transactions = await TransactionsHelper.GetRecentTransactions(50);

	return {
		transactions
	};
};
