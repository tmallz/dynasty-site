<script lang="ts">
	export let transaction;
	export let animationDelay: number = 0;

	const isWaiver = transaction.TransactionType === 1; // Waiver
	const isFreeAgent = transaction.TransactionType === 2; // Free Agent

	let userAvatarFailed = false;
	let playerAvatarsFailed: Record<string, boolean> = {};

	function getInitials(name: string): string {
		if (!name) return '?';
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<!-- Waiver/Free Agent Card with improved design -->
<div
	class="card bg-base-200 shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-150 fade-in"
	style="animation-delay: {animationDelay}ms;"
>
	<div class="card-body p-4 md:p-6">
		<!-- Header with badges and user info -->
		<div class="flex items-center justify-between mb-3 md:mb-4">
			<div class="flex items-center gap-2 md:gap-3">
				{#if userAvatarFailed || !transaction.WaiverFreeAgent?.InitiatorAvatarUrl}
					<div
						class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-info flex items-center justify-center text-info-content font-bold text-xs md:text-sm ring-2 ring-info ring-offset-2 ring-offset-base-100"
					>
						{getInitials(transaction.WaiverFreeAgent?.UserName ?? '')}
					</div>
				{:else}
					<img
						src={`https://sleepercdn.com/avatars/${transaction.WaiverFreeAgent?.InitiatorAvatarUrl}`}
						alt={transaction.WaiverFreeAgent?.UserName}
						class="w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 ring-info ring-offset-2 ring-offset-base-100 bg-base-300"
						on:error={() => (userAvatarFailed = true)}
					/>
				{/if}
				<div>
					<p class="font-bold text-base md:text-lg">{transaction.WaiverFreeAgent?.UserName}</p>
					<div class="flex gap-1 md:gap-2 mt-0.5 md:mt-1">
						{#if isWaiver}
							<div class="badge badge-info badge-xs md:badge-sm">Waiver</div>
						{:else if isFreeAgent}
							<div class="badge badge-accent badge-xs md:badge-sm">Free Agent</div>
						{/if}
						{#if transaction.Week}
							<div class="badge badge-outline badge-xs md:badge-sm">Week {transaction.Week}</div>
						{/if}
					</div>
				</div>
			</div>
			<div class="text-xs md:text-sm text-base-content/70">{transaction.TransactionDate}</div>
		</div>

		<!-- Transaction Details -->
		<div class="grid md:grid-cols-2 gap-4 md:gap-6">
			<!-- Adds Section -->
			<div>
				<div class="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
					<span class="text-xl md:text-2xl">+</span>
					<h3 class="font-bold text-success text-base md:text-lg">Added</h3>
				</div>
				<div class="space-y-2">
					{#if transaction.WaiverFreeAgent?.Adds && transaction.WaiverFreeAgent.Adds.length > 0}
						{#each transaction.WaiverFreeAgent.Adds as player}
							<div
								class="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-success/10 border-l-4 border-success hover:bg-success/20 transition-colors"
							>
								{#if playerAvatarsFailed[`add-${player.PlayerId}`]}
									<div
										class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-success/30 flex items-center justify-center text-success font-bold text-xs ring-2 ring-success"
									>
										{player.PlayerPosition}
									</div>
								{:else}
									<img
										src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
										alt={player.PlayerName}
										class="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-success bg-base-300"
										on:error={() => (playerAvatarsFailed[`add-${player.PlayerId}`] = true)}
									/>
								{/if}
								<div class="flex-1 min-w-0">
									<p class="font-semibold text-success text-sm md:text-base truncate">
										{player.PlayerName}
									</p>
									<p class="text-xs md:text-sm text-success/80">
										{player.PlayerPosition} · {player.PlayerTeam || 'FA'}
									</p>
								</div>
							</div>
						{/each}
					{:else}
						<p class="text-xs md:text-sm text-base-content/50 italic">No players added</p>
					{/if}
				</div>
			</div>

			<!-- Drops Section -->
			<div>
				<div class="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
					<span class="text-xl md:text-2xl">-</span>
					<h3 class="font-bold text-error text-base md:text-lg">Dropped</h3>
				</div>
				<div class="space-y-2">
					{#if transaction.WaiverFreeAgent?.Drops && transaction.WaiverFreeAgent.Drops.length > 0}
						{#each transaction.WaiverFreeAgent.Drops as player}
							<div
								class="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-error/10 border-l-4 border-error hover:bg-error/20 transition-colors"
							>
								{#if playerAvatarsFailed[`drop-${player.PlayerId}`]}
									<div
										class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-error/30 flex items-center justify-center text-error font-bold text-xs ring-2 ring-error opacity-75"
									>
										{player.PlayerPosition}
									</div>
								{:else}
									<img
										src={`https://sleepercdn.com/content/nfl/players/${player.PlayerId}.jpg`}
										alt={player.PlayerName}
										class="w-10 h-10 md:w-12 md:h-12 rounded-full ring-2 ring-error opacity-75 bg-base-300"
										on:error={() => (playerAvatarsFailed[`drop-${player.PlayerId}`] = true)}
									/>
								{/if}
								<div class="flex-1 min-w-0">
									<p class="font-semibold text-error text-sm md:text-base truncate">
										{player.PlayerName}
									</p>
									<p class="text-xs md:text-sm text-error/80">
										{player.PlayerPosition} · {player.PlayerTeam || 'FA'}
									</p>
								</div>
							</div>
						{/each}
					{:else}
						<p class="text-xs md:text-sm text-base-content/50 italic">No players dropped</p>
					{/if}
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
