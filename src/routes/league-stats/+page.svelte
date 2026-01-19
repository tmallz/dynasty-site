<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	
	let stats: any = null;
	let users: any = null;
	let isLoading = true;

	// Handle streamed data
	$: if (data.streamed?.leagueData) {
		data.streamed.leagueData.then((result: any) => {
			stats = result.stats;
			users = result.users;
			isLoading = false;
		});
	}
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
</style>

{#if isLoading}
	<!-- Loading State -->
	<div class="flex flex-col items-center justify-center py-20">
		<span class="loading loading-spinner loading-lg text-primary mb-4"></span>
		<p class="text-lg font-semibold">Loading league stats...</p>
		<p class="text-sm text-base-content/70 mt-2">This may take a few seconds</p>
	</div>
{:else if stats}
	<div class="container mx-auto px-4 py-8">
		<h1 class="text-4xl font-bold text-center mb-8">League Stats</h1>

		<!-- Two-column grid layout for tables -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Top Scoring Weeks Table -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					{#if stats.TopScoringWeeks && stats.TopScoringWeeks.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20">
								<thead>
									<tr>
										<th colspan="5" class="text-center text-lg font-bold border-b-2 border-base-content/20">
											<div class="flex items-center justify-center gap-2">
												<span class="text-2xl">🔥</span>
												Highest Scoring Weeks
											</div>
										</th>
									</tr>
									<tr class="border-b border-base-content/20">
										<th class="w-12"></th>
									<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-20">Season</th>
										<th class="w-20">Points</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.TopScoringWeeks as weekRecord, index}
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
					{:else}
						<p class="text-center text-sm text-base-content/70">No top scoring week data available.</p>
					{/if}
				</div>
			</div>

			<!-- Lowest Scoring Weeks Table -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					{#if stats.BottomScoringWeeks && stats.BottomScoringWeeks.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20">
								<thead>
									<tr>
										<th colspan="5" class="text-center text-lg font-bold border-b-2 border-base-content/20">
											<div class="flex items-center justify-center gap-2">
												<span class="text-2xl">💩</span>
												Lowest Scoring Weeks
											</div>
										</th>
									</tr>
									<tr class="border-b border-base-content/20">
										<th class="w-12"></th>
									<th class="w-10 hidden lg:table-cell"></th>
										<th>Manager</th>
										<th class="w-20">Season</th>
										<th class="w-20">Points</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.BottomScoringWeeks as weekRecord, index}
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
					{:else}
						<p class="text-center text-sm text-base-content/70">No lowest scoring week data available.</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Row 2: Season Totals -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Top 3 Highest Season Scoring -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					{#if stats.TopSeasons && stats.TopSeasons.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20">
								<thead>
									<tr>
										<th colspan="4" class="text-center text-lg font-bold border-b-2 border-base-content/20">
											<div class="flex items-center justify-center gap-2">
												<span class="text-2xl">🔥</span>
												Highest Scoring Seasons
											</div>
										</th>
									</tr>
									<tr class="border-b border-base-content/20">
										<th class="w-12"></th>
										<th>Manager</th>
										<th class="w-24">Season</th>
										<th class="w-24">Total Points</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.TopSeasons as seasonRecord, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">
												{#if index === 0}
													<span class="text-xl">🥇</span>
												{:else if index === 1}
													<span class="text-xl">🥈</span>
												{:else if index === 2}
													<span class="text-xl">🥉</span>
												{:else}
													{index + 1}
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
					{:else}
						<p class="text-center text-sm text-base-content/70">No season scoring data available.</p>
					{/if}
				</div>
			</div>

			<!-- Lowest Season Scoring -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					{#if stats.BottomSeasons && stats.BottomSeasons.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20">
								<thead>
									<tr>
										<th colspan="4" class="text-center text-lg font-bold border-b-2 border-base-content/20">
											<div class="flex items-center justify-center gap-2">
												<span class="text-2xl">💩</span>
												Lowest Scoring Seasons
											</div>
										</th>
									</tr>
									<tr class="border-b border-base-content/20">
										<th class="w-12"></th>
										<th>Manager</th>
										<th class="w-24">Season</th>
										<th class="w-24">Total Points</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.BottomSeasons as seasonRecord, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">
												{#if index < 3}
													<span class="text-xl">💩</span>
												{:else}
													{index + 1}
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
					{:else}
						<p class="text-center text-sm text-base-content/70">No lowest season data available.</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Row 3: Winning Percentages -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Top 3 Highest Winning Percentages -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					{#if stats.HighestWinningPercentages && stats.HighestWinningPercentages.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20">
								<thead>
									<tr>
										<th colspan="4" class="text-center text-lg font-bold border-b-2 border-base-content/20">
											<div class="flex items-center justify-center gap-2">
												<span class="text-2xl">📈</span>
												Highest Winning Percentages
											</div>
										</th>
									</tr>
									<tr class="border-b border-base-content/20">
										<th class="w-12"></th>
										<th>Manager</th>
										<th class="w-24">Record</th>
										<th class="w-24">Win %</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.HighestWinningPercentages as record, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">
												{#if index === 0}
													<span class="text-xl">🥇</span>
												{:else if index === 1}
													<span class="text-xl">🥈</span>
												{:else if index === 2}
													<span class="text-xl">🥉</span>
												{:else}
													{index + 1}
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
					{:else}
						<p class="text-center text-sm text-base-content/70">No winning percentage data available.</p>
					{/if}
				</div>
			</div>

			<!-- Bottom 3 Lowest Winning Percentages -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					{#if stats.LowestWinningPercentages && stats.LowestWinningPercentages.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20">
								<thead>
									<tr>
										<th colspan="4" class="text-center text-lg font-bold border-b-2 border-base-content/20">
											<div class="flex items-center justify-center gap-2">
												<span class="text-2xl">📉</span>
												Lowest Winning Percentages
											</div>
										</th>
									</tr>
									<tr class="border-b border-base-content/20">
										<th class="w-12"></th>
										<th>Manager</th>
										<th class="w-24">Record</th>
										<th class="w-24">Win %</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.LowestWinningPercentages as record, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
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
					{:else}
						<p class="text-center text-sm text-base-content/70">No winning percentage data available.</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Row 4: Blowouts and Close Games -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Top 10 Largest Blowouts -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					{#if stats.LargestBlowouts && stats.LargestBlowouts.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20">
								<thead>
									<tr>
										<th colspan="5" class="text-center text-lg font-bold border-b-2 border-base-content/20">
											<div class="flex items-center justify-center gap-2">
												<span class="text-2xl">💥</span>
												Biggest Blowouts
											</div>
										</th>
									</tr>
									<tr class="border-b border-base-content/20">
										<th class="w-12"></th>
									<th class="w-10 hidden lg:table-cell"></th>
										<th>Matchup</th>
										<th class="w-20">Week</th>
										<th class="w-24">Margin</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.LargestBlowouts as game, index}
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
					{:else}
						<p class="text-center text-sm text-base-content/70">No blowout data available.</p>
					{/if}
				</div>
			</div>

			<!-- Top 10 Closest Victories -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					{#if stats.ClosestVictories && stats.ClosestVictories.length}
						<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full border-2 border-base-content/20">
								<thead>
									<tr>
										<th colspan="5" class="text-center text-lg font-bold border-b-2 border-base-content/20">
											<div class="flex items-center justify-center gap-2">
												<span class="text-2xl">⚡</span>
												Closest Games
											</div>
										</th>
									</tr>
									<tr class="border-b border-base-content/20">
										<th class="w-12"></th>
									<th class="w-10 hidden lg:table-cell"></th>
										<th>Matchup</th>
										<th class="w-20">Week</th>
										<th class="w-24">Margin</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.ClosestVictories as game, index}
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
					{:else}
						<p class="text-center text-sm text-base-content/70">No close game data available.</p>
					{/if}
				</div>
			</div>
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body px-4 py-4">
					{#if stats.BiggestSkanks && stats.BiggestSkanks.length}
				<div class="card bg-base-200 shadow-xl">
					<div class="card-body px-4 py-4">
						<div class="overflow-x-auto">
							<table class="table table-zebra table-sm w-full border-2 border-base-content/20">
								<thead>
									<tr>
										<th colspan="5" class="text-center text-lg font-bold border-b-2 border-base-content/20">
											<div class="flex items-center justify-center gap-2">
												<span class="text-2xl">🦄</span>
												Biggest Skanks (Most Teams Played For)
											</div>
										</th>
									</tr>
									<tr class="border-b border-base-content/20">
										<th class="w-12">#</th>
										<th class="w-10 hidden lg:table-cell"></th>
										<th>Player</th>
										<th class="w-40">Last Acquired</th>
										<th class="w-20">Teams</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.BiggestSkanks as skank, idx}
									<tr class="border-b border-base-content/20">
										<td class="font-semibold">{idx + 1}</td>
										<td class="hidden lg:table-cell">
											{#if idx < 3}
												<span class="text-xl">🦄</span>
											{/if}
										</td>
										<td>
											<span class="font-medium truncate">{skank.DisplayName || skank.FirstName + ' ' + skank.LastName || skank.PlayerId}</span>
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
					</div>
				</div>
				{/if}
				</div>
			</div>
		</div>
	</div>

{:else}
	<p>No league stats available.</p>
{/if}


