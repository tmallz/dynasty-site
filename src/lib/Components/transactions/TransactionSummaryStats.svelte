<script lang="ts">
	import { TransactionType } from '$lib/api/Enums/TransactionType';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';

	export let transactions: TransactionsPageDto[] = [];

	// Calculate summary statistics
	$: tradeCount = transactions.filter(
		(t) => t.TransactionType === TransactionType.Trade
	).length;

	$: waiverCount = transactions.filter(
		(t) =>
			t.TransactionType === TransactionType.Waiver ||
			t.TransactionType === TransactionType.FreeAgent
	).length;

	// Find the most active trader
	$: mostActiveTrader = (() => {
		const userCounts: Record<string, { name: string; count: number; avatarUrl?: string }> = {};

		transactions.forEach((t) => {
			if (t.TransactionType === TransactionType.Trade && t.Trade) {
				// Count initiator
				const initiator = t.Trade.InitiatorName ?? 'Unknown';
				if (!userCounts[initiator]) {
					userCounts[initiator] = {
						name: initiator,
						count: 0,
						avatarUrl: t.Trade.InitiatorAvatarUrl
					};
				}
				userCounts[initiator].count++;

				// Count receiver
				const receiver = t.Trade.RecieverName ?? 'Unknown';
				if (!userCounts[receiver]) {
					userCounts[receiver] = {
						name: receiver,
						count: 0,
						avatarUrl: t.Trade.RecieverAvatarUrl
					};
				}
				userCounts[receiver].count++;
			} else if (t.WaiverFreeAgent) {
				const user = t.WaiverFreeAgent.UserName ?? 'Unknown';
				if (!userCounts[user]) {
					userCounts[user] = {
						name: user,
						count: 0,
						avatarUrl: t.WaiverFreeAgent.InitiatorAvatarUrl
					};
				}
				userCounts[user].count++;
			}
		});

		const sorted = Object.values(userCounts).sort((a, b) => b.count - a.count);
		return sorted[0] ?? null;
	})();

	// Get current season
	$: currentSeason = transactions[0]?.Season ?? new Date().getFullYear().toString();

	let avatarFailed = false;

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
	<!-- Total Trades -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150 fade-in" style="animation-delay: 50ms;"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				<div
					class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg md:text-xl"
				>
					<span class="hidden md:inline">&#x1F91D;</span>
					<span class="inline md:hidden text-sm">&#x1F91D;</span>
				</div>
				<div>
					<p class="text-xs md:text-sm text-base-content/70">Trades</p>
					<p class="text-xl md:text-2xl font-bold">{tradeCount}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Total Waivers/FA -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150 fade-in" style="animation-delay: 100ms;"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				<div
					class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-info/20 flex items-center justify-center text-info text-lg md:text-xl"
				>
					<span class="hidden md:inline">&#x1F4CB;</span>
					<span class="inline md:hidden text-sm">&#x1F4CB;</span>
				</div>
				<div>
					<p class="text-xs md:text-sm text-base-content/70">Waivers</p>
					<p class="text-xl md:text-2xl font-bold">{waiverCount}</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Most Active Trader -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150 fade-in" style="animation-delay: 150ms;"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				{#if mostActiveTrader}
					{#if avatarFailed || !mostActiveTrader.avatarUrl}
						<div
							class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-accent flex items-center justify-center text-accent-content font-bold text-xs md:text-sm"
						>
							{getInitials(mostActiveTrader.name)}
						</div>
					{:else}
						<img
							src={`https://sleepercdn.com/avatars/${mostActiveTrader.avatarUrl}`}
							alt={mostActiveTrader.name}
							class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-base-300"
							on:error={() => (avatarFailed = true)}
						/>
					{/if}
					<div class="min-w-0">
						<p class="text-xs md:text-sm text-base-content/70 truncate">Most Active</p>
						<p class="text-sm md:text-lg font-bold truncate">{mostActiveTrader.name}</p>
					</div>
				{:else}
					<div
						class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-base-300 flex items-center justify-center text-base-content/50"
					>
						?
					</div>
					<div>
						<p class="text-xs md:text-sm text-base-content/70">Most Active</p>
						<p class="text-sm md:text-lg font-bold text-base-content/50">N/A</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Current Season -->
	<div
		class="card bg-base-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150 fade-in" style="animation-delay: 200ms;"
	>
		<div class="card-body p-3 md:p-4">
			<div class="flex items-center gap-2 md:gap-3">
				<div
					class="w-9 h-9 md:w-10 md:h-10 rounded-full bg-success/20 flex items-center justify-center text-success text-lg md:text-xl"
				>
					<span class="hidden md:inline">&#x1F3C8;</span>
					<span class="inline md:hidden text-sm">&#x1F3C8;</span>
				</div>
				<div>
					<p class="text-xs md:text-sm text-base-content/70">Season</p>
					<p class="text-xl md:text-2xl font-bold">{currentSeason}</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.fade-in {
		animation: fade-in 0.4s ease-out forwards;
		opacity: 0;
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
