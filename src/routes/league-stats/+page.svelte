<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	const stats = data.stats;
</script>

{#if stats}
	<h1>League Stats (Debug View)</h1>

	<h2>All League Winners</h2>
	{#if stats.Winners && stats.Winners.length}
		{#each stats.Winners as winner}
			<p>
				Season {winner.Season}: {winner.DisplayName ?? 'Unknown'} (Roster {winner.RosterId})
			</p>
		{/each}
	{:else}
		<p>No winners found.</p>
	{/if}

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
{:else}
	<p>No league stats available.</p>
{/if}
