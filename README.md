# Skull King Scoring Engine

A JavaScript implementation of complex Skull King card game scoring rules.

## Scoring Rules

### Non-Zero Bids
- **Exact bid**: Base score = 20 × tricks, plus bonus = 10 × hands
- **Missed bid**: Score = -10 × |bid - tricks| (no bonus)

### Zero Bids (Bid = 0)
- **Exact (0 tricks taken)**: +10 × hands
- **Missed (took any tricks)**: -10 × hands

### Bonus Points
Bonus points (10 × hands) are **only applied when the bid is exactly met**.

## API

### calculateScore(bid, tricks, hands)

Calculates the score for a single round.

**Parameters:**
- `bid` (number): Tricks bid by the player (0 or positive integer)
- `tricks` (number): Actual tricks taken (non-negative integer)
- `hands` (number): Number of hands/rounds played (positive integer)

**Returns:** Object with:
```javascript
{
  bid: number,
  tricks: number,
  hands: number,
  baseScore: number,
  bonusPoints: number,
  total: number,
  breakdown: {
    description: string,
    base: number,
    bonus: number,
    total: number
  }
}
```

### calculateTotalScore(rounds)

Calculates total score across multiple rounds.

**Parameters:**
- `rounds` (array): Array of round objects with `{bid, tricks, hands}`

**Returns:** Object with:
```javascript
{
  totalScore: number,
  rounds: array of score results,
  summary: {
    totalRounds: number,
    totalScore: number,
    roundBreakdown: array of round summaries
  }
}
```

## Examples

### Example 1: Exact Bid with Bonus
```javascript
const { calculateScore } = require('./src/scoring');

const result = calculateScore(4, 4, 1);
// bid: 4, tricks: 4, hands: 1
// baseScore: 80 (20 × 4)
// bonusPoints: 10 (10 × 1)
// total: 90
```

### Example 2: Exact Bid, More Hands
```javascript
const result = calculateScore(5, 5, 1);
// bid: 5, tricks: 5, hands: 1
// baseScore: 100 (20 × 5)
// bonusPoints: 10 (10 × 1)
// total: 110
```

### Example 3: Missed Bid (Under)
```javascript
const result = calculateScore(5, 3, 1);
// bid: 5, tricks: 3, hands: 1
// baseScore: -20 (-10 × 2 difference)
// bonusPoints: 0 (no bonus for missed bid)
// total: -20
```

### Example 4: Exact Zero Bid
```javascript
const result = calculateScore(0, 0, 1);
// bid: 0, tricks: 0, hands: 1
// baseScore: 10 (10 × 1)
// bonusPoints: 0
// total: 10
```

### Example 5: Failed Zero Bid
```javascript
const result = calculateScore(0, 2, 1);
// bid: 0, tricks: 2, hands: 1
// baseScore: -10 (-10 × 1)
// bonusPoints: 0
// total: -10
```

### Example 6: Multiple Rounds
```javascript
const { calculateTotalScore } = require('./src/scoring');

const result = calculateTotalScore([
  { bid: 4, tricks: 4, hands: 1 }, // 90
  { bid: 5, tricks: 3, hands: 1 }, // -20
  { bid: 0, tricks: 0, hands: 1 }  // 10
]);
// totalScore: 80
```

## Installation

```bash
npm install
```

## Testing

```bash
npm test
```

Tests verify all acceptance criteria:
1. Non-zero bid scoring (exact and missed)
2. Zero bid scoring (exact and failed)
3. Bonus points only on exact bids
4. Total score calculations
5. Score breakdown transparency
