<script lang="ts">
	import { onMount } from 'svelte';
	import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';
	import { TransactionType } from '$lib/api/Enums/TransactionType';

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
				<div class="transaction-card mb-4 rounded-lg border p-4 shadow">
					<p><strong>Type:</strong> {transaction.TransactionType}</p>
					<p><strong>Initiator:</strong> {transaction.Trade?.InitiatorName}</p>
					<p><strong>Receiver:</strong> {transaction.Trade?.RecieverName}</p>
					<p><strong>Date:</strong> {transaction.TransactionDate}</p>
					{#if transaction.Trade?.InitiatorPlayersRecieved}
						<p><strong>Player1:</strong> {transaction.Trade?.InitiatorPlayersRecieved}</p>
					{/if}
					{#if transaction.Trade?.InitiatorPlayersRecieved}
						<p><strong>Player2:</strong> {transaction.Trade?.RecieverPlayersRecieved}</p>
					{/if}
					{#if transaction.Trade?.InitiatorDraftPicks}
						<p><strong>Player1:</strong> {transaction.Trade?.InitiatorDraftPicks}</p>
					{/if}
					{#if transaction.Trade?.RecieverDraftPicks}
						<p><strong>Player2:</strong> {transaction.Trade?.RecieverDraftPicks}</p>
					{/if}
				</div>
			{/if}
		{/each}
	{:else}
		<p>No transactions found</p>
	{/if}

	{#if transactions.length > 0}
		{#each transactions as transaction}
			{#if transaction.TransactionType === TransactionType.Waiver}
				<div class="transaction-card mb-4 rounded-lg border p-4 shadow">
					<p><strong>Type:</strong> {transaction.TransactionType}</p>
					<p><strong>User:</strong> {transaction.WaiverFreeAgent?.UserName}</p>
					<p><strong>Date:</strong> {transaction.TransactionDate}</p>
					{#if transaction.WaiverFreeAgent?.Adds}
						<p><strong>Adds:</strong> {transaction.WaiverFreeAgent?.Adds}</p>
					{/if}
					{#if transaction.WaiverFreeAgent?.Adds}
						<p><strong>Drops:</strong> {transaction.WaiverFreeAgent?.Drops}</p>
					{/if}
				</div>
			{/if}
		{/each}
	{:else}
		<p>No transactions found</p>
	{/if}
</main>
