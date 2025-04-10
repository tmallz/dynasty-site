<script lang="ts">
	import { onMount } from 'svelte';
	import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';
	import { TransactionType } from '$lib/api/Enums/TransactionType';
	import TradeTransaction from '$lib/Components/transactions/TradeTransaction.svelte';
	import WaiverTransaction from '$lib/Components/transactions/WaiverTransaction.svelte';

	let transactions: TransactionsPageDto[] = [];
	let LoadTransactions = async () => {
		try {
			transactions = await TransactionsHelper.GetAllTransactions();
			console.log('transactions on page:', transactions);
		} catch (error) {
			console.error(error);
		}
	};

	onMount(async () => {
		await LoadTransactions();
	});
</script>

<main>
	{#if transactions.length > 0}
		{#each transactions as transaction}
			{#if transaction.TransactionType === TransactionType.Trade}
				<TradeTransaction {transaction} />
			{/if}
			{#if transaction.TransactionType === TransactionType.Waiver || transaction.TransactionType === TransactionType.FreeAgent}
				<WaiverTransaction {transaction} />
			{/if}
		{/each}
	{:else}
		<p>No transactions found</p>
	{/if}
</main>
