export interface LeagueWinnerDto {
	Season?: string;
	LeagueId?: string;
	RosterId?: number;
	UserId?: string;
	DisplayName?: string;
}

export interface LeagueScoreRecordDto {
	Season?: string;
	LeagueId?: string;
	RosterId?: number;
	UserId?: string;
	DisplayName?: string;
	Week?: number;
	MatchupId?: number;
	Points?: number;
	TotalPoints?: number;
}

export interface WinningPercentageRecordDto {
	UserId?: string;
	DisplayName?: string;
	Wins?: number;
	Losses?: number;
	Games?: number;
	WinPercentage?: number; // 0-1
}

export interface MatchResultRecordDto {
	Season?: string;
	LeagueId?: string;
	Week?: number;
	MatchupId?: number;
	WinnerUserId?: string;
	WinnerDisplayName?: string;
	WinnerPoints?: number;
	LoserUserId?: string;
	LoserDisplayName?: string;
	LoserPoints?: number;
	Margin?: number;
}

export interface LeagueStatsPageDto {
	Winners?: LeagueWinnerDto[];
	HighestWeek?: LeagueScoreRecordDto | null;
	LowestWeek?: LeagueScoreRecordDto | null;
	HighestSeason?: LeagueScoreRecordDto | null;
	LowestSeason?: LeagueScoreRecordDto | null;
	TopSeasons?: LeagueScoreRecordDto[];
	BottomSeasons?: LeagueScoreRecordDto[];
	HighestWinningPercentages?: WinningPercentageRecordDto[];
	LowestWinningPercentages?: WinningPercentageRecordDto[];
	LargestBlowouts?: MatchResultRecordDto[];
	ClosestVictories?: MatchResultRecordDto[];
	TopScoringWeeks?: LeagueScoreRecordDto[];
	BottomScoringWeeks?: LeagueScoreRecordDto[];
}
