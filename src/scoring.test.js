/**
 * Test suite for Skull King Scoring Engine
 * Verifies all acceptance criteria and edge cases
 */

const {
  calculateRoundScore,
  calculateTotalScore,
  validateRoundScoring,
  getScoreMessage
} = require('./scoring');

// Test counters
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

/**
 * Assert helper function
 */
function assert(condition, message) {
  testsRun++;
  if (condition) {
    testsPassed++;
  } else {
    testsFailed++;
    console.error(`FAIL: ${message}`);
  }
}

/**
 * Assert equality helper
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    assert(false, `${message} - Expected: ${expected}, Got: ${actual}`);
  } else {
    assert(true, message);
  }
}

// ============================================================================
// AC1: Correctly calculates non-zero bid scores (20 × tricks if exact, -10 × difference if not)
// ============================================================================

console.log('\n=== AC1: Non-zero Bid Scoring ===');

// Test exact non-zero bid
let score = calculateRoundScore(5, 5, 1);
assertEqual(score.baseScore, 20 * 5, 'AC1.1: Exact bid (5/5) should give 20 × 5 = 100 points');
assertEqual(score.totalScore, 100 + 10, 'AC1.1: Exact bid with bonus should be 100 + 10 = 110');
assertEqual(score.isExact, true, 'AC1.1: isExact flag should be true');

// Test exact bid with different amounts
score = calculateRoundScore(3, 3, 1);
assertEqual(score.baseScore, 20 * 3, 'AC1.2: Exact bid (3/3) should give 20 × 3 = 60 points');
assertEqual(score.totalScore, 60 + 10, 'AC1.2: Exact bid with bonus should be 60 + 10 = 70');

score = calculateRoundScore(10, 10, 1);
assertEqual(score.baseScore, 20 * 10, 'AC1.3: Exact bid (10/10) should give 20 × 10 = 200 points');
assertEqual(score.totalScore, 200 + 10, 'AC1.3: Exact bid with bonus should be 200 + 10 = 210');

// Test missed bids (under)
score = calculateRoundScore(5, 3, 1);
assertEqual(score.baseScore, -10 * 2, 'AC1.4: Missed bid (5/3) should give -10 × 2 = -20 points');
assertEqual(score.bonusScore, 0, 'AC1.4: No bonus for missed bid');
assertEqual(score.totalScore, -20, 'AC1.4: Total should be -20');

// Test missed bids (over)
score = calculateRoundScore(3, 7, 1);
assertEqual(score.baseScore, -10 * 4, 'AC1.5: Missed bid (3/7) should give -10 × 4 = -40 points');
assertEqual(score.bonusScore, 0, 'AC1.5: No bonus for missed bid');
assertEqual(score.totalScore, -40, 'AC1.5: Total should be -40');

// Test single trick bid
score = calculateRoundScore(1, 1, 1);
assertEqual(score.baseScore, 20 * 1, 'AC1.6: Exact bid (1/1) should give 20 × 1 = 20 points');
assertEqual(score.totalScore, 20 + 10, 'AC1.6: Exact bid with bonus should be 20 + 10 = 30');

// Test high bid
score = calculateRoundScore(13, 13, 1);
assertEqual(score.baseScore, 20 * 13, 'AC1.7: Exact bid (13/13) should give 20 × 13 = 260 points');
assertEqual(score.totalScore, 260 + 10, 'AC1.7: Exact bid with bonus should be 260 + 10 = 270');

scroll = calculateRoundScore(13, 8, 1);
assertEqual(scroll.baseScore, -10 * 5, 'AC1.8: Missed bid (13/8) should give -10 × 5 = -50 points');
assertEqual(scroll.totalScore, -50, 'AC1.8: Total should be -50');

// ============================================================================
// AC2: Correctly calculates zero bid scores (±10 × hand count)
// ============================================================================

console.log('\n=== AC2: Zero Bid Scoring ===');

// Test exact zero bid (took 0 tricks)
score = calculateRoundScore(0, 0, 1);
assertEqual(score.baseScore, 10 * 1, 'AC2.1: Zero bid exact (0/0, hand 1) should give 10 × 1 = 10 points');
assertEqual(score.totalScore, 10, 'AC2.1: Total should be 10');
assertEqual(score.isExact, true, 'AC2.1: isExact flag should be true');

// Test exact zero bid with different hand numbers
score = calculateRoundScore(0, 0, 2);
assertEqual(score.baseScore, 10 * 2, 'AC2.2: Zero bid exact (0/0, hand 2) should give 10 × 2 = 20 points');
assertEqual(score.totalScore, 20, 'AC2.2: Total should be 20');

score = calculateRoundScore(0, 0, 5);
assertEqual(score.baseScore, 10 * 5, 'AC2.3: Zero bid exact (0/0, hand 5) should give 10 × 5 = 50 points');
assertEqual(score.totalScore, 50, 'AC2.3: Total should be 50');

score = calculateRoundScore(0, 0, 13);
assertEqual(score.baseScore, 10 * 13, 'AC2.4: Zero bid exact (0/0, hand 13) should give 10 × 13 = 130 points');
assertEqual(score.totalScore, 130, 'AC2.4: Total should be 130');

// Test failed zero bid (took any tricks)
score = calculateRoundScore(0, 1, 1);
assertEqual(score.baseScore, -10 * 1, 'AC2.5: Zero bid failed (0/1, hand 1) should give -10 × 1 = -10 points');
assertEqual(score.totalScore, -10, 'AC2.5: Total should be -10');
assertEqual(score.isExact, false, 'AC2.5: isExact flag should be false');

score = calculateRoundScore(0, 5, 2);
assertEqual(score.baseScore, -10 * 2, 'AC2.6: Zero bid failed (0/5, hand 2) should give -10 × 2 = -20 points');
assertEqual(score.totalScore, -20, 'AC2.6: Total should be -20');

score = calculateRoundScore(0, 13, 13);
assertEqual(score.baseScore, -10 * 13, 'AC2.7: Zero bid failed (0/13, hand 13) should give -10 × 13 = -130 points');
assertEqual(score.totalScore, -130, 'AC2.7: Total should be -130');

// ============================================================================
// AC3: Only applies bonus points when bid is exactly met
// ============================================================================

console.log('\n=== AC3: Bonus Points Only on Exact Bid ===');

// Test non-zero exact bid with bonus
score = calculateRoundScore(5, 5, 1);
assertEqual(score.bonusScore, 10 * 1, 'AC3.1: Exact non-zero bid should have bonus = 10 × 1 = 10');
assertEqual(score.totalScore > score.baseScore, true, 'AC3.1: Total includes bonus');

score = calculateRoundScore(7, 7, 3);
assertEqual(score.bonusScore, 10 * 3, 'AC3.2: Exact non-zero bid (hand 3) should have bonus = 10 × 3 = 30');
assertEqual(score.totalScore, 20 * 7 + 30, 'AC3.2: Total = base + bonus');

// Test non-zero missed bid - NO bonus
score = calculateRoundScore(5, 4, 1);
assertEqual(score.bonusScore, 0, 'AC3.3: Missed non-zero bid should have NO bonus');
assertEqual(score.totalScore, score.baseScore, 'AC3.3: Total = base only (no bonus)');

score = calculateRoundScore(5, 6, 3);
assertEqual(score.bonusScore, 0, 'AC3.4: Missed non-zero bid should have NO bonus');
assertEqual(score.totalScore, score.baseScore, 'AC3.4: Total = base only');

// Test zero bid - never has bonus
score = calculateRoundScore(0, 0, 1);
assertEqual(score.bonusScore, 0, 'AC3.5: Zero bid exact should have NO bonus field');

score = calculateRoundScore(0, 1, 2);
assertEqual(score.bonusScore, 0, 'AC3.6: Zero bid failed should have NO bonus field');

// Test boundary: bid of 1
score = calculateRoundScore(1, 1, 1);
assertEqual(score.bonusScore, 10 * 1, 'AC3.7: Exact bid of 1 should still have bonus');

score = calculateRoundScore(1, 0, 1);
assertEqual(score.bonusScore, 0, 'AC3.8: Missed bid of 1 should have NO bonus');

// ============================================================================
// AC4: Updates total scores correctly
// ============================================================================

console.log('\n=== AC4: Total Score Updates ===');

// Test single round
let result = calculateTotalScore([
  { bid: 5, tricks: 5, hands: 1 }
]);
assertEqual(result.totalScore, 110, 'AC4.1: Single round with exact bid should total 110');
assertEqual(result.rounds.length, 1, 'AC4.1: Should have 1 round');

// Test multiple rounds with various results
result = calculateTotalScore([
  { bid: 5, tricks: 5, hands: 1 },  // +110
  { bid: 3, tricks: 2, hands: 2 },  // -10 (1 trick off)
  { bid: 0, tricks: 0, hands: 3 }   // +30
]);
assertEqual(result.totalScore, 110 - 10 + 30, 'AC4.2: Multi-round total should sum all rounds');
assertEqual(result.totalScore, 130, 'AC4.2: Should equal 130');
assertEqual(result.rounds.length, 3, 'AC4.2: Should have 3 rounds');
assertEqual(result.breakdown.roundCount, 3, 'AC4.2: Breakdown should show round count');

// Test accumulation across many rounds
result = calculateTotalScore([
  { bid: 1, tricks: 1, hands: 1 },  // +30
  { bid: 2, tricks: 2, hands: 2 },  // +50
  { bid: 3, tricks: 3, hands: 3 },  // +70
  { bid: 4, tricks: 4, hands: 4 },  // +90
  { bid: 5, tricks: 5, hands: 5 }   // +110
]);
const expectedTotal = 30 + 50 + 70 + 90 + 110;
assertEqual(result.totalScore, expectedTotal, 'AC4.3: Multi-round accumulation should be correct');
assertEqual(result.totalScore, 350, 'AC4.3: Should equal 350');

// Test with negative scores
result = calculateTotalScore([
  { bid: 5, tricks: 0, hands: 1 },  // -50
  { bid: 4, tricks: 4, hands: 2 },  // +90
  { bid: 0, tricks: 1, hands: 3 }   // -30
]);
assertEqual(result.totalScore, -50 + 90 - 30, 'AC4.4: Should correctly sum positive and negative');
assertEqual(result.totalScore, 10, 'AC4.4: Should equal 10');

// Test breakdown structure
result = calculateTotalScore([
  { bid: 5, tricks: 5, hands: 1 },
  { bid: 3, tricks: 2, hands: 2 }
]);
assert(result.breakdown.hasOwnProperty('totalScore'), 'AC4.5: Breakdown should have totalScore');
assert(result.breakdown.hasOwnProperty('roundCount'), 'AC4.5: Breakdown should have roundCount');
assert(result.breakdown.hasOwnProperty('roundScores'), 'AC4.5: Breakdown should have roundScores array');
assert(result.breakdown.hasOwnProperty('details'), 'AC4.5: Breakdown should have details');
assert(Array.isArray(result.breakdown.roundScores), 'AC4.5: roundScores should be array');
assert(Array.isArray(result.breakdown.details), 'AC4.5: details should be array');

// ============================================================================
// AC5: Shows score breakdown for transparency
// ============================================================================

console.log('\n=== AC5: Score Breakdown for Transparency ===');

// Test round score breakdown
score = calculateRoundScore(5, 5, 2);
assert(score.hasOwnProperty('bid'), 'AC5.1: Breakdown should include bid');
assert(score.hasOwnProperty('tricks'), 'AC5.1: Breakdown should include tricks');
assert(score.hasOwnProperty('hands'), 'AC5.1: Breakdown should include hands');
assert(score.hasOwnProperty('baseScore'), 'AC5.1: Breakdown should include baseScore');
assert(score.hasOwnProperty('bonusScore'), 'AC5.1: Breakdown should include bonusScore');
assert(score.hasOwnProperty('totalScore'), 'AC5.1: Breakdown should include totalScore');
assert(score.hasOwnProperty('isExact'), 'AC5.1: Breakdown should include isExact');
assertEqual(score.bid, 5, 'AC5.1: Breakdown bid matches input');
assertEqual(score.tricks, 5, 'AC5.1: Breakdown tricks matches input');
assertEqual(score.hands, 2, 'AC5.1: Breakdown hands matches input');

// Test breakdown object structure
score = calculateRoundScore(3, 3, 1);
assert(score.hasOwnProperty('breakdown'), 'AC5.2: Should have breakdown object');
assert(score.breakdown.hasOwnProperty('bid'), 'AC5.2: breakdown should include bid');
assert(score.breakdown.hasOwnProperty('tricks'), 'AC5.2: breakdown should include tricks');
assert(score.breakdown.hasOwnProperty('hands'), 'AC5.2: breakdown should include hands');
assert(score.breakdown.hasOwnProperty('baseScore'), 'AC5.2: breakdown should include baseScore');
assert(score.breakdown.hasOwnProperty('bonusScore'), 'AC5.2: breakdown should include bonusScore');
assert(score.breakdown.hasOwnProperty('totalScore'), 'AC5.2: breakdown should include totalScore');
assert(score.breakdown.hasOwnProperty('type'), 'AC5.2: breakdown should include type');
assert(score.breakdown.hasOwnProperty('message'), 'AC5.2: breakdown should include message');

// Test human-readable message
score = calculateRoundScore(5, 5, 1);
assert(typeof score.breakdown.message === 'string', 'AC5.3: Message should be string');
assert(score.breakdown.message.length > 0, 'AC5.3: Message should be non-empty');
assert(score.breakdown.message.includes('5'), 'AC5.3: Message should reference bid');

score = calculateRoundScore(0, 0, 2);
assert(score.breakdown.type === 'zero-bid', 'AC5.4: Should identify zero-bid type');
assert(score.breakdown.message.includes('0'), 'AC5.4: Message should reference zero bid');

score = calculateRoundScore(7, 5, 3);
assert(score.breakdown.type === 'non-zero-bid', 'AC5.5: Should identify non-zero-bid type');
assert(score.breakdown.message.includes('7'), 'AC5.5: Message should reference bid');
assert(score.breakdown.message.includes('5'), 'AC5.5: Message should reference tricks');

// Test getScoreMessage function
let message = getScoreMessage(5, 5, 1, 100, 10);
assert(typeof message === 'string', 'AC5.6: getScoreMessage should return string');
assert(message.length > 0, 'AC5.6: Message should be non-empty');
assert(message.includes('Exact'), 'AC5.6: Message should indicate exact bid');

message = getScoreMessage(5, 3, 1, -20, 0);
assert(message.includes('Missed'), 'AC5.7: Message should indicate missed bid');
assert(message.includes('5'), 'AC5.7: Message should reference bid');

message = getScoreMessage(0, 0, 1, 10, 0);
assert(message.includes('Perfect'), 'AC5.8: Message should indicate perfect zero bid');

message = getScoreMessage(0, 1, 2, -20, 0);
assert(message.includes('Failed'), 'AC5.9: Message should indicate failed zero bid');

// Test total score breakdown
result = calculateTotalScore([
  { bid: 5, tricks: 5, hands: 1 },
  { bid: 0, tricks: 0, hands: 2 },
  { bid: 3, tricks: 2, hands: 3 }
]);
assert(result.breakdown.roundScores.length === 3, 'AC5.10: Should have scores for all rounds');
assert(result.breakdown.details.length === 3, 'AC5.10: Should have details for all rounds');
assert(result.breakdown.details[0].hasOwnProperty('message'), 'AC5.10: Details should have messages');

// ============================================================================
// Additional Edge Cases and Validation
// ============================================================================

console.log('\n=== Additional Edge Cases ===');

// Test validation
let validation = validateRoundScoring(5, 5);
assert(validation.isValid === true, 'Validation: Valid input should pass');
assert(validation.errors.length === 0, 'Validation: No errors for valid input');

validation = validateRoundScoring(-1, 5);
assert(validation.isValid === false, 'Validation: Negative bid should fail');

validation = validateRoundScoring(5, -1);
assert(validation.isValid === false, 'Validation: Negative tricks should fail');

// Test error handling
try {
  calculateRoundScore(-1, 5, 1);
  assert(false, 'Error: Should throw on negative bid');
} catch (e) {
  assert(true, 'Error: Correctly throws on negative bid');
}

try {
  calculateRoundScore(5, 5, 0);
  assert(false, 'Error: Should throw on invalid hands');
} catch (e) {
  assert(true, 'Error: Correctly throws on invalid hands');
}

try {
  calculateTotalScore('not an array');
  assert(false, 'Error: Should throw on non-array input');
} catch (e) {
  assert(true, 'Error: Correctly throws on non-array input');
}

// Test consistency
let score1 = calculateRoundScore(5, 5, 1);
let score2 = calculateRoundScore(5, 5, 1);
assertEqual(score1.totalScore, score2.totalScore, 'Consistency: Same inputs should give same output');

// Test large values
score = calculateRoundScore(13, 13, 13);
assertEqual(score.baseScore, 20 * 13, 'Large values: Should handle 13/13 correctly');
assertEqual(score.bonusScore, 10 * 13, 'Large values: Should handle 13 hand bonus correctly');
assertEqual(score.totalScore, 260 + 130, 'Large values: Total should be 390');

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests Run: ${testsRun}`);
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Pass Rate: ${((testsPassed / testsRun) * 100).toFixed(2)}%`);
console.log('='.repeat(70));

if (testsFailed === 0) {
  console.log('✓ ALL TESTS PASSED');
  process.exit(0);
} else {
  console.log('✗ SOME TESTS FAILED');
  process.exit(1);
}
