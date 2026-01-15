<script lang="ts">
	import type { PageData } from './$types';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';
	import { TransactionType } from '$lib/api/Enums/TransactionType';
	import TradeTransaction from '$lib/Components/transactions/TradeTransaction.svelte';
	import WaiverTransaction from '$lib/Components/transactions/WaiverTransaction.svelte';

	export let data: PageData;
	const transactions: TransactionsPageDto[] = data.transactions ?? [];
</script>

<main class="container mx-auto px-4 py-8 max-w-5xl">
	<!-- Page Header -->
	<div class="mb-8 text-center">
		<h1 class="text-4xl font-bold mb-2">Transactions</h1>
		<p class="text-base-content/70">Recent trades, waivers, and free agent pickups</p>
	</div>

	{#if transactions && transactions.length > 0}
		<div class="space-y-6">
			{#each transactions as transaction}
				{#if transaction.TransactionType === TransactionType.Trade}
					<TradeTransaction {transaction} />
				{/if}
				{#if transaction.TransactionType === TransactionType.Waiver || transaction.TransactionType === TransactionType.FreeAgent}
					<WaiverTransaction {transaction} />
				{/if}
			{/each}
		</div>
	{:else}
		<div class="text-center py-12">
			<p class="text-base-content/70 text-lg">No transactions found</p>
		</div>
	{/if}
</main>
