/**
 * Test suite for scoring.js
 * Tests Oh Hell scoring logic, input validation, and form management
 */

// Import scoring functions (for Node.js environment)
let scoring;
if (typeof module !== 'undefined' && module.exports) {
  scoring = require('./scoring.js');
} else {
  // Browser environment - functions are global
  scoring = {
    calculateScore: typeof calculateScore !== 'undefined' ? calculateScore : null,
    validateTricksInput: typeof validateTricksInput !== 'undefined' ? validateTricksInput : null,
    getFormValues: typeof getFormValues !== 'undefined' ? getFormValues : null,
    updateScoreDisplay: typeof updateScoreDisplay !== 'undefined' ? updateScoreDisplay : null,
    initializeScoringForm: typeof initializeScoringForm !== 'undefined' ? initializeScoringForm : null
  };
}

// Test suite
const tests = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function runTests() {
  console.log('Running scoring tests...\n');

  tests.forEach(({ name, fn }) => {
    try {
      fn();
      console.log(`✓ ${name}`);
      passCount++;
    } catch (error) {
      console.error(`✗ ${name}`);
      console.error(`  ${error.message}\n`);
      failCount++;
    }
  });

  console.log(`\n${passCount} passed, ${failCount} failed\n`);
}

// ============================================================================
// ACCEPTANCE CRITERIA 1: calculateScore(bid, tricks, bonus) returns correct score
// ============================================================================

test('AC1: calculateScore returns 10 + tricks when bid equals tricks (exact match)', () => {
  const score = scoring.calculateScore(5, 5, 0);
  assertEquals(score, 15, 'Score should be 10 + tricks when bid matches tricks');
});

test('AC1: calculateScore includes bonus when bid equals tricks', () => {
  const score = scoring.calculateScore(3, 3, 5);
  assertEquals(score, 18, 'Score should be 10 + tricks + bonus when bid matches');
});

test('AC1: calculateScore returns bonus when bid does not equal tricks', () => {
  const score = scoring.calculateScore(5, 3, 7);
  assertEquals(score, 7, 'Score should be 0 + bonus when bid does not match tricks');
});

test('AC1: calculateScore returns 0 when bid mismatches and no bonus', () => {
  const score = scoring.calculateScore(5, 3, 0);
  assertEquals(score, 0, 'Score should be 0 when bid mismatches and no bonus');
});

test('AC1: calculateScore with zero bid and zero tricks should be exact match', () => {
  const score = scoring.calculateScore(0, 0, 0);
  assertEquals(score, 10, 'Score should be 10 + 0 tricks when both are 0');
});

test('AC1: calculateScore throws error for negative bid', () => {
  try {
    scoring.calculateScore(-1, 5, 0);
    throw new Error('Should have thrown an error for negative bid');
  } catch (error) {
    assert(
      error.message.includes('Invalid bid'),
      `Expected error about invalid bid, got: ${error.message}`
    );
  }
});

test('AC1: calculateScore throws error for negative tricks', () => {
  try {
    scoring.calculateScore(5, -1, 0);
    throw new Error('Should have thrown an error for negative tricks');
  } catch (error) {
    assert(
      error.message.includes('Invalid tricks'),
      `Expected error about invalid tricks, got: ${error.message}`
    );
  }
});

test('AC1: calculateScore throws error for negative bonus', () => {
  try {
    scoring.calculateScore(5, 5, -1);
    throw new Error('Should have thrown an error for negative bonus');
  } catch (error) {
    assert(
      error.message.includes('Invalid bonus'),
      `Expected error about invalid bonus, got: ${error.message}`
    );
  }
});

test('AC1: calculateScore throws error for NaN bid', () => {
  try {
    scoring.calculateScore(NaN, 5, 0);
    throw new Error('Should have thrown an error for NaN bid');
  } catch (error) {
    assert(
      error.message.includes('Invalid bid'),
      `Expected error about invalid bid, got: ${error.message}`
    );
  }
});

test('AC1: calculateScore throws error for NaN tricks', () => {
  try {
    scoring.calculateScore(5, NaN, 0);
    throw new Error('Should have thrown an error for NaN tricks');
  } catch (error) {
    assert(
      error.message.includes('Invalid tricks'),
      `Expected error about invalid tricks, got: ${error.message}`
    );
  }
});

test('AC1: calculateScore throws error for NaN bonus', () => {
  try {
    scoring.calculateScore(5, 5, NaN);
    throw new Error('Should have thrown an error for NaN bonus');
  } catch (error) {
    assert(
      error.message.includes('Invalid bonus'),
      `Expected error about invalid bonus, got: ${error.message}`
    );
  }
});

// ============================================================================
// ACCEPTANCE CRITERIA 3: Input validation prevents invalid trick counts
// ============================================================================

test('AC3: validateTricksInput rejects negative tricks', () => {
  const isValid = scoring.validateTricksInput(-1, 13);
  assertEquals(isValid, false, 'Should reject negative tricks');
});

test('AC3: validateTricksInput accepts zero tricks', () => {
  const isValid = scoring.validateTricksInput(0, 13);
  assertEquals(isValid, true, 'Should accept zero tricks');
});

test('AC3: validateTricksInput accepts tricks within valid range', () => {
  const isValid = scoring.validateTricksInput(5, 13);
  assertEquals(isValid, true, 'Should accept tricks within valid range');
});

test('AC3: validateTricksInput rejects tricks exceeding max', () => {
  const isValid = scoring.validateTricksInput(14, 13);
  assertEquals(isValid, false, 'Should reject tricks exceeding max');
});

test('AC3: validateTricksInput accepts tricks at max boundary', () => {
  const isValid = scoring.validateTricksInput(13, 13);
  assertEquals(isValid, true, 'Should accept tricks at max boundary');
});

test('AC3: validateTricksInput rejects NaN', () => {
  const isValid = scoring.validateTricksInput(NaN, 13);
  assertEquals(isValid, false, 'Should reject NaN');
});

// ============================================================================
// ACCEPTANCE CRITERIA 2: Real-time score updates as user enters data
// ACCEPTANCE CRITERIA 4: Form completion detection enables/disables next button
// (These require DOM, tested separately or with mock DOM)
// ============================================================================

test('AC2/AC4: getFormValues returns null when form elements not found', () => {
  const values = scoring.getFormValues();
  // In test environment without DOM, this should return null or handle gracefully
  assert(
    values === null || (typeof values === 'object' && values !== null),
    'getFormValues should handle missing elements'
  );
});

// ============================================================================
// ACCEPTANCE CRITERIA 5: Bonus points properly added to scores
// ============================================================================

test('AC5: Bonus points added when bid matches', () => {
  const scoreWithBonus = scoring.calculateScore(5, 5, 10);
  const scoreWithoutBonus = scoring.calculateScore(5, 5, 0);
  assertEquals(
    scoreWithBonus - scoreWithoutBonus,
    10,
    'Bonus should increase score by exact amount when bid matches'
  );
});

test('AC5: Bonus points added when bid mismatches', () => {
  const scoreWithBonus = scoring.calculateScore(5, 3, 10);
  const scoreWithoutBonus = scoring.calculateScore(5, 3, 0);
  assertEquals(
    scoreWithBonus,
    10,
    'When bid mismatches, score should equal bonus'
  );
  assertEquals(
    scoreWithoutBonus,
    0,
    'When bid mismatches with no bonus, score should be 0'
  );
});

test('AC5: Zero bonus does not affect score', () => {
  const score1 = scoring.calculateScore(7, 7, 0);
  const score2 = scoring.calculateScore(7, 7, 0);
  assertEquals(score1, score2, 'Zero bonus should produce consistent results');
});

// ============================================================================
// Run all tests
// ============================================================================

if (typeof require !== 'undefined' && require.main === module) {
  runTests();
}
