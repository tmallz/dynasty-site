<script lang="ts">
	export let transaction;
</script>

<!-- Compact Trade Card for Homepage -->
<div class="card bg-base-300 shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4">
	<div class="card-body p-4">
		<!-- Header with Trade Info -->
		<div class="flex items-center justify-between mb-3">
			<span class="badge badge-sm">🤝 Trade</span>
			<span class="text-xs text-base-content/50">{transaction.TransactionDate}</span>
		</div>

		<!-- Trade Participants Grid -->
		<div class="grid grid-cols-2 gap-3">
			<!-- Initiator -->
			<div>
				<div class="flex items-center gap-1 mb-2">
					<img
						src={`https://sleepercdn.com/avatars/${transaction.Trade?.InitiatorAvatarUrl}`}
						alt={transaction.Trade?.InitiatorName}
						class="w-5 h-5 rounded-full"
					/>
					<p class="text-xs font-semibold truncate">{transaction.Trade?.InitiatorName}</p>
				</div>
				<div class="space-y-1">
					{#if transaction.Trade?.InitiatorPlayersRecieved && transaction.Trade.InitiatorPlayersRecieved.length > 0}
						{#each transaction.Trade.InitiatorPlayersRecieved as player}
							<p class="text-xs bg-base-200 rounded px-2 py-1">{player.PlayerName}</p>
						{/each}
					{/if}
					{#if transaction.Trade?.InitiatorDraftPicks && transaction.Trade.InitiatorDraftPicks.length > 0}
						{#each transaction.Trade.InitiatorDraftPicks as pick}
							<p class="text-xs bg-base-200 rounded px-2 py-1">
								{pick.Year} Round {pick.Round}
							</p>
						{/each}
					{/if}
					{#if (!transaction.Trade?.InitiatorPlayersRecieved || transaction.Trade.InitiatorPlayersRecieved.length === 0) && (!transaction.Trade?.InitiatorDraftPicks || transaction.Trade.InitiatorDraftPicks.length === 0)}
						<p class="text-xs text-base-content/50 italic">Nothing</p>
					{/if}
				</div>
			</div>

			<!-- Receiver -->
			<div>
				<div class="flex items-center gap-1 mb-2">
					<img
						src={`https://sleepercdn.com/avatars/${transaction.Trade?.RecieverAvatarUrl}`}
						alt={transaction.Trade?.RecieverName}
						class="w-5 h-5 rounded-full"
					/>
					<p class="text-xs font-semibold truncate">{transaction.Trade?.RecieverName}</p>
				</div>
				<div class="space-y-1">
					{#if transaction.Trade?.RecieverPlayersRecieved && transaction.Trade.RecieverPlayersRecieved.length > 0}
						{#each transaction.Trade.RecieverPlayersRecieved as player}
							<p class="text-xs bg-base-200 rounded px-2 py-1">{player.PlayerName}</p>
						{/each}
					{/if}
					{#if transaction.Trade?.RecieverDraftPicks && transaction.Trade.RecieverDraftPicks.length > 0}
						{#each transaction.Trade.RecieverDraftPicks as pick}
							<p class="text-xs bg-base-200 rounded px-2 py-1">
								{pick.Year} Round {pick.Round}
							</p>
						{/each}
					{/if}
					{#if (!transaction.Trade?.RecieverPlayersRecieved || transaction.Trade.RecieverPlayersRecieved.length === 0) && (!transaction.Trade?.RecieverDraftPicks || transaction.Trade.RecieverDraftPicks.length === 0)}
						<p class="text-xs text-base-content/50 italic">Nothing</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
