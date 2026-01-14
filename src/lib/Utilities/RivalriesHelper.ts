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
            tradeDetails: []
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
        stats.totalTrades = tradeStats.length;
        stats.tradeDetails = tradeStats;

        return stats;
    }

    private static findHeadToHeadMatchups(
        team1RosterId: number,
        team2RosterId: number,
        matchups: any,
        brackets: Record<string, { winners: any[]; losers: any[] }>
    ): RivalryMatchup[] {
        const games: RivalryMatchup[] = [];

        console.log(`Finding matchups between roster ${team1RosterId} and roster ${team2RosterId}`);

        // Matchups are organized by season -> week
        for (const season in matchups) {
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
                    team1Matchup.matchup_id === team2Matchup.matchup_id) {
                    const team1Score = team1Matchup.points || 0;
                    const team2Score = team2Matchup.points || 0;
                    
                    // Validate this is a real matchup by checking bracket data
                    const isValidMatchup = this.isMatchupInBracket(
                        team1RosterId,
                        team2RosterId,
                        weekNum,
                        seasonBrackets
                    );
                    
                    if (!isValidMatchup) {
                        console.log(`Skipping ${season} Week ${weekNum}: Not found in playoff brackets`);
                        continue;
                    }
                    
                    // Skip matchups where both scores are 0 (no lineups set)
                    if (team1Score === 0 && team2Score === 0) {
                        console.log(`Skipping ${season} Week ${weekNum}: Both scores are 0`);
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

        console.log(`Total matchups found: ${games.length}`);
        
        return games;
    }

    private static isMatchupInBracket(
        team1RosterId: number,
        team2RosterId: number,
        week: number,
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
            
            // Also check winner/loser in case match is complete
            const hasTeam1 = t1 === team1RosterId || t1 === team2RosterId || 
                            bracketMatchup.w === team1RosterId || bracketMatchup.w === team2RosterId ||
                            bracketMatchup.l === team1RosterId || bracketMatchup.l === team2RosterId;
            const hasTeam2 = t2 === team1RosterId || t2 === team2RosterId ||
                            bracketMatchup.w === team1RosterId || bracketMatchup.w === team2RosterId ||
                            bracketMatchup.l === team1RosterId || bracketMatchup.l === team2RosterId;
            
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
    ): TradeDetail[] {
        const trades: TradeDetail[] = [];

        transactions.forEach(transaction => {
            if (transaction.type === TransactionType.Trade) {
                // Check if both teams are involved in this trade
                const rosterIds = transaction.roster_ids || [];
                
                if (rosterIds.includes(team1RosterId) && 
                    rosterIds.includes(team2RosterId)) {
                    trades.push({
                        season: transaction.season?.toString() || '',
                        week: transaction.leg || 0,
                        transactionId: transaction.transaction_id || ''
                    });
                }
            }
        });

        return trades;
    }
}
