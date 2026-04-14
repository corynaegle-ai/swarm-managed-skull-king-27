# Skull King Scoring Engine

A complete implementation of the Skull King card game scoring system.

## Features

### Scoring Rules

#### Non-Zero Bids
- **Exact bid**: +20 per trick (e.g., bid 3, won 3 = 60 points)
- **Missed bid**: -10 per trick difference (e.g., bid 5, won 3 = -20 points)
- **Bonus points**: Only applied when bid is exactly met

#### Zero Bids
- **Exact (0 tricks)**: +10 × hand number (e.g., hand 3, bid 0, won 0 = 30 points)
- **Missed (any tricks)**: -10 × hand number (e.g., hand 3, bid 0, won 2 = -30 points)
- **Bonus points**: Only applied when bid is exactly met (0 tricks)

## API

### `calculateHandScore(bid, tricks, handNumber, bonusPoints = 0)`

Calculates the score for a single hand.

**Parameters:**
- `bid` (number): The number of tricks bid (0 or positive)
- `tricks` (number): The number of tricks actually won
- `handNumber` (number): The hand number (1-indexed)
- `bonusPoints` (number, optional): Bonus points earned

**Returns:**
```javascript
{
  baseScore: number,      // Score before bonus
  bonus: number,          // Bonus points awarded
  total: number,          // baseScore + bonus
  bid: number,
  tricks: number,
  handNumber: number,
  isExact: boolean,       // Whether bid was exactly met
  bonusPoints: number
}
```

**Examples:**
```javascript
// Exact non-zero bid with bonus
calculateHandScore(3, 3, 1, 5)
// Returns: { baseScore: 60, bonus: 5, total: 65, ... }

// Missed non-zero bid (no bonus applied)
calculateHandScore(5, 3, 1, 10)
// Returns: { baseScore: -20, bonus: 0, total: -20, ... }

// Exact zero bid with bonus
calculateHandScore(0, 0, 2, 5)
// Returns: { baseScore: 20, bonus: 5, total: 25, ... }

// Missed zero bid (no bonus applied)
calculateHandScore(0, 1, 1, 10)
// Returns: { baseScore: -10, bonus: 0, total: -10, ... }
```

### `calculateRoundScores(hands)`

Calculates scores for all hands in a round.

**Parameters:**
- `hands` (array): Array of hand objects with {bid, tricks, handNumber, bonusPoints}

**Returns:**
```javascript
{
  hands: array,           // Hand score objects
  roundTotal: number,     // Sum of all hand totals
  breakdown: array        // Formatted breakdown for display
}
```

### `updatePlayerScores(players, roundScores)`

Updates cumulative player scores after a round.

**Parameters:**
- `players` (array): Player objects with score property
- `roundScores` (array): Round score total for each player

**Returns:**
Updated player array with new scores and previous scores tracked.

### `formatScoreBreakdown(roundScoring, playerNames = [])`

Formats score breakdown as human-readable string.

**Parameters:**
- `roundScoring` (object): Result from calculateRoundScores
- `playerNames` (array, optional): Names of players

**Returns:**
Formatted string with detailed score breakdown.

## Testing

Run tests with:
```bash
npm test
```

Tests cover:
- Non-zero bid scoring (exact and missed)
- Zero bid scoring (exact and missed)
- Bonus point application (only on exact bids)
- Round calculations
- Player score updates
- Error handling and validation
- Output formatting

## Implementation Notes

1. **Bonus Points**: Correctly constrained to only apply when bid is exactly met
2. **Error Handling**: Input validation for all parameters
3. **Transparency**: Score breakdown shows each hand's calculation
4. **Flexibility**: Hand number and bonus points are configurable
