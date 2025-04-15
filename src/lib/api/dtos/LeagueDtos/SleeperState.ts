export interface SleeperState {
	week?: number; // Current week
	season_type?: 'pre' | 'regular' | 'post'; // Preseason, regular season, or postseason
	season_start_date?: string; // Start date of the regular season
	season?: string; // Current season
	previous_season?: string; // Previous season
	leg?: number; // Week of the regular season
	league_season?: string; // Active season for leagues
	league_create_season?: string; // Season for newly created leagues
	display_week?: number; // UI display week (can differ from actual week)
}
