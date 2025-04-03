import type { User } from '../dtos/UserDtos/User';
import type { League } from '../dtos/LeagueDtos/League';
import type { Roster } from '../dtos/LeagueDtos/Roster';
import type { Matchup } from '../dtos/LeagueDtos/Matchup';
import type { LeagueUser } from '../dtos/LeagueDtos/LeagueUser';
import type { BracketMatchup } from '../dtos/LeagueDtos/BracketMatchup';
import type { Transaction } from '../dtos/LeagueDtos/Transaction';
import type { TradedPick } from '../dtos/LeagueDtos/TradedPick';
import type { SleeperState } from '../dtos/LeagueDtos/SleeperState';
import type { Draft } from '../dtos/DraftDtos/Draft';
import type { DraftDetail } from '../dtos/DraftDtos/DraftDetail';
import type { DraftPick } from '../dtos/DraftDtos/DraftPick';
import type { Player } from '../dtos/PlayerDtos/Player';
import type { TrendingPlayer } from '../dtos/PlayerDtos/TrendingPlayer';
import { TransactionStatus } from '../Enums/TransactionStatus';
import { TransactionType } from '../Enums/TransactionType';
import { DraftType } from '../Enums/DraftType';
import { DraftStatus } from '../Enums/DraftStatus';

export class SleeperClient {
	private static BASE_URL = import.meta.env.VITE_SLEEPER_API_URL;

	/**
	 * Retrieves the sleeper user for the given username
	 * @param username
	 * @returns a user
	 */
	public static async GetUser(username: string): Promise<User> {
		const response = await fetch(`${this.BASE_URL}/user/${username}`);
		if (!response.ok) throw new Error('Failed to fetch user');
		return response.json();
	}

	/**
	 * Retrieves the leagues for the given userId and sport/season
	 * @param userId
	 * @param sport
	 * @param season
	 * @returns a list of leagues
	 */
	public static async GetUserLeagues(
		userId: string,
		sport: string,
		season: string
	): Promise<League[]> {
		const response = await fetch(`${this.BASE_URL}/user/${userId}/leagues/${sport}/${season}`);
		if (!response.ok) throw new Error('Failed to fetch leagues');
		return response.json();
	}

	/**
	 * Retrieves the leagues for the given userId and sport/season
	 * @param avatarId
	 * @returns an avatar URL
	 */
	public static async GetThumbnailAvatar(avatarId: string): Promise<any> {
		const response = await fetch(`https://sleepercdn.com/avatars/thumbs/${avatarId}`);
		if (!response.ok) throw new Error('Failed to fetch avatar');
		return response.url;
	}

	/**
	 * Retrieves the league for the given leagueId
	 * @param leagueId
	 * @returns a league
	 */
	public static async GetLeague(leagueId: string): Promise<League> {
		const response = await fetch(`${this.BASE_URL}/league/${leagueId}`);
		if (!response.ok) throw new Error('Failed to fetch league');
		return response.json();
	}

	/**
	 * Retrieves the rosters for the given leagueId
	 * @param leagueId
	 * @returns a list of rosters
	 */
	public static async GetRosters(leagueId: string): Promise<Roster[]> {
		const response = await fetch(`${this.BASE_URL}/league/${leagueId}/rosters`);
		if (!response.ok) {
			throw new Error(`Failed to fetch rosters: ${response.statusText}`);
		}
		return response.json();
	}

	/**
	 * Retrieves the matchups for the given leagueId and week
	 * @param leagueId
	 * @param week
	 * @returns a list of matchups
	 */
	public static async GetMatchups(leagueId: string, week: number): Promise<Matchup[]> {
		const response = await fetch(`${this.BASE_URL}/league/${leagueId}/matchups/${week}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch matchups: ${response.statusText}`);
		}
		return response.json();
	}

	/**
	 * Retrieves the users for the given leagueId
	 * @param leagueId
	 * @returns a list of league users
	 */
	public static async GetLeagueUsers(leagueId: string): Promise<LeagueUser[]> {
		const response = await fetch(`${this.BASE_URL}/league/${leagueId}/users`);
		if (!response.ok) {
			throw new Error('Failed to fetch league users');
		}
		return response.json();
	}

	/**
	 * Retrieves the playoff winners bracket for the given leagueId
	 * @param leagueId
	 * @returns a list of bracket matchups
	 */
	public static async GetWinnersBracket(leagueId: string): Promise<BracketMatchup[]> {
		const response = await fetch(`${this.BASE_URL}/league/${leagueId}/winners_bracket`);
		if (!response.ok) {
			throw new Error('Failed to fetch winners bracket');
		}
		return response.json();
	}

	/**
	 * Retrieves the playoff losers bracket for the given leagueId
	 * @param leagueId
	 * @returns a list of bracket matchups
	 */
	public static async GetLosersBracket(leagueId: string): Promise<BracketMatchup[]> {
		const response = await fetch(`${this.BASE_URL}/league/${leagueId}/losers_bracket`);
		if (!response.ok) {
			throw new Error('Failed to fetch losers bracket');
		}
		return response.json();
	}

	/**
	 * Retrieves the transactions for the given leagueId and round
	 * @param leagueId
	 * @param round
	 * @returns a list of transactions
	 */
	public static async GetTransactions(leagueId: string, round: number): Promise<Transaction[]> {
		const response = await fetch(`${this.BASE_URL}/league/${leagueId}/transactions/${round}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch transactions: ${response.statusText}`);
		}
		let transactions = await response.json();

		// Map the transaction status to the enum
		return transactions.map((transaction: any) => ({
			...transaction,
			status: transaction.status as TransactionStatus,
			type: transaction.type as TransactionType
		}));
	}

	/**
	 * Gets the traded picks for the given leagueId
	 * @param leagueId
	 * @returns a list of traded picks
	 */
	public static async GetTradedPicks(leagueId: string): Promise<TradedPick[]> {
		const response = await fetch(`${this.BASE_URL}/league/${leagueId}/traded_picks`);
		if (!response.ok) {
			throw new Error('Failed to fetch traded picks');
		}
		return response.json();
	}

	/**
	 * Retrieves the state for the given sport
	 * @param sport
	 * @returns a state object
	 */
	public static async GetSportState(sport?: string): Promise<SleeperState> {
		if (!sport) sport = 'nfl';
		const response = await fetch(`${this.BASE_URL}/state/${sport}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch state for ${sport}`);
		}
		return response.json();
	}

	/**
	 * Retrieves the drafts for the given leagueId
	 * @param leagueId
	 * @returns a list of drafts
	 */
	public static async GetUserDrafts(
		user_id: string,
		sport: string = 'nfl',
		season: string
	): Promise<Draft[]> {
		const response = await fetch(`${this.BASE_URL}/user/${user_id}/drafts/${sport}/${season}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch drafts for user ${user_id} in season ${season}`);
		}
		return response.json();
	}

	/**
	 * Retrieves the drafts for the given leagueId
	 * @param leagueId
	 * @returns a list of drafts for the given league
	 */
	public static async GetLeagueDrafts(leagueId: string): Promise<Draft[]> {
		const response = await fetch(`${this.BASE_URL}/league/${leagueId}/drafts`);
		if (!response.ok) {
			throw new Error(`Failed to fetch drafts for league ${leagueId}`);
		}
		return response.json();
	}

	/**
	 * Retrieves the draft for the given draftId
	 * @param draftId
	 * @returns a draft
	 */
	public static async GetDraft(draftId: string): Promise<DraftDetail> {
		const response = await fetch(`${this.BASE_URL}/draft/${draftId}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch draft with ID ${draftId}`);
		}
		let draft = await response.json();

		draft.type = draft.type as DraftType;
		draft.status = draft.status as DraftStatus;
		return draft;
	}

	/**
	 * Gets all draft picks for a given draft
	 * @param draftId
	 * @returns
	 */
	public static async GetDraftPicks(draftId: string): Promise<DraftPick[]> {
		const response = await fetch(`${this.BASE_URL}/draft/${draftId}/picks`);
		if (!response.ok) {
			throw new Error(`Failed to fetch picks for draft ${draftId}`);
		}
		return response.json();
	}

	/**
	 * Gets all traded picks for a given draft
	 * @param draftId
	 * @returns
	 */
	public static async GetDraftTradedPicks(draftId: string): Promise<TradedPick[]> {
		const response = await fetch(`${this.BASE_URL}/draft/${draftId}/traded_picks`);
		if (!response.ok) {
			throw new Error(`Failed to fetch traded picks for draft ${draftId}`);
		}
		return response.json();
	}

	/**
	 * Retrieves all players for the NFL
	 * @returns a list of players
	 */
	public static async GetAllPlayers(): Promise<Record<string, Player>> {
		const response = await fetch(`${this.BASE_URL}/players/nfl`);
		if (!response.ok) {
			throw new Error('Failed to fetch Sleeper player data');
		}
		return response.json();
	}

	/**
	 * Retrieves the trending players for the given sport and type
	 * @param sport
	 * @param type
	 * @param lookbackHours
	 * @param limits
	 * @returns a player
	 */
	public static async GetTrendingPlayers(
		sport: string,
		type: 'add' | 'drop',
		lookbackHours?: number,
		limit?: number
	): Promise<TrendingPlayer[]> {
		const url = new URL(`${SleeperClient.BASE_URL}/players/${sport}/trending/${type}`);

		if (lookbackHours) url.searchParams.append('lookback_hours', lookbackHours.toString());
		if (limit) url.searchParams.append('limit', limit.toString());

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`Failed to fetch trending players: ${response.statusText}`);
		}

		return response.json();
	}
}
