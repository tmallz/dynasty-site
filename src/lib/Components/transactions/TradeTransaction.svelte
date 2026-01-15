<script lang="ts">
	export let transaction;

	// Helper function to format the round number with the appropriate suffix
	function formatRound(round: number): string {
		const suffixes = ['th', 'st', 'nd', 'rd'];
		const value = round % 100;
		return round + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
	}
</script>

<!-- Trade Card with improved design -->
<div class="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
	<div class="card-body">
		<!-- Header with badges and date -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex gap-2">
				<div class="badge badge-primary badge-lg">🤝 Trade</div>
				{#if transaction.Week}
					<div class="badge badge-outline">Week {transaction.Week}</div>
				{/if}
			</div>
			<div class="text-sm text-base-content/70">{transaction.TransactionDate}</div>
		</div>

		<!-- Trade Participants -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
			<!-- Initiator's Side -->
			<div class="flex-1">
				<!-- User Info -->
				<div class="flex items-center gap-3 mb-4">
					<img
						src={`https://sleepercdn.com/avatars/${transaction.Trade?.InitiatorAvatarUrl}`}
						alt={transaction.Trade?.InitiatorName}
						class="w-10 h-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100"
					/>
					<span class="font-bold text-lg">{transaction.Trade?.InitiatorName}</span>
				</div>

				<!-- Received Items -->
				<div class="space-y-3">
					{#if transaction.Trade?.InitiatorPlayersRecieved}
						{#each transaction.Trade?.InitiatorPlayersRecieved as player}
							<div class="flex items-center gap-3 p-3 rounded-lg bg-base-300 hover:bg-base-100 transition-colors">
								<img
									src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
									alt={player.PlayerName}
									class="w-12 h-12 rounded-full ring-2 ring-success ring-offset-2 ring-offset-base-300"
								/>
								<div class="flex-1">
									<p class="font-semibold">{player.PlayerName}</p>
									<p class="text-sm text-base-content/70">{player.PlayerPosition} · {player.PlayerTeam}</p>
								</div>
							</div>
						{/each}
					{/if}
					{#if transaction.Trade?.InitiatorDraftPicks}
						{#each transaction.Trade?.InitiatorDraftPicks as pick}
							<div class="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-success/20 to-accent/20 hover:from-success/30 hover:to-accent/30 transition-colors">
								<div class="w-12 h-12 rounded-full bg-gradient-to-br from-success to-accent flex items-center justify-center text-white font-bold shadow-lg">
									{pick.Round}
								</div>
								<div class="flex-1">
									<p class="font-semibold">{formatRound(pick.Round)} Round Pick</p>
									<p class="text-sm text-base-content/70">{pick.Year} Draft</p>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Swap Icon -->
			<div class="flex items-center justify-center px-4 md:px-4 py-4 md:py-0">
				<div class="text-4xl opacity-50 rotate-90 md:rotate-0">⇄</div>
			</div>

			<!-- Receiver's Side -->
			<div class="flex-1">
				<!-- User Info -->
				<div class="flex items-center gap-3 mb-4">
					<img
						src={`https://sleepercdn.com/avatars/${transaction.Trade?.RecieverAvatarUrl}`}
						alt={transaction.Trade?.RecieverName}
						class="w-10 h-10 rounded-full ring-2 ring-secondary ring-offset-2 ring-offset-base-100"
					/>
					<span class="font-bold text-lg">{transaction.Trade?.RecieverName}</span>
				</div>

				<!-- Received Items -->
				<div class="space-y-3">
					{#if transaction.Trade?.RecieverPlayersRecieved}
						{#each transaction.Trade?.RecieverPlayersRecieved as player}
							<div class="flex items-center gap-3 p-3 rounded-lg bg-base-300 hover:bg-base-100 transition-colors">
								<img
									src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
									alt={player.PlayerName}
									class="w-12 h-12 rounded-full ring-2 ring-success ring-offset-2 ring-offset-base-300"
								/>
								<div class="flex-1">
									<p class="font-semibold">{player.PlayerName}</p>
									<p class="text-sm text-base-content/70">{player.PlayerPosition} · {player.PlayerTeam}</p>
								</div>
							</div>
						{/each}
					{/if}
					{#if transaction.Trade?.RecieverDraftPicks}
						{#each transaction.Trade?.RecieverDraftPicks as pick}
							<div class="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-success/20 to-accent/20 hover:from-success/30 hover:to-accent/30 transition-colors">
								<div class="w-12 h-12 rounded-full bg-gradient-to-br from-success to-accent flex items-center justify-center text-white font-bold shadow-lg">
									{pick.Round}
								</div>
								<div class="flex-1">
									<p class="font-semibold">{formatRound(pick.Round)} Round Pick</p>
									<p class="text-sm text-base-content/70">{pick.Year} Draft</p>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

