<script lang="ts">
	import { onMount } from 'svelte';
	import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';
	import { TransactionType } from '$lib/api/Enums/TransactionType';

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
			{#if transaction.TransactionType === TransactionType.TRADE}
				<div class="transaction-card mb-4 rounded-lg border p-4 shadow">
					<p><strong>Type:</strong> {transaction.TransactionType}</p>
					<p><strong>Initiator:</strong> {transaction.Trade?.initiatorName}</p>
					<p><strong>Receiver:</strong> {transaction.Trade?.recieverName}</p>
					<p><strong>Date:</strong> {transaction.TransactionDate}</p>
					{#if transaction.Trade?.intiatorPlayersRecieved}
						<p><strong>Player1:</strong> {transaction.Trade?.intiatorPlayersRecieved}</p>
					{/if}
					{#if transaction.Trade?.intiatorPlayersRecieved}
						<p><strong>Player2:</strong> {transaction.Trade?.recieverPlayersRecieved}</p>
					{/if}
					{#if transaction.Trade?.initiatorDraftPicks}
						<p><strong>Player1:</strong> {transaction.Trade?.initiatorDraftPicks}</p>
					{/if}
					{#if transaction.Trade?.recieverDraftPicks}
						<p><strong>Player2:</strong> {transaction.Trade?.recieverDraftPicks}</p>
					{/if}
				</div>
			{/if}
		{/each}
	{:else}
		<p>No transactions found</p>
	{/if}

	{#if transactions.length > 0}
		{#each transactions as transaction}
			{#if transaction.TransactionType === TransactionType.WAIVER}
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
