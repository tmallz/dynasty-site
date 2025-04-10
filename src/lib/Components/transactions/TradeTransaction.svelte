<script lang="ts">
	export let transaction;

	// Helper function to format the round number with the appropriate suffix
	function formatRound(round: number): string {
		const suffixes = ['th', 'st', 'nd', 'rd'];
		const value = round % 100;
		return round + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
	}

	console.log('TradeTransaction:', transaction);
</script>

<!-- Container for avatars and names -->
<div class="mx-auto mt-5 mb-4 flex max-w-4xl items-start justify-between">
	<!-- Initiator -->
	<div class="flex w-1/2 flex-col items-center">
		<img
			src={`https://sleepercdn.com/avatars/${transaction.Trade?.InitiatorAvatarUrl}`}
			alt={transaction.Trade?.InitiatorName}
			class="h-12 w-12 rounded-full"
		/>
		<p class="mt-2 text-sm font-bold">{transaction.Trade?.InitiatorName}</p>
	</div>

	<!-- Receiver -->
	<div class="flex w-1/2 flex-col items-center">
		<img
			src={`https://sleepercdn.com/avatars/${transaction.Trade?.RecieverAvatarUrl}`}
			alt={transaction.Trade?.RecieverName}
			class="h-12 w-12 rounded-full"
		/>
		<p class="mt-2 text-sm font-bold">{transaction.Trade?.RecieverName}</p>
	</div>
</div>

<!-- Trade Details Card -->
<div
	class="trade-transaction-card bg-base-200 mx-auto max-w-4xl rounded-lg border border-gray-700 p-6 shadow-lg"
>
	<div class="relative flex items-start justify-between">
		<!-- Initiator's Side -->
		<div class="flex w-1/2 flex-col items-center">
			<!-- Initiator's Players and Picks -->
			<div class="flex flex-col items-center space-y-4">
				{#if transaction.Trade?.InitiatorPlayersRecieved}
					{#each transaction.Trade?.InitiatorPlayersRecieved as player}
						<div class="flex flex-col items-center">
							<img
								src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
								alt={player.PlayerName}
								class="h-12 w-12 rounded-full border border-gray-500"
							/>
							<div class="mt-2 text-center">
								<p class="text-sm font-bold">{player.PlayerName}</p>
								<p class="text-xs">{player.PlayerPosition} – {player.PlayerTeam}</p>
							</div>
						</div>
					{/each}
				{/if}
				{#if transaction.Trade?.InitiatorDraftPicks}
					{#each transaction.Trade?.InitiatorDraftPicks as pick}
						<div class="flex flex-col items-center">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-500 bg-green-500 text-white"
							>
								{formatRound(pick.Round)}
							</div>
							<p class="mt-2 text-sm">{pick.Year}</p>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Connecting Line -->
		<div class="mx-4 flex-1 border-t border-dashed"></div>

		<!-- Receiver's Side -->
		<div class="flex w-1/2 flex-col items-center">
			<!-- Receiver's Players and Picks -->
			<div class="flex flex-col items-center space-y-4">
				{#if transaction.Trade?.RecieverPlayersRecieved}
					{#each transaction.Trade?.RecieverPlayersRecieved as player}
						<div class="flex flex-col items-center">
							<img
								src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
								alt={player.PlayerName}
								class="h-12 w-12 rounded-full border border-gray-500"
							/>
							<div class="mt-2 text-center">
								<p class="text-sm font-bold">{player.PlayerName}</p>
								<p class="text-xs">{player.PlayerPosition} – {player.PlayerTeam}</p>
							</div>
						</div>
					{/each}
				{/if}
				{#if transaction.Trade?.RecieverDraftPicks}
					{#each transaction.Trade?.RecieverDraftPicks as pick}
						<div class="flex flex-col items-center">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-500 bg-green-500 text-white"
							>
								{formatRound(pick.Round)}
							</div>
							<p class="mt-2 text-sm">{pick.Year}</p>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- Date -->
	<p class="mt-4 text-center text-xs">{transaction.TransactionDate}</p>
</div>
