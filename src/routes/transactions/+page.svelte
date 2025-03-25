<script lang="ts">
	import { onMount } from 'svelte';
	import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';

	let transactions: TransactionsPageDto[] = [];
	let LoadTransactions = async () => {
		try {
			transactions = await TransactionsHelper.GetAllTransactions();
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
			<div class="transaction-card mb-4 rounded-lg border p-4 shadow">
				<p><strong>Type:</strong> {transaction.TransactionType}</p>
				<p><strong>User:</strong> {transaction.UserName}</p>
				<p><strong>Date:</strong> {transaction.TransactionDate}</p>
				{#if transaction.Adds}
					<p><strong>Adds:</strong> {transaction.Adds}</p>
				{/if}
				{#if transaction.Drops}
					<p><strong>Drops:</strong> {transaction.Drops}</p>
				{/if}
			</div>
		{/each}
	{:else}
		<p>No transactions found</p>
	{/if}
</main>
