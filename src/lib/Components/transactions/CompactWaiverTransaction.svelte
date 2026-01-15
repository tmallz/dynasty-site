<script lang="ts">
	export let transaction;

	const isWaiver = transaction.TransactionType === 1;
	const isFreeAgent = transaction.TransactionType === 2;
</script>

<!-- Compact Waiver Card for Homepage -->
<div class="card bg-base-300 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4">
	<div class="card-body p-4">
		<!-- Header -->
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center gap-2">
				<img
					src={`https://sleepercdn.com/avatars/${transaction.WaiverFreeAgent?.InitiatorAvatarUrl}`}
					alt={transaction.WaiverFreeAgent?.UserName}
					class="w-6 h-6 rounded-full"
				/>
				<p class="text-xs font-semibold truncate">{transaction.WaiverFreeAgent?.UserName}</p>
			</div>
			<div class="flex gap-1">
				{#if isWaiver}
					<div class="badge badge-info badge-xs">📋 Waiver</div>
				{:else if isFreeAgent}
					<div class="badge badge-accent badge-xs">🆓 Free Agent</div>
				{/if}
			</div>
		</div>

		<!-- Adds and Drops -->
		<div class="grid grid-cols-2 gap-2">
			<!-- Adds -->
			<div>
				<p class="text-xs font-semibold text-success mb-1">Added</p>
				<div class="space-y-1">
					{#if transaction.WaiverFreeAgent?.Adds && transaction.WaiverFreeAgent.Adds.length > 0}
						{#each transaction.WaiverFreeAgent.Adds as player}
							<p class="text-xs bg-success/10 rounded px-2 py-1">{player.PlayerName}</p>
						{/each}
					{:else}
						<p class="text-xs text-base-content/50 italic">None</p>
					{/if}
				</div>
			</div>

			<!-- Drops -->
			<div>
				<p class="text-xs font-semibold text-error mb-1">Dropped</p>
				<div class="space-y-1">
					{#if transaction.WaiverFreeAgent?.Drops && transaction.WaiverFreeAgent.Drops.length > 0}
						{#each transaction.WaiverFreeAgent.Drops as player}
							<p class="text-xs bg-error/10 rounded px-2 py-1">{player.PlayerName}</p>
						{/each}
					{:else}
						<p class="text-xs text-base-content/50 italic">None</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Date -->
		<div class="text-xs text-center text-base-content/50 mt-2">
			{transaction.TransactionDate}
		</div>
	</div>
</div>
