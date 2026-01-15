<script lang="ts">
	export let transaction;

	const isWaiver = transaction.TransactionType === 1; // Waiver
	const isFreeAgent = transaction.TransactionType === 2; // Free Agent
</script>

<!-- Waiver/Free Agent Card with improved design -->
<div class="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
	<div class="card-body">
		<!-- Header with badges and user info -->
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center gap-3">
				<img
					src={`https://sleepercdn.com/avatars/${transaction.WaiverFreeAgent?.InitiatorAvatarUrl}`}
					alt={transaction.WaiverFreeAgent?.UserName}
					class="w-10 h-10 rounded-full ring-2 ring-info ring-offset-2 ring-offset-base-100"
				/>
				<div>
					<p class="font-bold text-lg">{transaction.WaiverFreeAgent?.UserName}</p>
					<div class="flex gap-2 mt-1">
						{#if isWaiver}
							<div class="badge badge-info badge-sm">📋 Waiver</div>
						{:else if isFreeAgent}
							<div class="badge badge-accent badge-sm">🆓 Free Agent</div>
						{/if}
						{#if transaction.Week}
							<div class="badge badge-outline badge-sm">Week {transaction.Week}</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="text-sm text-base-content/70">{transaction.TransactionDate}</div>
		</div>

		<!-- Transaction Details -->
		<div class="grid md:grid-cols-2 gap-6">
			<!-- Adds Section -->
			<div>
				<div class="flex items-center gap-2 mb-3">
					<span class="text-2xl">+</span>
					<h3 class="font-bold text-success text-lg">Added</h3>
				</div>
				<div class="space-y-2">
					{#if transaction.WaiverFreeAgent?.Adds && transaction.WaiverFreeAgent.Adds.length > 0}
						{#each transaction.WaiverFreeAgent.Adds as player}
							<div class="flex items-center gap-3 p-3 rounded-lg bg-success/10 border-l-4 border-success hover:bg-success/20 transition-colors">
								<img
									src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
									alt={player.PlayerName}
									class="w-12 h-12 rounded-full ring-2 ring-success"
								/>
								<div class="flex-1">
									<p class="font-semibold text-success">{player.PlayerName}</p>
									<p class="text-sm text-success/80">{player.PlayerPosition} · {player.PlayerTeam}</p>
								</div>
							</div>
						{/each}
					{:else}
						<p class="text-sm text-base-content/50 italic">No players added</p>
					{/if}
				</div>
			</div>

			<!-- Drops Section -->
			<div>
				<div class="flex items-center gap-2 mb-3">
					<span class="text-2xl">−</span>
					<h3 class="font-bold text-error text-lg">Dropped</h3>
				</div>
				<div class="space-y-2">
					{#if transaction.WaiverFreeAgent?.Drops && transaction.WaiverFreeAgent.Drops.length > 0}
						{#each transaction.WaiverFreeAgent.Drops as player}
							<div class="flex items-center gap-3 p-3 rounded-lg bg-error/10 border-l-4 border-error hover:bg-error/20 transition-colors">
								<img
									src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
									alt={player.PlayerName}
									class="w-12 h-12 rounded-full ring-2 ring-error opacity-75"
								/>
								<div class="flex-1">
									<p class="font-semibold text-error">{player.PlayerName}</p>
									<p class="text-sm text-error/80">{player.PlayerPosition} · {player.PlayerTeam}</p>
								</div>
							</div>
						{/each}
					{:else}
						<p class="text-sm text-base-content/50 italic">No players dropped</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

