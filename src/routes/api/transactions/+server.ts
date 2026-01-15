import { json } from '@sveltejs/kit';
import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const limit = Number(url.searchParams.get('limit')) || 50;
	const offset = Number(url.searchParams.get('offset')) || 0;

	try {
		const transactions = await TransactionsHelper.GetRecentTransactions(limit, offset);
		return json(transactions);
	} catch (error) {
		console.error('Failed to fetch transactions:', error);
		return json({ error: 'Failed to fetch transactions' }, { status: 500 });
	}
};
