/**
 * Test suite for scoring.js
 * Tests all scoring calculations and edge cases
 */

// Import functions (for Node.js environment)
const { calculateRoundScore, calculateTotalScore } = typeof require !== 'undefined' ? require('./scoring.js') : {};

// Test helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Test suite
console.log('Running Scoring Tests...');

// ============================================================
// Test: calculateRoundScore - Non-zero bid, exact match
// ============================================================
console.log('\nTest 1: Non-zero bid, exact match');
let score = calculateRoundScore(3, 3, 5);
assert(score === 60, `Expected 60 (3 tricks × 20), got ${score}`);
console.log('✓ PASSED: Non-zero bid exact match gives +20 per trick');

// ============================================================
// Test: calculateRoundScore - Non-zero bid, under bid
// ============================================================
console.log('\nTest 2: Non-zero bid, under bid');
score = calculateRoundScore(5, 3, 5);
assert(score === -20, `Expected -20 (2 trick difference × -10), got ${score}`);
console.log('✓ PASSED: Non-zero bid under by 2 gives -20');

// ============================================================
// Test: calculateRoundScore - Non-zero bid, over bid
// ============================================================
console.log('\nTest 3: Non-zero bid, over bid');
score = calculateRoundScore(2, 4, 5);
assert(score === -20, `Expected -20 (2 trick difference × -10), got ${score}`);
console.log('✓ PASSED: Non-zero bid over by 2 gives -20');

// ============================================================
// Test: calculateRoundScore - Zero bid, exact (0 tricks)
// ============================================================
console.log('\nTest 4: Zero bid, exact match');
score = calculateRoundScore(0, 0, 3);
assert(score === 30, `Expected 30 (10 × 3 hand), got ${score}`);
console.log('✓ PASSED: Zero bid exact gives +10 × handNumber');

// ============================================================
// Test: calculateRoundScore - Zero bid, not exact (1 trick)
// ============================================================
console.log('\nTest 5: Zero bid, not exact');
score = calculateRoundScore(0, 1, 3);
assert(score === -30, `Expected -30 (-10 × 3 hand), got ${score}`);
console.log('✓ PASSED: Zero bid with 1 trick gives -10 × handNumber');

// ============================================================
// Test: calculateRoundScore - Zero bid, multiple tricks
// ============================================================
console.log('\nTest 6: Zero bid, multiple tricks');
score = calculateRoundScore(0, 5, 7);
assert(score === -70, `Expected -70 (-10 × 7 hand), got ${score}`);
console.log('✓ PASSED: Zero bid with multiple tricks gives -10 × handNumber');

// ============================================================
// Test: calculateRoundScore - Single trick bid
// ============================================================
console.log('\nTest 7: Single trick bid, exact');
score = calculateRoundScore(1, 1, 1);
assert(score === 20, `Expected 20, got ${score}`);
console.log('✓ PASSED: Single trick exact bid gives 20');

// ============================================================
// Test: calculateRoundScore - Hand number variations
// ============================================================
console.log('\nTest 8: Zero bid with hand number 1');
score = calculateRoundScore(0, 0, 1);
assert(score === 10, `Expected 10, got ${score}`);
console.log('✓ PASSED: Zero bid hand 1 gives 10');

console.log('\nTest 9: Zero bid with hand number 13');
score = calculateRoundScore(0, 0, 13);
assert(score === 130, `Expected 130, got ${score}`);
console.log('✓ PASSED: Zero bid hand 13 gives 130');

// ============================================================
// Test: calculateRoundScore - Edge case: off by 1
// ============================================================
console.log('\nTest 10: Non-zero bid off by 1');
score = calculateRoundScore(5, 4, 5);
assert(score === -10, `Expected -10, got ${score}`);
console.log('✓ PASSED: Off by 1 trick gives -10');

// ============================================================
// Test: calculateRoundScore - Error handling: negative bid
// ============================================================
console.log('\nTest 11: Error handling - negative bid');
try {
  calculateRoundScore(-1, 2, 5);
  throw new Error('Should have thrown an error for negative bid');
} catch (e) {
  assert(e.message === 'Bid cannot be negative', `Unexpected error: ${e.message}`);
  console.log('✓ PASSED: Negative bid throws appropriate error');
}

// ============================================================
// Test: calculateRoundScore - Error handling: negative tricks
// ============================================================
console.log('\nTest 12: Error handling - negative tricks');
try {
  calculateRoundScore(3, -1, 5);
  throw new Error('Should have thrown an error for negative tricks');
} catch (e) {
  assert(e.message === 'Tricks won cannot be negative', `Unexpected error: ${e.message}`);
  console.log('✓ PASSED: Negative tricks throws appropriate error');
}

// ============================================================
// Test: calculateRoundScore - Error handling: negative hand number
// ============================================================
console.log('\nTest 13: Error handling - negative hand number');
try {
  calculateRoundScore(3, 2, -1);
  throw new Error('Should have thrown an error for negative hand number');
} catch (e) {
  assert(e.message === 'Hand number must be positive', `Unexpected error: ${e.message}`);
  console.log('✓ PASSED: Negative hand number throws appropriate error');
}

// ============================================================
// Test: calculateRoundScore - Error handling: zero hand number
// ============================================================
console.log('\nTest 14: Error handling - zero hand number');
try {
  calculateRoundScore(3, 2, 0);
  throw new Error('Should have thrown an error for zero hand number');
} catch (e) {
  assert(e.message === 'Hand number must be positive', `Unexpected error: ${e.message}`);
  console.log('✓ PASSED: Zero hand number throws appropriate error');
}

// ============================================================
// Test: calculateRoundScore - Error handling: non-integer parameters
// ============================================================
console.log('\nTest 15: Error handling - non-integer parameters');
try {
  calculateRoundScore(3.5, 2, 5);
  throw new Error('Should have thrown an error for non-integer bid');
} catch (e) {
  assert(e.message === 'All parameters must be integers', `Unexpected error: ${e.message}`);
  console.log('✓ PASSED: Non-integer bid throws appropriate error');
}

// ============================================================
// Test: calculateTotalScore - Multiple scores
// ============================================================
console.log('\nTest 16: calculateTotalScore with multiple scores');
let total = calculateTotalScore([20, 30, -10, 40]);
assert(total === 80, `Expected 80, got ${total}`);
console.log('✓ PASSED: calculateTotalScore sums correctly');

// ============================================================
// Test: calculateTotalScore - Single score
// ============================================================
console.log('\nTest 17: calculateTotalScore with single score');
total = calculateTotalScore([50]);
assert(total === 50, `Expected 50, got ${total}`);
console.log('✓ PASSED: Single score sums to itself');

// ============================================================
// Test: calculateTotalScore - All negative scores
// ============================================================
console.log('\nTest 18: calculateTotalScore with negative scores');
total = calculateTotalScore([-10, -20, -30]);
assert(total === -60, `Expected -60, got ${total}`);
console.log('✓ PASSED: Negative scores sum correctly');

// ============================================================
// Test: calculateTotalScore - Empty array
// ============================================================
console.log('\nTest 19: calculateTotalScore with empty array');
total = calculateTotalScore([]);
assert(total === 0, `Expected 0, got ${total}`);
console.log('✓ PASSED: Empty array returns 0');

// ============================================================
// Test: calculateTotalScore - Error handling: not an array
// ============================================================
console.log('\nTest 20: Error handling - calculateTotalScore with non-array');
try {
  calculateTotalScore("not an array");
  throw new Error('Should have thrown an error for non-array input');
} catch (e) {
  assert(e.message === 'playerScores must be an array', `Unexpected error: ${e.message}`);
  console.log('✓ PASSED: Non-array input throws appropriate error');
}

// ============================================================
// Test: calculateTotalScore - Error handling: non-numeric element
// ============================================================
console.log('\nTest 21: Error handling - calculateTotalScore with non-numeric element');
try {
  calculateTotalScore([10, 20, "invalid"]);
  throw new Error('Should have thrown an error for non-numeric element');
} catch (e) {
  assert(e.message.includes('not a number'), `Unexpected error: ${e.message}`);
  console.log('✓ PASSED: Non-numeric element throws appropriate error');
}

// ============================================================
// Integration test: realistic game scenario
// ============================================================
console.log('\nTest 22: Integration test - realistic game scenario');
const roundScores = [
  calculateRoundScore(2, 2, 1),  // Exact: +40
  calculateRoundScore(1, 0, 2),  // Missed: -10
  calculateRoundScore(0, 0, 3),  // Zero exact: +30
  calculateRoundScore(3, 4, 4)   // Over by 1: -10
];
assert(roundScores[0] === 40, `Round 1 should be 40, got ${roundScores[0]}`);
assert(roundScores[1] === -10, `Round 2 should be -10, got ${roundScores[1]}`);
assert(roundScores[2] === 30, `Round 3 should be 30, got ${roundScores[2]}`);
assert(roundScores[3] === -10, `Round 4 should be -10, got ${roundScores[3]}`);

const gameTotal = calculateTotalScore(roundScores);
assert(gameTotal === 50, `Game total should be 50, got ${gameTotal}`);
console.log('✓ PASSED: Realistic game scenario calculates correctly');

console.log('\n' + '='.repeat(50));
console.log('ALL TESTS PASSED!');
console.log('='.repeat(50));
