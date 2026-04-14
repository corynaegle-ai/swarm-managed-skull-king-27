# Skull King Scoring Engine Documentation

## Overview

The Skull King Scoring Engine implements the complex scoring rules for the Skull King card game. It provides accurate score calculation for both individual rounds and complete games.

## Scoring Rules

### Non-Zero Bid Scoring

When a player bids a number greater than zero:

- **Exact Bid**: +20 points per trick taken, plus automatic bonus of +10 × hand count
- **Missed Bid**: -10 points per difference between bid and tricks taken, no bonus

**Examples:**
- Bid 5, took 5 tricks (1 hand): 20 × 5 + 10 × 1 = 100 + 10 = **110 points**
- Bid 5, took 3 tricks (1 hand): -10 × 2 = **-20 points** (no bonus)
- Bid 3, took 3 tricks (2 hands): 20 × 3 + 10 × 2 = 60 + 20 = **80 points**

### Zero Bid Scoring

When a player bids zero (attempting to take no tricks):

- **Exact Bid** (0 tricks taken): +10 × hand count
- **Missed Bid** (any tricks taken): -10 × hand count
- **Important**: Zero bids never receive bonus points, even if exact

**Examples:**
- Bid 0, took 0 tricks (1 hand): +10 × 1 = **10 points**
- Bid 0, took 0 tricks (3 hands): +10 × 3 = **30 points**
- Bid 0, took 1 trick (1 hand): -10 × 1 = **-10 points**
- Bid 0, took 2 tricks (2 hands): -10 × 2 = **-20 points**

### Bonus Points

- **When Applied**: ONLY when a non-zero bid is exactly met
- **Amount**: 10 × number of hands in the current game
- **Zero Bids**: Never receive bonus points
- **Missed Non-Zero Bids**: Do not receive bonus points

## API Reference

### calculateRoundScore(bid, tricks, hands)

Calculates the score for a single round.

**Parameters:**
- `bid` (number): The number of tricks bid (0 or positive integer)
- `tricks` (number): The number of tricks actually taken (0 or positive integer)
- `hands` (number): The number of hands/rounds in the game (positive integer)

**Returns:** Object with:
- `baseScore` (number): Score before bonus
- `bonus` (number): Bonus points (0 if not applicable)
- `totalScore` (number): Final score (baseScore + bonus)
- `breakdown` (object): Detailed scoring breakdown including:
  - `bid`: The bid value
  - `tricks`: Tricks taken
  - `hands`: Hand count
  - `rule`: Scoring rule applied
  - `formula`: Mathematical formula used
  - `bonus`: Bonus description
  - `calculation`: Complete calculation shown

**Example:**
```javascript
const result = calculateRoundScore(5, 5, 1);
// Returns:
// {
//   baseScore: 100,
//   bonus: 10,
//   totalScore: 110,
//   breakdown: {
//     bid: 5,
//     tricks: 5,
//     hands: 1,
//     rule: 'Non-zero bid - exact',
//     formula: '+20 × 5',
//     bonus: '+10 × 1 (automatic for exact bid)',
//     calculation: '100 + 10 = 110'
//   }
// }
```

### calculateTotalScore(rounds)

Calculates cumulative score across multiple rounds.

**Parameters:**
- `rounds` (array): Array of round objects, each containing:
  - `bid` (number): The bid for that round
  - `tricks` (number): Tricks taken that round
  - `hands` (number): Hand count for that round

**Returns:** Object with:
- `totalScore` (number): Sum of all round scores
- `rounds` (array): Array of round breakdowns with details and individual round totals

**Example:**
```javascript
const result = calculateTotalScore([
  { bid: 5, tricks: 5, hands: 1 },  // 110 points
  { bid: 3, tricks: 3, hands: 1 },  // 70 points
  { bid: 0, tricks: 0, hands: 1 }   // 10 points
]);
// Returns: { totalScore: 190, rounds: [...] }
```

### validateRoundScoring(bid, tricks, hands, expectedScore)

Validates that a round scores correctly.

**Parameters:**
- `bid`, `tricks`, `hands`: Same as calculateRoundScore
- `expectedScore` (number): The score expected

**Returns:** Boolean - true if calculated score matches expected

**Example:**
```javascript
const isCorrect = validateRoundScoring(5, 5, 1, 110);
// Returns: true
```

## Implementation Details

### Key Decisions

1. **Bonus Automation**: Bonus points are automatically calculated and applied when the criteria are met. The function signature is simple (3 parameters for round score) without requiring bonus as a separate player-entered parameter.

2. **Zero Bid Rules**: Zero bids follow a distinct scoring path with no bonus application, simplifying the logic and preventing confusion.

3. **Transparency**: Every score calculation includes a detailed breakdown showing the rule applied, formula used, and complete calculation, enabling easy verification and debugging.

4. **Input Validation**: All parameters are validated before calculation to prevent invalid scores.

## Testing

The implementation includes comprehensive test coverage:

- **40+ test cases** covering all scoring scenarios
- **Edge cases**: High hand counts, boundary conditions, empty game rounds
- **Input validation**: Tests for invalid bids, tricks, and hands
- **Breakdown verification**: Tests that score breakdowns are accurate and transparent
- **Acceptance criteria coverage**: Each criterion is explicitly tested

## Error Handling

The scoring engine throws descriptive errors for invalid inputs:

```javascript
try {
  calculateRoundScore(-1, 0, 1);
} catch (e) {
  // Error: Invalid bid: -1. Bid must be a non-negative integer.
}
```
