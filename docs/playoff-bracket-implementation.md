# Playoff Bracket Implementation Plan

## Overview
Add playoff bracket display to the matchups page. When the league is in playoffs, display the bracket instead of regular matchups. Later, add a toggle to switch between views.

## Current State
- ✅ Playoff detection logic implemented
- ✅ Server-side data loading with +page.server.ts
- ✅ Bracket data fetching and processing
- ✅ Toggle between playoff brackets, losers bracket, and week 14 matchups
- ✅ Basic bracket display (left-to-right flow, vertical centering)
- ✅ Winners bracket: 4→2→1 structure with bye weeks
- ✅ Consolation bracket: 2→1 structure (3rd/5th place)
- ✅ Losers bracket: 2→1 structure with 9th place consolation

## Goals
- **Phase 1**: ✅ Implement playoff bracket logic and basic display
- **Phase 2**: ✅ Add toggle between bracket, losers bracket, and matchups views
- **Phase 3**: 🚧 Polish bracket styling (IN PROGRESS)

---

## Phase 3: Bracket Styling Polish (Current Phase)

### Step 1: Add Team Logos to Bracket Matchups
**Objective**: Display team avatar/logo next to team name in each bracket matchup

**Implementation**:
- Pass roster and user data to bracket display components
- Look up avatar URL for each team using roster ID
- Add avatar image next to team name in matchup cards
- Use similar styling to RosterSpot/TeamHeader components

**Required changes**:
- Update `ProcessedBracketMatchup` interface to include avatar URLs
- Modify `ProcessBrackets()` to include avatar data
- Update Svelte template to display avatars

---

### Step 2: Add Borders and Visual Hierarchy
**Objective**: Improve visual distinction between teams and highlight winners

**Styling changes**:
- Add border around entire matchup card
- Add divider/border between team1 and team2 within card
- Highlight winning team's section with green border
- Use consistent spacing and padding

**CSS approach**:
- Matchup card: `border-2 border-base-content/20`
- Team sections: `border-b` between teams
- Winner highlight: `border-l-4 border-success` on winning team row
- Maintain responsive design with proper spacing

---

### Step 3: Improve Bracket Alignment
**Objective**: Align matchups so center lines match gap midpoints in previous round

**Visual goal**:
```
Round 1 (4)     Round 2 (2)     Round 3 (1)
┌────┐
│ M1 │────┐
└────┘    │    ┌────┐
          ├────│ M5 │────┐
┌────┐    │    └────┘    │
│ M2 │────┘              │    ┌────┐
└────┘                   ├────│ M7 │
                         │    └────┘
┌────┐                   │
│ M3 │────┐              │
└────┘    │    ┌────┐    │
          ├────│ M6 │────┘
┌────┐    │    └────┘
│ M4 │────┘
└────┘
```

**Implementation strategy**:
- Use flexbox with `items-center` for each column
- Set custom gap values that create proper alignment
- Round 1: `gap-8` between matchups
- Round 2: `gap-16` between matchups (centers between Round 1 pairs)
- Round 3: Single matchup, naturally centered
- Apply to winners bracket, consolation bracket, and losers bracket

---

### Step 4: Consistency Across All Brackets
**Objective**: Apply all styling improvements to winners, consolation, and losers brackets

**Implementation**:
- Apply team logo changes to all three bracket types
- Apply border/highlight styling to all bracket displays
- Ensure alignment works for different bracket structures:
  - Winners: 4→2→1
  - Consolation: 2→1 (5th/3rd place)
  - Losers: 2→1 with separate 9th place game
- Test responsive behavior on mobile devices

---

## Phase 1: Playoff Bracket Logic Implementation ✅

### Step 1: Detect Playoff vs Regular Season
**Objective**: Determine if we're in playoffs or regular season

**Implementation**:
- Check NFL season state to determine current season type
- Fantasy playoffs are weeks 15-17
- Regular season is weeks 1-14

**Changes needed**:
- Add method to `MatchupHelper`: `GetTargetWeekForDisplay()`
- Returns: `{ week: number, isPlayoffs: boolean }`

**Logic**:
```typescript
// Pseudo-code
if (NFL season type is 'regular') {
  return { week: currentWeek, isPlayoffs: false }
} else if (NFL season type is 'post') {
  return { week: 18, isPlayoffs: true }
} else {
  // Offseason - find last completed week
  searchBackwardsFromWeek18()
}
```

---

### Step 2: Create Playoff Bracket Data Types
**Objective**: Define TypeScript interfaces for bracket data

**File**: `src/lib/Utilities/Dtos/MatchupPageDto.ts`

**New interfaces**:
```typescript
interface PlayoffMatchupDto {
  Round: number;
  MatchId: number;
  T1RosterId?: number;
  T1Name: string;
  T1Score?: number;
  T2RosterId?: number;
  T2Name: string;
  T2Score?: number;
  WinnerRosterId?: number;
}

interface PlayoffRoundDto {
  RoundNumber: number;
  Matchups: PlayoffMatchupDto[];
}

interface PlayoffBracketDto {
  BracketType: 'winners' | 'losers';
  Rounds: PlayoffRoundDto[];
}
```

---

### Step 3: Fetch Playoff Bracket Data
**Objective**: Get bracket structure from Sleeper API and combine with scores

**Sleeper API endpoints**:
- `GET /league/{league_id}/winners_bracket` - Returns bracket structure
- `GET /league/{league_id}/losers_bracket` - Returns consolation bracket
- `GET /league/{league_id}/matchups/{week}` - Returns scores for a week

**Key considerations**:
- Bracket API provides structure (teams, rounds, progression)
- Matchup API provides actual scores
- Need to match roster IDs between bracket and matchup data
- Round 1 = Week 15, Round 2 = Week 16, Round 3 = Week 17

**Implementation**:
- Add method to `MatchupHelper`: `GetPlayoffBracket(leagueId: string)`
- Fetch winners and losers brackets
- Fetch matchup scores for weeks 15, 16, 17
- Combine data by matching roster IDs
- Resolve roster IDs to team names
- Structure into `PlayoffBracketDto`

**Helper functions needed**:
- `resolveRosterId(ref, bracket)` - Handle bracket progression references
- `getRosterName(rosterId)` - Get team name from roster ID
- `getScoreFromMatchups(rosterId, week)` - Get score for a team in a specific week

---

### Step 4: Update Matchups Page Logic
**Objective**: Display bracket when in playoffs, matchups otherwise

**File**: `src/routes/matchups/+page.svelte`

**Changes**:
1. Call `GetTargetWeekForDisplay()` to check if playoffs
2. If `isPlayoffs === true`:
   - Fetch playoff bracket data
   - Display bracket (simple text format for now)
3. If `isPlayoffs === false`:
   - Keep existing matchup display logic

**Pseudo-code**:
```svelte
<script>
  let isPlayoffs = false;
  let bracket = null;
  let matchups = [];

  onMount(async () => {
    const { week, isPlayoffs: inPlayoffs } = await MatchupHelper.GetTargetWeekForDisplay();
    isPlayoffs = inPlayoffs;
    
    if (isPlayoffs) {
      bracket = await MatchupHelper.GetPlayoffBracket(leagueId);
    } else {
      matchups = await MatchupHelper.GetPageMatchups();
    }
  });
</script>

{#if isPlayoffs}
  <!-- Display bracket (simple text for now) -->
  <pre>{JSON.stringify(bracket, null, 2)}</pre>
{:else}
  <!-- Existing matchup display -->
{/if}
```

---

### Step 5: Simple Bracket Display (No Styling)
**Objective**: Show bracket data in a readable format

**Display requirements**:
- Show winners bracket rounds
- Show each matchup with team names and scores
- Indicate winner of each matchup
- Show losers bracket if it exists

**Simple text format**:
```
Winners Bracket
  Round 1:
    Team A (125.5) vs Team B (98.2) → Winner: Team A
    Team C (110.3) vs Team D (105.1) → Winner: Team C
  Round 2:
    Team A (132.8) vs Team C (118.5) → Winner: Team A
  Round 3 (Championship):
    Team A (140.2) vs Team E (135.9) → Winner: Team A

Losers Bracket
  Round 1:
    Team B (102.5) vs Team D (99.8) → Winner: Team B
  Round 2 (3rd Place):
    Team B (115.3) vs Team F (112.1) → Winner: Team B
```

---

## Implementation Checklist

### Step 1: Detect Playoffs ✅ COMPLETE
- [x] Add `GetTargetWeekForDisplay()` method to `MatchupHelper`
- [x] Handle regular season case
- [x] Handle playoff case
- [x] Handle offseason case
- [x] Test with current NFL season state

### Step 2: Create Data Types
- [ ] Add `PlayoffMatchupDto` interface
- [ ] Add `PlayoffRoundDto` interface
- [ ] Add `PlayoffBracketDto` interface

### Step 3: Fetch Bracket Data
- [ ] Add `GetPlayoffBracket()` method to `MatchupHelper`
- [ ] Fetch winners bracket from Sleeper API
- [ ] Fetch losers bracket from Sleeper API
- [ ] Fetch matchup scores for weeks 15, 16, 17
- [ ] Implement `resolveRosterId()` helper
- [ ] Implement `getRosterName()` helper
- [ ] Implement `getScoreFromMatchups()` helper
- [ ] Combine bracket structure with scores
- [ ] Structure data into `PlayoffBracketDto`

### Step 4: Update Page Logic
- [ ] Update `+page.svelte` to call `GetTargetWeekForDisplay()`
- [ ] Add conditional logic for playoffs vs regular season
- [ ] Fetch bracket data when in playoffs
- [ ] Keep existing matchup fetch for regular season

### Step 5: Simple Display
- [ ] Display winners bracket with rounds
- [ ] Show matchups with team names and scores
- [ ] Indicate winner of each matchup
- [ ] Display losers bracket if exists
- [ ] Show "No bracket data" message if no data

---

## Testing & Validation

After implementation, verify:
- [ ] Regular season shows matchups (current behavior)
- [ ] Playoffs show bracket data
- [ ] All team names resolve correctly
- [ ] Scores display correctly for each matchup
- [ ] Winners are indicated correctly
- [ ] Losers bracket displays when available
- [ ] Offseason shows most recent completed week
- [ ] No errors in console

---

## Important Notes

### Fantasy Season vs NFL Season
- Fantasy regular season: Weeks 1-14
- Fantasy playoffs: Weeks 15-17
- NFL season timing may not align with fantasy season

### Sleeper Bracket API Response
The bracket API returns an array of matchup objects with this structure:
```typescript
{
  r: number;              // Round number (1, 2, 3)
  m: number;              // Match ID
  t1: number | {w: num};  // Team 1 roster ID or reference to winner
  t2: number | {l: num};  // Team 2 roster ID or reference to loser
  w: number;              // Winner roster ID (null if not complete)
  l: number;              // Loser roster ID (null if not complete)
  t1_from: {w?: number, l?: number};  // Where t1 comes from
  t2_from: {w?: number, l?: number};  // Where t2 comes from
  p: number;              // Placement (for 3rd place, 5th place, etc.)
}
```

### Matching Bracket to Scores
- Bracket provides roster IDs and structure
- Matchup API provides scores by roster ID and week
- Map: Round 1 → Week 15, Round 2 → Week 16, Round 3 → Week 17
- Match roster_id from bracket to roster_id in matchups to get score

---

## Future Phases (Not in Scope for Phase 1)

### Phase 2: Toggle Between Views
- Add toggle button when in playoffs
- State management for current view
- Display matchups when toggle is on "Matchups"
- Display bracket when toggle is on "Bracket"

### Phase 3: Styled Bracket Display
- Tournament-style bracket layout
- Visual connectors between rounds
- Team logos/avatars
- Highlight winners with colors
- Responsive design
- Mobile-friendly display
