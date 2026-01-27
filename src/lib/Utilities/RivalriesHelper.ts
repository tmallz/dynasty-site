import type { Transaction } from '$lib/api/dtos/LeagueDtos/Transaction';
import { TransactionType } from '$lib/api/Enums/TransactionType';

// Extended transaction with season info added by server
interface TransactionWithSeason extends Transaction {
    season?: string;
}

export interface RivalryMatchup {
    week: number;
    season: string;
    margin: number;
    team1Score: number;
    team2Score: number;
    winner: number; // roster_id of winner
    isPlayoff: boolean; // true if in winners bracket (actual playoffs)
    isConsolation: boolean; // true if in losers bracket (consolation)
}

export interface TradeDetail {
    season: string;
    week: number;
    transactionId: string;
}

export interface RecentTradeDetail extends TradeDetail {
    team1Adds: string[]; // player IDs team1 received
    team2Adds: string[]; // player IDs team2 received
    team1Picks: Array<{ season: string; round: number; originalOwner?: number }>;
    team2Picks: Array<{ season: string; round: number; originalOwner?: number }>;
}

export interface StreakInfo {
    currentStreak: number;
    currentStreakOwner: number; // roster_id, 0 if no streak
    longestStreak: number;
    longestStreakOwner: number;
}

export interface TrendInfo {
    recentWinner: number; // roster_id of who won more in last 5, 0 if tied
    recentTeam1Wins: number;
    recentTeam2Wins: number;
    trend: 'team1_hot' | 'team2_hot' | 'even' | 'no_data';
    trendText: string;
}

export interface RivalryStats {
    team1Wins: number;
    team2Wins: number;
    ties: number;
    totalGames: number;
    team1BiggestBlowout: RivalryMatchup | null;
    team2BiggestBlowout: RivalryMatchup | null;
    team1NarrowestVictory: RivalryMatchup | null;
    team2NarrowestVictory: RivalryMatchup | null;
    totalTrades: number;
    tradeDetails: RecentTradeDetail[];
    mostRecentTrade: RecentTradeDetail | null;
    // New stats
    team1TotalPoints: number;
    team2TotalPoints: number;
    streakInfo: StreakInfo;
    intensityScore: number; // 0-100, percentage of close games
    mostRecentMatchup: RivalryMatchup | null;
    trendInfo: TrendInfo;
}

export class RivalriesHelper {
    static CalculateRivalryStats(
        team1RosterId: number,
        team2RosterId: number,
        matchups: any,
        transactions: TransactionWithSeason[],
        brackets: Record<string, { winners: any[]; losers: any[] }>
    ): RivalryStats {
        // Initialize stats
        const stats: RivalryStats = {
            team1Wins: 0,
            team2Wins: 0,
            ties: 0,
            totalGames: 0,
            team1BiggestBlowout: null,
            team2BiggestBlowout: null,
            team1NarrowestVictory: null,
            team2NarrowestVictory: null,
            totalTrades: 0,
            tradeDetails: [],
            mostRecentTrade: null,
            team1TotalPoints: 0,
            team2TotalPoints: 0,
            streakInfo: {
                currentStreak: 0,
                currentStreakOwner: 0,
                longestStreak: 0,
                longestStreakOwner: 0
            },
            intensityScore: 0,
            mostRecentMatchup: null,
            trendInfo: {
                recentWinner: 0,
                recentTeam1Wins: 0,
                recentTeam2Wins: 0,
                trend: 'no_data',
                trendText: ''
            }
        };

        // Find head-to-head matchups
        const headToHeadGames = this.findHeadToHeadMatchups(
            team1RosterId,
            team2RosterId,
            matchups,
            brackets
        );

        // Sort games chronologically for streak calculation
        const sortedGames = [...headToHeadGames].sort((a, b) => {
            if (a.season !== b.season) return a.season.localeCompare(b.season);
            return a.week - b.week;
        });

        let closeGames = 0; // games within 10 points

        // Calculate win/loss record and total points
        headToHeadGames.forEach(game => {
            stats.totalGames++;
            stats.team1TotalPoints += game.team1Score;
            stats.team2TotalPoints += game.team2Score;

            // Track close games for intensity
            if (game.margin <= 10) {
                closeGames++;
            }

            if (game.team1Score > game.team2Score) {
                stats.team1Wins++;

                // Check for narrowest victory
                if (!stats.team1NarrowestVictory ||
                    game.margin < stats.team1NarrowestVictory.margin) {
                    stats.team1NarrowestVictory = game;
                }

                // Check for biggest blowout
                if (!stats.team1BiggestBlowout ||
                    game.margin > stats.team1BiggestBlowout.margin) {
                    stats.team1BiggestBlowout = game;
                }
            } else if (game.team2Score > game.team1Score) {
                stats.team2Wins++;

                // Check for narrowest victory
                if (!stats.team2NarrowestVictory ||
                    game.margin < stats.team2NarrowestVictory.margin) {
                    stats.team2NarrowestVictory = game;
                }

                // Check for biggest blowout
                if (!stats.team2BiggestBlowout ||
                    game.margin > stats.team2BiggestBlowout.margin) {
                    stats.team2BiggestBlowout = game;
                }
            } else {
                stats.ties++;
            }
        });

        // Calculate intensity score (percentage of close games, weighted)
        if (stats.totalGames > 0) {
            stats.intensityScore = Math.round((closeGames / stats.totalGames) * 100);
        }

        // Calculate streaks
        stats.streakInfo = this.calculateStreaks(sortedGames, team1RosterId, team2RosterId);

        // Get most recent matchup
        if (sortedGames.length > 0) {
            stats.mostRecentMatchup = sortedGames[sortedGames.length - 1];
        }

        // Calculate trend (last 5 games)
        stats.trendInfo = this.calculateTrend(sortedGames, team1RosterId, team2RosterId);

        // Calculate trade statistics
        const tradeStats = this.findTradesBetweenTeams(
            team1RosterId,
            team2RosterId,
            transactions
        );
        stats.totalTrades = tradeStats.trades.length;
        stats.tradeDetails = tradeStats.trades;
        stats.mostRecentTrade = tradeStats.mostRecent;

        return stats;
    }

    private static calculateStreaks(
        sortedGames: RivalryMatchup[],
        team1RosterId: number,
        team2RosterId: number
    ): StreakInfo {
        const info: StreakInfo = {
            currentStreak: 0,
            currentStreakOwner: 0,
            longestStreak: 0,
            longestStreakOwner: 0
        };

        if (sortedGames.length === 0) return info;

        let currentStreak = 0;
        let currentOwner = 0;
        let longestStreak = 0;
        let longestOwner = 0;

        for (const game of sortedGames) {
            const winner = game.team1Score > game.team2Score ? team1RosterId :
                          game.team2Score > game.team1Score ? team2RosterId : 0;

            if (winner === 0) {
                // Tie breaks streak
                currentStreak = 0;
                currentOwner = 0;
            } else if (winner === currentOwner) {
                currentStreak++;
            } else {
                currentStreak = 1;
                currentOwner = winner;
            }

            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
                longestOwner = currentOwner;
            }
        }

        info.currentStreak = currentStreak;
        info.currentStreakOwner = currentOwner;
        info.longestStreak = longestStreak;
        info.longestStreakOwner = longestOwner;

        return info;
    }

    private static calculateTrend(
        sortedGames: RivalryMatchup[],
        team1RosterId: number,
        team2RosterId: number
    ): TrendInfo {
        const info: TrendInfo = {
            recentWinner: 0,
            recentTeam1Wins: 0,
            recentTeam2Wins: 0,
            trend: 'no_data',
            trendText: ''
        };

        if (sortedGames.length < 2) {
            info.trendText = 'Not enough games';
            return info;
        }

        // Get last 5 games (or all if less than 5)
        const recentGames = sortedGames.slice(-5);

        for (const game of recentGames) {
            if (game.team1Score > game.team2Score) {
                info.recentTeam1Wins++;
            } else if (game.team2Score > game.team1Score) {
                info.recentTeam2Wins++;
            }
        }

        const winDiff = info.recentTeam1Wins - info.recentTeam2Wins;

        if (winDiff >= 2) {
            info.trend = 'team1_hot';
            info.recentWinner = team1RosterId;
            info.trendText = 'Dominating recently';
        } else if (winDiff <= -2) {
            info.trend = 'team2_hot';
            info.recentWinner = team2RosterId;
            info.trendText = 'Dominating recently';
        } else {
            info.trend = 'even';
            info.trendText = 'Evenly matched lately';
        }

        return info;
    }

    static findHeadToHeadMatchups(
        team1RosterId: number,
        team2RosterId: number,
        matchups: any,
        brackets: Record<string, { winners: any[]; losers: any[] }>
    ): RivalryMatchup[] {
        const games: RivalryMatchup[] = [];

        // Get current year to avoid processing future seasons
        const currentYear = new Date().getFullYear();

        // Matchups are organized by season -> week
        for (const season in matchups) {
            // Skip future seasons (in case Sleeper returns data for seasons not yet played)
            const seasonYear = parseInt(season);
            if (seasonYear > currentYear) {
                continue;
            }

            const seasonMatchups = matchups[season];
            const seasonBrackets = brackets[season] || { winners: [], losers: [] };

            for (const week in seasonMatchups) {
                const weekNum = parseInt(week);

                // Skip week 18 (no lineups set)
                if (weekNum === 18) {
                    continue;
                }

                const weekMatchups = seasonMatchups[week];

                // Find if these two teams played each other this week
                let team1Matchup = null;
                let team2Matchup = null;

                for (const matchup of weekMatchups) {
                    if (matchup.roster_id === team1RosterId) {
                        team1Matchup = matchup;
                    }
                    if (matchup.roster_id === team2RosterId) {
                        team2Matchup = matchup;
                    }
                }

                // If both teams played and have the same matchup_id, they played each other
                if (team1Matchup && team2Matchup &&
                    team1Matchup.matchup_id === team2Matchup.matchup_id &&
                    team1Matchup.matchup_id !== null) {
                    const team1Score = team1Matchup.points || 0;
                    const team2Score = team2Matchup.points || 0;

                    // Check bracket status for playoff weeks
                    const bracketStatus = this.getMatchupBracketStatus(
                        team1RosterId,
                        team2RosterId,
                        weekNum,
                        seasonBrackets
                    );

                    if (!bracketStatus.isValid) {
                        continue;
                    }

                    // Skip matchups where both scores are 0 (no lineups set)
                    if (team1Score === 0 && team2Score === 0) {
                        continue;
                    }

                    const margin = Math.abs(team1Score - team2Score);

                    games.push({
                        week: weekNum,
                        season: season,
                        margin: margin,
                        team1Score: team1Score,
                        team2Score: team2Score,
                        winner: team1Score > team2Score ? team1RosterId :
                                team2Score > team1Score ? team2RosterId : 0,
                        isPlayoff: bracketStatus.isPlayoff,
                        isConsolation: bracketStatus.isConsolation
                    });
                }
            }
        }

        return games;
    }

    private static getMatchupBracketStatus(
        team1RosterId: number,
        team2RosterId: number,
        week: number,
        brackets: { winners: any[]; losers: any[] }
    ): { isValid: boolean; isPlayoff: boolean; isConsolation: boolean } {
        // Regular season matchups are always valid (typically weeks 1-14)
        // Assuming playoffs start around week 15
        if (week <= 14) {
            return { isValid: true, isPlayoff: false, isConsolation: false };
        }

        // Check winners bracket (actual playoffs)
        for (const bracketMatchup of brackets.winners || []) {
            const t1 = typeof bracketMatchup.t1 === 'number' ? bracketMatchup.t1 : null;
            const t2 = typeof bracketMatchup.t2 === 'number' ? bracketMatchup.t2 : null;

            if ((t1 === team1RosterId && t2 === team2RosterId) ||
                (t1 === team2RosterId && t2 === team1RosterId)) {
                return { isValid: true, isPlayoff: true, isConsolation: false };
            }
        }

        // Check losers bracket (consolation)
        for (const bracketMatchup of brackets.losers || []) {
            const t1 = typeof bracketMatchup.t1 === 'number' ? bracketMatchup.t1 : null;
            const t2 = typeof bracketMatchup.t2 === 'number' ? bracketMatchup.t2 : null;

            if ((t1 === team1RosterId && t2 === team2RosterId) ||
                (t1 === team2RosterId && t2 === team1RosterId)) {
                return { isValid: true, isPlayoff: false, isConsolation: true };
            }
        }

        // Not found in any bracket - invalid matchup for playoff week
        return { isValid: false, isPlayoff: false, isConsolation: false };
    }

    private static findTradesBetweenTeams(
        team1RosterId: number,
        team2RosterId: number,
        transactions: TransactionWithSeason[]
    ): { trades: RecentTradeDetail[]; mostRecent: RecentTradeDetail | null } {
        const trades: RecentTradeDetail[] = [];

        transactions.forEach(transaction => {
            if (transaction.type === TransactionType.Trade) {
                // Check if both teams are involved in this trade
                const rosterIds = transaction.roster_ids || [];
                
                if (rosterIds.includes(team1RosterId) && 
                    rosterIds.includes(team2RosterId)) {
                    
                    // Parse trade details for each trade
                    const team1Adds: string[] = [];
                    const team2Adds: string[] = [];
                    
                    // Parse adds - figure out which team got which players
                    const adds = transaction.adds;
                    if (adds) {
                        for (const [playerId, rosterId] of Object.entries(adds)) {
                            if (rosterId === team1RosterId) {
                                team1Adds.push(playerId);
                            } else if (rosterId === team2RosterId) {
                                team2Adds.push(playerId);
                            }
                        }
                    }
                    
                    // Parse draft picks
                    const team1Picks: Array<{ season: string; round: number; originalOwner?: number }> = [];
                    const team2Picks: Array<{ season: string; round: number; originalOwner?: number }> = [];
                    
                    const draftPicks = transaction.draft_picks;
                    if (draftPicks) {
                        for (const pick of draftPicks) {
                            const pickDetail = {
                                season: pick.season,
                                round: pick.round,
                                originalOwner: pick.roster_id
                            };
                            
                            if (pick.owner_id === team1RosterId) {
                                team1Picks.push(pickDetail);
                            } else if (pick.owner_id === team2RosterId) {
                                team2Picks.push(pickDetail);
                            }
                        }
                    }
                    
                    const tradeDetail: RecentTradeDetail = {
                        season: transaction.season?.toString() || '',
                        week: transaction.leg || 0,
                        transactionId: transaction.transaction_id || '',
                        team1Adds,
                        team2Adds,
                        team1Picks,
                        team2Picks
                    };
                    trades.push(tradeDetail);
                }
            }
        });

        return { trades, mostRecent: trades.length > 0 ? trades[0] : null };
    }
}
