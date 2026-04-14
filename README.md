# Skull King Game Implementation

## Project Overview

This is a JavaScript implementation of the Skull King card game, including a sophisticated scoring engine that handles the complex rules of the game.

## Scoring Engine

The Skull King Scoring Engine calculates game scores according to official game rules. See [README_SCORING.md](./README_SCORING.md) for detailed scoring documentation.

### Quick Start

```javascript
const { calculateRoundScore, calculateTotalScore } = require('./src/scoring');

// Calculate score for a single round
const round = calculateRoundScore(5, 5, 1);
console.log(round.totalScore); // 110

// Calculate total score across multiple rounds
const game = calculateTotalScore([
  { bid: 5, tricks: 5, hands: 1 },
  { bid: 3, tricks: 3, hands: 1 },
  { bid: 0, tricks: 0, hands: 1 }
]);
console.log(game.totalScore); // 190
```

### Scoring Rules Summary

**Non-Zero Bids:**
- Exact: +20 × tricks + 10 × hands (automatic bonus)
- Missed: -10 × difference from bid

**Zero Bids:**
- Exact (0 tricks): +10 × hands
- Missed (any tricks): -10 × hands
- Never receive bonus points

## Running Tests

```bash
npm test
```

Runs 40+ test cases covering all scoring scenarios, edge cases, and acceptance criteria.

## Project Structure

```
.
├── src/
│   ├── scoring.js          # Main scoring engine
│   └── scoring.test.js     # Test suite (40+ tests)
├── README.md               # This file
├── README_SCORING.md       # Detailed scoring documentation
└── package.json
```

## Implementation Notes

### Scoring Engine Design

The scoring engine is designed with the following principles:

1. **Correctness**: Implements all official Skull King scoring rules accurately
2. **Transparency**: Every score includes a detailed breakdown showing the calculation
3. **Validation**: All inputs are validated to prevent scoring errors
4. **Maintainability**: Clear code structure with comprehensive documentation

### Acceptance Criteria

All acceptance criteria are satisfied:

1. ✅ **Non-zero bid scoring**: Correctly calculates 20 × tricks for exact bids and -10 × difference for missed bids
2. ✅ **Zero bid scoring**: Correctly calculates ±10 × hands based on whether exact or missed
3. ✅ **Bonus application**: Automatically applies 10 × hands bonus ONLY when non-zero bid is exactly met
4. ✅ **Total score updates**: Accurately sums scores across multiple rounds
5. ✅ **Score transparency**: Provides detailed breakdown for every score calculation

## Testing

The test suite includes:

- **Non-Zero Bid Tests**: 7 tests covering exact and missed bids with various parameters
- **Zero Bid Tests**: 7 tests covering exact and missed zero bids
- **Bonus Tests**: 3 tests verifying bonus application rules
- **Total Score Tests**: 4 tests for multi-round calculations
- **Transparency Tests**: 5 tests verifying breakdown details
- **Validation Tests**: 6 tests for input validation
- **Edge Cases**: 4 tests for boundary conditions
- **Validation Function**: 4 tests for the validateRoundScoring function

**Total: 40+ tests, all passing**

## API Documentation

For detailed API documentation, see [README_SCORING.md](./README_SCORING.md).

### Main Functions

#### `calculateRoundScore(bid, tricks, hands)`
Calculates the score for a single round with full breakdown.

#### `calculateTotalScore(rounds)`
Calculates cumulative score across multiple rounds.

#### `validateRoundScoring(bid, tricks, hands, expectedScore)`
Verifies that a round calculates to the expected score.

## Version

Implementation: 1.0.0
- Supports games with 1-13 hands
- Handles all standard Skull King scoring scenarios
