<script lang="ts">
	export let transaction;
</script>

<!-- Container for avatars and names -->
<div class="mx-auto mt-5 mb-4 flex max-w-4xl items-start justify-between">
	<!-- Initiator -->
	<div class="flex w-1/2 flex-col items-center">
		<img
			src={`https://sleepercdn.com/avatars/${transaction.WaiverFreeAgent?.InitiatorAvatarUrl}`}
			alt={transaction.WaiverFreeAgent?.UserName}
			class="h-12 w-12 rounded-full"
		/>
		<p class="mt-2 text-sm font-bold">{transaction.WaiverFreeAgent?.UserName}</p>
	</div>
</div>

<!-- Waiver Details Card -->
<div
	class="trade-transaction-card bg-base-200 mx-auto max-w-4xl rounded-lg border border-gray-700 p-6 shadow-lg"
>
	<!-- Adds's Side -->
	<div class="relative flex items-start justify-between">
		<div class="flex w-1/2 flex-col items-center">
			<!-- Players Added Header -->
			<h3 class="text-success mb-4 text-center text-lg font-bold">Players Added</h3>

			<div class="flex flex-col items-center space-y-4">
				{#if transaction.WaiverFreeAgent?.Adds}
					{#each transaction.WaiverFreeAgent?.Adds as player}
						<div class="flex flex-col items-center">
							<img
								src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
								alt={player.PlayerName}
								class="border-success h-12 w-12 rounded-full border"
							/>
							<div class="mt-2 text-center">
								<p class="text-success text-sm font-bold">{player.PlayerName}</p>
								<p class="text-success text-xs">{player.PlayerPosition} – {player.PlayerTeam}</p>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Drops's Side -->
		<div class="flex w-1/2 flex-col items-center">
			<!-- Players Dropped Header -->
			<h3 class="text-error dark:text-secondary mb-4 text-center text-lg font-bold">
				Players Dropped
			</h3>

			<div class="flex flex-col items-center space-y-4">
				{#if transaction.WaiverFreeAgent?.Drops}
					{#each transaction.WaiverFreeAgent?.Drops as player}
						<div class="flex flex-col items-center">
							<img
								src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
								alt={player.PlayerName}
								class="border-error dark:border-secondary h-12 w-12 rounded-full border"
							/>
							<div class="mt-2 text-center">
								<p class="text-error dark:text-secondary text-sm font-bold">{player.PlayerName}</p>
								<p class="text-error dark:text-secondary text-xs">
									{player.PlayerPosition} – {player.PlayerTeam}
								</p>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- Date -->
	<p class="mt-4 text-center text-xs">{transaction.TransactionDate}</p>
</div>
