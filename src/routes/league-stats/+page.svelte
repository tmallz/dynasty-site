<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let stats: any = $state(null);
	let users: any = $state(null);
	let isLoading = $state(true);

	// Track expanded state for each table
	let expandedTables: Record<string, boolean> = $state({});

	// Track collapsed state for each card
	let collapsedCards: Record<string, boolean> = $state({});

	const DEFAULT_ROWS = 5;

	function toggleExpanded(tableId: string) {
		expandedTables[tableId] = !expandedTables[tableId];
	}

	function toggleCollapsed(cardId: string) {
		collapsedCards[cardId] = !collapsedCards[cardId];
	}

	// Derived visible arrays that automatically react to expandedTables changes
	let visibleTopWeeks = $derived(
		!stats?.TopScoringWeeks ? [] :
		expandedTables['topWeeks'] ? stats.TopScoringWeeks :
		stats.TopScoringWeeks.slice(0, DEFAULT_ROWS)
	);

	let visibleBottomWeeks = $derived(
		!stats?.BottomScoringWeeks ? [] :
		expandedTables['bottomWeeks'] ? stats.BottomScoringWeeks :
		stats.BottomScoringWeeks.slice(0, DEFAULT_ROWS)
	);

	let visibleTopSeasons = $derived(
		!stats?.TopSeasons ? [] :
		expandedTables['topSeasons'] ? stats.TopSeasons :
		stats.TopSeasons.slice(0, DEFAULT_ROWS)
	);

	let visibleBottomSeasons = $derived(
		!stats?.BottomSeasons ? [] :
		expandedTables['bottomSeasons'] ? stats.BottomSeasons :
		stats.BottomSeasons.slice(0, DEFAULT_ROWS)
	);

	let visibleBestDefense = $derived(
		!stats?.BestFantasyDefense ? [] :
		expandedTables['bestDefense'] ? stats.BestFantasyDefense :
		stats.BestFantasyDefense.slice(0, DEFAULT_ROWS)
	);

	let visibleWorstDefense = $derived(
		!stats?.WorstFantasyDefense ? [] :
		expandedTables['worstDefense'] ? stats.WorstFantasyDefense :
		stats.WorstFantasyDefense.slice(0, DEFAULT_ROWS)
	);

	let visibleHighWinPct = $derived(
		!stats?.HighestWinningPercentages ? [] :
		expandedTables['highWinPct'] ? stats.HighestWinningPercentages :
		stats.HighestWinningPercentages.slice(0, DEFAULT_ROWS)
	);

	let visibleLowWinPct = $derived(
		!stats?.LowestWinningPercentages ? [] :
		expandedTables['lowWinPct'] ? stats.LowestWinningPercentages :
		stats.LowestWinningPercentages.slice(0, DEFAULT_ROWS)
	);

	let visibleBlowouts = $derived(
		!stats?.LargestBlowouts ? [] :
		expandedTables['blowouts'] ? stats.LargestBlowouts :
		stats.LargestBlowouts.slice(0, DEFAULT_ROWS)
	);

	let visibleCloseGames = $derived(
		!stats?.ClosestVictories ? [] :
		expandedTables['closeGames'] ? stats.ClosestVictories :
		stats.ClosestVictories.slice(0, DEFAULT_ROWS)
	);

	let visibleSkanks = $derived(
		!stats?.BiggestSkanks ? [] :
		expandedTables['skanks'] ? stats.BiggestSkanks :
		stats.BiggestSkanks.slice(0, DEFAULT_ROWS)
	);

	let visibleTradeAddicts = $derived(
		!stats?.TradeAddicts ? [] :
		expandedTables['tradeAddicts'] ? stats.TradeAddicts :
		stats.TradeAddicts.slice(0, DEFAULT_ROWS)
	);

	// Compute summary stats
	let totalSeasons = $derived(stats?.Winners?.length ?? 0);
	let currentChampion = $derived(stats?.Winners?.[stats?.Winners?.length - 1]);
	let allTimePointsLeader = $derived(stats?.TopSeasons?.[0]);

	// Handle streamed data
	$effect(() => {
		if (data.streamed?.leagueData) {
			data.streamed.leagueData.then((result: any) => {
				stats = result.stats;
				users = result.users;
				isLoading = false;
			});
		}
	});
</script>

<style>
	/* Reduce table cell padding on mobile for better fit */
	@media (max-width: 1023px) {
		:global(.table th),
		:global(.table td) {
			padding-left: 0.25rem;
			padding-right: 0.25rem;
		}
	}

	/* Row hover effect */
	:global(.stats-table tbody tr) {
		transition: background-color 0.15s ease;
	}
	:global(.stats-table tbody tr:hover) {
		background-color: oklch(var(--b3) / 0.5);
	}

	/* Skeleton animation */
	.skeleton-row {
		animation: pulse 1.5s ease-in-out infinite;
	}
	@keyframes pulse {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 0.7; }
	}

	/* Expand/collapse animation */
	.table-container {
		overflow: hidden;
		transition: max-height 0.3s ease-out;
	}
</style>

{#if isLoading}
	<!-- Skeleton Loading State -->
	<div class="container mx-auto px-4 py-8">
		<h1 class="text-4xl font-bold text-center mb-8">League Stats</h1>

		<!-- Skeleton Summary Banner -->
		<div class="bg-base-200 rounded-xl p-6 mb-8">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				{#each [1, 2, 3, 4] as _}
					<div class="text-center">
						<div class="skeleton h-4 w-20 mx-auto mb-2 skeleton-row"></div>
						<div class="skeleton h-8 w-24 mx-auto skeleton-row"></div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Skeleton Tables Grid -->
		{#each [1, 2, 3] as _row}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				{#each [1, 2] as _col}
					<div class="card bg-base-200 shadow-xl">
						<div class="card-body px-4 py-4">
							<div class="skeleton h-6 w-48 mx-auto mb-4 skeleton-row"></div>
							<div class="overflow-x-auto">
								<table class="table table-sm w-full">
									<thead>
										<tr>
											<th class="skeleton h-4 w-8 skeleton-row"></th>
											<th class="skeleton h-4 w-32 skeleton-row"></th>
											<th class="skeleton h-4 w-16 skeleton-row"></th>
											<th class="skeleton h-4 w-16 skeleton-row"></th>
										</tr>
									</thead>
									<tbody>
										{#each [1, 2, 3, 4, 5] as _}
											<tr>
												<td><div class="skeleton h-4 w-6 skeleton-row"></div></td>
												<td>
													<div class="flex items-center gap-2">
														<div class="skeleton h-8 w-8 rounded-full skeleton-row"></div>
														<div class="skeleton h-4 w-24 skeleton-row"></div>
													</div>
												</td>
												<td><div class="skeleton h-4 w-12 skeleton-row"></div></td>
												<td><div class="skeleton h-4 w-16 skeleton-row"></div></td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>
{:else if stats}
	<div class="container mx-auto px-4 py-8" in:fade={{ duration: 300 }}>
		<h1 class="text-4xl font-bold text-center mb-8">League Stats</h1>

		<!-- Summary Banner -->
		<div class="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-6 mb-8 border border-base-content/10">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
				<div>
					<p class="text-sm text-base-content/70 uppercase tracking-wide">Seasons</p>
					<p class="text-3xl font-bold text-primary">{totalSeasons}</p>
				</div>
				<div>
					<p class="text-sm text-base-content/70 uppercase tracking-wide">Current Champ</p>
					<p class="text-xl font-bold truncate">{currentChampion?.DisplayName ?? 'N/A'}</p>
					<p class="text-xs text-base-content/60">{currentChampion?.Season ?? ''}</p>
				</div>
				<div>
					<p class="text-sm text-base-content/70 uppercase tracking-wide">Points Leader</p>
					<p class="text-xl font-bold truncate">{allTimePointsLeader?.DisplayName ?? 'N/A'}</p>
					<p class="text-xs text-base-content/60">{allTimePointsLeader?.TotalPoints?.toFixed(0) ?? ''} pts</p>
				</div>
				<div>
					<p class="text-sm text-base-content/70 uppercase tracking-wide">Top Win %</p>
					<p class="text-xl font-bold truncate">{stats.HighestWinningPercentages?.[0]?.DisplayName ?? 'N/A'}</p>
					<p class="text-xs text-base-content/60">{stats.HighestWinningPercentages?.[0]?.WinPercentage ? Math.round(stats.HighestWinningPercentages[0].WinPercentage * 1000) / 10 + '%' : ''}</p>
				</div>
			</div>
		</div>

		<!-- Section 1: Weekly Records -->
		<div class="divider text-lg font-semibold text-base-content/70 mb-4">Weekly Records</div>
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Top Scoring Weeks Table -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('topWeeks')} onkeypress={() => toggleCollapsed('topWeeks')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">🔥</span>
							Highest Scoring Weeks
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['topWeeks'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['topWeeks']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.TopScoringWeeks && stats.TopScoringWeeks.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
									<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-20">Season</th>
										<th class="w-20">Points</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleTopWeeks as weekRecord, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
										<td class="hidden lg:table-cell">
												{#if index < 3}
													<span class="text-xl">🔥</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													{#if weekRecord.UserId}
														<div class="avatar">
															<div class="w-8 h-8 rounded-full">
																<img
																	src="https://sleepercdn.com/avatars/{users?.find(
																		(u: any) => u.user_id === weekRecord.UserId
																	)?.avatar ?? 'default'}"
																	alt={weekRecord.DisplayName ?? 'Manager'}
																/>
															</div>
														</div>
													{/if}
													<span class="font-medium truncate">{weekRecord.DisplayName ?? 'Unknown'}</span>
												</div>
											</td>
											<td>
												<span class="text-sm">{weekRecord.Season}</span>
												<br />
												<span class="text-xs text-base-content/70">Wk {weekRecord.Week}</span>
											</td>
											<td class="font-bold text-lg">{weekRecord.Points?.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.TopScoringWeeks.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('topWeeks')}>
								{expandedTables['topWeeks'] ? 'Show less' : `Show all ${stats.TopScoringWeeks.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No top scoring week data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Lowest Scoring Weeks Table -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('bottomWeeks')} onkeypress={() => toggleCollapsed('bottomWeeks')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">💩</span>
							Lowest Scoring Weeks
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['bottomWeeks'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['bottomWeeks']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.BottomScoringWeeks && stats.BottomScoringWeeks.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
									<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-20">Season</th>
										<th class="w-20">Points</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleBottomWeeks as weekRecord, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
										<td class="hidden lg:table-cell">
												{#if index < 3}
													<span class="text-xl">💩</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													{#if weekRecord.UserId}
														<div class="avatar">
															<div class="w-8 h-8 rounded-full">
																<img
																	src="https://sleepercdn.com/avatars/{users?.find(
																		(u: any) => u.user_id === weekRecord.UserId
																	)?.avatar ?? 'default'}"
																	alt={weekRecord.DisplayName ?? 'Manager'}
																/>
															</div>
														</div>
													{/if}
													<span class="font-medium truncate">{weekRecord.DisplayName ?? 'Unknown'}</span>
												</div>
											</td>
											<td>
												<span class="text-sm">{weekRecord.Season}</span>
												<br />
												<span class="text-xs text-base-content/70">Wk {weekRecord.Week}</span>
											</td>
											<td class="font-bold text-lg">{weekRecord.Points?.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.BottomScoringWeeks.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('bottomWeeks')}>
								{expandedTables['bottomWeeks'] ? 'Show less' : `Show all ${stats.BottomScoringWeeks.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No lowest scoring week data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Section 2: Season Records -->
		<div class="divider text-lg font-semibold text-base-content/70 mb-4">Season Records</div>
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Top Seasons -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('topSeasons')} onkeypress={() => toggleCollapsed('topSeasons')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">🔥</span>
							Highest Scoring Seasons
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['topSeasons'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['topSeasons']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.TopSeasons && stats.TopSeasons.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
										<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-24">Season</th>
										<th class="w-24">Total Points</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleTopSeasons as seasonRecord, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
											<td class="hidden lg:table-cell">
												{#if index === 0}
													<span class="text-xl">🥇</span>
												{:else if index === 1}
													<span class="text-xl">🥈</span>
												{:else if index === 2}
													<span class="text-xl">🥉</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													{#if seasonRecord.UserId}
														<div class="avatar">
															<div class="w-8 h-8 rounded-full">
																<img
																	src="https://sleepercdn.com/avatars/{users?.find(
																		(u: any) => u.user_id === seasonRecord.UserId
																	)?.avatar ?? 'default'}"
																	alt={seasonRecord.DisplayName ?? 'Manager'}
																/>
															</div>
														</div>
													{/if}
													<span class="font-medium truncate">{seasonRecord.DisplayName ?? 'Unknown'}</span>
												</div>
											</td>
											<td class="text-sm">{seasonRecord.Season}</td>
											<td class="font-bold text-lg">{seasonRecord.TotalPoints?.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.TopSeasons.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('topSeasons')}>
								{expandedTables['topSeasons'] ? 'Show less' : `Show all ${stats.TopSeasons.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No season scoring data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Bottom Seasons -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('bottomSeasons')} onkeypress={() => toggleCollapsed('bottomSeasons')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">💩</span>
							Lowest Scoring Seasons
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['bottomSeasons'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['bottomSeasons']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.BottomSeasons && stats.BottomSeasons.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
										<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-24">Season</th>
										<th class="w-24">Total Points</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleBottomSeasons as seasonRecord, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
											<td class="hidden lg:table-cell">
												{#if index < 3}
													<span class="text-xl">💩</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													{#if seasonRecord.UserId}
														<div class="avatar">
															<div class="w-8 h-8 rounded-full">
																<img
																	src="https://sleepercdn.com/avatars/{users?.find(
																		(u: any) => u.user_id === seasonRecord.UserId
																	)?.avatar ?? 'default'}"
																	alt={seasonRecord.DisplayName ?? 'Manager'}
																/>
															</div>
														</div>
													{/if}
													<span class="font-medium truncate">{seasonRecord.DisplayName ?? 'Unknown'}</span>
												</div>
											</td>
											<td class="text-sm">{seasonRecord.Season}</td>
											<td class="font-bold text-lg">{seasonRecord.TotalPoints?.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.BottomSeasons.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('bottomSeasons')}>
								{expandedTables['bottomSeasons'] ? 'Show less' : `Show all ${stats.BottomSeasons.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No lowest season data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Best Fantasy Defense -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('bestDefense')} onkeypress={() => toggleCollapsed('bestDefense')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">🛡️</span>
							Best Fantasy Defense
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['bestDefense'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['bestDefense']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.BestFantasyDefense && stats.BestFantasyDefense.length}
						<div class="overflow-x-auto">
							<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
										<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-20">Season</th>
										<th class="w-20">Total</th>
										<th class="w-20">PPG</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleBestDefense as defense, idx}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{idx + 1}</td>
											<td class="hidden lg:table-cell">
												{#if idx < 3}
													<span class="text-xl">🛡️</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													{#if defense.UserId}
														<div class="avatar">
															<div class="w-8 h-8 rounded-full">
																<img
																	src="https://sleepercdn.com/avatars/{users?.find(
																		(u: any) => u.user_id === defense.UserId
																	)?.avatar ?? 'default'}"
																	alt={defense.DisplayName ?? 'Manager'}
																/>
															</div>
														</div>
													{/if}
													<span class="font-medium truncate">{defense.DisplayName ?? 'Unknown'}</span>
												</div>
											</td>
											<td class="text-sm">{defense.Season}</td>
											<td class="font-bold text-lg">{defense.TotalPointsAgainst?.toFixed(2)}</td>
											<td class="text-sm">{defense.AvgPointsAgainst?.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.BestFantasyDefense.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('bestDefense')}>
								{expandedTables['bestDefense'] ? 'Show less' : `Show all ${stats.BestFantasyDefense.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No fantasy defense data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Worst Fantasy Defense -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('worstDefense')} onkeypress={() => toggleCollapsed('worstDefense')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">🎯</span>
							Worst Fantasy Defense
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['worstDefense'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['worstDefense']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.WorstFantasyDefense && stats.WorstFantasyDefense.length}
						<div class="overflow-x-auto">
							<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
										<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-20">Season</th>
										<th class="w-20">Total</th>
										<th class="w-20">PPG</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleWorstDefense as defense, idx}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{idx + 1}</td>
											<td class="hidden lg:table-cell">
												{#if idx < 3}
													<span class="text-xl">🎯</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													{#if defense.UserId}
														<div class="avatar">
															<div class="w-8 h-8 rounded-full">
																<img
																	src="https://sleepercdn.com/avatars/{users?.find(
																		(u: any) => u.user_id === defense.UserId
																	)?.avatar ?? 'default'}"
																	alt={defense.DisplayName ?? 'Manager'}
																/>
															</div>
														</div>
													{/if}
													<span class="font-medium truncate">{defense.DisplayName ?? 'Unknown'}</span>
												</div>
											</td>
											<td class="text-sm">{defense.Season}</td>
											<td class="font-bold text-lg">{defense.TotalPointsAgainst?.toFixed(2)}</td>
											<td class="text-sm">{defense.AvgPointsAgainst?.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.WorstFantasyDefense.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('worstDefense')}>
								{expandedTables['worstDefense'] ? 'Show less' : `Show all ${stats.WorstFantasyDefense.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No fantasy defense data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Section 3: All-Time Records -->
		<div class="divider text-lg font-semibold text-base-content/70 mb-4">All-Time Records</div>
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Highest Winning Percentages -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('highWinPct')} onkeypress={() => toggleCollapsed('highWinPct')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">📈</span>
							Highest Winning Percentages
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['highWinPct'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['highWinPct']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.HighestWinningPercentages && stats.HighestWinningPercentages.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
										<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-24">Record</th>
										<th class="w-24">Win %</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleHighWinPct as record, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
											<td class="hidden lg:table-cell">
												{#if index === 0}
													<span class="text-xl">🥇</span>
												{:else if index === 1}
													<span class="text-xl">🥈</span>
												{:else if index === 2}
													<span class="text-xl">🥉</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													{#if record.UserId}
														<div class="avatar">
															<div class="w-8 h-8 rounded-full">
																<img
																	src="https://sleepercdn.com/avatars/{users?.find(
																		(u: any) => u.user_id === record.UserId
																	)?.avatar ?? 'default'}"
																	alt={record.DisplayName ?? 'Manager'}
																/>
															</div>
														</div>
													{/if}
													<span class="font-medium truncate">{record.DisplayName ?? 'Unknown'}</span>
												</div>
											</td>
											<td class="text-sm">{record.Wins}-{record.Losses}</td>
											<td class="font-bold text-lg">{Math.round((record.WinPercentage ?? 0) * 1000) / 10}%</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.HighestWinningPercentages.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('highWinPct')}>
								{expandedTables['highWinPct'] ? 'Show less' : `Show all ${stats.HighestWinningPercentages.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No winning percentage data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Lowest Winning Percentages -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('lowWinPct')} onkeypress={() => toggleCollapsed('lowWinPct')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">📉</span>
							Lowest Winning Percentages
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['lowWinPct'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['lowWinPct']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.LowestWinningPercentages && stats.LowestWinningPercentages.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
										<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-24">Record</th>
										<th class="w-24">Win %</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleLowWinPct as record, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
											<td class="hidden lg:table-cell">
												{#if index < 3}
													<span class="text-xl">📉</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													{#if record.UserId}
														<div class="avatar">
															<div class="w-8 h-8 rounded-full">
																<img
																	src="https://sleepercdn.com/avatars/{users?.find(
																		(u: any) => u.user_id === record.UserId
																	)?.avatar ?? 'default'}"
																	alt={record.DisplayName ?? 'Manager'}
																/>
															</div>
														</div>
													{/if}
													<span class="font-medium truncate">{record.DisplayName ?? 'Unknown'}</span>
												</div>
											</td>
											<td class="text-sm">{record.Wins}-{record.Losses}</td>
											<td class="font-bold text-lg">{Math.round((record.WinPercentage ?? 0) * 1000) / 10}%</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.LowestWinningPercentages.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('lowWinPct')}>
								{expandedTables['lowWinPct'] ? 'Show less' : `Show all ${stats.LowestWinningPercentages.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No winning percentage data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Section 4: Game Records -->
		<div class="divider text-lg font-semibold text-base-content/70 mb-4">Game Records</div>
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Largest Blowouts -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('blowouts')} onkeypress={() => toggleCollapsed('blowouts')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">💥</span>
							Biggest Blowouts
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['blowouts'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['blowouts']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.LargestBlowouts && stats.LargestBlowouts.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
									<th class="w-10 hidden lg:table-cell"></th>
										<th>Matchup</th>
										<th class="w-20">Week</th>
										<th class="w-24">Margin</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleBlowouts as game, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
										<td class="hidden lg:table-cell">
												{#if index < 3}
													<span class="text-xl">💥</span>
												{/if}
											</td>
											<td>
												<div class="flex flex-col gap-0.5">
													<div class="flex items-center gap-2">
														{#if game.WinnerUserId}
															<div class="avatar">
																<div class="w-6 h-6 rounded-full">
																	<img
																		src="https://sleepercdn.com/avatars/{users?.find(
																			(u: any) => u.user_id === game.WinnerUserId
																		)?.avatar ?? 'default'}"
																		alt={game.WinnerDisplayName ?? 'Winner'}
																	/>
																</div>
															</div>
														{/if}
													<span class="font-medium truncate">{game.WinnerDisplayName ?? 'Unknown'}</span>
														<span class="font-bold">{game.WinnerPoints?.toFixed(2)}</span>
													</div>
													<div class="text-center text-xs text-base-content/50">V</div>
													<div class="flex items-center gap-2">
														{#if game.LoserUserId}
															<div class="avatar">
																<div class="w-6 h-6 rounded-full">
																	<img
																		src="https://sleepercdn.com/avatars/{users?.find(
																			(u: any) => u.user_id === game.LoserUserId
																		)?.avatar ?? 'default'}"
																		alt={game.LoserDisplayName ?? 'Loser'}
																	/>
																</div>
															</div>
														{/if}
													<span class="truncate">{game.LoserDisplayName ?? 'Unknown'}</span>
														<span>{game.LoserPoints?.toFixed(2)}</span>
													</div>
												</div>
											</td>
											<td>
												<span class="text-sm">{game.Season} Wk {game.Week}</span>
											</td>
											<td class="font-bold text-lg text-red-600">{game.Margin?.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.LargestBlowouts.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('blowouts')}>
								{expandedTables['blowouts'] ? 'Show less' : `Show all ${stats.LargestBlowouts.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No blowout data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Closest Games -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('closeGames')} onkeypress={() => toggleCollapsed('closeGames')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">⚡</span>
							Closest Games
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['closeGames'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['closeGames']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.ClosestVictories && stats.ClosestVictories.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
									<th class="w-10 hidden lg:table-cell"></th>
										<th>Matchup</th>
										<th class="w-20">Week</th>
										<th class="w-24">Margin</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleCloseGames as game, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
										<td class="hidden lg:table-cell">
												{#if index < 3}
													<span class="text-xl">⚡</span>
												{/if}
											</td>
											<td>
												<div class="flex flex-col gap-0.5">
													<div class="flex items-center gap-2">
														{#if game.WinnerUserId}
															<div class="avatar">
																<div class="w-6 h-6 rounded-full">
																	<img
																		src="https://sleepercdn.com/avatars/{users?.find(
																			(u: any) => u.user_id === game.WinnerUserId
																		)?.avatar ?? 'default'}"
																		alt={game.WinnerDisplayName ?? 'Winner'}
																	/>
																</div>
															</div>
														{/if}
													<span class="font-medium truncate">{game.WinnerDisplayName ?? 'Unknown'}</span>
														<span class="font-bold">{game.WinnerPoints?.toFixed(2)}</span>
													</div>
													<div class="text-center text-xs text-base-content/50">V</div>
													<div class="flex items-center gap-2">
														{#if game.LoserUserId}
															<div class="avatar">
																<div class="w-6 h-6 rounded-full">
																	<img
																		src="https://sleepercdn.com/avatars/{users?.find(
																			(u: any) => u.user_id === game.LoserUserId
																		)?.avatar ?? 'default'}"
																		alt={game.LoserDisplayName ?? 'Loser'}
																	/>
																</div>
															</div>
														{/if}
													<span class="truncate">{game.LoserDisplayName ?? 'Unknown'}</span>
														<span>{game.LoserPoints?.toFixed(2)}</span>
													</div>
												</div>
											</td>
											<td>
												<span class="text-sm">{game.Season} Wk {game.Week}</span>
											</td>
											<td class="font-bold text-lg text-yellow-600">{game.Margin?.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.ClosestVictories.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('closeGames')}>
								{expandedTables['closeGames'] ? 'Show less' : `Show all ${stats.ClosestVictories.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No close game data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Section 5: Fun Stats -->
		<div class="divider text-lg font-semibold text-base-content/70 mb-4">Fun Stats</div>
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Biggest Skanks -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('skanks')} onkeypress={() => toggleCollapsed('skanks')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">🦄</span>
							Biggest Skanks (Most Teams)
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['skanks'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['skanks']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.BiggestSkanks && stats.BiggestSkanks.length}
						<div class="overflow-x-auto">
							<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
										<th class="w-10 hidden lg:table-cell"></th>
										<th>Player</th>
										<th class="w-40">Last Acquired</th>
										<th class="w-20">Teams</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleSkanks as skank, idx}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{idx + 1}</td>
											<td class="hidden lg:table-cell">
												{#if idx < 3}
													<span class="text-xl">🦄</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													<div class="avatar">
														<div class="w-8 h-8 rounded-full">
															<img
																src="https://sleepercdn.com/content/nfl/players/{skank.PlayerId}.jpg"
																alt={skank.DisplayName ?? 'Player'}
															/>
														</div>
													</div>
													<span class="font-medium truncate">{skank.DisplayName || skank.FirstName + ' ' + skank.LastName || skank.PlayerId}</span>
												</div>
											</td>
											<td>
												<span class="text-sm">{skank.LastAcquired ? new Date(skank.LastAcquired).toLocaleDateString() : '-'}</span>
											</td>
											<td class="font-bold text-lg">{skank.NumTeams}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.BiggestSkanks.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('skanks')}>
								{expandedTables['skanks'] ? 'Show less' : `Show all ${stats.BiggestSkanks.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No player transaction data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Trade Addicts -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					<div class="flex items-center justify-between cursor-pointer" onclick={() => toggleCollapsed('tradeAddicts')} onkeypress={() => toggleCollapsed('tradeAddicts')} role="button" tabindex="0">
						<h3 class="text-lg font-bold flex items-center gap-2">
							<span class="text-2xl">🤝</span>
							Trade Addicts
						</h3>
						<button class="btn btn-ghost btn-sm">
							{collapsedCards['tradeAddicts'] ? '▼' : '▲'}
						</button>
					</div>
					{#if !collapsedCards['tradeAddicts']}
						<div class="table-container" in:fade={{ duration: 200 }}>
					{#if stats.TradeAddicts && stats.TradeAddicts.length}
						<div class="overflow-x-auto">
							<table class="table table-zebra table-sm w-full border-2 border-base-content/20 stats-table">
								<thead>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
										<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-20">Trades</th>
										<th class="w-20 hidden sm:table-cell">Got</th>
										<th class="w-20 hidden sm:table-cell">Gave</th>
									</tr>
								</thead>
								<tbody>
									{#each visibleTradeAddicts as trader, idx}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{idx + 1}</td>
											<td class="hidden lg:table-cell">
												{#if idx < 3}
													<span class="text-xl">🤝</span>
												{/if}
											</td>
											<td>
												<div class="flex items-center gap-2">
													{#if trader.UserId}
														<div class="avatar">
															<div class="w-8 h-8 rounded-full">
																<img
																	src="https://sleepercdn.com/avatars/{users?.find(
																		(u: any) => u.user_id === trader.UserId
																	)?.avatar ?? 'default'}"
																	alt={trader.DisplayName ?? 'Manager'}
																/>
															</div>
														</div>
													{/if}
													<span class="font-medium truncate">{trader.DisplayName ?? 'Unknown'}</span>
												</div>
											</td>
											<td class="font-bold text-lg">{trader.TotalTrades}</td>
											<td class="text-sm hidden sm:table-cell">{trader.PlayersAcquired}</td>
											<td class="text-sm hidden sm:table-cell">{trader.PlayersTraded}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						{#if stats.TradeAddicts.length > DEFAULT_ROWS}
							<button class="btn btn-ghost btn-sm w-full mt-2" onclick={() => toggleExpanded('tradeAddicts')}>
								{expandedTables['tradeAddicts'] ? 'Show less' : `Show all ${stats.TradeAddicts.length}`}
							</button>
						{/if}
					{:else}
						<p class="text-center text-sm text-base-content/70">No trade data available.</p>
					{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

{:else}
	<p>No league stats available.</p>
{/if}
