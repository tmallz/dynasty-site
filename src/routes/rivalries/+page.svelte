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

	function getTeamAvatar(rosterId: number): string {
		const roster = data.rosters.find((r) => r.roster_id === rosterId);
		return roster?.AvatarUrl || '';
	}
</script>

<div class="container mx-auto p-6 max-w-7xl">
	<h1 class="text-4xl font-bold mb-8 text-center">Team Rivalries</h1>

	<!-- Team Selection Hero Section -->
	<div class="card bg-base-100 shadow-xl mb-8">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-6 justify-center">Select Teams to Compare</h2>

			<div class="flex flex-col lg:flex-row items-center justify-center gap-6">
				<!-- Team 1 Selection -->
				<div class="flex flex-col items-center gap-3 w-full lg:w-auto">
					{#if selectedTeam1}
						<div class="avatar">
							<div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
								<img src={getTeamAvatar(selectedTeam1)} alt={getTeamName(selectedTeam1)} />
							</div>
						</div>
					{/if}
					<select
						bind:value={selectedTeam1}
						on:change={calculateStats}
						class="select select-primary select-lg w-full max-w-xs font-semibold"
					>
						<option value={null}>Select Team 1</option>
						{#each data.rosters as roster}
							<option value={roster.roster_id}>{roster.TeamName}</option>
						{/each}
					</select>
				</div>

				<!-- VS Divider -->
				<div class="text-4xl font-bold text-primary hidden lg:block">VS</div>
				<div class="text-2xl font-bold text-primary lg:hidden">VS</div>

				<!-- Team 2 Selection -->
				<div class="flex flex-col items-center gap-3 w-full lg:w-auto">
					{#if selectedTeam2}
						<div class="avatar">
							<div class="w-24 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
								<img src={getTeamAvatar(selectedTeam2)} alt={getTeamName(selectedTeam2)} />
							</div>
						</div>
					{/if}
					<select
						bind:value={selectedTeam2}
						on:change={calculateStats}
						class="select select-secondary select-lg w-full max-w-xs font-semibold"
					>
						<option value={null}>Select Team 2</option>
						{#each data.rosters as roster}
							<option value={roster.roster_id}>{roster.TeamName}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Stats Display -->
	{#if rivalryStats && selectedTeam1 !== null && selectedTeam2 !== null}
		<!-- Overall Record - Featured Card -->
		<div class="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-2xl mb-8">
			<div class="card-body items-center text-center">
				<h2 class="card-title text-3xl mb-4">Head-to-Head Record</h2>
				<div class="flex items-center justify-center gap-8 flex-wrap">
					<div class="text-center">
						<div class="avatar mb-2">
							<div class="w-16 rounded-full">
								<img src={getTeamAvatar(selectedTeam1)} alt={getTeamName(selectedTeam1)} />
							</div>
						</div>
						<p class="text-sm opacity-90">{getTeamName(selectedTeam1)}</p>
						<p class="text-6xl font-bold my-2">{rivalryStats.team1Wins}</p>
					</div>

					<div class="text-5xl font-bold opacity-50">-</div>

					<div class="text-center">
						<div class="avatar mb-2">
							<div class="w-16 rounded-full">
								<img src={getTeamAvatar(selectedTeam2)} alt={getTeamName(selectedTeam2)} />
							</div>
						</div>
						<p class="text-sm opacity-90">{getTeamName(selectedTeam2)}</p>
						<p class="text-6xl font-bold my-2">{rivalryStats.team2Wins}</p>
					</div>
				</div>
				<div class="divider">Total Games: {rivalryStats.totalGames}</div>
				{#if rivalryStats.ties > 0}
					<p class="text-sm opacity-75">Ties: {rivalryStats.ties}</p>
				{/if}
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Biggest Blowouts Card -->
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h3 class="card-title text-xl">
						<span class="text-3xl">💥</span>
						Biggest Blowouts
					</h3>
					<div class="divider my-1"></div>

					<!-- Team 1 Blowout -->
					<div class="mb-4">
						<div class="flex items-center gap-2 mb-2">
							<div class="avatar">
								<div class="w-8 rounded-full">
									<img src={getTeamAvatar(selectedTeam1)} alt={getTeamName(selectedTeam1)} />
								</div>
							</div>
							<p class="font-semibold">{getTeamName(selectedTeam1)}</p>
						</div>
						{#if rivalryStats.team1BiggestBlowout}
							<div class="bg-base-200 rounded-lg p-3">
								<p class="text-sm">
									<span class="badge badge-primary badge-sm"
										>{rivalryStats.team1BiggestBlowout.season}</span
									>
									Week {rivalryStats.team1BiggestBlowout.week}
								</p>
								<p class="text-lg font-bold mt-1">
									{rivalryStats.team1BiggestBlowout.team1Score.toFixed(2)} - {rivalryStats.team1BiggestBlowout.team2Score.toFixed(
										2
									)}
								</p>
								<p class="text-sm text-success">
									+{rivalryStats.team1BiggestBlowout.margin.toFixed(2)} point margin
								</p>
							</div>
						{:else}
							<p class="text-sm text-base-content/50 italic">No wins</p>
						{/if}
					</div>

					<!-- Team 2 Blowout -->
					<div>
						<div class="flex items-center gap-2 mb-2">
							<div class="avatar">
								<div class="w-8 rounded-full">
									<img src={getTeamAvatar(selectedTeam2)} alt={getTeamName(selectedTeam2)} />
								</div>
							</div>
							<p class="font-semibold">{getTeamName(selectedTeam2)}</p>
						</div>
						{#if rivalryStats.team2BiggestBlowout}
							<div class="bg-base-200 rounded-lg p-3">
								<p class="text-sm">
									<span class="badge badge-secondary badge-sm"
										>{rivalryStats.team2BiggestBlowout.season}</span
									>
									Week {rivalryStats.team2BiggestBlowout.week}
								</p>
								<p class="text-lg font-bold mt-1">
									{rivalryStats.team2BiggestBlowout.team2Score.toFixed(2)} - {rivalryStats.team2BiggestBlowout.team1Score.toFixed(
										2
									)}
								</p>
								<p class="text-sm text-success">
									+{rivalryStats.team2BiggestBlowout.margin.toFixed(2)} point margin
								</p>
							</div>
						{:else}
							<p class="text-sm text-base-content/50 italic">No wins</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Narrowest Victories Card -->
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h3 class="card-title text-xl">
						<span class="text-3xl">⚡</span>
						Narrowest Victories
					</h3>
					<div class="divider my-1"></div>

					<!-- Team 1 Narrowest -->
					<div class="mb-4">
						<div class="flex items-center gap-2 mb-2">
							<div class="avatar">
								<div class="w-8 rounded-full">
									<img src={getTeamAvatar(selectedTeam1)} alt={getTeamName(selectedTeam1)} />
								</div>
							</div>
							<p class="font-semibold">{getTeamName(selectedTeam1)}</p>
						</div>
						{#if rivalryStats.team1NarrowestVictory}
							<div class="bg-base-200 rounded-lg p-3">
								<p class="text-sm">
									<span class="badge badge-primary badge-sm"
										>{rivalryStats.team1NarrowestVictory.season}</span
									>
									Week {rivalryStats.team1NarrowestVictory.week}
								</p>
								<p class="text-lg font-bold mt-1">
									{rivalryStats.team1NarrowestVictory.team1Score.toFixed(2)} - {rivalryStats.team1NarrowestVictory.team2Score.toFixed(
										2
									)}
								</p>
								<p class="text-sm text-warning">
									+{rivalryStats.team1NarrowestVictory.margin.toFixed(2)} point margin
								</p>
							</div>
						{:else}
							<p class="text-sm text-base-content/50 italic">No wins</p>
						{/if}
					</div>

					<!-- Team 2 Narrowest -->
					<div>
						<div class="flex items-center gap-2 mb-2">
							<div class="avatar">
								<div class="w-8 rounded-full">
									<img src={getTeamAvatar(selectedTeam2)} alt={getTeamName(selectedTeam2)} />
								</div>
							</div>
							<p class="font-semibold">{getTeamName(selectedTeam2)}</p>
						</div>
						{#if rivalryStats.team2NarrowestVictory}
							<div class="bg-base-200 rounded-lg p-3">
								<p class="text-sm">
									<span class="badge badge-secondary badge-sm"
										>{rivalryStats.team2NarrowestVictory.season}</span
									>
									Week {rivalryStats.team2NarrowestVictory.week}
								</p>
								<p class="text-lg font-bold mt-1">
									{rivalryStats.team2NarrowestVictory.team2Score.toFixed(2)} - {rivalryStats.team2NarrowestVictory.team1Score.toFixed(
										2
									)}
								</p>
								<p class="text-sm text-warning">
									+{rivalryStats.team2NarrowestVictory.margin.toFixed(2)} point margin
								</p>
							</div>
						{:else}
							<p class="text-sm text-base-content/50 italic">No wins</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Trades Card -->
			<div class="card bg-base-100 shadow-xl">
				<div class="card-body">
					<h3 class="card-title text-xl">
						<span class="text-3xl">🤝</span>
						Trade History
					</h3>
					<div class="divider my-1"></div>

					<div class="text-center mb-4">
						<p class="text-5xl font-bold text-primary">{rivalryStats.totalTrades}</p>
						<p class="text-sm text-base-content/70">Total Trades</p>
					</div>

					{#if rivalryStats.tradeDetails.length > 0}
						<div class="overflow-auto max-h-64">
							<div class="space-y-2">
								{#each rivalryStats.tradeDetails as trade}
									<div class="bg-base-200 rounded-lg p-2 text-sm">
										<span class="badge badge-accent badge-sm">{trade.season}</span>
										<span class="ml-2">Week {trade.week}</span>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<p class="text-sm text-base-content/50 italic text-center">No trades between these teams</p>
					{/if}
				</div>
			</div>
		</div>
	{:else if selectedTeam1 && selectedTeam2 && selectedTeam1 === selectedTeam2}
		<div class="alert alert-error shadow-lg">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="stroke-current flex-shrink-0 h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>Please select two different teams.</span>
		</div>
	{:else}
		<div class="alert alert-info shadow-lg">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-current flex-shrink-0 w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			<span>Select two teams from the dropdowns above to view their rivalry statistics.</span>
		</div>
	{/if}
</div>
