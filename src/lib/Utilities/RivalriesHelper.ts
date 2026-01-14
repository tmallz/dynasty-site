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
        transactions: TransactionWithSeason[]
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
            matchups
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
        matchups: any
    ): RivalryMatchup[] {
        const games: RivalryMatchup[] = [];

        // Matchups are organized by season -> week
        for (const season in matchups) {
            const seasonMatchups = matchups[season];
            
            for (const week in seasonMatchups) {
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
                    const margin = Math.abs(team1Score - team2Score);
                    
                    games.push({
                        week: parseInt(week),
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
