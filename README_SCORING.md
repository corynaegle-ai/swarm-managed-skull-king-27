# Skull King Scoring Engine Documentation

This document describes the complete Skull King scoring rules as implemented in the scoring engine.

## Overview

The Skull King scoring system rewards accurate bidding and penalizes incorrect estimates. There are two distinct scoring paths: **non-zero bids** and **zero bids**, each with their own calculation method.

## Scoring Rules

### Non-Zero Bids

When a player bids 1 or more tricks:

#### Exact Bid (won exactly as many tricks as bid)
- **Base Score**: +20 points per trick won
  - Example: Bid 5, won 5 tricks = 5 × 20 = +100 points
- **Bonus Score**: +10 points per hand (round number)
  - Example: Hand 3 = +30 bonus points
- **Total**: 100 + 30 = +130 points

#### Missed Bid (won fewer or more tricks than bid)
- **Base Score**: -10 points per trick difference
  - Example: Bid 5, won 3 tricks = |5-3| = 2 × -10 = -20 points
- **Bonus Score**: No bonus
- **Total**: -20 points

### Zero Bids

When a player bids 0 tricks:

#### Exact Zero Bid (won 0 tricks)
- **Score**: +10 points per hand (round number)
  - Example: Hand 2 = 2 × 10 = +20 points
- **No penalty, no bonus structure** (score is the hand multiplier)

#### Failed Zero Bid (won any tricks when bid 0)
- **Score**: -10 points per hand (round number)
  - Example: Hand 2, won 1+ tricks = -20 points
- **Note**: Score is negative regardless of how many tricks were taken

## Key Rules

1. **Bonus Points are ONLY applied for non-zero exact bids**
   - Zero bids never have a bonus component
   - Missed non-zero bids never have a bonus
   - Only perfect bids (bid == tricks) for non-zero amounts get +10×hands

2. **Hand Number Multiplier Effect**
   - Earlier rounds (hands 1-5) have lower multipliers
   - Later rounds (hands 10-13) have much higher multipliers
   - This increases the stakes and scoring swing as the game progresses

3. **Bid-Trick Matching**
   - Exact match: winning exactly as many tricks as the bid
   - Any mismatch (over or under): triggers the -10×difference penalty

## Examples

### Non-Zero Bid Examples

**Example 1: Exact Bid (3 tricks bid, 3 tricks won, Hand 1)**
- Base: 3 × 20 = +60 points
- Bonus: 1 × 10 = +10 points
- **Total: +70 points**

**Example 2: Missed Bid - Under (5 tricks bid, 2 tricks won, Hand 3)**
- Difference: |5 - 2| = 3
- Base: 3 × -10 = -30 points
- Bonus: None
- **Total: -30 points**

**Example 3: Missed Bid - Over (2 tricks bid, 5 tricks won, Hand 2)**
- Difference: |2 - 5| = 3
- Base: 3 × -10 = -30 points
- Bonus: None
- **Total: -30 points**

**Example 4: High Exact Bid (10 tricks bid, 10 tricks won, Hand 5)**
- Base: 10 × 20 = +200 points
- Bonus: 5 × 10 = +50 points
- **Total: +250 points**

### Zero Bid Examples

**Example 1: Perfect Zero (0 tricks bid, 0 tricks won, Hand 1)**
- Score: 1 × 10 = +10 points
- **Total: +10 points**

**Example 2: Perfect Zero (0 tricks bid, 0 tricks won, Hand 5)**
- Score: 5 × 10 = +50 points
- **Total: +50 points**

**Example 3: Failed Zero (0 tricks bid, 3 tricks won, Hand 2)**
- Score: 2 × -10 = -20 points
- **Total: -20 points**
- Note: Takes -20 regardless of exactly how many tricks were won (3, 5, etc.)

**Example 4: Failed Zero (0 tricks bid, 1 trick won, Hand 10)**
- Score: 10 × -10 = -100 points
- **Total: -100 points**

## API Reference

### calculateRoundScore(bid, tricks, hands)

Calculates the score for a single round.

**Parameters:**
- `bid` (number): The number of tricks bid (0 or positive)
- `tricks` (number): The number of tricks actually won
- `hands` (number): The hand/round number (1-13 typically)

**Returns:** Object with structure:
```javascript
{
  bid,              // Input bid
  tricks,           // Input tricks
  hands,            // Input hands
  baseScore,        // Score from main calculation
  bonusScore,       // Bonus points (0 if not applicable)
  totalScore,       // baseScore + bonusScore
  isExact,          // Boolean: true if bid === tricks
  breakdown: {
    bid,
    tricks,
    hands,
    baseScore,
    bonusScore,
    totalScore,
    type,             // 'zero-bid' or 'non-zero-bid'
    message           // Human-readable description
  }
}
```

**Examples:**
```javascript
const score = calculateRoundScore(5, 5, 2);
// Returns: {
//   baseScore: 100,      (5 × 20)
//   bonusScore: 20,      (2 × 10)
//   totalScore: 120,
//   isExact: true,
//   breakdown: { ... message: "Exact! Bid 5 and won 5 tricks..." }
// }

const score = calculateRoundScore(0, 0, 3);
// Returns: {
//   baseScore: 30,       (3 × 10)
//   bonusScore: 0,
//   totalScore: 30,
//   isExact: true,
//   breakdown: { ... message: "Perfect! Won 0 tricks as bid..." }
// }
```

### calculateTotalScore(rounds)

Calculates the cumulative score across multiple rounds.

**Parameters:**
- `rounds` (Array): Array of round objects with structure `{ bid, tricks, hands }`

**Returns:** Object with structure:
```javascript
{
  totalScore,      // Sum of all round scores
  rounds: [        // Array of round score objects
    { bid, tricks, hands, baseScore, bonusScore, totalScore, ... }
  ],
  breakdown: {
    totalScore,
    roundCount,
    roundScores: [10, 120, -20, ...],  // Score for each round
    details: [ { bid, tricks, message, ... }, ... ]  // Detailed info per round
  }
}
```

**Example:**
```javascript
const result = calculateTotalScore([
  { bid: 5, tricks: 5, hands: 1 },   // +110
  { bid: 0, tricks: 0, hands: 2 },   // +20
  { bid: 3, tricks: 2, hands: 3 }    // -10
]);
// Returns: {
//   totalScore: 120,
//   rounds: [ ... ],
//   breakdown: { ... }
// }
```

### validateRoundScoring(bid, tricks)

Validates input values before scoring.

**Parameters:**
- `bid` (number): The bid amount
- `tricks` (number): The tricks won

**Returns:** Object with structure:
```javascript
{
  isValid: boolean,
  errors: [string],      // Fatal validation errors
  warnings: [string]     // Non-fatal warnings
}
```

## Implementation Notes

1. **Transparency**: All calculations break down into base score, bonus score, and total, making it easy to understand how points were awarded or deducted.

2. **Consistency**: The same input always produces the same output. The calculation is deterministic and stateless.

3. **Error Handling**: The engine validates inputs and throws clear errors for invalid bids, tricks, or hands values.

4. **Message Generation**: Human-readable messages explain each score calculation, suitable for displaying to players in the UI.

## Testing

The implementation includes comprehensive test coverage (40+ unit tests) that verify:
- ✓ All non-zero bid scoring scenarios (exact and missed)
- ✓ All zero bid scoring scenarios (exact and failed)
- ✓ Bonus point application rules
- ✓ Total score accumulation across rounds
- ✓ Score breakdown structure and transparency
- ✓ Edge cases and boundary conditions
- ✓ Error handling and validation
- ✓ Consistency across multiple calls

Run tests with:
```bash
node src/scoring.test.js
```

All tests should pass with 100% pass rate.
