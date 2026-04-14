# Score Display Feature

## Overview
The Score Display feature provides a comprehensive view of player standings, round-by-round score history, detailed score breakdowns, and final rankings for the Skull King game.

## Components

### ScoreDisplay Component
**Location:** `src/components/ScoreDisplay.tsx`

Main component that displays:
- Current total scores for all players
- Score history organized by round
- Detailed score breakdown showing bids, tricks, and round scores
- Final rankings when game ends

**Props:**
- `game: Game` - The current game state
- `gameEnded: boolean` - Whether the game has ended

## Features

### 1. Current Standings (Leaderboard)
- Displays all players sorted by total score
- Shows player rankings numerically
- Highlights the current leader with a special badge and yellow background
- Shows total score prominently

### 2. Round History
- Table view of scores for each round
- Rows represent players, columns represent rounds
- Shows running totals in the rightmost column
- Easy-to-scan format for tracking score progression

### 3. Score Breakdown
- Individual card for each player
- Lists all rounds with:
  - Bid amount
  - Tricks taken
  - Round score (color-coded: green for positive, red for negative)
  - Total score for player
- Compact, readable format

### 4. Final Rankings
- Only displayed when game has ended
- Shows all players ranked by final score
- Visual indicators:
  - Trophy emoji (🏆) for 1st place
  - Silver medal (🥈) for 2nd place
  - Bronze medal (🥉) for 3rd place
  - Numerical position for other places
- Winner's card highlighted in gold with slight scale effect

## Responsive Design

### Desktop (1200px+)
- Full multi-column layout
- Large, readable fonts
- Optimal spacing and padding

### Tablet (769px - 1200px)
- Adjusted grid layouts
- Smaller section margins
- Reduced padding

### Mobile (481px - 768px)
- Single-column layout where appropriate
- Optimized font sizes
- Touch-friendly spacing
- Reduced overall padding

### Small Mobile (<480px)
- Minimal padding and margins
- Compact fonts
- Full-width sections
- Simplified round history table (shows last 3 rounds)
- Single-column breakdown cards

## Styling

**Color Scheme:**
- Primary: #667eea (Blue-purple)
- Secondary: #764ba2 (Purple)
- Success: #28a745 (Green)
- Danger: #dc3545 (Red)
- Warning: #ffc107 (Yellow/Gold)
- Neutral: #f8f9fa (Light gray)

**Fonts:**
- Family: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', etc.)
- Weights: 600 (semi-bold) for labels, 700 (bold) for highlights

## Usage Example

```tsx
import ScoreDisplay from './components/ScoreDisplay';
import { Game } from './types';

const App = () => {
  const game: Game = {
    id: 'game-1',
    players: [
      {
        id: 'player-1',
        name: 'Alice',
        rounds: [
          { bid: 2, tricks: 2, score: 20 },
          { bid: 3, tricks: 2, score: -10 },
        ],
      },
      {
        id: 'player-2',
        name: 'Bob',
        rounds: [
          { bid: 1, tricks: 1, score: 10 },
          { bid: 2, tricks: 2, score: 20 },
        ],
      },
    ],
    currentRound: 2,
    status: 'active',
  };

  return <ScoreDisplay game={game} gameEnded={false} />;
};

export default App;
```

## Data Types

**Round:**
```typescript
interface Round {
  bid: number;      // Number of tricks the player bid
  tricks: number;   // Number of tricks actually taken
  score: number;    // Score for this round
}
```

**Player:**
```typescript
interface Player {
  id: string;       // Unique player identifier
  name: string;     // Player name
  rounds: Round[];  // Array of round results
}
```

**Game:**
```typescript
interface Game {
  id: string;              // Unique game identifier
  players: Player[];       // Array of players
  currentRound: number;    // Current round number
  status: 'active' | 'ended'; // Game status
}
```

## Testing

Run the test suite with:
```bash
npm test -- ScoreDisplay.test.tsx
```

The test suite covers:
- Component rendering
- Display of total scores
- Round history rendering
- Score breakdown display
- Final rankings visibility
- Current leader indication
- Empty state handling
- Score calculations
- Responsive layout

## Performance Considerations

- Uses `useMemo` hooks to memoize calculated values (rankings, round history)
- Prevents unnecessary re-renders of child elements
- Efficient scoring calculations

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Chart visualization for score trends
- Printable score sheets
- Score history export (CSV, PDF)
- Animated score transitions
- Head-to-head player comparison
- Historical game statistics
