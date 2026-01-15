import type { PageServerLoad } from './$types';
import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';

export const load: PageServerLoad = async () => {
	// Stream transactions data to client for instant page load
	const transactionsPromise = TransactionsHelper.GetRecentTransactions(50);

	return {
		streamed: {
			transactions: transactionsPromise
		}
	};
};
