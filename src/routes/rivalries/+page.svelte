<script lang="ts">
	import type { PageData } from './$types';
	import { RivalriesHelper } from '$lib/Utilities/RivalriesHelper';
	import type { RivalryStats } from '$lib/Utilities/RivalriesHelper';

	export let data: PageData;

	let selectedTeam1: number | null = null;
	let selectedTeam2: number | null = null;
	let rivalryStats: RivalryStats | null = null;

	function calculateStats() {
		if (selectedTeam1 && selectedTeam2 && selectedTeam1 !== selectedTeam2) {
			rivalryStats = RivalriesHelper.CalculateRivalryStats(
				selectedTeam1,
				selectedTeam2,
				data.matchups,
				data.transactions
			);
		} else {
			rivalryStats = null;
		}
	}

	function getTeamName(rosterId: number): string {
		const roster = data.rosters.find((r) => r.roster_id === rosterId);
		return roster?.TeamName || 'Unknown Team';
	}
</script>

<div class="p-6">
	<h1 class="text-3xl font-bold mb-6">Team Rivalries</h1>

	<!-- Team Selection -->
	<div class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Select Teams</h2>

		<div class="mb-4">
			<label for="team1" class="block mb-2">Team 1:</label>
			<select
				id="team1"
				bind:value={selectedTeam1}
				on:change={calculateStats}
				class="select select-bordered w-full max-w-xs"
			>
				<option value={null}>Select Team 1</option>
				{#each data.rosters as roster}
					<option value={roster.roster_id}>{roster.TeamName}</option>
				{/each}
			</select>
		</div>

		<div class="mb-4">
			<label for="team2" class="block mb-2">Team 2:</label>
			<select
				id="team2"
				bind:value={selectedTeam2}
				on:change={calculateStats}
				class="select select-bordered w-full max-w-xs"
			>
				<option value={null}>Select Team 2</option>
				{#each data.rosters as roster}
					<option value={roster.roster_id}>{roster.TeamName}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Stats Display -->
	{#if rivalryStats && selectedTeam1 !== null && selectedTeam2 !== null}
		<div>
			<h2 class="text-2xl font-bold mb-4">
				{getTeamName(selectedTeam1)} vs {getTeamName(selectedTeam2)}
			</h2>

			<!-- Overall Record -->
			<div class="mb-6">
				<h3 class="text-xl font-semibold mb-2">Overall Record</h3>
				<p>Total Games: {rivalryStats.totalGames}</p>
				<p>{getTeamName(selectedTeam1)} Wins: {rivalryStats.team1Wins}</p>
				<p>{getTeamName(selectedTeam2)} Wins: {rivalryStats.team2Wins}</p>
				{#if rivalryStats.ties > 0}
					<p>Ties: {rivalryStats.ties}</p>
				{/if}
			</div>

			<!-- Biggest Blowouts -->
			<div class="mb-6">
				<h3 class="text-xl font-semibold mb-2">Biggest Blowouts</h3>
				{#if rivalryStats.team1BiggestBlowout}
					<div class="mb-2">
						<p class="font-semibold">{getTeamName(selectedTeam1)}:</p>
						<p>
							{rivalryStats.team1BiggestBlowout.season} Week {rivalryStats.team1BiggestBlowout
								.week}
						</p>
						<p>
							Score: {rivalryStats.team1BiggestBlowout.team1Score.toFixed(2)} - {rivalryStats.team1BiggestBlowout.team2Score.toFixed(
								2
							)}
						</p>
						<p>Margin: {rivalryStats.team1BiggestBlowout.margin.toFixed(2)} points</p>
					</div>
				{:else}
					<p>{getTeamName(selectedTeam1)}: No wins</p>
				{/if}

				{#if rivalryStats.team2BiggestBlowout}
					<div>
						<p class="font-semibold">{getTeamName(selectedTeam2)}:</p>
						<p>
							{rivalryStats.team2BiggestBlowout.season} Week {rivalryStats.team2BiggestBlowout
								.week}
						</p>
						<p>
							Score: {rivalryStats.team2BiggestBlowout.team2Score.toFixed(2)} - {rivalryStats.team2BiggestBlowout.team1Score.toFixed(
								2
							)}
						</p>
						<p>Margin: {rivalryStats.team2BiggestBlowout.margin.toFixed(2)} points</p>
					</div>
				{:else}
					<p>{getTeamName(selectedTeam2)}: No wins</p>
				{/if}
			</div>

			<!-- Narrowest Victories -->
			<div class="mb-6">
				<h3 class="text-xl font-semibold mb-2">Narrowest Victories</h3>
				{#if rivalryStats.team1NarrowestVictory}
					<div class="mb-2">
						<p class="font-semibold">{getTeamName(selectedTeam1)}:</p>
						<p>
							{rivalryStats.team1NarrowestVictory.season} Week {rivalryStats.team1NarrowestVictory
								.week}
						</p>
						<p>
							Score: {rivalryStats.team1NarrowestVictory.team1Score.toFixed(2)} - {rivalryStats.team1NarrowestVictory.team2Score.toFixed(
								2
							)}
						</p>
						<p>Margin: {rivalryStats.team1NarrowestVictory.margin.toFixed(2)} points</p>
					</div>
				{:else}
					<p>{getTeamName(selectedTeam1)}: No wins</p>
				{/if}

				{#if rivalryStats.team2NarrowestVictory}
					<div>
						<p class="font-semibold">{getTeamName(selectedTeam2)}:</p>
						<p>
							{rivalryStats.team2NarrowestVictory.season} Week {rivalryStats.team2NarrowestVictory
								.week}
						</p>
						<p>
							Score: {rivalryStats.team2NarrowestVictory.team2Score.toFixed(2)} - {rivalryStats.team2NarrowestVictory.team1Score.toFixed(
								2
							)}
						</p>
						<p>Margin: {rivalryStats.team2NarrowestVictory.margin.toFixed(2)} points</p>
					</div>
				{:else}
					<p>{getTeamName(selectedTeam2)}: No wins</p>
				{/if}
			</div>

			<!-- Trades -->
			<div class="mb-6">
				<h3 class="text-xl font-semibold mb-2">Trades Between Teams</h3>
				<p>Total Trades: {rivalryStats.totalTrades}</p>
				{#if rivalryStats.tradeDetails.length > 0}
					<div class="mt-2">
						<p class="font-semibold">Trade History:</p>
						<ul>
							{#each rivalryStats.tradeDetails as trade}
								<li>
									{trade.season} Week {trade.week}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	{:else if selectedTeam1 && selectedTeam2 && selectedTeam1 === selectedTeam2}
		<p class="text-red-500">Please select two different teams.</p>
	{:else}
		<p class="text-gray-500">Select two teams to view rivalry statistics.</p>
	{/if}
</div>
