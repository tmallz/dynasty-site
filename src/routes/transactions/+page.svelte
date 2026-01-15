<script lang="ts">
	import type { PageData } from './$types';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';
	import { TransactionType } from '$lib/api/Enums/TransactionType';
	import TradeTransaction from '$lib/Components/transactions/TradeTransaction.svelte';
	import WaiverTransaction from '$lib/Components/transactions/WaiverTransaction.svelte';

	export let data: PageData;
	let transactions: TransactionsPageDto[] = [];
	let offset = 50;
	let loading = false;
	let hasMore = true;
	let isLoading = true;
	let filterType: 'all' | 'trades' | 'waivers' = 'all';

	// Handle streamed data
	$: if (data.streamed?.transactions) {
		data.streamed.transactions.then((result: TransactionsPageDto[]) => {
			transactions = result ?? [];
			isLoading = false;
		});
	}

	// Filter transactions based on selected type
	$: filteredTransactions = transactions.filter(transaction => {
		if (filterType === 'all') {
			return true;
		} else if (filterType === 'trades') {
			return transaction.TransactionType === TransactionType.Trade;
		} else if (filterType === 'waivers') {
			return transaction.TransactionType === TransactionType.Waiver || 
			       transaction.TransactionType === TransactionType.FreeAgent;
		}
		return true;
	});

	async function loadMore() {
		if (loading) return;
		
		loading = true;
		try {
			const response = await fetch(`/api/transactions?limit=50&offset=${offset}`);
			const newTransactions: TransactionsPageDto[] = await response.json();
			
			if (newTransactions.length < 50) {
				hasMore = false;
			}
			
			if (newTransactions.length > 0) {
				transactions = [...transactions, ...newTransactions];
				offset += newTransactions.length;
			} else {
				hasMore = false;
			}
		} catch (error) {
			console.error('Failed to load more transactions:', error);
		} finally {
			loading = false;
		}
	}
</script>

<main class="container mx-auto px-4 py-8 max-w-5xl">
	<!-- Page Header -->
	<div class="mb-8 text-center">
		<h1 class="text-4xl font-bold mb-2">Transactions</h1>
		<p class="text-base-content/70">Recent trades, waivers, and free agent pickups</p>
	</div>

	<!-- Filter Dropdown -->
	<div class="mb-6 flex justify-center">
		<div class="form-control w-full max-w-xs">
			<label class="label" for="transaction-filter">
				<span class="label-text font-semibold">Filter by type</span>
			</label>
			<select 
				id="transaction-filter"
				class="select select-bordered w-full"
				bind:value={filterType}
			>
				<option value="all">All Transactions</option>
				<option value="trades">Trades Only</option>
				<option value="waivers">Waivers & Free Agents</option>
			</select>
		</div>
	</div>

	{#if isLoading}
		<!-- Loading State -->
		<div class="flex flex-col items-center justify-center py-20">
			<span class="loading loading-spinner loading-lg text-primary mb-4"></span>
			<p class="text-lg font-semibold">Loading transactions...</p>
			<p class="text-sm text-base-content/70 mt-2">This may take a few seconds</p>
		</div>
	{:else if transactions && transactions.length > 0}
		<div class="space-y-6">
			{#each filteredTransactions as transaction}
				{#if transaction.TransactionType === TransactionType.Trade}
					<TradeTransaction {transaction} />
				{/if}
				{#if transaction.TransactionType === TransactionType.Waiver || transaction.TransactionType === TransactionType.FreeAgent}
					<WaiverTransaction {transaction} />
				{/if}
			{/each}
		</div>

		{#if filteredTransactions.length === 0}
			<div class="text-center py-12">
				<p class="text-base-content/70 text-lg">No {filterType === 'trades' ? 'trades' : filterType === 'waivers' ? 'waivers or free agent pickups' : 'transactions'} found</p>
			</div>
		{/if}

		<!-- Load More Button -->
		{#if hasMore}
			<div class="flex justify-center mt-8">
				<button
					on:click={loadMore}
					disabled={loading}
					class="btn btn-primary btn-lg"
				>
					{#if loading}
						<span class="loading loading-spinner"></span>
						Loading...
					{:else}
						Load More Transactions
					{/if}
				</button>
			</div>
		{:else}
			<div class="text-center mt-8 text-base-content/50">
				<p>No more transactions to load</p>
			</div>
		{/if}
	{:else}
		<div class="text-center py-12">
			<p class="text-base-content/70 text-lg">No transactions found</p>
		</div>
	{/if}
</main>
