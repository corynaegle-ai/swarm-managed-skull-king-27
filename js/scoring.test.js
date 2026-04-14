/**
 * Test suite for js/scoring.js
 * Tests all scoring calculation functions with comprehensive coverage
 */

const { calculateRoundScore, calculateTotalScore } = require('./scoring.js');

// Test helper function
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function testCalculateRoundScore() {
  console.log('Testing calculateRoundScore()...');
  
  // Non-zero bid: exact match
  assert(calculateRoundScore(3, 3, 1) === 60, 'Non-zero bid (3/3): should be 20*3 = 60');
  assert(calculateRoundScore(5, 5, 2) === 100, 'Non-zero bid (5/5): should be 20*5 = 100');
  assert(calculateRoundScore(1, 1, 1) === 20, 'Non-zero bid (1/1): should be 20*1 = 20');
  
  // Non-zero bid: not exact (too many tricks)
  assert(calculateRoundScore(3, 5, 1) === -20, 'Non-zero bid (3/5): difference 2, should be -10*2 = -20');
  assert(calculateRoundScore(2, 4, 1) === -20, 'Non-zero bid (2/4): difference 2, should be -10*2 = -20');
  
  // Non-zero bid: not exact (too few tricks)
  assert(calculateRoundScore(5, 2, 1) === -30, 'Non-zero bid (5/2): difference 3, should be -10*3 = -30');
  assert(calculateRoundScore(4, 1, 1) === -30, 'Non-zero bid (4/1): difference 3, should be -10*3 = -30');
  
  // Zero bid: exact (0 tricks)
  assert(calculateRoundScore(0, 0, 1) === 10, 'Zero bid hand 1 (0/0): should be 10*1 = 10');
  assert(calculateRoundScore(0, 0, 3) === 30, 'Zero bid hand 3 (0/0): should be 10*3 = 30');
  assert(calculateRoundScore(0, 0, 5) === 50, 'Zero bid hand 5 (0/0): should be 10*5 = 50');
  
  // Zero bid: not exact (any tricks taken)
  assert(calculateRoundScore(0, 1, 1) === -10, 'Zero bid hand 1 (0/1): should be -10*1 = -10');
  assert(calculateRoundScore(0, 2, 2) === -20, 'Zero bid hand 2 (0/2): should be -10*2 = -20');
  assert(calculateRoundScore(0, 3, 3) === -30, 'Zero bid hand 3 (0/3): should be -10*3 = -30');
  
  // Edge case: 0 bid with 0 tricks on higher hands
  assert(calculateRoundScore(0, 0, 10) === 100, 'Zero bid hand 10 (0/0): should be 10*10 = 100');
  
  // Edge case: large bids
  assert(calculateRoundScore(13, 13, 1) === 260, 'Large bid (13/13): should be 20*13 = 260');
  
  console.log('✓ All calculateRoundScore() tests passed');
}

function testCalculateRoundScoreValidation() {
  console.log('Testing calculateRoundScore() validation...');
  
  // Invalid input types
  try {
    calculateRoundScore('3', 3, 1);
    throw new Error('Should throw on string bid');
  } catch (e) {
    assert(e.message.includes('must be numbers'), 'Should validate bid type');
  }
  
  try {
    calculateRoundScore(3, '3', 1);
    throw new Error('Should throw on string tricksWon');
  } catch (e) {
    assert(e.message.includes('must be numbers'), 'Should validate tricksWon type');
  }
  
  try {
    calculateRoundScore(3, 3, '1');
    throw new Error('Should throw on string handNumber');
  } catch (e) {
    assert(e.message.includes('must be numbers'), 'Should validate handNumber type');
  }
  
  // Non-integer inputs
  try {
    calculateRoundScore(3.5, 3, 1);
    throw new Error('Should throw on non-integer bid');
  } catch (e) {
    assert(e.message.includes('must be integers'), 'Should validate bid integer');
  }
  
  try {
    calculateRoundScore(3, 3.5, 1);
    throw new Error('Should throw on non-integer tricksWon');
  } catch (e) {
    assert(e.message.includes('must be integers'), 'Should validate tricksWon integer');
  }
  
  try {
    calculateRoundScore(3, 3, 1.5);
    throw new Error('Should throw on non-integer handNumber');
  } catch (e) {
    assert(e.message.includes('must be integers'), 'Should validate handNumber integer');
  }
  
  // Negative values
  try {
    calculateRoundScore(-1, 3, 1);
    throw new Error('Should throw on negative bid');
  } catch (e) {
    assert(e.message.includes('must be non-negative'), 'Should reject negative bid');
  }
  
  try {
    calculateRoundScore(3, -1, 1);
    throw new Error('Should throw on negative tricksWon');
  } catch (e) {
    assert(e.message.includes('must be non-negative'), 'Should reject negative tricksWon');
  }
  
  try {
    calculateRoundScore(3, 3, 0);
    throw new Error('Should throw on handNumber < 1');
  } catch (e) {
    assert(e.message.includes('at least 1'), 'Should reject handNumber < 1');
  }
  
  try {
    calculateRoundScore(3, 3, -1);
    throw new Error('Should throw on negative handNumber');
  } catch (e) {
    assert(e.message.includes('at least 1'), 'Should reject negative handNumber');
  }
  
  console.log('✓ All calculateRoundScore() validation tests passed');
}

function testCalculateTotalScore() {
  console.log('Testing calculateTotalScore()...');
  
  // Basic cases
  assert(calculateTotalScore([10, 20, 30]) === 60, 'Sum of [10, 20, 30] should be 60');
  assert(calculateTotalScore([0]) === 0, 'Sum of [0] should be 0');
  assert(calculateTotalScore([100]) === 100, 'Sum of [100] should be 100');
  assert(calculateTotalScore([]) === 0, 'Sum of empty array should be 0');
  
  // Negative scores
  assert(calculateTotalScore([-10, -20, 30]) === 0, 'Sum of [-10, -20, 30] should be 0');
  assert(calculateTotalScore([-10, -20, -30]) === -60, 'Sum of [-10, -20, -30] should be -60');
  
  // Mixed positive and negative
  assert(calculateTotalScore([50, -20, 10, -5, 15]) === 50, 'Mixed scores should sum correctly');
  
  // Large arrays
  const manyScores = Array(13).fill(20);
  assert(calculateTotalScore(manyScores) === 260, '13 rounds of 20 points each should be 260');
  
  // Single negative score
  assert(calculateTotalScore([-100]) === -100, 'Single negative score should work');
  
  console.log('✓ All calculateTotalScore() tests passed');
}

function testCalculateTotalScoreValidation() {
  console.log('Testing calculateTotalScore() validation...');
  
  // Non-array input
  try {
    calculateTotalScore('not an array');
    throw new Error('Should throw on string input');
  } catch (e) {
    assert(e.message.includes('must be an array'), 'Should validate input is array');
  }
  
  try {
    calculateTotalScore(42);
    throw new Error('Should throw on number input');
  } catch (e) {
    assert(e.message.includes('must be an array'), 'Should validate input is array');
  }
  
  try {
    calculateTotalScore(null);
    throw new Error('Should throw on null input');
  } catch (e) {
    assert(e.message.includes('must be an array'), 'Should validate input is array');
  }
  
  // Array with non-number elements
  try {
    calculateTotalScore([10, 'twenty', 30]);
    throw new Error('Should throw on non-number element');
  } catch (e) {
    assert(e.message.includes('All scores must be numbers'), 'Should validate all elements are numbers');
  }
  
  try {
    calculateTotalScore([10, null, 30]);
    throw new Error('Should throw on null element');
  } catch (e) {
    assert(e.message.includes('All scores must be numbers'), 'Should validate no null elements');
  }
  
  try {
    calculateTotalScore([10, undefined, 30]);
    throw new Error('Should throw on undefined element');
  } catch (e) {
    assert(e.message.includes('All scores must be numbers'), 'Should validate no undefined elements');
  }
  
  console.log('✓ All calculateTotalScore() validation tests passed');
}

function testIntegration() {
  console.log('Testing integration scenarios...');
  
  // Simulate a complete game round
  const roundScores = [];
  
  // Hand 1: bid 2, won 2 (exact)
  roundScores.push(calculateRoundScore(2, 2, 1));
  assert(roundScores[0] === 40, 'Hand 1 score should be 40');
  
  // Hand 2: bid 0, won 0 (exact)
  roundScores.push(calculateRoundScore(0, 0, 2));
  assert(roundScores[1] === 20, 'Hand 2 score should be 20');
  
  // Hand 3: bid 3, won 2 (missed 1 trick)
  roundScores.push(calculateRoundScore(3, 2, 3));
  assert(roundScores[2] === -10, 'Hand 3 score should be -10');
  
  // Hand 4: bid 0, won 1 (failed zero bid)
  roundScores.push(calculateRoundScore(0, 1, 4));
  assert(roundScores[3] === -40, 'Hand 4 score should be -40');
  
  // Calculate total
  const totalScore = calculateTotalScore(roundScores);
  assert(totalScore === 10, 'Total score should be 40 + 20 - 10 - 40 = 10');
  
  console.log('✓ All integration tests passed');
}

// Run all tests
try {
  testCalculateRoundScore();
  testCalculateRoundScoreValidation();
  testCalculateTotalScore();
  testCalculateTotalScoreValidation();
  testIntegration();
  console.log('\n✅ ALL TESTS PASSED');
} catch (e) {
  console.error('\n❌ TEST FAILED:', e.message);
  process.exit(1);
}
