# Skull King Scoring Engine

A production-grade scoring calculator for the Skull King card game, implementing complex scoring rules with full validation and transparency.

## Features

- **Accurate Scoring**: Implements official Skull King scoring rules with precision
- **Non-zero Bid Scoring**: +20 per correct trick, -10 per trick difference on misses
- **Zero Bid Scoring**: +10×hand_number if exact, -10×hand_number if any tricks taken
- **Bonus Point Handling**: Applies bonuses only when bids are exactly met
- **Score Tracking**: Maintains cumulative scores across all rounds
- **Detailed Breakdowns**: Provides transparent scoring explanations
- **Comprehensive Validation**: Catches invalid inputs with clear error messages

## Installation

```bash
npm install
```

## Usage

### Basic Example

```javascript
const { calculateHandScore, calculateRoundScores, updateTotalScores } = require('./src/scoring');

// Calculate score for a single hand
const score = calculateHandScore(
  5,      // bid amount
  5,      // tricks taken
  1,      // hand number
  0       // bonus points (optional)
);

console.log(score);
// Output: {
//   baseScore: 100,      // 20 × 5 tricks
//   bonusApplied: 0,
//   totalScore: 100,
//   breakdown: 'Non-zero bid exact: +20 × 5 tricks = 100',
//   isBidExact: true
// }
```

### Multiple Players

```javascript
const roundResults = [
  { bid: 3, tricks: 3, handNumber: 1, playerId: 'Alice' },
  { bid: 2, tricks: 1, handNumber: 1, playerId: 'Bob' },
  { bid: 5, tricks: 5, handNumber: 1, playerId: 'Charlie', bonusPoints: 10 }
];

const roundScores = calculateRoundScores(roundResults);
// Alice: 60 points (20 × 3)
// Bob: -10 points (-10 × 1 difference)
// Charlie: 110 points (20 × 5 + 10 bonus)

let totals = {};
totals = updateTotalScores(totals, roundScores);
```

## Scoring Rules

### Non-Zero Bids (1-13)

**Exact Bid**: +20 per trick taken
```
Example: bid=5, tricks=5
Score = 20 × 5 = +100 points
```

**Missed Bid**: -10 per trick difference
```
Example 1: bid=5, tricks=3
Score = -10 × (5-3) = -20 points

Example 2: bid=3, tricks=7
Score = -10 × (7-3) = -40 points
```

### Zero Bids

**Exact Zero Bid**: +10 × hand_number (no tricks taken)
```
Example: bid=0, tricks=0, hand=2
Score = +10 × 2 = +20 points
```

**Missed Zero Bid**: -10 × hand_number (any tricks taken)
```
Example: bid=0, tricks=2, hand=2
Score = -10 × 2 = -20 points (regardless of trick count)
```

### Bonus Points

Bonus points are **only applied when the bid is exactly met on non-zero bids**. Zero bids never receive bonus points.

```
Example 1 (Applied):
bid=5, tricks=5, bonus=10
Score = (20 × 5) + 10 = +110 points

Example 2 (Not Applied):
bid=5, tricks=3, bonus=10
Score = -10 × 2 = -20 points (bonus ignored)

Example 3 (Not Applied on zero bid):
bid=0, tricks=0, hand=1, bonus=15
Score = 10 × 1 = +10 points (bonus not applied to zero bids)
```

## API Reference

### calculateHandScore(bid, tricks, handNumber, bonusPoints = 0)

Calculates the score for a single hand.

**Parameters:**
- `bid` (number): The bid amount (0-13)
- `tricks` (number): Actual tricks taken (0-13)
- `handNumber` (number): The hand number (1-indexed, used for zero bid scoring)
- `bonusPoints` (number): Optional bonus points (only applied if bid is exact)

**Returns:** Object with:
- `baseScore`: Score before bonuses
- `bonusApplied`: Bonus points applied (0 if bid missed)
- `totalScore`: Final score (baseScore + bonusApplied)
- `breakdown`: Human-readable scoring explanation
- `isBidExact`: Boolean indicating if bid was met exactly

**Throws:**
- `TypeError`: If parameters are not the correct type
- `RangeError`: If numeric parameters are outside valid ranges

### calculateRoundScores(roundResults)

Calculates scores for all players in a single round.

**Parameters:**
- `roundResults` (Array): Array of hand result objects, each with:
  - `bid` (number): The bid amount
  - `tricks` (number): Tricks taken
  - `handNumber` (number): Hand number
  - `bonusPoints` (number, optional): Bonus points
  - `playerId` (string, optional): Player identifier

**Returns:** Object mapping playerId to score results

### updateTotalScores(currentTotals, roundScores)

Updates cumulative game scores with a round's scores.

**Parameters:**
- `currentTotals` (Object): Current cumulative scores by playerId
- `roundScores` (Object): Round scores from calculateRoundScores

**Returns:** New object with updated cumulative scores

### getScoreBreakdown(roundScores)

Converts round scores to a breakdown array for display.

**Parameters:**
- `roundScores` (Object): Round scores from calculateRoundScores

**Returns:** Array of breakdown objects with playerId and all score details

## Testing

```bash
npm test
```

The test suite includes:
- 40+ unit tests covering all scoring scenarios
- Edge case validation (bid=13, hand multipliers, etc.)
- Bonus point application logic
- Error handling and input validation
- Integration tests for multi-round scenarios

All acceptance criteria are covered with explicit test cases.

## Scoring Examples

### Example 1: Standard Non-Zero Bid
```javascript
calculateHandScore(5, 5, 1)
// Result: baseScore=100, totalScore=100
// Explanation: Bid exactly 5 tricks, got 5 tricks → 20 × 5 = +100
```

### Example 2: Missed Non-Zero Bid
```javascript
calculateHandScore(5, 3, 1)
// Result: baseScore=-20, totalScore=-20
// Explanation: Bid 5 tricks, got 3 → -10 × |5-3| = -10 × 2 = -20
```

### Example 3: Exact Zero Bid
```javascript
calculateHandScore(0, 0, 2)
// Result: baseScore=20, bonusApplied=0, totalScore=20
// Explanation: Bid 0 on hand 2, took 0 tricks → 10 × 2 = +20 (no bonus on zero bids)
```

### Example 4: Missed Zero Bid
```javascript
calculateHandScore(0, 1, 2)
// Result: baseScore=-20, totalScore=-20
// Explanation: Bid 0 on hand 2, took 1 trick → -10 × 2 = -20 (bonus not applied)
```

## Implementation Details

- **Single Responsibility**: Each function has one clear purpose
- **Immutability**: Functions don't mutate input objects
- **Error First**: Validates all inputs before processing
- **Transparency**: Every calculation includes a breakdown string
- **Type Safety**: Runtime type checking for all parameters

## Development

### File Structure
```
├── src/
│   ├── scoring.js              # Main scoring engine
│   └── scoring.test.js         # Comprehensive test suite
├── .gitignore
├── README.md
└── package.json
```

### Adding Tests

Each new feature should include tests covering:
1. Normal operation
2. Edge cases (bid=0, bid=13, hand=1, hand=13, etc.)
3. Error conditions
4. Integration with other functions

## License

MIT
