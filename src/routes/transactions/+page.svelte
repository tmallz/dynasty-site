<script lang="ts">
	import type { PageData } from './$types';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';
	import { TransactionType } from '$lib/api/Enums/TransactionType';
	import TradeTransaction from '$lib/Components/transactions/TradeTransaction.svelte';
	import WaiverTransaction from '$lib/Components/transactions/WaiverTransaction.svelte';

	export let data: PageData;
	const transactions: TransactionsPageDto[] = data.transactions ?? [];
</script>

<main>
	{#if transactions && transactions.length > 0}
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
