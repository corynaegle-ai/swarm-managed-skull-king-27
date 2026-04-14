# Round Scoring Interface

## Overview

The Round Scoring Interface allows the scorekeeper to enter actual tricks taken by each player and any bonus points during a round of Skull King. The component automatically calculates scores based on the game rules and prevents advancing to the next round until all required data has been entered.

## Features

### 1. Player Bid Display
- Shows each player's name and bid clearly in a table format
- Bids are displayed in a dedicated column for easy reference during scoring

### 2. Tricks Entry
- Input field for each player to enter tricks taken (0 to hand count)
- Validates that tricks are within the valid range
- Shows error messages if invalid values are entered

### 3. Bonus Points Entry
- Input field for bonus points (optional, defaults to 0)
- Accepts any non-negative integer value
- Particularly useful for special bonuses like "Pirate" or "Treasure" cards

### 4. Real-Time Score Calculation
- Scores are calculated and displayed immediately as data is entered
- Scoring formula:
  - **Match (tricks == bid):** `10 * bid + bonus_points`
  - **Undercut (tricks < bid):** `0`
  - **Overcut (tricks > bid):** `-5 * (tricks - bid)`

### 5. Data Validation
- Submit button is disabled until all players have valid tricks entered
- Bonus points default to 0 but can be entered if needed
- Invalid entries are highlighted with error messages
- Prevents accidental progression to next round

## Component Props

```javascript
<RoundScoringInterface
  players={Array}          // Array of player objects with id and name
  hand={Number}           // Current hand/round number (max tricks possible)
  bids={Object}           // Object mapping player IDs to their bids
  onComplete={Function}   // Callback with scoring results
/>
```

### onComplete Callback Data

When the submit button is clicked, the component calls `onComplete` with:

```javascript
{
  hand: Number,              // Current hand number
  tricks: {                  // Player ID -> tricks taken
    "1": 2,
    "2": 1,
    "3": 0
  },
  bonusPoints: {             // Player ID -> bonus points
    "1": 5,
    "2": 0,
    "3": 0
  },
  scores: {                  // Player ID -> calculated score
    "1": 25,                 // 10*2 + 5 bonus = 25
    "2": 0,                  // undercut (bid 1, tricks 1 would be 10, but using example)
    "3": 0                   // bid 0, tricks 0 = 0
  }
}
```

## Usage Example

```javascript
import RoundScoringInterface from './components/RoundScoringInterface';

function GameBoard() {
  const [players] = useState([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ]);

  const [currentHand, setCurrentHand] = useState(1);
  const [bids] = useState({
    1: 2,
    2: 1,
    3: 0,
  });

  const handleScoringComplete = (scoringData) => {
    console.log('Round scored:', scoringData);
    // Update game state with scores
    updatePlayerScores(scoringData.scores);
    // Move to next hand
    setCurrentHand(currentHand + 1);
  };

  return (
    <RoundScoringInterface
      players={players}
      hand={currentHand}
      bids={bids}
      onComplete={handleScoringComplete}
    />
  );
}
```

## Scoring Rules

The component implements Skull King scoring rules:

### Match (Tricks = Bid)
- Award: `10 × bid + bonus_points`
- Example: Bid 3, took 3 tricks, 5 bonus = 35 points

### Undercut (Tricks < Bid)
- Award: `0 points`
- Example: Bid 3, took 2 tricks = 0 points

### Overcut (Tricks > Bid)
- Penalty: `-5 × (tricks - bid)`
- Example: Bid 2, took 4 tricks = -10 points

## Error Handling

- **Invalid tricks value:** Displays error message "Tricks must be between 0 and [hand count]"
- **Negative bonus points:** Input field rejects negative values
- **Missing player data:** Shows "No players found" message
- **Missing bids:** Displays "-" for missing bid values

## Styling

The component includes a professional gradient background with:
- Responsive table layout
- Color-coded feedback (errors highlighted in red)
- Disabled button styling for better UX
- Mobile-responsive CSS with media queries
- Smooth transitions and hover effects

## Testing

Comprehensive test suite included covering:
- All 5 acceptance criteria
- Score calculation edge cases
- Input validation
- Error handling
- Real-time calculation
- Button state management

Run tests with:
```bash
npm test
```

## Files

- `src/components/RoundScoringInterface.jsx` - Main component
- `src/utils/scoring.js` - Scoring calculation utilities
- `src/styles/RoundScoringInterface.css` - Component styling
- `src/__tests__/RoundScoringInterface.test.jsx` - Component tests
- `src/__tests__/scoring.test.js` - Scoring utility tests