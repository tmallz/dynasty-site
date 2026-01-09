# League Stats Page Redesign Plan

## Overview
Transform the league stats page from a debug text view into a polished, single-column table design. Each stat category will be displayed in its own table with a clear header and organized data rows.

---

## Current Stats Categories

1. **All League Winners**
2. **Top Scoring Weeks (Top 10)**
3. **Lowest Scoring Weeks (Bottom 10)**
4. **Top 3 Highest Season Scoring Teams**
5. **Lowest Season Scoring Team**
6. **Top 3 Highest Winning Percentages**
7. **Bottom 3 Lowest Winning Percentages**
8. **Top 10 Largest Blowouts**
9. **Top 10 Closest Victories**

---

## Proposed Table Designs

### 1. All League Winners
**Table Header:** "League Champions"

| Column Layout |
|---------------|
| **Rank** (medal icons: 🏆 for most recent, then numbered) |
| **Season** |
| **Champion** (Display name + avatar) |
| **Record** (Wins-Losses) |

**Design Notes:**
- Most recent champion at top with 🏆 icon
- Include team avatar next to name
- Consider adding season points total if available
- Alternating row colors for readability

---

### 2. Top Scoring Weeks (Top 10)
**Table Header:** "Highest Scoring Weeks"

| Column Layout |
|---------------|
| **Rank** (#1, #2, etc. with 🔥 for top 3) |
| **Manager** (Display name + avatar) |
| **Season & Week** (e.g., "2025 Week 14") |
| **Points** (Large, bold number) |

**Design Notes:**
- Top 3 get 🔥 fire emoji
- Points displayed prominently (larger font)
- Color gradient: Red (highest) to orange (10th)

---

### 3. Lowest Scoring Weeks (Bottom 10)
**Table Header:** "Lowest Scoring Weeks"

| Column Layout |
|---------------|
| **Rank** (#1 = worst, with 💩 for bottom 3) |
| **Manager** (Display name + avatar) |
| **Season & Week** |
| **Points** (Bold number with sadder styling) |

**Design Notes:**
- Bottom 3 get 💩 emoji (embracing the shame)
- Muted color palette (grays)
- Consider "Wall of Shame" styling

---

### 4. Top 3 Highest Season Scoring Teams
**Table Header:** "Highest Scoring Seasons"

| Column Layout |
|---------------|
| **Rank** (🥇🥈🥉 medals) |
| **Manager** (Display name + avatar) |
| **Season** |
| **Total Points** (Bold, large) |
| **Avg Points/Week** (calculated if possible) |

**Design Notes:**
- Medal icons for 1st, 2nd, 3rd place
- Highlight total points as main metric
- Include average if data available

---

### 5. Lowest Season Scoring Team
**Table Header:** "Lowest Scoring Season"

| Column Layout |
|---------------|
| **Manager** (Display name + avatar) |
| **Season** |
| **Total Points** |
| **Avg Points/Week** |

**Design Notes:**
- Single row table (or card design)
- Sympathetic but clear styling
- Could add "Comeback Player Opportunity" badge

---

### 6. Top 3 Highest Winning Percentages
**Table Header:** "Best Winning Percentages (All-Time)"

| Column Layout |
|---------------|
| **Rank** (🥇🥈🥉) |
| **Manager** (Display name + avatar) |
| **Record** (W-L format) |
| **Win %** (Large, with progress bar visual) |

**Design Notes:**
- Visual progress bar showing win percentage
- Green color scale
- Consider min games played requirement note

---

### 7. Bottom 3 Lowest Winning Percentages
**Table Header:** "Lowest Winning Percentages (All-Time)"

| Column Layout |
|---------------|
| **Rank** (#1 = worst) |
| **Manager** (Display name + avatar) |
| **Record** (W-L format) |
| **Win %** (with progress bar visual) |

**Design Notes:**
- Red/gray color scale for progress bar
- Sympathetic styling
- Could add "Building for the Future" note

---

### 8. Top 10 Largest Blowouts
**Table Header:** "Biggest Blowouts"

| Column Layout |
|---------------|
| **Rank** (#1, #2, etc. with 💥 for top 3) |
| **Winner** (Display name + avatar) vs **Loser** (Display name + avatar) |
| **Score** (Winner Score - Loser Score) |
| **Margin** (Bold, emphasized) |
| **Season & Week** |

**Design Notes:**
- Top 3 get 💥 explosion emoji
- Winner name in green, Loser in red
- Margin highlighted prominently
- "vs" separator between teams

---

### 9. Top 10 Closest Victories
**Table Header:** "Closest Games"

| Column Layout |
|---------------|
| **Rank** (#1, #2, etc. with ⚡ for top 3) |
| **Winner** (Display name + avatar) vs **Loser** (Display name + avatar) |
| **Score** (Winner Score - Loser Score) |
| **Margin** (Small number, emphasized) |
| **Season & Week** |

**Design Notes:**
- Top 3 get ⚡ lightning bolt (nail-biter!)
- Yellow/gold color scheme
- Margin shown in italics or special formatting
- Could add "Heart Attack Game" badge for margin < 1 point

---

## Overall Page Layout

### Layout Structure:
```
┌─────────────────────────────────────┐
│         League Stats Header         │
│    (Page title + season selector)   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│      League Champions Table         │
└─────────────────────────────────────┘
┌────────────────┬────────────────────┐
│ Highest Weeks  │  Lowest Weeks      │
│     Table      │     Table          │
└────────────────┴────────────────────┘
┌────────────────┬────────────────────┐
│ Highest Season │  Lowest Season     │
│     Table      │     Card           │
└────────────────┴────────────────────┘
┌────────────────┬────────────────────┐
│ Highest Win %  │  Lowest Win %      │
│     Table      │     Table          │
└────────────────┴────────────────────┘
┌─────────────────────────────────────┐
│      Largest Blowouts Table         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│      Closest Victories Table        │
└─────────────────────────────────────┘
```

### Responsive Design:
- **Desktop**: Side-by-side layout for related stats (high/low comparisons)
- **Tablet/Mobile**: Single column, stacked tables

---

## Component Structure

### Suggested Components to Create:

1. **`StatTable.svelte`** - Reusable table component
   - Props: `title`, `columns`, `data`, `headerColor`
   - Handles sorting, responsive design
   
2. **`ManagerCell.svelte`** - Manager display with avatar
   - Props: `displayName`, `avatarUrl`, `season` (optional)
   
3. **`MatchupCell.svelte`** - Winner vs Loser display
   - Props: `winner`, `loser`, `winnerScore`, `loserScore`, `margin`
   
4. **`RankBadge.svelte`** - Rank with emoji/styling
   - Props: `rank`, `total`, `type` (win/loss/blowout/etc)

---

## Styling Guidelines

### Color Scheme:
- **Champions/Winners**: Gold/Green tones
- **Top Performers**: Green gradients
- **Bottom Performers**: Red/Gray tones (not harsh, more muted)
- **Neutral**: Blue/Purple for general stats

### Typography:
- **Headers**: Bold, larger (text-2xl)
- **Primary Data** (points, margins): Bold, emphasized
- **Secondary Data** (weeks, seasons): Smaller, muted

### Spacing:
- Use DaisyUI table utilities
- Card-based design with shadows
- Generous padding between stat sections

---

## Technical Implementation Notes

### Data Flow:
1. Keep existing `+page.server.ts` loading pattern
2. Pass stats data to new table components
3. Components handle formatting/display logic

### Accessibility:
- Proper table headers with scope
- Alt text for avatars
- Screen reader friendly rank labels
- Keyboard navigation support

### Performance:
- Lazy load avatars
- Consider virtual scrolling for large datasets (future)
- Memoize calculations (win %, averages)

---

## Migration Strategy

1. **Phase 1**: Create base `StatTable` component
2. **Phase 2**: Implement Champions table (most important)
3. **Phase 3**: Add scoring week tables
4. **Phase 4**: Add season totals tables
5. **Phase 5**: Add winning percentage tables
6. **Phase 6**: Add blowout/close game tables
7. **Phase 7**: Polish, animations, responsive testing

---

## Future Enhancements

- **Interactive filters**: Filter by season, manager
- **Sortable columns**: Click to sort by different metrics
- **Expandable rows**: Show more details on click
- **Tooltips**: Hover for additional context
- **Export**: Download stats as CSV/PDF
- **Comparisons**: Side-by-side manager comparisons
- **Trends**: Line charts showing performance over time
- **Search**: Search for specific managers/seasons

---

## Questions for Review

1. Should we include avatars for all manager displays?
2. Do we want animations on stat reveal (count-up numbers, etc.)?
3. Should tables be sortable by default?
4. Include a "Fun Facts" section with random interesting stats?
5. Add a podium visualization for top 3 stats?
6. Include season selector to filter by year?
7. Dark mode considerations for colors?

