<script lang="ts">
	import type { SleeperState } from '$lib/api/dtos/LeagueDtos/SleeperState';
	import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
	import { TransactionType } from '$lib/api/Enums/TransactionType';
	import { SleeperClient } from '$lib/api/services/SleeperClient';
	import TrendingPlayer from '$lib/Components/homepage/TrendingPlayer.svelte';
	import TradeTransaction from '$lib/Components/transactions/TradeTransaction.svelte';
	import WaiverTransaction from '$lib/Components/transactions/WaiverTransaction.svelte';
	import { AvatarHelper } from '$lib/Utilities/AvatarHelper';
	import type { TransactionsPageDto } from '$lib/Utilities/Dtos/TransactionsPageDto';
	import type { TrendingPlayerPageDto } from '$lib/Utilities/Dtos/TrendingPlayerPageDto';
	import { PodiumHelper } from '$lib/Utilities/PodiumHelper';
	import { TransactionsHelper } from '$lib/Utilities/TransactionsHelper';
	import { TrendingPlayersHelper } from '$lib/Utilities/TredningPlayersHelper';
	import { onMount } from 'svelte';

	let transactions: TransactionsPageDto[] = [];
	let recentTrades: TransactionsPageDto[] = [];
	let recentWaivers: TransactionsPageDto[] = [];
	let trendingUpPlayers: TrendingPlayerPageDto[] = [];
	let trendingDownPlayers: TrendingPlayerPageDto[] = [];
	let mostRecentWinner: (LeagueUser & { season?: string }) | null = null;
	let sleeperState: SleeperState = {};
	let currentSeasonStatus: string = '';
	let loading: boolean = true;

	let GetSeasonTypeText = (seasonType: string) => {
		switch (seasonType) {
			case 'pre':
				return 'Preseason';
			case 'off':
				return 'Preseason';
			case 'regular':
				return 'Regular Season';
			case 'post':
				return 'Playoffs';
			default:
				return 'Unknown';
		}
	};

	let LoadData = async () => {
		try {
			transactions = await TransactionsHelper.GetAllTransactions();
			sleeperState = await SleeperClient.GetSportState('nfl');
			currentSeasonStatus = sleeperState.season_type ?? '';

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

			mostRecentWinner = await PodiumHelper.GetMostRecentWinner();
			trendingUpPlayers = await TrendingPlayersHelper.GetTrendingUpPlayers();
			trendingDownPlayers = await TrendingPlayersHelper.GetTrendingDownPlayers();
		} catch (error) {
			console.error(error);
		} finally {
			loading = false; // Set loading to false after data is fetched
		}
	};

	onMount(async () => {
		await LoadData();
	});
</script>

<div class="mx-auto flex max-w-7xl flex-col space-y-6 p-6 lg:flex-row lg:space-y-0 lg:space-x-6">
	<!-- Intro Section - First on mobile -->
	<div class="bg-base-200 order-1 rounded-lg p-6 shadow-lg lg:hidden">
		<h1 class="mb-4 text-2xl font-bold">The League of Extraordinary Armchair GMs</h1>
		<p>
			The League of Extraordinary Armchair GMs is a fantasy football league that was established in
			2025 by Tim O'Malley who recently got addicted to dynasty fantasy football leagues and needed
			another start up draft to prep for and draft in. The league consists of 10 friends and family
			members, and trash talk is encouraged. The league is hosted on Sleeper.
		</p>
	</div>

	<!-- Side Panel - Second on mobile, right column on desktop -->
	<div class="bg-base-200 order-2 flex-[1] rounded-lg p-6 shadow-lg lg:order-2 lg:ml-6">
		{#if loading}
			<!-- Loading Indicator -->
			<div class="flex h-full items-center justify-center">
				<span class="loading loading-bars loading-xs">Loading</span>
			</div>
		{:else}
			<!-- Current League Season and Status -->
			<div class="bg-primary mb-6 rounded-lg p-4 text-center shadow">
				<h2 class="text-lg font-bold">
					{sleeperState.season ?? new Date().getFullYear()} NFL - {GetSeasonTypeText(currentSeasonStatus)}
				</h2>
			</div>

			<!-- Most Recent Winner -->
			<div class="mb-6">
				{#if mostRecentWinner && mostRecentWinner.display_name}
					<h2 class="mb-4 text-xl font-bold">Most Recent Champion</h2>
					<div class="rounded-lg bg-base-300 border-2 border-base-content/20 p-8 text-center">
						<div class="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">
							{mostRecentWinner.season ? `${mostRecentWinner.season} Champion` : 'Champion'}
						</div>
						<div class="font-bold text-2xl mb-4">{mostRecentWinner.display_name}</div>
						<div class="flex items-center justify-center gap-3 mb-4">
							{#if mostRecentWinner.avatar}
								<img
								src={`https://sleepercdn.com/avatars/${mostRecentWinner.avatar}`}
									alt={mostRecentWinner.display_name}
									class="w-16 h-16 rounded-full"
								/>
							{/if}
						</div>
						<div class="text-6xl">🏆</div>
					</div>
				{:else}
					<a
						href="https://imgflip.com/i/9qrtql"
						title="Real Griddy meme on imgflip"
						aria-label="Open Real Griddy meme on imgflip"
					>
						<img src="https://i.imgflip.com/9qrtql.jpg" alt="Real Griddy meme" />
					</a>
				{/if}
			</div>

			<!-- Recent Trades -->
			<h2 class="mb-4 text-xl font-bold">Recent Trades</h2>
			{#each recentTrades as trade}
				<TradeTransaction transaction={trade} />
			{/each}

			<!-- Recent Waivers -->
			<h2 class="mt-6 mb-4 text-xl font-bold">Recent Waivers</h2>
			{#each recentWaivers as waiver}
				<WaiverTransaction transaction={waiver} />
			{/each}
		{/if}
	</div>

	<!-- Main Content - Third on mobile, left column on desktop (with intro) -->
	<div class="bg-base-200 order-3 flex-[2] rounded-lg p-6 shadow-lg lg:order-1">
		<!-- Desktop Intro (hidden on mobile) -->
		<div class="hidden lg:block">
			<h1 class="mb-4 text-2xl font-bold">The League of Extraordinary Armchair GMs</h1>
			<p class="mb-8">
				The League of Extraordinary Armchair GMs is a fantasy football league that was established in
				2025 by Tim O'Malley who recently got addicted to dynasty fantasy football leagues and needed
				another start up draft to prep for and draft in. The league consists of 10 friends and family
				members, and trash talk is encouraged. The league is hosted on Sleeper.
			</p>
		</div>

		{#if loading}
			<!-- Loading Indicator -->
			<div class="flex h-full items-center justify-center">
				<span class="loading loading-bars loading-xs">Loading</span>
			</div>
		{:else}
			<!-- Trending Players Section -->
			<h2 class="mb-4 text-xl font-bold">Trending Players: Powered by Sleeper</h2>
			<div class="space-y-4">
				{#each trendingUpPlayers as player}
					<TrendingPlayer
						playerName={player.playerName}
						playerPosition={player.playerPosition}
						playerTeam={player.playerTeam}
						playerAvatar={AvatarHelper.GetPlayerAvatarUrl(player.playerId ?? '')}
						teamAvatar={AvatarHelper.GetPlayerTeamAvatarUrl(player.playerTeam?.toLowerCase() ?? '')}
						numWaivers={player.timesWaived}
						upOrDown={true}
					/>
				{/each}
			</div>
			<div class="mt-4"></div>
			<div class="space-y-4">
				{#each trendingDownPlayers as player}
					<TrendingPlayer
						playerName={player.playerName}
						playerPosition={player.playerPosition}
						playerTeam={player.playerTeam}
						playerAvatar={AvatarHelper.GetPlayerAvatarUrl(player.playerId ?? '')}
						teamAvatar={AvatarHelper.GetPlayerTeamAvatarUrl(player.playerTeam?.toLowerCase() ?? '')}
						numWaivers={player.timesWaived}
						upOrDown={false}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>
