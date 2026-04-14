/**
 * Test suite for scoring.js
 * Tests all scoring calculation functions
 */

// Import functions (works in Node.js with module.exports)
const { calculateRoundScore, calculateTotalScore } = typeof require !== 'undefined' ? require('./scoring') : window;

// Test helper
function assert(condition, message) {
  if (!condition) {
    console.error('❌ TEST FAILED:', message);
    throw new Error(message);
  }
  console.log('✓', message);
}

function testCalculateRoundScore() {
  console.log('\n=== Testing calculateRoundScore ===');
  
  // Non-zero bid tests - exact match
  assert(calculateRoundScore(3, 3, 1) === 60, 'Non-zero bid exact match (3 tricks): 20×3 = 60');
  assert(calculateRoundScore(1, 1, 1) === 20, 'Non-zero bid exact match (1 trick): 20×1 = 20');
  assert(calculateRoundScore(5, 5, 3) === 100, 'Non-zero bid exact match (5 tricks): 20×5 = 100');
  
  // Non-zero bid tests - not exact
  assert(calculateRoundScore(3, 2, 1) === -10, 'Non-zero bid off by 1: -10×1 = -10');
  assert(calculateRoundScore(3, 5, 1) === -20, 'Non-zero bid off by 2: -10×2 = -20');
  assert(calculateRoundScore(4, 1, 1) === -30, 'Non-zero bid off by 3: -10×3 = -30');
  assert(calculateRoundScore(2, 0, 1) === -20, 'Non-zero bid (2) vs 0 tricks: -10×2 = -20');
  
  // Zero bid tests - exact (no tricks)
  assert(calculateRoundScore(0, 0, 1) === 10, 'Zero bid exact at hand 1: 10×1 = 10');
  assert(calculateRoundScore(0, 0, 5) === 50, 'Zero bid exact at hand 5: 10×5 = 50');
  assert(calculateRoundScore(0, 0, 8) === 80, 'Zero bid exact at hand 8: 10×8 = 80');
  
  // Zero bid tests - not exact (took tricks)
  assert(calculateRoundScore(0, 1, 1) === -10, 'Zero bid took 1 trick at hand 1: -10×1 = -10');
  assert(calculateRoundScore(0, 3, 2) === -20, 'Zero bid took 3 tricks at hand 2: -10×2 = -20');
  assert(calculateRoundScore(0, 5, 4) === -40, 'Zero bid took 5 tricks at hand 4: -10×4 = -40');
  
  // Edge cases
  assert(calculateRoundScore(0, 0, 10) === 100, 'Zero bid at high hand number: 10×10 = 100');
  assert(calculateRoundScore(8, 8, 1) === 160, 'High non-zero bid exact match: 20×8 = 160');
}

function testCalculateTotalScore() {
  console.log('\n=== Testing calculateTotalScore ===');
  
  // Basic summation
  assert(calculateTotalScore([10, 20, 30]) === 60, 'Sum of [10, 20, 30] = 60');
  assert(calculateTotalScore([60, -10, 50]) === 100, 'Sum with negative: [60, -10, 50] = 100');
  
  // Single score
  assert(calculateTotalScore([50]) === 50, 'Single score: [50] = 50');
  
  // All zeros
  assert(calculateTotalScore([0, 0, 0]) === 0, 'All zeros: [0, 0, 0] = 0');
  
  // Negative scores
  assert(calculateTotalScore([-10, -20, -5]) === -35, 'All negative: [-10, -20, -5] = -35');
  
  // Mixed scores from actual game scenarios
  const gameScores = [
    calculateRoundScore(0, 0, 1),  // 10
    calculateRoundScore(1, 1, 2),  // 20
    calculateRoundScore(2, 1, 3),  // -10
    calculateRoundScore(0, 2, 4)   // -40
  ];
  assert(calculateTotalScore(gameScores) === -20, 'Mixed game scores sum correctly');
  
  // Empty array
  assert(calculateTotalScore([]) === 0, 'Empty array returns 0');
}

function testInputValidation() {
  console.log('\n=== Testing Input Validation ===');
  
  // calculateRoundScore validation
  try {
    calculateRoundScore('3', 3, 1);
    throw new Error('Should have thrown for non-number bid');
  } catch (e) {
    assert(e.message === 'All parameters must be numbers', 'Rejects non-number bid');
  }
  
  try {
    calculateRoundScore(3.5, 3, 1);
    throw new Error('Should have thrown for non-integer bid');
  } catch (e) {
    assert(e.message === 'All parameters must be integers', 'Rejects non-integer bid');
  }
  
  try {
    calculateRoundScore(-1, 3, 1);
    throw new Error('Should have thrown for negative bid');
  } catch (e) {
    assert(e.message === 'Bid cannot be negative', 'Rejects negative bid');
  }
  
  try {
    calculateRoundScore(3, -1, 1);
    throw new Error('Should have thrown for negative tricks won');
  } catch (e) {
    assert(e.message === 'Tricks won cannot be negative', 'Rejects negative tricks won');
  }
  
  try {
    calculateRoundScore(3, 3, 0);
    throw new Error('Should have thrown for hand number <= 0');
  } catch (e) {
    assert(e.message === 'Hand number must be positive', 'Rejects non-positive hand number');
  }
  
  try {
    calculateRoundScore(3, 3, -1);
    throw new Error('Should have thrown for negative hand number');
  } catch (e) {
    assert(e.message === 'Hand number must be positive', 'Rejects negative hand number');
  }
  
  // calculateTotalScore validation
  try {
    calculateTotalScore('not an array');
    throw new Error('Should have thrown for non-array');
  } catch (e) {
    assert(e.message === 'playerScores must be an array', 'Rejects non-array input');
  }
  
  try {
    calculateTotalScore([10, 'twenty', 30]);
    throw new Error('Should have thrown for non-number in array');
  } catch (e) {
    assert(e.message.includes('must be an integer'), 'Rejects non-number in array');
  }
  
  try {
    calculateTotalScore([10, 20.5, 30]);
    throw new Error('Should have thrown for non-integer in array');
  } catch (e) {
    assert(e.message.includes('must be an integer'), 'Rejects non-integer in array');
  }
}

// Run all tests
try {
  testCalculateRoundScore();
  testCalculateTotalScore();
  testInputValidation();
  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
}
