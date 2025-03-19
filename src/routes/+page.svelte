<script lang="ts">
	import { onMount } from 'svelte';
	import { SleeperClient } from '$lib/api/services/SleeperClient';
	import type { User } from '$lib/api/dtos/UserDtos/User';
	import type { League } from '$lib/api/dtos/LeagueDtos/League'; // Import the LeagueDTO type
	import type { Roster } from '$lib/api/dtos/LeagueDtos/Roster'; // Import the RosterDTO type
	import type { Matchup } from '$lib/api/dtos/LeagueDtos/Matchup';
	import type { LeagueUser } from '$lib/api/dtos/LeagueDtos/LeagueUser';
	import type { BracketMatchup } from '../lib/api/dtos/LeagueDtos/BracketMatchup';
	import type { Transaction } from '$lib/api/dtos/LeagueDtos/Transaction';
	import type { TradedPick } from '$lib/api/dtos/LeagueDtos/TradedPick';
	import type { SleeperState } from '$lib/api/dtos/LeagueDtos/SleeperState';
	import type { Draft } from '$lib/api/dtos/DraftDtos/Draft';
	import type { DraftDetail } from '$lib/api/dtos/DraftDtos/DraftDetail';
	import type { DraftPick } from '$lib/api/dtos/LeagueDtos/DraftPick';
	import type { Player } from '$lib/api/dtos/PlayerDtos/Player';
	import type { TrendingPlayer } from '$lib/api/dtos/PlayerDtos/TrendingPlayer';
	import { PlayersStore } from '$lib/Stores/PlayerStores';
	import { get } from 'svelte/store';

	let user: User | null = null;
	let error: string | null = null;

	const LoadUser = async (username: string) => {
		try {
			user = await SleeperClient.GetUser(username);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let leagues: League[] = [];
	let leagueError: string | null = null;
	const LoadLeagues = async (userId: string, sport: string, season: string) => {
		try {
			leagues = await SleeperClient.GetUserLeagues(userId, sport, season);
		} catch (err) {
			leagueError = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let leagueRes: League | null = null;
	const GetLeague = async () => {
		leagueRes = await SleeperClient.GetLeague('1065403288746606592');
		console.log(leagueRes);
	};

	let rosters: Roster[] = [];
	let rosterError: string | null = null;
	const LoadRosters = async (leagueId: string) => {
		try {
			rosters = await SleeperClient.GetRosters(leagueId);
			console.log(rosters[0].owner_id);
			console.log(rosters);
		} catch (err) {
			rosterError = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let matchups: Matchup[] = [];
	let matchupError: string | null = null;

	const LoadMatchups = async (leagueId: string, week: number) => {
		try {
			matchups = await SleeperClient.GetMatchups(leagueId, week);
		} catch (err) {
			matchupError = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let leagueUsers: LeagueUser[] = [];
	let leagueUsersError: string | null = null;

	const LoadLeagueUsers = async (leagueId: string) => {
		try {
			leagueUsers = await SleeperClient.GetLeagueUsers(leagueId);
		} catch (err) {
			leagueUsersError = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let winnersBracket: BracketMatchup[] = [];
	let losersBracket: BracketMatchup[] = [];
	let bracketError: string | null = null;

	const LoadBrackets = async (leagueId: string) => {
		try {
			winnersBracket = await SleeperClient.GetWinnersBracket(leagueId);
			losersBracket = await SleeperClient.GetLosersBracket(leagueId);
			console.log(winnersBracket);
			console.log(losersBracket);
		} catch (err) {
			bracketError = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let leagueId = 'YOUR_LEAGUE_ID';
	let round = 1;
	let transactions: Transaction[] = [];

	const LoadTransactions = async (leagueId: string, round: number) => {
		try {
			transactions = await SleeperClient.GetTransactions(leagueId, round);
			console.log('transactions', transactions);
		} catch (err) {
			console.error(err);
		}
	};

	let tradedPicks: TradedPick[] = [];
	let pickerror: string | null = null;

	const LoadTradedPicks = async (leagueId: string) => {
		try {
			tradedPicks = await SleeperClient.GetTradedPicks(leagueId);
			console.log(tradedPicks);
		} catch (err) {
			pickerror = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let sport = 'nfl'; // Default to NFL
	let state: SleeperState | null = null;
	let error3: string | null = null;

	const LoadState = async (sport: string) => {
		try {
			state = await SleeperClient.GetSportState(sport);
		} catch (err) {
			error3 = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let userId: string;
	let season: string;
	let drafts: Draft[] = [];
	let error4: string | null = null;

	const LoadDrafts = async (userId: string, season: string) => {
		try {
			drafts = await SleeperClient.GetUserDrafts(userId, 'nfl', season);
		} catch (err) {
			error4 = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let leagueId2: string;
	let draftsLeague: Draft[] = [];
	let error5: string | null = null;

	const LoadDraftsForLeague = async (leagueId: string) => {
		try {
			draftsLeague = await SleeperClient.GetLeagueDrafts(leagueId);
			console.log('drafts for league', draftsLeague);
		} catch (err) {
			error5 = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let draftId: string;
	let draft: DraftDetail | null = null;
	let errorDraft: string | null = null;

	const LoadDraft = async (draftId: string) => {
		try {
			draft = await SleeperClient.GetDraft(draftId);
		} catch (err) {
			errorDraft = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let picks: DraftPick[] = [];
	let errorDraftPick: string | null = null;
	const LoadDraftPicks = async (draftId: string) => {
		try {
			picks = await SleeperClient.GetDraftPicks(draftId);
		} catch (err) {
			errorDraftPick = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let draftId1: string;
	let tradedPicks1: TradedPick[] = [];
	let error6: string | null = null;

	const LoadDraftTradedPicks = async (leagueId: string) => {
		try {
			tradedPicks = await SleeperClient.GetTradedPicks(leagueId);
			console.log('TradedDraftPicks:', tradedPicks1);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let players: Record<string, Player> = get(PlayersStore);
	let error7: string | null = null;

	const LoadPlayers = async () => {
		try {
			players = await SleeperClient.GetAllPlayers();
		} catch (err) {
			error7 = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	let trendingPlayers: TrendingPlayer[] = [];
	let error8: string | null = null;

	const LoadTrendingPlayers = async () => {
		try {
			trendingPlayers = await SleeperClient.GetTrendingPlayers(
				'nfl',
				'add',
				72
			);
			console.log(trendingPlayers);
		} catch (err) {
			error8 = err instanceof Error ? err.message : 'Unknown error';
		}
	};

	onMount(async () => {
		await LoadUser('tmallz');
		let userId: string = user?.user_id ?? '';
		await LoadLeagues('656006678600331264', 'nfl', '2024');
		await GetLeague();
		await LoadRosters('1065403288746606592');
		await LoadMatchups('206827432160788480', 1);
		await LoadLeagueUsers('1065403288746606592');
		await LoadBrackets('1065403288746606592'); // Replace with your actual league ID
		await LoadTransactions('1065403288746606592', 1);
		await LoadTradedPicks('1065403288746606592');
		await LoadState(sport);
		await LoadDrafts(userId, '2025');
		await LoadDraftsForLeague('1065403288746606592');
		const draftId = drafts[0].draft_id;
		await LoadDraft(draftId);
		await LoadDraftPicks(draftId);
		await LoadDraftTradedPicks('1065403289526775808');
		await LoadTrendingPlayers();
	});
</script>

<h1>user ID:{user?.user_id}</h1>
<h1>{user?.display_name}</h1>
<h1>{user?.username}</h1>

<h1>
	{#if leagueError}
		<p>Error: {leagueError}</p>
	{/if}

	{#if leagues.length > 0}
		<ul>
			{#each leagues as league}
				<li>
					<h3>{league.name}</h3>
					<p>Status: {league.status}</p>
					<p>Season: {league.season} ({league.season_type})</p>
					<p>League ID: {league.league_id}</p>
					<!-- <img src={`https://avatars.sleeper.app/${league.avatar}`} alt="League Avatar" /> -->
				</li>
			{/each}
		</ul>
	{:else}
		<p>No leagues found.</p>
	{/if}

	{#if leagueRes}
		<h3>{leagueRes.name}</h3>
		<p>Status: {leagueRes.status}</p>
		<p>Season: {leagueRes.season} ({leagueRes.season_type})</p>
		<p>League ID: {leagueRes.league_id}</p>
		<!-- <img src={`https://avatars.sleeper.app/${league.avatar}`} alt="League Avatar" /> -->
	{/if}

	{#if rosters}
		<h3>Roster</h3>
		<ul>
			{#each rosters as roster}
				<li>
					<h3>Onwer ID: {roster.owner_id}</h3>
					<p>League ID: {roster.league_id}</p>
					<p>Starters: {roster.starters}</p>
					<p>Players: {roster.players}</p>
				</li>
			{/each}
		</ul>
	{/if}

	{#if matchups.length > 0}
		<ul>
			{#each matchups as matchup}
				<li>
					<h3>Matchup {matchup.matchup_id}</h3>
					<p>Roster ID: {matchup.roster_id}</p>
					<p>Points: {matchup.points}</p>
					<p>Custom Points: {matchup.custom_points ?? 'N/A'}</p>
					<p>Starters: {matchup.starters.join(', ')}</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No matchups found.</p>
	{/if}
</h1>

{#if leagueUsersError}
	<p>Error: {leagueUsersError}</p>
{/if}

{#if leagueUsers.length > 0}
	<h3>League Users</h3>
	<ul>
		{#each leagueUsers as user}
			<li>
				<h3>{user.display_name} ({user.username})</h3>
				<p>User ID: {user.user_id}</p>
				<p>Team Name: {user.metadata?.team_name ?? 'N/A'}</p>
				<p>Commissioner: {user.is_owner ? 'Yes' : 'No'}</p>
				{#if user.avatar}
					<img
						src={`https://sleepercdn.com/avatars/${user.avatar}`}
						alt="{user.username}'s avatar"
						width="50"
						height="50"
					/>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p>No users found.</p>
{/if}

{#if bracketError}
	<p>Error: {bracketError}</p>
{/if}

{#if winnersBracket.length > 0}
	<h3>Winners Bracket</h3>
	<ul>
		{#each winnersBracket as match}
			<li>
				<p>Round {match.r} - Match {match.m}</p>
				<p>
					Team 1: {match.t1_from?.w
						? `Winner of Match ${match.t1_from.w}`
						: match.t1}
				</p>
				<p>
					Team 2: {match.t2_from?.l
						? `Loser of Match ${match.t2_from.l}`
						: match.t2}
				</p>
				<p>Winner: {match.w ?? 'TBD'}</p>
				<p>Loser: {match.l ?? 'TBD'}</p>
			</li>
		{/each}
	</ul>
{:else}
	<p>No winners bracket data found.</p>
{/if}

{#if losersBracket.length > 0}
	<h3>Losers Bracket</h3>
	<ul>
		{#each losersBracket as match}
			<li>
				<p>Round {match.r} - Match {match.m}</p>
				<p>
					Team 1: {match.t1_from?.w
						? `Winner of Match ${match.t1_from.w}`
						: match.t1}
				</p>
				<p>
					Team 2: {match.t2_from?.l
						? `Loser of Match ${match.t2_from.l}`
						: match.t2}
				</p>
				<p>Winner: {match.w ?? 'TBD'}</p>
				<p>Loser: {match.l ?? 'TBD'}</p>
			</li>
		{/each}
	</ul>
{:else}
	<p>No losers bracket data found.</p>
{/if}

<h2>Transactions - Week {round}</h2>

{#if transactions.length > 0}
	<table>
		<thead>
			<tr>
				<th>Type</th>
				<th>Status</th>
				<th>Rosters Involved</th>
				<th>Draft Picks</th>
				<th>Adds/Drops</th>
				<th>Waiver Budget</th>
			</tr>
		</thead>
		<tbody>
			{#each transactions as txn}
				<tr>
					<td>{txn.type}</td>
					<td>{txn.status}</td>
					<td>{txn.roster_ids.join(', ')}</td>
					<td>
						{#each txn.draft_picks as pick}
							<p>Round {pick.round} ({pick.owner_id})</p>
						{/each}
					</td>
					<td>
						{#if txn.adds}
							<p>
								Adds: {Object.entries(txn.adds)
									.map(
										([player, roster]) => `Player ${player} -> Roster ${roster}`
									)
									.join(', ')}
							</p>
						{/if}
						{#if txn.drops}
							<p>
								Drops: {Object.entries(txn.drops)
									.map(
										([player, roster]) => `Player ${player} -> Roster ${roster}`
									)
									.join(', ')}
							</p>
						{/if}
					</td>
					<td>
						{#each txn.waiver_budget as waiver}
							<p>From {waiver.sender} to {waiver.receiver}: {waiver.amount}</p>
						{/each}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>No transactions found for this week.</p>
{/if}

{#if error}
	<p class="text-red-500">Error: {error}</p>
{:else}
	<table class="w-full table-auto border-collapse border border-gray-400">
		<thead>
			<tr class="bg-gray-200">
				<th class="border border-gray-400 px-4 py-2">Season</th>
				<th class="border border-gray-400 px-4 py-2">Round</th>
				<th class="border border-gray-400 px-4 py-2">Original Owner</th>
				<th class="border border-gray-400 px-4 py-2">Previous Owner</th>
				<th class="border border-gray-400 px-4 py-2">Current Owner</th>
			</tr>
		</thead>
		<tbody>
			{#each tradedPicks as pick}
				<tr class="border border-gray-400">
					<td class="border border-gray-400 px-4 py-2">{pick.season}</td>
					<td class="border border-gray-400 px-4 py-2">{pick.round}</td>
					<td class="border border-gray-400 px-4 py-2">{pick.roster_id}</td>
					<td class="border border-gray-400 px-4 py-2"
						>{pick.previous_owner_id}</td
					>
					<td class="border border-gray-400 px-4 py-2">{pick.owner_id}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

{#if error}
	<p class="text-red-500">Error: {error}</p>
{:else if state}
	<div class="rounded-lg border border-gray-400 p-4">
		<h2 class="text-xl font-bold">Current {sport.toUpperCase()} State</h2>
		<ul class="ml-4 list-disc">
			<li><strong>Week:</strong> {state.week}</li>
			<li><strong>Season Type:</strong> {state.season_type}</li>
			<li><strong>Season Start:</strong> {state.season_start_date}</li>
			<li><strong>Season:</strong> {state.season}</li>
			<li><strong>Previous Season:</strong> {state.previous_season}</li>
			<li><strong>League Season:</strong> {state.league_season}</li>
			<li><strong>Display Week:</strong> {state.display_week}</li>
		</ul>
	</div>
{/if}

{#if error}
	<p class="text-red-500">Error: {error}</p>
{:else if drafts.length === 0}
	<p>No drafts found for user {'tmallz'} in {2024}.</p>
{:else}
	<div class="rounded-lg border border-gray-400 p-4">
		<h2 class="text-xl font-bold">User Drafts for {2024}</h2>
		<ul class="ml-4 list-disc">
			{#each drafts as draft}
				<li>
					<strong>{draft.metadata.name}</strong> - {draft.type} draft ({draft.status})
					<ul class="ml-4">
						<li>League ID: {draft.league_id}</li>
						<li>Rounds: {draft.settings.rounds}</li>
						<li>Teams: {draft.settings.teams}</li>
						<li>Scoring: {draft.metadata.scoring_type}</li>
						<li>
							Start Time: {new Date(draft.start_time).toLocaleDateString()}
						</li>
					</ul>
				</li>
			{/each}
		</ul>
	</div>
{/if}

{#if error5}
	<p class="text-red-500">Error: {error5}</p>
{:else if draftsLeague.length === 0}
	<p>No drafts found for league Specific call.</p>
{:else}
	<div class="rounded-lg border border-gray-400 p-4">
		<h2 class="text-xl font-bold">Drafts for League {leagueId}</h2>
		<ul class="ml-4 list-disc">
			{#each draftsLeague as draft}
				<li>
					<strong>{draft.metadata.name}</strong> - {draft.type} draft ({draft.status})
					<ul class="ml-4">
						<li>Draft ID: {draft.draft_id}</li>
						<li>Round Count: {draft.settings.rounds}</li>
						<li>Teams: {draft.settings.teams}</li>
						<li>Scoring Type: {draft.metadata.scoring_type}</li>
						<li>
							Start Date: {new Date(draft.start_time).toLocaleDateString()}
						</li>
					</ul>
				</li>
			{/each}
		</ul>
	</div>
{/if}

{#if error}
	<p class="text-red-500">Error: {error}</p>
{:else if !draft}
	<p>Loading draft details...</p>
{:else}
	<div class="rounded-lg border border-gray-400 p-4">
		<h2 class="text-xl font-bold">Draft Details: {draft.metadata.name}</h2>
		<ul>
			<li><strong>Type:</strong> {draft.type}</li>
			<li><strong>Status:</strong> {draft.status}</li>
			<li><strong>Season:</strong> {draft.season}</li>
			<li><strong>Teams:</strong> {draft.settings.teams}</li>
			<li><strong>Rounds:</strong> {draft.settings.rounds}</li>
			<li><strong>Scoring Type:</strong> {draft.metadata.scoring_type}</li>
			<li>
				<strong>Start Date:</strong>
				{new Date(draft.start_time).toLocaleDateString()}
			</li>
		</ul>

		<h3 class="mt-4 text-lg font-semibold">Draft Order</h3>
		<ul>
			{#each Object.entries(draft.draft_order || {}) as [userId, slot]}
				<li>User {userId} → Slot {slot}</li>
			{/each}
		</ul>

		<h3 class="mt-4 text-lg font-semibold">Slot to Roster Mapping</h3>
		<ul>
			{#each Object.entries(draft.slot_to_roster_id || {}) as [slot, rosterId]}
				<li>Slot {slot} → Roster {rosterId}</li>
			{/each}
		</ul>
	</div>
{/if}

{#if error}
	<p class="text-red-500">Error: {error}</p>
{:else if tradedPicks1.length === 0}
	<p>No traded picks found.</p>
{:else}
	<table class="w-full table-auto border-collapse border border-gray-400">
		<thead>
			<tr class="bg-gray-200">
				<th class="border border-gray-400 px-4 py-2">Season</th>
				<th class="border border-gray-400 px-4 py-2">Round</th>
				<th class="border border-gray-400 px-4 py-2">Original Owner</th>
				<th class="border border-gray-400 px-4 py-2">Previous Owner</th>
				<th class="border border-gray-400 px-4 py-2">Current Owner</th>
			</tr>
		</thead>
		<tbody>
			{#each tradedPicks1 as pick}
				<tr class="border border-gray-400">
					<td class="border border-gray-400 px-4 py-2 text-center"
						>{pick.season}</td
					>
					<td class="border border-gray-400 px-4 py-2 text-center"
						>{pick.round}</td
					>
					<td class="border border-gray-400 px-4 py-2 text-center"
						>{pick.roster_id}</td
					>
					<td class="border border-gray-400 px-4 py-2 text-center"
						>{pick.previous_owner_id}</td
					>
					<td class="border border-gray-400 px-4 py-2 text-center"
						>{pick.owner_id}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
