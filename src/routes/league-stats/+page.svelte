<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	const stats = data.stats;
</script>

{#if stats}
	<div class="container mx-auto px-4 py-8">
		<h1 class="text-4xl font-bold text-center mb-8">League Stats</h1>

		<!-- Two-column grid layout for tables -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- Top Scoring Weeks Table -->
			<div class="card bg-base-200 shadow-xl mx-auto w-fit">
				<div class="card-body px-4 py-4">
					{#if stats.TopScoringWeeks && stats.TopScoringWeeks.length}
						<div class="overflow-x-auto">
							<table class="table table-zebra table-sm w-full min-w-[500px] border-2 border-base-content/20">
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
										<th class="w-10"></th>
										<th>Manager</th>
										<th class="w-20">Season</th>
										<th class="w-20">Points</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.TopScoringWeeks as weekRecord, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
											<td>
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
																	src="https://sleepercdn.com/avatars/{data.users?.find(
																		(u) => u.user_id === weekRecord.UserId
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
											<td class="font-bold text-lg">{weekRecord.Points}</td>
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
			<div class="card bg-base-200 shadow-xl mx-auto w-fit">
				<div class="card-body px-4 py-4">
					{#if stats.BottomScoringWeeks && stats.BottomScoringWeeks.length}
						<div class="overflow-x-auto">
							<table class="table table-zebra table-sm w-full min-w-[500px] border-2 border-base-content/20">
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
										<th class="w-10"></th>
										<th>Manager</th>
										<th class="w-20">Season</th>
										<th class="w-20">Points</th>
									</tr>
								</thead>
								<tbody>
									{#each stats.BottomScoringWeeks as weekRecord, index}
										<tr class="border-b border-base-content/20">
											<td class="font-semibold">{index + 1}</td>
											<td>
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
																	src="https://sleepercdn.com/avatars/{data.users?.find(
																		(u) => u.user_id === weekRecord.UserId
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
											<td class="font-bold text-lg">{weekRecord.Points}</td>
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
		
		<!-- Debug sections below - keeping for now -->
		<div class="mt-8">
	<h2>Top Scoring Weeks (Top 10)</h2>
	{#if stats.TopScoringWeeks && stats.TopScoringWeeks.length}
		{#each stats.TopScoringWeeks as weekRecord, index}
			<p>
				#{index + 1}: Season {weekRecord.Season}, Week {weekRecord.Week}:
				{weekRecord.DisplayName ?? 'Unknown'} scored {weekRecord.Points} points
			</p>
		{/each}
	{:else}
		<p>No top scoring week data.</p>
	{/if}

	<h2>Lowest Scoring Weeks (Bottom 10)</h2>
	{#if stats.BottomScoringWeeks && stats.BottomScoringWeeks.length}
		{#each stats.BottomScoringWeeks as weekRecord, index}
			<p>
				#{index + 1}: Season {weekRecord.Season}, Week {weekRecord.Week}:
				{weekRecord.DisplayName ?? 'Unknown'} scored {weekRecord.Points} points
			</p>
		{/each}
	{:else}
		<p>No lowest week data.</p>
	{/if}

	<h2>Top 3 Highest Season Scoring Teams</h2>
	{#if stats.TopSeasons && stats.TopSeasons.length}
		{#each stats.TopSeasons as seasonRecord, index}
			<p>
				#{index + 1}: Season {seasonRecord.Season}:
				{seasonRecord.DisplayName ?? 'Unknown'} scored {seasonRecord.TotalPoints} total points
			</p>
		{/each}
	{:else}
		<p>No highest season data.</p>
	{/if}

	<h2>Lowest Season Scoring Team</h2>
	{#if stats.LowestSeason}
		<p>
			Season {stats.LowestSeason.Season}:
			{stats.LowestSeason.DisplayName ?? 'Unknown'} scored
			{stats.LowestSeason.TotalPoints} total points
		</p>
	{:else}
		<p>No lowest season data.</p>
	{/if}

	<h2>Top 3 Highest Winning Percentages</h2>
	{#if stats.HighestWinningPercentages && stats.HighestWinningPercentages.length}
		{#each stats.HighestWinningPercentages as record, index}
			<p>
				#{index + 1}: {record.DisplayName ?? 'Unknown'}:
				{record.Wins} wins / {record.Losses} losses
				({Math.round((record.WinPercentage ?? 0) * 1000) / 10}% )
			</p>
		{/each}
	{:else}
		<p>No highest winning percentage data.</p>
	{/if}

	<h2>Bottom 3 Lowest Winning Percentages</h2>
	{#if stats.LowestWinningPercentages && stats.LowestWinningPercentages.length}
		{#each stats.LowestWinningPercentages as record, index}
			<p>
				#{index + 1}: {record.DisplayName ?? 'Unknown'}:
				{record.Wins} wins / {record.Losses} losses
				({Math.round((record.WinPercentage ?? 0) * 1000) / 10}% )
			</p>
		{/each}
	{:else}
		<p>No lowest winning percentage data.</p>
	{/if}

	<h2>Top 10 Largest Blowouts</h2>
	{#if stats.LargestBlowouts && stats.LargestBlowouts.length}
		{#each stats.LargestBlowouts as game, index}
			<p>
				#{index + 1}: Season {game.Season}, Week {game.Week} -
				{game.WinnerDisplayName ?? 'Unknown'} {game.WinnerPoints} vs
				{game.LoserDisplayName ?? 'Unknown'} {game.LoserPoints} (margin {game.Margin})
			</p>
		{/each}
	{:else}
		<p>No blowout data.</p>
	{/if}

	<h2>Top 10 Closest Victories</h2>
	{#if stats.ClosestVictories && stats.ClosestVictories.length}
		{#each stats.ClosestVictories as game, index}
			<p>
				#{index + 1}: Season {game.Season}, Week {game.Week} -
				{game.WinnerDisplayName ?? 'Unknown'} {game.WinnerPoints} vs
				{game.LoserDisplayName ?? 'Unknown'} {game.LoserPoints} (margin {game.Margin})
			</p>
		{/each}
	{:else}
		<p>No closest victory data.</p>
	{/if}
		</div>
	</div>
{:else}
	<p>No league stats available.</p>
{/if}
