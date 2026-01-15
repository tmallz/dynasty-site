<script lang="ts">
	import type { PageData } from './$types';
	import { RivalriesHelper } from '$lib/Utilities/RivalriesHelper';
	import type { RivalryStats } from '$lib/Utilities/RivalriesHelper';

	export let data: PageData;

	let selectedTeam1: number | null = null;
	let selectedTeam2: number | null = null;
	let rivalryStats: RivalryStats | null = null;

	// Type for the loaded data
	interface RivalriesData {
		rosters: any[];
		matchups: any;
		transactions: any[];
		users: any[];
		brackets: any;
		players: any;
	}

	let loadedData: RivalriesData | null = null;
	let isLoading = true;
	
	// Additional stats
	let seasonBreakdown: Record<string, { team1Wins: number; team2Wins: number; ties: number }> = {};
	let team1AvgScore = 0;
	let team2AvgScore = 0;
	let playoffGames = 0;
	let regularSeasonGames = 0;
	let team1PlayoffWins = 0;
	let team2PlayoffWins = 0;
	
	function isPlayoffGame(week: number): boolean {
		// Typically weeks 15-17 are playoffs in fantasy
		return week >= 15 && week <= 17;
	}

	// Handle streamed data
	$: if (data.streamed?.rivalriesData) {
		data.streamed.rivalriesData.then((result: RivalriesData) => {
			loadedData = result;
			isLoading = false;
		});
	}

	function calculateStats() {
		if (!loadedData || !selectedTeam1 || !selectedTeam2 || selectedTeam1 === selectedTeam2) {
			rivalryStats = null;
			seasonBreakdown = {};
			team1AvgScore = 0;
			team2AvgScore = 0;
			playoffGames = 0;
			regularSeasonGames = 0;
			team1PlayoffWins = 0;
			team2PlayoffWins = 0;
			return;
		}

		rivalryStats = RivalriesHelper.CalculateRivalryStats(
			selectedTeam1,
			selectedTeam2,
			loadedData.matchups,
			loadedData.transactions,
			loadedData.brackets
		);
		
		// Calculate season breakdown
		seasonBreakdown = {};
		let team1TotalScore = 0;
		let team2TotalScore = 0;
		let gameCount = 0;
		
		const headToHeadGames = RivalriesHelper.findHeadToHeadMatchups(
			selectedTeam1,
			selectedTeam2,
			loadedData.matchups,
			loadedData.brackets
		);
		
		headToHeadGames.forEach((game: any) => {
			if (!seasonBreakdown[game.season]) {
				seasonBreakdown[game.season] = { team1Wins: 0, team2Wins: 0, ties: 0 };
			}
			
			team1TotalScore += game.team1Score;
			team2TotalScore += game.team2Score;
			gameCount++;
			
			// Track playoff vs regular season
			if (isPlayoffGame(game.week)) {
				playoffGames++;
				if (game.team1Score > game.team2Score) {
					team1PlayoffWins++;
				} else if (game.team2Score > game.team1Score) {
					team2PlayoffWins++;
				}
			} else {
				regularSeasonGames++;
			}
			
			if (game.team1Score > game.team2Score) {
				seasonBreakdown[game.season].team1Wins++;
			} else if (game.team2Score > game.team1Score) {
				seasonBreakdown[game.season].team2Wins++;
			} else {
				seasonBreakdown[game.season].ties++;
			}
		});
		
		team1AvgScore = gameCount > 0 ? team1TotalScore / gameCount : 0;
		team2AvgScore = gameCount > 0 ? team2TotalScore / gameCount : 0;
	}

	function getTeamName(rosterId: number): string {
		if (!loadedData) return 'Unknown Team';
		const roster = loadedData.rosters.find((r: any) => r.roster_id === rosterId);
		return roster?.TeamName || 'Unknown Team';
	}

	function getTeamAvatar(rosterId: number): string {
		if (!loadedData) return '';
		const roster = loadedData.rosters.find((r: any) => r.roster_id === rosterId);
		return roster?.AvatarUrl || '';
	}

	function getPlayerName(playerId: string): string {
		if (!loadedData) return playerId;
		const player = loadedData.players[playerId];
		if (player) {
			const fullName = `${player.first_name || ''} ${player.last_name || ''}`.trim();
			return fullName || playerId;
		}
		return playerId;
	}
</script>

<div class="container mx-auto p-6 max-w-7xl">
	<h1 class="text-4xl font-bold mb-8 text-center">Team Rivalries</h1>

	{#if isLoading}
		<!-- Loading State -->
		<div class="flex flex-col items-center justify-center py-20">
			<span class="loading loading-spinner loading-lg text-primary mb-4"></span>
			<p class="text-lg font-semibold">Loading rivalry data...</p>
			<p class="text-sm text-base-content/70 mt-2">This may take a few seconds</p>
		</div>
	{:else}
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
							{#if loadedData}
								{#each loadedData.rosters as roster}
									<option value={roster.roster_id}>{roster.TeamName}</option>
								{/each}
							{/if}
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
							{#if loadedData}
								{#each loadedData.rosters as roster}
									<option value={roster.roster_id}>{roster.TeamName}</option>
								{/each}
							{/if}
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
				
				<!-- Average Scores -->
				<div class="flex gap-8 mt-4 justify-center">
					<div class="text-center">
						<p class="text-xs opacity-75 uppercase tracking-wide">Avg Points</p>
						<p class="text-2xl font-bold">{team1AvgScore.toFixed(2)}</p>
					</div>
					<div class="text-center">
						<p class="text-xs opacity-75 uppercase tracking-wide">Avg Points</p>
						<p class="text-2xl font-bold">{team2AvgScore.toFixed(2)}</p>
					</div>
				</div>
				
				<!-- Playoff vs Regular Season Split -->
				{#if playoffGames > 0}
					<div class="divider text-xs opacity-75">Playoff Record</div>
					<div class="flex gap-6 justify-center text-sm">
						<div class="text-center">
							<p class="text-lg font-bold">{team1PlayoffWins}</p>
							<p class="text-xs opacity-75">{getTeamName(selectedTeam1)}</p>
						</div>
						<div class="text-center">
							<p class="text-lg font-bold">{team2PlayoffWins}</p>
							<p class="text-xs opacity-75">{getTeamName(selectedTeam2)}</p>
						</div>
					</div>
				<p class="text-xs opacity-75 text-center mt-2">{playoffGames} playoff game{playoffGames > 1 ? 's' : ''}, {regularSeasonGames} regular season game{regularSeasonGames > 1 ? 's' : ''}</p>
			{/if}
			</div>
		</div>
		
		<!-- Season Breakdown Card -->
		<div class="card bg-base-100 shadow-xl mb-8">
			<div class="card-body">
				<h2 class="card-title text-2xl mb-4">
					<span class="text-3xl">📅</span>
					Season-by-Season Breakdown
				</h2>
				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Season</th>
								<th class="text-center">{getTeamName(selectedTeam1)}</th>
								<th class="text-center">{getTeamName(selectedTeam2)}</th>
								{#if Object.values(seasonBreakdown).some(s => s.ties > 0)}
									<th class="text-center">Ties</th>
								{/if}
							</tr>
						</thead>
						<tbody>
							{#each Object.entries(seasonBreakdown).sort((a, b) => b[0].localeCompare(a[0])) as [season, record]}
								<tr>
									<td class="font-semibold">{season}</td>
									<td class="text-center">
										<span class="badge badge-primary">{record.team1Wins}</span>
									</td>
									<td class="text-center">
										<span class="badge badge-secondary">{record.team2Wins}</span>
									</td>
									{#if Object.values(seasonBreakdown).some(s => s.ties > 0)}
										<td class="text-center">
											{#if record.ties > 0}
												<span class="badge badge-ghost">{record.ties}</span>
											{:else}
												-
											{/if}
										</td>
									{/if}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
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
									Week {rivalryStats.team1BiggestBlowout.week}								{#if isPlayoffGame(rivalryStats.team1BiggestBlowout.week)}
									<span class="badge badge-warning badge-sm ml-1">🏆 Playoffs</span>
								{/if}								</p>
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
									Week {rivalryStats.team2BiggestBlowout.week}								{#if isPlayoffGame(rivalryStats.team2BiggestBlowout.week)}
									<span class="badge badge-warning badge-sm ml-1">🏆 Playoffs</span>
								{/if}								</p>
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
									Week {rivalryStats.team1NarrowestVictory.week}								{#if isPlayoffGame(rivalryStats.team1NarrowestVictory.week)}
									<span class="badge badge-warning badge-sm ml-1">🏆 Playoffs</span>
								{/if}								</p>
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
									Week {rivalryStats.team2NarrowestVictory.week}								{#if isPlayoffGame(rivalryStats.team2NarrowestVictory.week)}
									<span class="badge badge-warning badge-sm ml-1">🏆 Playoffs</span>
								{/if}								</p>
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

					<!-- Recent Trades with Details -->
					{#if rivalryStats.tradeDetails.length > 0}
						<div class="space-y-3 max-h-96 overflow-y-auto">
							<p class="text-sm font-semibold text-base-content/70">Recent Trades</p>
							{#each rivalryStats.tradeDetails.slice(0, 5) as trade}
								<div class="bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg p-3">
									<div class="flex items-center justify-between mb-2">
										<span class="badge badge-accent badge-sm">{trade.season}</span>
										<span class="text-xs">Week {trade.week}</span>
									</div>

									<div class="grid grid-cols-2 gap-3 text-xs">
										<!-- Team 1 Received -->
										<div>
											<div class="flex items-center gap-1 mb-1">
												<div class="avatar">
													<div class="w-4 rounded-full">
														<img src={getTeamAvatar(selectedTeam1)} alt="" />
													</div>
												</div>
												<p class="font-semibold">Received</p>
											</div>
											<div class="space-y-1">
												{#if trade.team1Adds && trade.team1Adds.length > 0}
													{#each trade.team1Adds as playerId}
														<p class="bg-base-200 rounded px-2 py-0.5">{getPlayerName(playerId)}</p>
													{/each}
												{/if}
												{#if trade.team1Picks && trade.team1Picks.length > 0}
													{#each trade.team1Picks as pick}
														<p class="bg-base-200 rounded px-2 py-0.5">
															{pick.season} Rd {pick.round}
														</p>
													{/each}
												{/if}
												{#if (!trade.team1Adds || trade.team1Adds.length === 0) && (!trade.team1Picks || trade.team1Picks.length === 0)}
													<p class="text-base-content/50 italic">Nothing</p>
												{/if}
											</div>
										</div>

										<!-- Team 2 Received -->
										<div>
											<div class="flex items-center gap-1 mb-1">
												<div class="avatar">
													<div class="w-4 rounded-full">
														<img src={getTeamAvatar(selectedTeam2)} alt="" />
													</div>
												</div>
												<p class="font-semibold">Received</p>
											</div>
											<div class="space-y-1">
												{#if trade.team2Adds && trade.team2Adds.length > 0}
													{#each trade.team2Adds as playerId}
														<p class="bg-base-200 rounded px-2 py-0.5">{getPlayerName(playerId)}</p>
													{/each}
												{/if}
												{#if trade.team2Picks && trade.team2Picks.length > 0}
													{#each trade.team2Picks as pick}
														<p class="bg-base-200 rounded px-2 py-0.5">
															{pick.season} Rd {pick.round}
														</p>
													{/each}
												{/if}
												{#if (!trade.team2Adds || trade.team2Adds.length === 0) && (!trade.team2Picks || trade.team2Picks.length === 0)}
													<p class="text-base-content/50 italic">Nothing</p>
												{/if}
											</div>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-base-content/50 italic text-center">No trades between these teams</p>
					{/if}
				</div>
			</div>
		</div>
		
		<!-- Point Differential Chart Card -->
		<div class="card bg-base-100 shadow-xl mt-8">
			<div class="card-body">
				<h2 class="card-title text-2xl mb-4">
					<span class="text-3xl">📊</span>
					Point Differential Over Time
				</h2>
				<div class="w-full overflow-x-auto">
					{#if rivalryStats.totalGames > 0 && loadedData}
						{@const games = RivalriesHelper.findHeadToHeadMatchups(selectedTeam1, selectedTeam2, loadedData.matchups, loadedData.brackets)}
						{@const sortedGames = [...games].sort((a, b) => {
							if (a.season !== b.season) return a.season.localeCompare(b.season);
							return a.week - b.week;
						})}
						{@const maxDiff = Math.max(...sortedGames.map(g => Math.abs(g.team1Score - g.team2Score)))}
						{@const chartHeight = 300}
						{@const chartWidth = Math.max(800, sortedGames.length * 60)}
						{@const padding = 50}
						
						<svg width="100%" height={chartHeight + padding * 2} viewBox="0 0 {chartWidth} {chartHeight + padding * 2}" class="bg-base-200 rounded-lg">
							<!-- Y-axis line -->
							<line x1={padding} y1={padding} x2={padding} y2={chartHeight + padding} stroke="currentColor" stroke-width="2" opacity="0.3" />
							
							<!-- Zero line (horizontal) -->
							<line x1={padding} y1={chartHeight / 2 + padding} x2={chartWidth - padding} y2={chartHeight / 2 + padding} stroke="currentColor" stroke-width="1" stroke-dasharray="5,5" opacity="0.2" />
							
							<!-- X-axis line -->
							<line x1={padding} y1={chartHeight + padding} x2={chartWidth - padding} y2={chartHeight + padding} stroke="currentColor" stroke-width="2" opacity="0.3" />
							
							<!-- Data points and lines -->
							{#each sortedGames as game, i}
								{@const differential = game.team1Score - game.team2Score}
								{@const normalizedDiff = (differential / (maxDiff * 1.2)) * (chartHeight / 2)}
								{@const x = padding + (i * ((chartWidth - padding * 2) / (sortedGames.length - 1 || 1)))}
								{@const y = (chartHeight / 2 + padding) - normalizedDiff}
								{@const isWin = differential > 0}
								{@const color = isWin ? 'rgb(96, 165, 250)' : 'rgb(248, 113, 113)'}
								
								<!-- Line to next point -->
								{#if i < sortedGames.length - 1}
									{@const nextDiff = sortedGames[i + 1].team1Score - sortedGames[i + 1].team2Score}
									{@const nextNormalizedDiff = (nextDiff / (maxDiff * 1.2)) * (chartHeight / 2)}
									{@const nextX = padding + ((i + 1) * ((chartWidth - padding * 2) / (sortedGames.length - 1 || 1)))}
									{@const nextY = (chartHeight / 2 + padding) - nextNormalizedDiff}
									<line x1={x} y1={y} x2={nextX} y2={nextY} stroke="currentColor" stroke-width="2" opacity="0.3" />
								{/if}
								
								<!-- Data point -->
								<circle cx={x} cy={y} r="6" fill={color} opacity="0.8" class="hover:opacity-100 transition-opacity cursor-pointer">
									<title>{game.season} Week {game.week}: {game.team1Score.toFixed(2)} - {game.team2Score.toFixed(2)} (Diff: {Math.abs(differential).toFixed(2)}){isPlayoffGame(game.week) ? ' 🏆' : ''}</title>
								</circle>
								
								<!-- Week labels on x-axis -->
								{#if i % Math.max(1, Math.floor(sortedGames.length / 10)) === 0}
									<text x={x} y={chartHeight + padding + 20} text-anchor="middle" font-size="10" fill="currentColor" opacity="0.7">
										{game.season.slice(-2)}W{game.week}
									</text>
								{/if}
							{/each}
							
							<!-- Y-axis labels -->
							<text x={padding - 10} y={padding} text-anchor="end" font-size="12" fill="currentColor" opacity="0.7">+{maxDiff.toFixed(0)}</text>
							<text x={padding - 10} y={chartHeight / 2 + padding} text-anchor="end" font-size="12" fill="currentColor" opacity="0.7">0</text>
							<text x={padding - 10} y={chartHeight + padding} text-anchor="end" font-size="12" fill="currentColor" opacity="0.7">-{maxDiff.toFixed(0)}</text>
							
							<!-- Legend -->
							<g transform="translate({chartWidth - 150}, {padding})">
								<circle cx="0" cy="0" r="6" fill="rgb(96, 165, 250)" />
								<text x="12" y="4" font-size="12" fill="currentColor">{getTeamName(selectedTeam1)}</text>
								
								<circle cx="0" cy="20" r="6" fill="rgb(248, 113, 113)" />
								<text x="12" y="24" font-size="12" fill="currentColor">{getTeamName(selectedTeam2)}</text>
							</g>
						</svg>
						
						<div class="flex justify-center gap-6 mt-4 text-sm">
							<div class="stat place-items-center p-4 bg-base-200 rounded-lg">
								<div class="stat-title text-xs">Largest Win Margin</div>
								<div class="stat-value text-2xl text-primary">
									{Math.max(...sortedGames.map(g => Math.abs(g.team1Score - g.team2Score))).toFixed(2)}
								</div>
							</div>
							<div class="stat place-items-center p-4 bg-base-200 rounded-lg">
								<div class="stat-title text-xs">Avg Margin</div>
								<div class="stat-value text-2xl">
									{(sortedGames.reduce((sum, g) => sum + Math.abs(g.team1Score - g.team2Score), 0) / sortedGames.length).toFixed(2)}
								</div>
							</div>
							<div class="stat place-items-center p-4 bg-base-200 rounded-lg">
								<div class="stat-title text-xs">Closest Game</div>
								<div class="stat-value text-2xl text-warning">
									{Math.min(...sortedGames.map(g => Math.abs(g.team1Score - g.team2Score))).toFixed(2)}
								</div>
							</div>
						</div>
					{:else}
						<p class="text-center text-base-content/50 py-8">No games to display</p>
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
	{/if}
</div>
