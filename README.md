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
const { calculateRoundScore, calculateTotalScore, validateRoundScoring } = require('./src/scoring');

// Calculate score for a single round
const score = calculateRoundScore(
  5,      // bid amount
  5,      // tricks taken
  1       // hand number
);

console.log(score);
// Output: {
//   baseScore: 100,      // 20 × 5 tricks
//   bonusScore: 10,      // 10 × 1 hand (automatic for exact bid)
//   totalScore: 110,
//   isExact: true,
//   breakdown: { ... }
// }
```

### Multiple Players

```javascript
const rounds = [
  { bid: 3, tricks: 3, hands: 1 },
  { bid: 2, tricks: 1, hands: 1 },
  { bid: 5, tricks: 5, hands: 1 }
];

const totalScores = calculateTotalScore(rounds);
// Round 1: 60 points (20 × 3)
// Round 2: -10 points (-10 × 1 difference)
// Round 3: 110 points (20 × 5 + 10 automatic bonus)
// Total: 160 points
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

Bonus points are **only applied when the bid is exactly met on non-zero bids**. When an exact non-zero bid is achieved, the bonus is calculated as 10 × hand_number and added to the base score. This bonus must be explicitly provided as input (player-entered bonus points). Zero bids never receive bonus points, even if exactly met (no tricks taken).

```
Example 1 (Applied on Exact Bid):
bid=5, tricks=5, hand=1
baseScore = 20 × 5 = 100
bonusScore = 10 × 1 = 10 (applied only because bid is exact)
totalScore = 100 + 10 = +110 points

Example 2 (Not Applied - Bid Missed):
bid=5, tricks=3, hand=1
baseScore = -10 × |5-3| = -20
bonusScore = 0 (no bonus on missed bid)
totalScore = -20 points

Example 3 (Not Applied - Zero Bid):
bid=0, tricks=0, hand=1
baseScore = 10 × 1 = 10 (no bonus multiplier for zero bids)
bonusScore = 0
totalScore = +10 points
```

## API Reference

### calculateRoundScore(bid, tricks, hands, bonus)

Calculates the score for a single round/hand.

**Parameters:**
- `bid` (number): The bid amount (0 or higher)
- `tricks` (number): Actual tricks taken (0 or higher)
- `hands` (number): The hand/round number (positive integer, used for multipliers)
- `bonus` (number, optional): Player-entered bonus points to apply only when bid is exactly met (default: 0)

**Returns:** Object with:
- `baseScore`: Score from bid correctness (±20 per trick for non-zero, ±10×hands for zero)
- `bonusScore`: Bonus points applied only for exact non-zero bids (10×hands if exact and bonus provided, 0 otherwise). Zero bids never receive bonus points.
- `totalScore`: Final score (baseScore + bonusScore)
- `isExact`: Boolean indicating if bid was met exactly
- `breakdown`: Object with detailed breakdown and human-readable message

**Throws:**
- `TypeError`: If parameters are not the correct type
- `RangeError`: If numeric parameters are outside valid ranges

### calculateTotalScore(rounds)

Calculates total score across multiple rounds for a player.

**Parameters:**
- `rounds` (Array): Array of round result objects, each with:
  - `bid` (number): The bid amount
  - `tricks` (number): Tricks taken
  - `hands` (number): Hand/round number (positive integer)

**Returns:** Object with:
- `totalScore`: Cumulative score across all rounds
- `rounds`: Array of individual round score objects
- `breakdown`: Detailed breakdown including round-by-round scores

### validateRoundScoring(bid, tricks)

Validates scoring inputs for a single round.

**Parameters:**
- `bid` (number): The bid amount
- `tricks` (number): Tricks taken

**Returns:** Object with:
- `isValid`: Boolean indicating if inputs are valid
- `errors`: Array of error messages (if any)
- `warnings`: Array of warning messages (non-blocking issues)

### getScoreMessage(bid, tricks, hands, baseScore, bonusScore)

Generates a human-readable message describing the score calculation.

**Parameters:**
- `bid` (number): The bid amount
- `tricks` (number): Tricks taken
- `hands` (number): Hand/round number
- `baseScore` (number): Calculated base score
- `bonusScore` (number): Calculated bonus score

**Returns:** String with human-readable explanation of the score

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

### Example 1: Standard Non-Zero Bid (Exact)
```javascript
calculateRoundScore(5, 5, 1, 10)
// Result: baseScore=100, bonusScore=10, totalScore=110
// Explanation: Bid exactly 5 tricks, got 5 → (20 × 5) + 10 (player bonus) = +110
```

### Example 2: Missed Non-Zero Bid
```javascript
calculateRoundScore(5, 3, 1)
// Result: baseScore=-20, bonusScore=0, totalScore=-20
// Explanation: Bid 5 tricks, got 3 → -10 × |5-3| = -20 (no bonus on miss)
```

### Example 3: Exact Zero Bid
```javascript
calculateRoundScore(0, 0, 2)
// Result: baseScore=20, bonusScore=0, totalScore=20
// Explanation: Bid 0 on hand 2, took 0 tricks → 10 × 2 = +20 (no bonus on zero bids)
```

### Example 4: Missed Zero Bid
```javascript
calculateRoundScore(0, 1, 2)
// Result: baseScore=-20, bonusScore=0, totalScore=-20
// Explanation: Bid 0 on hand 2, took 1 trick → -10 × 2 = -20
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
