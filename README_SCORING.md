# Skull King Scoring Engine

## Overview
This document describes the Skull King scoring rules as implemented in `src/scoring.js`.

## Scoring Rules

### Non-Zero Bid Scoring

**Exact Bid (bid == tricks):**
- Base score: `+20 × tricks`
- Bonus: `+10 × hands` (only applied when bid is exact)
- Total: `(20 × tricks) + (10 × hands)`

**Example:** Bid 5, took 5 tricks, 1 hand = (20×5) + (10×1) = 110 points

**Missed Bid (bid ≠ tricks):**
- Score: `-10 × |bid - tricks|` (penalty based on difference)
- No bonus points applied

**Example:** Bid 5, took 3 tricks = -10 × |5-3| = -20 points

### Zero Bid Scoring

**Exact Zero Bid (bid == 0 AND tricks == 0):**
- Score: `+10 × hands`
- No bonus points (zero bids don't receive bonuses)

**Example:** Bid 0, took 0 tricks, 2 hands = 10 × 2 = 20 points

**Missed Zero Bid (bid == 0 AND tricks > 0):**
- Score: `-10 × hands` (fixed penalty based on hand count, regardless of tricks taken)
- No bonus points
- The penalty is calculated as `-10 × hands`, not `-10 × tricks`. For example, taking 1 trick or 3 tricks in the same hand both incur the same penalty if hands are equal.

**Example:** Bid 0, took 1 trick, 1 hand = -10 × 1 = -10 points
**Example:** Bid 0, took 3 tricks, 1 hand = -10 × 1 = -10 points (same penalty, as hands are equal)

## Key Rules

1. **Bonus points only apply to exact non-zero bids** - If you bid non-zero and meet it exactly, you get the +10×hands bonus
2. **Zero bids have no bonus** - Even if you bid 0 and take 0 tricks (exact), you only get the base +10×hands
3. **Missed bids have no bonus** - If you bid non-zero but don't meet it exactly, bonus is forfeited
4. **Score accumulates across rounds** - Total score is the sum of all round scores

## API

### calculateRoundScore(bid, tricks, hands)
Calculates the score for a single round.

**Parameters:**
- `bid` (number): The bid for this round (0 or greater)
- `tricks` (number): The tricks actually taken
- `hands` (number): The hand count for this round

**Returns:**
```javascript
{
  bid: number,
  tricks: number,
  hands: number,
  baseScore: number,
  bonusScore: number,
  totalScore: number,
  exact: boolean
}
```

**Example:**
```javascript
const result = calculateRoundScore(5, 5, 1);
// {
//   bid: 5,
//   tricks: 5,
//   hands: 1,
//   baseScore: 100,
//   bonusScore: 10,
//   totalScore: 110,
//   exact: true
// }
```

### calculateTotalScore(rounds)
Calculates the total score across multiple rounds.

**Parameters:**
- `rounds` (array): Array of round objects with {bid, tricks, hands}

**Returns:**
```javascript
{
  totalScore: number,
  rounds: array,
  roundCount: number
}
```

**Example:**
```javascript
const result = calculateTotalScore([
  { bid: 5, tricks: 5, hands: 1 },
  { bid: 3, tricks: 3, hands: 1 },
  { bid: 0, tricks: 0, hands: 1 }
]);
// {
//   totalScore: 190,
//   rounds: [...],
//   roundCount: 3
// }
```

### validateRoundScoring(round)
Validates that a round follows all Skull King rules.

**Parameters:**
- `round` (object): Round object with {bid, tricks, hands}

**Returns:**
```javascript
{
  valid: boolean,
  errors: array,
  warnings: array
}
```

## Test Coverage

The implementation includes comprehensive test coverage (40+ tests) verifying:

1. ✅ Non-zero bid exact scoring with bonus
2. ✅ Non-zero bid missed scoring without bonus
3. ✅ Zero bid exact scoring without bonus
4. ✅ Zero bid missed scoring
5. ✅ Bonus points only apply to exact non-zero bids
6. ✅ Score accumulation across multiple rounds
7. ✅ Transparent score breakdown per round
8. ✅ Input validation and error handling

## Implementation Details

- **Input Validation:** All functions validate inputs and throw errors for invalid data
- **Transparent Breakdown:** Score calculations show base score, bonus score, and total separately
- **Exact Tracking:** Each round's breakdown includes an `exact` flag indicating if bid was met
- **No Side Effects:** Functions are pure and don't modify input data
- **Clear Comments:** Code is well-commented for maintainability
