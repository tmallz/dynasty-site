import type { PageServerLoad } from './$types';
import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';

export const load: PageServerLoad = async () => {
	const transactions = await TransactionsHelper.GetAllTransactionsAcrossLeagues();

	return {
		transactions
	};
};
