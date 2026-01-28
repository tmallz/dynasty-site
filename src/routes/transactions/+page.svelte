<script lang="ts">
	import type { PageData } from './$types';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';
	import { TransactionType } from '$lib/api/Enums/TransactionType';
	import TradeTransaction from '$lib/Components/transactions/TradeTransaction.svelte';
	import WaiverTransaction from '$lib/Components/transactions/WaiverTransaction.svelte';
	import TransactionsSkeleton from '$lib/Components/transactions/TransactionsSkeleton.svelte';
	import TransactionSummaryStats from '$lib/Components/transactions/TransactionSummaryStats.svelte';
	import { page } from '$app/stores';

	export let data: PageData;
	let offset = 50;
	let loading = false;
	let hasMore = true;
	let additionalTransactions: TransactionsPageDto[] = [];
	let baseTransactions: TransactionsPageDto[] = [];
	let isLoading = true;

	// Initialize filter from URL query param
	function getInitialFilter(): 'all' | 'trades' | 'waivers' {
		const param = $page.url.searchParams.get('filter');
		if (param === 'trades' || param === 'waivers') return param;
		return 'all';
	}
	let filterType: 'all' | 'trades' | 'waivers' = getInitialFilter();

	// Handle streamed data
	$: if (data.streamed?.transactions) {
		data.streamed.transactions
			.then((result: TransactionsPageDto[]) => {
				baseTransactions = result ?? [];
				isLoading = false;
			})
			.catch((error: Error) => {
				console.error('Failed to load transactions:', error);
				isLoading = false;
			});
	}

	// All transactions (base + additional loaded)
	$: allTransactions = [...baseTransactions, ...additionalTransactions];

	// Reactively filter transactions based on filterType
	$: filteredTransactions = allTransactions.filter((transaction) => {
		if (filterType === 'all') {
			return true;
		} else if (filterType === 'trades') {
			return transaction.TransactionType === TransactionType.Trade;
		} else if (filterType === 'waivers') {
			return (
				transaction.TransactionType === TransactionType.Waiver ||
				transaction.TransactionType === TransactionType.FreeAgent
			);
		}
		return true;
	});

	// Reactively group by week (only weeks with matching transactions will appear)
	$: sortedWeekGroups = (() => {
		const groups = filteredTransactions.reduce(
			(acc, transaction) => {
				const season = transaction.Season ?? 'Unknown';
				const week = transaction.Week ?? 0;
				const key = `${season} Week ${week}`;
				if (!acc[key]) {
					acc[key] = { season, week, transactions: [] };
				}
				acc[key].transactions.push(transaction);
				return acc;
			},
			{} as Record<string, { season: string; week: number; transactions: TransactionsPageDto[] }>
		);

		// Sort by season (desc) then week (desc)
		return Object.entries(groups).sort((a, b) => {
			const seasonDiff = parseInt(b[1].season) - parseInt(a[1].season);
			if (seasonDiff !== 0) return seasonDiff;
			return b[1].week - a[1].week;
		});
	})();

	function getCardAnimationDelay(groupIndex: number, cardIndex: number): number {
		const baseDelay = 150 + groupIndex * 50;
		const cardDelay = Math.min(cardIndex * 50, 300);
		return baseDelay + cardDelay;
	}

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
				additionalTransactions = [...additionalTransactions, ...newTransactions];
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

<main class="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
	<!-- Page Header -->
	<div class="mb-6 md:mb-8 text-center fade-in">
		<h1 class="text-3xl md:text-4xl font-bold mb-2">Transactions</h1>
		<p class="text-sm md:text-base text-base-content/70">
			Recent trades, waivers, and free agent pickups
		</p>
	</div>

	{#if isLoading}
		<!-- Skeleton Loading State -->
		<TransactionsSkeleton />
	{:else if allTransactions.length > 0}
		<!-- Summary Stats -->
		<TransactionSummaryStats transactions={allTransactions} />

		<!-- Segmented Filter Tabs -->
		<div class="flex justify-center mb-6 md:mb-8 fade-in" style="animation-delay: 100ms;">
			<div class="join">
				<button
					class="join-item btn btn-sm md:btn-md {filterType === 'all'
						? 'btn-primary'
						: 'btn-ghost'}"
					on:click={() => (filterType = 'all')}
				>
					All
				</button>
				<button
					class="join-item btn btn-sm md:btn-md {filterType === 'trades'
						? 'btn-primary'
						: 'btn-ghost'}"
					on:click={() => (filterType = 'trades')}
				>
					Trades
				</button>
				<button
					class="join-item btn btn-sm md:btn-md {filterType === 'waivers'
						? 'btn-primary'
						: 'btn-ghost'}"
					on:click={() => (filterType = 'waivers')}
				>
					Waivers
				</button>
			</div>
		</div>

		{#if filteredTransactions.length === 0}
			<div class="text-center py-12">
				<p class="text-base-content/70 text-lg">
					No {filterType === 'trades'
						? 'trades'
						: filterType === 'waivers'
							? 'waivers or free agent pickups'
							: 'transactions'} found
				</p>
			</div>
		{:else}
			<!-- Week-Grouped Transactions -->
			<div class="space-y-6 md:space-y-8">
				{#each sortedWeekGroups as [groupKey, group], groupIndex (groupKey)}
					<div class="fade-in" style="animation-delay: {150 + groupIndex * 50}ms;">
						<!-- Sticky Week Header -->
						<div
							class="sticky top-0 z-10 bg-base-100/80 backdrop-blur-sm py-2 mb-3 md:mb-4 -mx-4 px-4"
						>
							<h2 class="text-base md:text-lg font-semibold text-base-content/80">
								{group.season} Week {group.week}
							</h2>
						</div>

						<!-- Transactions in this week -->
						<div class="space-y-4 md:space-y-6">
							{#each group.transactions as transaction, cardIndex}
								{#if transaction.TransactionType === TransactionType.Trade}
									<TradeTransaction
										{transaction}
										animationDelay={getCardAnimationDelay(groupIndex, cardIndex)}
									/>
								{:else if transaction.TransactionType === TransactionType.Waiver || transaction.TransactionType === TransactionType.FreeAgent}
									<WaiverTransaction
										{transaction}
										animationDelay={getCardAnimationDelay(groupIndex, cardIndex)}
									/>
								{/if}
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Load More Button -->
		{#if hasMore}
			<div class="flex justify-center mt-6 md:mt-8">
				<button
					on:click={loadMore}
					disabled={loading}
					class="btn btn-primary btn-md md:btn-lg"
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
			<div class="text-center mt-6 md:mt-8 text-base-content/50">
				<p>No more transactions to load</p>
			</div>
		{/if}
	{:else}
		<div class="text-center py-12">
			<p class="text-base-content/70 text-lg">No transactions found</p>
		</div>
	{/if}
</main>

<style>
	.fade-in {
		animation: fade-in 0.4s ease-out forwards;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
