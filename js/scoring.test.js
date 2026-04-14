/**
 * Test suite for scoring.js
 * Tests calculateRoundScore() and calculateTotalScore() functions
 */

const { calculateRoundScore, calculateTotalScore } = require('./scoring.js');

// Test suite for calculateRoundScore - Non-zero bids
function testNonZeroBidScoring() {
  console.log('Testing non-zero bid scoring...');
  
  // Exact match: +20 per trick
  console.assert(calculateRoundScore(1, 1, 1) === 20, 'Bid 1, Won 1, Hand 1: should be 20');
  console.assert(calculateRoundScore(3, 3, 5) === 60, 'Bid 3, Won 3, Hand 5: should be 60');
  console.assert(calculateRoundScore(7, 7, 10) === 140, 'Bid 7, Won 7, Hand 10: should be 140');
  
  // One trick difference: -10
  console.assert(calculateRoundScore(1, 0, 1) === -10, 'Bid 1, Won 0, Hand 1: should be -10');
  console.assert(calculateRoundScore(1, 2, 1) === -10, 'Bid 1, Won 2, Hand 1: should be -10');
  
  // Multiple tricks difference: -10 per difference
  console.assert(calculateRoundScore(5, 2, 3) === -30, 'Bid 5, Won 2, Hand 3: -10 * 3 = -30');
  console.assert(calculateRoundScore(3, 7, 2) === -40, 'Bid 3, Won 7, Hand 2: -10 * 4 = -40');
  
  console.log('✓ Non-zero bid scoring tests passed');
}

// Test suite for calculateRoundScore - Zero bids
function testZeroBidScoring() {
  console.log('Testing zero bid scoring...');
  
  // Zero bid, zero tricks: +10×handNumber
  console.assert(calculateRoundScore(0, 0, 1) === 10, 'Bid 0, Won 0, Hand 1: should be +10');
  console.assert(calculateRoundScore(0, 0, 3) === 30, 'Bid 0, Won 0, Hand 3: should be +30');
  console.assert(calculateRoundScore(0, 0, 10) === 100, 'Bid 0, Won 0, Hand 10: should be +100');
  
  // Zero bid, any tricks: -10×handNumber
  console.assert(calculateRoundScore(0, 1, 1) === -10, 'Bid 0, Won 1, Hand 1: should be -10');
  console.assert(calculateRoundScore(0, 2, 3) === -30, 'Bid 0, Won 2, Hand 3: should be -30');
  console.assert(calculateRoundScore(0, 5, 7) === -70, 'Bid 0, Won 5, Hand 7: should be -70');
  
  console.log('✓ Zero bid scoring tests passed');
}

// Test suite for calculateRoundScore - Edge cases
function testEdgeCases() {
  console.log('Testing edge cases...');
  
  // Large bid values
  console.assert(calculateRoundScore(13, 13, 1) === 260, 'Bid 13, Won 13: should be 260');
  console.assert(calculateRoundScore(13, 5, 1) === -80, 'Bid 13, Won 5: should be -80');
  
  // High hand numbers
  console.assert(calculateRoundScore(0, 0, 100) === 1000, 'Zero bid, hand 100: should be 1000');
  console.assert(calculateRoundScore(0, 1, 100) === -1000, 'Zero bid with trick, hand 100: should be -1000');
  
  console.log('✓ Edge case tests passed');
}

// Test suite for calculateRoundScore - Input validation
function testInputValidation() {
  console.log('Testing input validation...');
  
  // Invalid types
  try {
    calculateRoundScore('1', 1, 1);
    console.assert(false, 'Should throw error for string bid');
  } catch (e) {
    console.assert(e.message === 'All parameters must be numbers', 'Correct error for string bid');
  }
  
  try {
    calculateRoundScore(1, null, 1);
    console.assert(false, 'Should throw error for null tricksWon');
  } catch (e) {
    console.assert(e.message === 'All parameters must be numbers', 'Correct error for null tricksWon');
  }
  
  // Non-integer values
  try {
    calculateRoundScore(1.5, 1, 1);
    console.assert(false, 'Should throw error for float bid');
  } catch (e) {
    console.assert(e.message === 'All parameters must be integers', 'Correct error for float bid');
  }
  
  // Negative values
  try {
    calculateRoundScore(-1, 1, 1);
    console.assert(false, 'Should throw error for negative bid');
  } catch (e) {
    console.assert(e.message === 'Bid and tricksWon must be non-negative, handNumber must be positive', 'Correct error for negative bid');
  }
  
  try {
    calculateRoundScore(1, -1, 1);
    console.assert(false, 'Should throw error for negative tricksWon');
  } catch (e) {
    console.assert(e.message === 'Bid and tricksWon must be non-negative, handNumber must be positive', 'Correct error for negative tricksWon');
  }
  
  // Zero or negative hand number
  try {
    calculateRoundScore(1, 1, 0);
    console.assert(false, 'Should throw error for zero handNumber');
  } catch (e) {
    console.assert(e.message === 'Bid and tricksWon must be non-negative, handNumber must be positive', 'Correct error for zero handNumber');
  }
  
  try {
    calculateRoundScore(1, 1, -5);
    console.assert(false, 'Should throw error for negative handNumber');
  } catch (e) {
    console.assert(e.message === 'Bid and tricksWon must be non-negative, handNumber must be positive', 'Correct error for negative handNumber');
  }
  
  console.log('✓ Input validation tests passed');
}

// Test suite for calculateTotalScore
function testCalculateTotalScore() {
  console.log('Testing calculateTotalScore()...');
  
  // Simple sum
  console.assert(calculateTotalScore([10, 20, 30]) === 60, 'Sum of [10, 20, 30] should be 60');
  
  // With negative scores
  console.assert(calculateTotalScore([20, -10, 30, -15]) === 25, 'Sum of [20, -10, 30, -15] should be 25');
  
  // Empty array
  console.assert(calculateTotalScore([]) === 0, 'Empty array should sum to 0');
  
  // Single element
  console.assert(calculateTotalScore([100]) === 100, 'Single element [100] should sum to 100');
  
  // All zeros
  console.assert(calculateTotalScore([0, 0, 0]) === 0, 'Array of zeros should sum to 0');
  
  // Large numbers
  console.assert(calculateTotalScore([1000, 2000, -500]) === 2500, 'Large numbers should sum correctly');
  
  console.log('✓ calculateTotalScore() tests passed');
}

// Test suite for calculateTotalScore - Input validation
function testCalculateTotalScoreValidation() {
  console.log('Testing calculateTotalScore() input validation...');
  
  // Not an array
  try {
    calculateTotalScore('not an array');
    console.assert(false, 'Should throw error for non-array input');
  } catch (e) {
    console.assert(e.message === 'playerScores must be an array', 'Correct error for non-array');
  }
  
  // Contains non-number
  try {
    calculateTotalScore([10, 'twenty', 30]);
    console.assert(false, 'Should throw error for non-number element');
  } catch (e) {
    console.assert(e.message.includes('is not a number'), 'Correct error for non-number element');
  }
  
  // Contains non-finite number
  try {
    calculateTotalScore([10, Infinity, 30]);
    console.assert(false, 'Should throw error for Infinity');
  } catch (e) {
    console.assert(e.message.includes('is not a finite number'), 'Correct error for Infinity');
  }
  
  try {
    calculateTotalScore([10, NaN, 30]);
    console.assert(false, 'Should throw error for NaN');
  } catch (e) {
    console.assert(e.message.includes('is not a finite number'), 'Correct error for NaN');
  }
  
  console.log('✓ calculateTotalScore() validation tests passed');
}

// Run all tests
console.log('\n=== Running Scoring Tests ===\n');
testNonZeroBidScoring();
testZeroBidScoring();
testEdgeCases();
testInputValidation();
testCalculateTotalScore();
testCalculateTotalScoreValidation();
console.log('\n=== All Tests Passed ===\n');