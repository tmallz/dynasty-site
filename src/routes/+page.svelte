<script lang="ts">
	import type { PageData } from './$types';
	import type { SleeperState } from '$lib/api/dtos/LeagueDtos/SleeperState';
	import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
	import { TransactionType } from '$lib/api/Enums/TransactionType';
	import TrendingPlayer from '$lib/Components/homepage/TrendingPlayer.svelte';
	import CompactTradeTransaction from '$lib/Components/transactions/CompactTradeTransaction.svelte';
	import CompactWaiverTransaction from '$lib/Components/transactions/CompactWaiverTransaction.svelte';
	import HomepageSkeleton from '$lib/Components/homepage/HomepageSkeleton.svelte';
	import HeroSection from '$lib/Components/homepage/HeroSection.svelte';
	import StandingsPreview from '$lib/Components/homepage/StandingsPreview.svelte';
	import MatchupsPreview from '$lib/Components/homepage/MatchupsPreview.svelte';
	import EnhancedChampionCard from '$lib/Components/homepage/EnhancedChampionCard.svelte';
	import { AvatarHelper } from '$lib/Utilities/AvatarHelper';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';
	import type { TrendingPlayerPageDto } from '$lib/Utilities/Dtos/TrendingPlayerPageDto';
	import { PodiumHelper } from '$lib/Utilities/PodiumHelper';
	import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';
	import { TrendingPlayersHelper } from '$lib/Utilities/TredningPlayersHelper';
	import { HomepageHelper, type StandingTeam, type MatchupPreviewDto } from '$lib/Utilities/HomepageHelper';
	import { onMount } from 'svelte';

	export let data: PageData;

	let transactions: TransactionsPageDto[] = [];
	let recentTrades: TransactionsPageDto[] = [];
	let recentWaivers: TransactionsPageDto[] = [];
	let trendingUpPlayers: TrendingPlayerPageDto[] = [];
	let trendingDownPlayers: TrendingPlayerPageDto[] = [];
	let mostRecentWinner: (LeagueUser & { season?: string }) | null = null;
	let sleeperState: SleeperState = {};
	let currentSeasonStatus: string = '';
	let loading: boolean = true;

	// New state for standings and matchups preview
	let standings: StandingTeam[] = [];
	let currentWeekMatchups: MatchupPreviewDto[] = [];
	let currentWeek: number = 1;
	let isOffseason: boolean = false;

	// Handle streamed sleeper state
	$: if (data.streamed?.sleeperState) {
		data.streamed.sleeperState.then((result: SleeperState) => {
			sleeperState = result;
			currentSeasonStatus = result.season_type ?? '';
		});
	}

	let LoadData = async () => {
		try {
			// Load all data in parallel
			const [
				transactionsResult,
				winnerResult,
				trendingUpResult,
				trendingDownResult,
				standingsResult,
				matchupsResult
			] = await Promise.all([
				TransactionsHelper.GetAllTransactions(),
				PodiumHelper.GetMostRecentWinner(),
				TrendingPlayersHelper.GetTrendingUpPlayers(),
				TrendingPlayersHelper.GetTrendingDownPlayers(),
				HomepageHelper.GetStandings(),
				HomepageHelper.GetCurrentWeekMatchupsPreview()
			]);

			transactions = transactionsResult;

			// Filter and limit to top 3 trades
			recentTrades = transactions
				.filter((transaction) => transaction.TransactionType === TransactionType.Trade)
				.slice(0, 3);

			// Filter and limit to top 3 waivers
			recentWaivers = transactions
				.filter(
					(transaction) =>
						transaction.TransactionType === TransactionType.Waiver ||
						transaction.TransactionType === TransactionType.FreeAgent
				)
				.slice(0, 3);

			mostRecentWinner = winnerResult;
			trendingUpPlayers = trendingUpResult;
			trendingDownPlayers = trendingDownResult;

			// Filter out players with missing data (defensive strategy for API timing issues)
			const originalUpCount = trendingUpPlayers.length;
			const originalDownCount = trendingDownPlayers.length;

			trendingUpPlayers = trendingUpPlayers.filter(
				(player) => player.playerName && player.playerPosition && player.playerId
			);
			trendingDownPlayers = trendingDownPlayers.filter(
				(player) => player.playerName && player.playerPosition && player.playerId
			);

			// Log if any players were filtered out
			if (trendingUpPlayers.length < originalUpCount) {
				console.warn(
					`Filtered out ${originalUpCount - trendingUpPlayers.length} trending up player(s) with missing data`
				);
			}
			if (trendingDownPlayers.length < originalDownCount) {
				console.warn(
					`Filtered out ${originalDownCount - trendingDownPlayers.length} trending down player(s) with missing data`
				);
			}

			// Set standings and matchups preview data
			standings = standingsResult;
			currentWeekMatchups = matchupsResult.matchups;
			currentWeek = matchupsResult.week;
			isOffseason = matchupsResult.isOffseason;
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
		}
	};

	onMount(async () => {
		await LoadData();
	});
</script>

<main class="mx-0 px-3 py-4 md:mx-4 md:px-4 md:py-8 md:mx-auto max-w-7xl">
	{#if loading}
		<HomepageSkeleton />
	{:else}
		<!-- Hero Section -->
		<HeroSection
			seasonYear={sleeperState.season ?? new Date().getFullYear().toString()}
			seasonType={currentSeasonStatus}
			animationDelay={0}
		/>

		<!-- Two Column Layout -->
		<div class="flex flex-col lg:flex-row gap-4 md:gap-6 mt-6 md:mt-8">
			<!-- Main Column (2x width) -->
			<div class="flex-[2] space-y-4 md:space-y-6">
				<!-- Standings Preview -->
				<StandingsPreview {standings} animationDelay={100} />

				<!-- Matchups Preview -->
				<MatchupsPreview
					matchups={currentWeekMatchups}
					{currentWeek}
					{isOffseason}
					animationDelay={200}
				/>

				<!-- Enhanced Champion Card - Mobile Only -->
				<div class="lg:hidden">
					<EnhancedChampionCard
						championName={mostRecentWinner?.display_name ?? ''}
						championAvatar={mostRecentWinner?.avatar
							? `https://sleepercdn.com/avatars/${mostRecentWinner.avatar}`
							: ''}
						season={mostRecentWinner?.season ?? ''}
						animationDelay={250}
					/>
				</div>

				<!-- Trending Players Section -->
				<div class="card bg-base-200 shadow-lg fade-in" style="animation-delay: 300ms">
					<div class="card-body p-4 md:p-6">
						<h2 class="card-title text-lg md:text-xl mb-4">
							Trending Players
							<span class="badge badge-sm badge-ghost">Powered by Sleeper</span>
						</h2>
						<div class="space-y-3">
							{#each trendingUpPlayers as player}
								<TrendingPlayer
									playerName={player.playerName}
									playerPosition={player.playerPosition}
									playerTeam={player.playerTeam}
									playerAvatar={AvatarHelper.GetPlayerAvatarUrl(player.playerId ?? '')}
									teamAvatar={AvatarHelper.GetPlayerTeamAvatarUrl(
										player.playerTeam?.toLowerCase() ?? ''
									)}
									numWaivers={player.timesWaived}
									upOrDown={true}
								/>
							{/each}
						</div>
						{#if trendingDownPlayers.length > 0}
							<div class="divider my-4"></div>
							<div class="space-y-3">
								{#each trendingDownPlayers as player}
									<TrendingPlayer
										playerName={player.playerName}
										playerPosition={player.playerPosition}
										playerTeam={player.playerTeam}
										playerAvatar={AvatarHelper.GetPlayerAvatarUrl(player.playerId ?? '')}
										teamAvatar={AvatarHelper.GetPlayerTeamAvatarUrl(
											player.playerTeam?.toLowerCase() ?? ''
										)}
										numWaivers={player.timesWaived}
										upOrDown={false}
									/>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Sidebar (1x width) -->
			<div class="flex-[1] space-y-4 md:space-y-6">
				<!-- Enhanced Champion Card - Desktop Only -->
				<div class="hidden lg:block">
					<EnhancedChampionCard
						championName={mostRecentWinner?.display_name ?? ''}
						championAvatar={mostRecentWinner?.avatar
							? `https://sleepercdn.com/avatars/${mostRecentWinner.avatar}`
							: ''}
						season={mostRecentWinner?.season ?? ''}
						animationDelay={100}
					/>
				</div>

				<!-- Recent Trades -->
				<div class="card bg-base-200 shadow-lg fade-in" style="animation-delay: 200ms">
					<div class="card-body p-4 md:p-6">
						<div class="flex items-center justify-between mb-4">
							<h2 class="card-title text-lg">Recent Trades</h2>
							<a href="/transactions?filter=trades" class="link link-primary text-sm hover:link-hover">
								View All
							</a>
						</div>
						{#if recentTrades.length > 0}
							{#each recentTrades as trade}
								<CompactTradeTransaction transaction={trade} />
							{/each}
						{:else}
							<div class="text-center py-4 text-base-content/50">No recent trades</div>
						{/if}
					</div>
				</div>

				<!-- Recent Waivers -->
				<div class="card bg-base-200 shadow-lg fade-in" style="animation-delay: 250ms">
					<div class="card-body p-4 md:p-6">
						<div class="flex items-center justify-between mb-4">
							<h2 class="card-title text-lg">Recent Waivers</h2>
							<a href="/transactions?filter=waivers" class="link link-primary text-sm hover:link-hover">
								View All
							</a>
						</div>
						{#if recentWaivers.length > 0}
							{#each recentWaivers as waiver}
								<CompactWaiverTransaction transaction={waiver} />
							{/each}
						{:else}
							<div class="text-center py-4 text-base-content/50">No recent waivers</div>
						{/if}
					</div>
				</div>
			</div>
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
