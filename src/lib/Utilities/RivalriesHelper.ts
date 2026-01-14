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
}

export interface TradeDetail {
    season: string;
    week: number;
    transactionId: string;
}

export interface RecentTradeDetail extends TradeDetail {
    team1Adds: string[]; // player IDs team1 received
    team2Adds: string[]; // player IDs team2 received
    team1Picks: Array<{ season: number; round: number; originalOwner?: number }>;
    team2Picks: Array<{ season: number; round: number; originalOwner?: number }>;
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
    tradeDetails: TradeDetail[];
    mostRecentTrade: RecentTradeDetail | null;
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
            mostRecentTrade: null
        };

        // Find head-to-head matchups
        const headToHeadGames = this.findHeadToHeadMatchups(
            team1RosterId,
            team2RosterId,
            matchups,
            brackets
        );

        // Calculate win/loss record
        headToHeadGames.forEach(game => {
            stats.totalGames++;
            
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

    private static findHeadToHeadMatchups(
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
                    
                    // Validate this is a real matchup by checking bracket data
                    const isValidMatchup = this.isMatchupInBracket(
                        team1RosterId,
                        team2RosterId,
                        weekNum,
                        season,
                        seasonBrackets
                    );
                    
                    if (!isValidMatchup) {
                        continue;
                    }
                    
                    // Skip matchups where both scores are 0 (no lineups set)
                    if (team1Score === 0 && team2Score === 0) {
                        continue;
                    }
                    
                    const margin = Math.abs(team1Score - team2Score);
                    
                    console.log(`Found matchup: ${season} Week ${weekNum} - Score: ${team1Score.toFixed(2)} vs ${team2Score.toFixed(2)} (Margin: ${margin.toFixed(2)})`);
                    
                    games.push({
                        week: weekNum,
                        season: season,
                        margin: margin,
                        team1Score: team1Score,
                        team2Score: team2Score,
                        winner: team1Score > team2Score ? team1RosterId : 
                                team2Score > team1Score ? team2RosterId : 0
                    });
                }
            }
        }
        
        return games;
    }

    private static isMatchupInBracket(
        team1RosterId: number,
        team2RosterId: number,
        week: number,
        season: string,
        brackets: { winners: any[]; losers: any[] }
    ): boolean {
        // Regular season matchups are always valid (typically weeks 1-14)
        // Assuming playoffs start around week 15
        if (week <= 14) {
            return true;
        }
        
        // For playoff weeks, check if this matchup exists in either bracket
        const allBracketMatchups = [...brackets.winners, ...brackets.losers];
        
        for (const bracketMatchup of allBracketMatchups) {
            // Check if both teams are in this bracket matchup
            const t1 = typeof bracketMatchup.t1 === 'number' ? bracketMatchup.t1 : null;
            const t2 = typeof bracketMatchup.t2 === 'number' ? bracketMatchup.t2 : null;
            
            if ((t1 === team1RosterId && t2 === team2RosterId) ||
                (t1 === team2RosterId && t2 === team1RosterId)) {
                return true;
            }
        }
        return false;
    }

    private static findTradesBetweenTeams(
        team1RosterId: number,
        team2RosterId: number,
        transactions: TransactionWithSeason[]
    ): { trades: TradeDetail[]; mostRecent: RecentTradeDetail | null } {
        const trades: TradeDetail[] = [];
        let mostRecentTransaction: TransactionWithSeason | null = null;

        transactions.forEach(transaction => {
            if (transaction.type === TransactionType.Trade) {
                // Check if both teams are involved in this trade
                const rosterIds = transaction.roster_ids || [];
                
                if (rosterIds.includes(team1RosterId) && 
                    rosterIds.includes(team2RosterId)) {
                    const tradeDetail: TradeDetail = {
                        season: transaction.season?.toString() || '',
                        week: transaction.leg || 0,
                        transactionId: transaction.transaction_id || ''
                    };
                    trades.push(tradeDetail);
                    
                    // Keep track of most recent (first one we encounter since transactions are loaded newest first)
                    if (!mostRecentTransaction) {
                        mostRecentTransaction = transaction;
                    }
                }
            }
        });

        // Parse most recent trade details if exists
        let mostRecent: RecentTradeDetail | null = null;
        if (mostRecentTransaction) {
            const team1Adds: string[] = [];
            const team2Adds: string[] = [];
            
            // Parse adds - figure out which team got which players
            if (mostRecentTransaction.adds) {
                for (const [playerId, rosterId] of Object.entries(mostRecentTransaction.adds)) {
                    if (rosterId === team1RosterId) {
                        team1Adds.push(playerId);
                    } else if (rosterId === team2RosterId) {
                        team2Adds.push(playerId);
                    }
                }
            }
            
            // Parse draft picks
            const team1Picks: Array<{ season: number; round: number; originalOwner?: number }> = [];
            const team2Picks: Array<{ season: number; round: number; originalOwner?: number }> = [];
            
            if (mostRecentTransaction.draft_picks) {
                for (const pick of mostRecentTransaction.draft_picks) {
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
            
            mostRecent = {
                season: mostRecentTransaction.season?.toString() || '',
                week: mostRecentTransaction.leg || 0,
                transactionId: mostRecentTransaction.transaction_id || '',
                team1Adds,
                team2Adds,
                team1Picks,
                team2Picks
            };
        }

        return { trades, mostRecent };
    }
}
