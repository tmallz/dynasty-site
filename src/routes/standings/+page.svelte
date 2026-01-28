<script lang="ts">
	import type { PageData } from './$types';
	import type { FullStandingTeam, StandingsSummary } from '$lib/Utilities/StandingsHelper';
	import StandingsSkeleton from '$lib/Components/standings/StandingsSkeleton.svelte';
	import StandingsSummaryStats from '$lib/Components/standings/StandingsSummaryStats.svelte';

	export let data: PageData;

	let standings: FullStandingTeam[] = [];
	let summary: StandingsSummary = { totalTeams: 0, totalGamesPlayed: 0, highestScorer: { name: '', points: 0 } };
	let season: string = '';
	let isCurrentSeason: boolean = true;
	let isLoading = true;

	// Sorting state
	let sortBy: 'rank' | 'wins' | 'losses' | 'ties' | 'pf' | 'pa' | 'diff' = 'rank';
	let sortDir: 'asc' | 'desc' = 'asc';

	// Avatar error tracking
	let avatarErrors: Record<number, boolean> = {};

	// Handle streamed data
	$: if (data.streamed?.standingsData) {
		data.streamed.standingsData
			.then((result) => {
				standings = result.standings;
				summary = result.summary;
				season = result.season;
				isCurrentSeason = result.isCurrentSeason;
				isLoading = false;
			})
			.catch((error: Error) => {
				console.error('Failed to load standings:', error);
				isLoading = false;
			});
	}

	// Sorted standings based on current sort state
	$: sortedStandings = [...standings].sort((a, b) => {
		let comparison = 0;
		switch (sortBy) {
			case 'rank':
				comparison = a.rank - b.rank;
				break;
			case 'wins':
				comparison = b.wins - a.wins;
				break;
			case 'losses':
				comparison = b.losses - a.losses;
				break;
			case 'ties':
				comparison = b.ties - a.ties;
				break;
			case 'pf':
				comparison = b.pointsFor - a.pointsFor;
				break;
			case 'pa':
				comparison = b.pointsAgainst - a.pointsAgainst;
				break;
			case 'diff':
				comparison = b.pointsDiff - a.pointsDiff;
				break;
		}
		return sortDir === 'asc' ? comparison : -comparison;
	});

	function handleSort(column: typeof sortBy) {
		if (sortBy === column) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortDir = column === 'rank' ? 'asc' : 'desc';
		}
	}

	function getSortIcon(column: typeof sortBy): string {
		if (sortBy !== column) return '';
		return sortDir === 'asc' ? '↑' : '↓';
	}

	function getRankBadgeClass(rank: number): string {
		switch (rank) {
			case 1:
				return 'bg-yellow-500 text-yellow-900';
			case 2:
				return 'bg-gray-300 text-gray-700';
			case 3:
				return 'bg-amber-600 text-amber-100';
			default:
				return 'bg-base-300 text-base-content';
		}
	}

	function getInitials(name: string): string {
		if (!name) return '?';
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	}

	function handleAvatarError(rosterId: number) {
		avatarErrors[rosterId] = true;
	}
</script>

<main class="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
	<!-- Page Header -->
	<div class="mb-6 md:mb-8 text-center fade-in">
		<h1 class="text-3xl md:text-4xl font-bold mb-2">League Standings</h1>
		<p class="text-sm md:text-base text-base-content/70">
			{season} {isCurrentSeason ? 'Season' : 'Final Standings'}
		</p>
		{#if !isCurrentSeason}
			<div class="badge badge-info mt-2">Showing previous season</div>
		{/if}
	</div>

	{#if isLoading}
		<StandingsSkeleton />
	{:else}
		<!-- Summary Stats -->
		<StandingsSummaryStats {summary} />

		<!-- Standings Table -->
		<div class="card bg-base-200 shadow-lg fade-in" style="animation-delay: 150ms">
			<div class="overflow-x-auto">
				<table class="table table-zebra">
					<thead>
						<tr class="bg-base-300">
							<th
								class="cursor-pointer hover:bg-base-100 transition-colors"
								on:click={() => handleSort('rank')}
							>
								<span class="flex items-center gap-1">
									Rank
									<span class="text-primary">{getSortIcon('rank')}</span>
								</span>
							</th>
							<th>Team</th>
							<th
								class="cursor-pointer hover:bg-base-100 transition-colors text-center"
								on:click={() => handleSort('wins')}
							>
								<span class="flex items-center justify-center gap-1">
									W
									<span class="text-primary">{getSortIcon('wins')}</span>
								</span>
							</th>
							<th
								class="cursor-pointer hover:bg-base-100 transition-colors text-center"
								on:click={() => handleSort('losses')}
							>
								<span class="flex items-center justify-center gap-1">
									L
									<span class="text-primary">{getSortIcon('losses')}</span>
								</span>
							</th>
							<th
								class="cursor-pointer hover:bg-base-100 transition-colors text-center hidden md:table-cell"
								on:click={() => handleSort('ties')}
							>
								<span class="flex items-center justify-center gap-1">
									T
									<span class="text-primary">{getSortIcon('ties')}</span>
								</span>
							</th>
							<th
								class="cursor-pointer hover:bg-base-100 transition-colors text-right"
								on:click={() => handleSort('pf')}
							>
								<span class="flex items-center justify-end gap-1">
									PF
									<span class="text-primary">{getSortIcon('pf')}</span>
								</span>
							</th>
							<th
								class="cursor-pointer hover:bg-base-100 transition-colors text-right hidden md:table-cell"
								on:click={() => handleSort('pa')}
							>
								<span class="flex items-center justify-end gap-1">
									PA
									<span class="text-primary">{getSortIcon('pa')}</span>
								</span>
							</th>
							<th
								class="cursor-pointer hover:bg-base-100 transition-colors text-right hidden md:table-cell"
								on:click={() => handleSort('diff')}
							>
								<span class="flex items-center justify-end gap-1">
									+/-
									<span class="text-primary">{getSortIcon('diff')}</span>
								</span>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each sortedStandings as team, i (team.rosterId)}
							<tr
								class="hover:bg-base-300/50 transition-colors fade-in"
								style="animation-delay: {200 + i * 30}ms"
							>
								<!-- Rank -->
								<td>
									<div
										class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold {getRankBadgeClass(team.rank)}"
									>
										{team.rank}
									</div>
								</td>

								<!-- Team -->
								<td>
									<a
										href="/rosters?team={team.rosterId}"
										class="flex items-center gap-3 hover:text-primary transition-colors"
									>
										<div class="w-8 h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
											{#if team.avatarUrl && !avatarErrors[team.rosterId]}
												<img
													src={team.avatarUrl}
													alt={team.teamName}
													class="w-full h-full object-cover"
													on:error={() => handleAvatarError(team.rosterId)}
												/>
											{:else}
												<div
													class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 text-xs font-bold text-base-content/70"
												>
													{getInitials(team.teamName)}
												</div>
											{/if}
										</div>
										<span class="font-medium truncate max-w-[120px] md:max-w-none">
											{team.teamName}
										</span>
									</a>
								</td>

								<!-- W -->
								<td class="text-center font-medium">{team.wins}</td>

								<!-- L -->
								<td class="text-center font-medium">{team.losses}</td>

								<!-- T -->
								<td class="text-center font-medium hidden md:table-cell">{team.ties}</td>

								<!-- PF -->
								<td class="text-right font-medium">{team.pointsFor.toFixed(1)}</td>

								<!-- PA -->
								<td class="text-right font-medium hidden md:table-cell">
									{team.pointsAgainst.toFixed(1)}
								</td>

								<!-- +/- -->
								<td
									class="text-right font-bold hidden md:table-cell {team.pointsDiff > 0
										? 'text-success'
										: team.pointsDiff < 0
											? 'text-error'
											: ''}"
								>
									{team.pointsDiff > 0 ? '+' : ''}{team.pointsDiff.toFixed(1)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Legend (mobile) -->
		<div class="mt-4 text-xs text-base-content/60 md:hidden">
			<p>PF = Points For | Tap column headers to sort</p>
		</div>
	{/if}
</main>

<style>
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

	.fade-in {
		animation: fade-in 0.4s ease-out forwards;
		opacity: 0;
	}
</style>
