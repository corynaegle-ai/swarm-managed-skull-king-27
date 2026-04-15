# Skull King Game Scoring System

## Project Overview
A comprehensive scoring engine for the Skull King card game, implementing complex scoring rules with full transparency and validation.

## Features

✅ **Accurate Scoring** - Implements all Skull King scoring rules correctly
✅ **Transparent Breakdown** - Shows base score, bonus, and totals for each round
✅ **Validation** - Validates round data against game rules
✅ **Error Handling** - Comprehensive error handling with clear messages
✅ **Well Tested** - 40+ unit tests covering all scoring scenarios
✅ **Production Ready** - Clean, documented, maintainable code

## Quick Start

### Installation
```bash
npm install
```

### Usage

```javascript
const { calculateRoundScore, calculateTotalScore } = require('./src/scoring');

// Calculate score for a single round
const round1 = calculateRoundScore(5, 5, 1);
console.log(round1.totalScore); // 110 (20×5 base + 10×1 bonus)

// Calculate total across multiple rounds
const gameScore = calculateTotalScore([
  { bid: 5, tricks: 5, hands: 1 },
  { bid: 3, tricks: 3, hands: 1 },
  { bid: 0, tricks: 0, hands: 1 }
]);
console.log(gameScore.totalScore); // 190
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Scoring Rules

See [README_SCORING.md](./README_SCORING.md) for complete scoring rules documentation.

### Quick Reference

**Non-Zero Bids:**
- Exact: `+20 × bid + 10 × hands` (when bid == tricks)
- Missed: `-10 × |bid - tricks|` (when bid != tricks)

**Zero Bids:**
- Exact (0 tricks): `+10 × hands`
- Missed (any tricks): `-10 × hands`

**Key Rule:** Bonus points (+10 × hands) only apply when a non-zero bid is met exactly.

## API Reference

### calculateRoundScore(bid, tricks, hands)
Calculates score for a single round.

**Returns:** `{bid, tricks, hands, baseScore, bonusScore, totalScore, exact}`

### calculateTotalScore(rounds)
Calculates cumulative score across rounds.

**Returns:** `{totalScore, rounds[], roundCount}`

### validateRoundScoring(round)
Validates a round against game rules.

**Returns:** `{valid, errors[], warnings[]}`

## Project Structure

```
.
├── src/
│   ├── scoring.js           # Main scoring engine
│   └── scoring.test.js      # Comprehensive test suite (40+ tests)
├── README.md                # This file
├── README_SCORING.md        # Detailed scoring rules
└── package.json             # Project dependencies
```

## Examples

### Example 1: Perfect Round
```javascript
const result = calculateRoundScore(4, 4, 1);
// bid: 4, tricks: 4 (exact match)
// Base: 20 × 4 = 80
// Bonus: 10 × 1 = 10 (applied because bid was exact)
// Total: 90
```

### Example 2: Missed Bid
```javascript
const result = calculateRoundScore(5, 3, 1);
// bid: 5, tricks: 3
// Penalty: -10 × |5-3| = -20
// Total: -20
```

### Example 3: Zero Bid Made
```javascript
const result = calculateRoundScore(0, 0, 2);
// bid: 0, tricks: 0
// Score: 10 × 2 = 20
// Total: 20
```

### Example 4: Zero Bid Broken
```javascript
const result = calculateRoundScore(0, 1, 1);
// bid: 0, tricks: 1
// Penalty: -10 × 1 = -10
// Total: -10
```

### Example 5: Full Game
```javascript
const gameRounds = [
  { bid: 5, tricks: 5, hands: 1 }, // Exact: 20×5 + 10×1 = 110
  { bid: 3, tricks: 3, hands: 1 }, // Exact: 20×3 + 10×1 = 70
  { bid: 0, tricks: 0, hands: 1 }  // Exact: 10×1 = 10
];

const game = calculateTotalScore(gameRounds);
console.log(game.totalScore); // 190 (110 + 70 + 10)
```

## Acceptance Criteria Status

✅ **AC1** - Correctly calculates non-zero bid scores
✅ **AC2** - Correctly calculates zero bid scores  
✅ **AC3** - Only applies bonus points when bid is exactly met
✅ **AC4** - Updates total scores correctly
✅ **AC5** - Shows score breakdown for transparency

## Development

All code follows modern JavaScript best practices with:
- Clear function naming and documentation
- Comprehensive error handling
- Input validation
- Full test coverage
- No external dependencies for core logic

## License
MIT
