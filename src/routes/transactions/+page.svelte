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
			<p>{transaction.TransactionType}</p>
			<p>{transaction.UserName}</p>
			<p>{transaction.TransactionDate}</p>
		{/each}
	{:else}
		<p>No transactions found</p>
	{/if}
</main>
