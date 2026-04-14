/**
 * Test suite for scoring.js
 */

// Mock DOM elements for testing
function setupDOMMocks() {
  document.body.innerHTML = `
    <form id="scoring-form">
      <input id="bid-input" type="number" value="" min="0">
      <input id="tricks-input" type="number" value="" min="0">
      <input id="bonus-input" type="number" value="0" min="0">
      <div id="score-display">0</div>
      <button id="next-button" disabled class="disabled">Next</button>
    </form>
  `;
}

// Test: calculateScore function
function testCalculateScore() {
  console.log('Testing calculateScore...');
  
  // Test exact bid (bid === tricks)
  let score = calculateScore(5, 5, 0);
  console.assert(score === 15, `Expected 15, got ${score} for bid=5, tricks=5, bonus=0`);
  
  // Test exact bid with bonus
  score = calculateScore(3, 3, 2);
  console.assert(score === 15, `Expected 15, got ${score} for bid=3, tricks=3, bonus=2`);
  
  // Test wrong bid without bonus
  score = calculateScore(5, 3, 0);
  console.assert(score === 0, `Expected 0, got ${score} for bid=5, tricks=3, bonus=0`);
  
  // Test wrong bid with bonus
  score = calculateScore(2, 5, 3);
  console.assert(score === 3, `Expected 3, got ${score} for bid=2, tricks=5, bonus=3`);
  
  // Test edge case: bid=0, tricks=0
  score = calculateScore(0, 0, 0);
  console.assert(score === 10, `Expected 10, got ${score} for bid=0, tricks=0, bonus=0`);
  
  // Test edge case: bid=0, tricks=0 with bonus
  score = calculateScore(0, 0, 5);
  console.assert(score === 15, `Expected 15, got ${score} for bid=0, tricks=0, bonus=5`);
  
  console.log('✓ calculateScore tests passed');
}

// Test: Real-time score updates
function testRealtimeScoreUpdates() {
  console.log('Testing real-time score updates...');
  
  setupDOMMocks();
  
  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  const bonusInput = document.querySelector('#bonus-input');
  const scoreDisplay = document.querySelector('#score-display');
  
  // Initialize the form
  initializeScoringForm(13);
  
  // Simulate user input
  bidInput.value = '4';
  bidInput.dispatchEvent(new Event('input'));
  
  tricksInput.value = '4';
  tricksInput.dispatchEvent(new Event('input'));
  
  bonusInput.value = '2';
  bonusInput.dispatchEvent(new Event('input'));
  
  // Score should be 10 + 4 + 2 = 16
  setTimeout(() => {
    const score = parseInt(scoreDisplay.textContent);
    console.assert(score === 16, `Expected score 16, got ${score}`);
    console.log('✓ Real-time score update tests passed');
  }, 100);
}

// Test: Input validation (tricks cannot exceed round max)
function testInputValidation() {
  console.log('Testing input validation...');
  
  setupDOMMocks();
  
  const tricksInput = document.querySelector('#tricks-input');
  
  // Initialize with round 5 (max 5 tricks)
  initializeScoringForm(5);
  
  // Try to set tricks to 10 (exceeds max)
  tricksInput.value = '10';
  tricksInput.dispatchEvent(new Event('input'));
  
  // Value should be clamped to 5
  setTimeout(() => {
    const value = parseInt(tricksInput.value);
    console.assert(value <= 5, `Tricks value ${value} exceeds maximum of 5`);
    console.log('✓ Input validation tests passed');
  }, 100);
}

// Test: Form completion detection
function testFormCompletion() {
  console.log('Testing form completion detection...');
  
  setupDOMMocks();
  
  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  const bonusInput = document.querySelector('#bonus-input');
  const nextButton = document.querySelector('#next-button');
  
  // Initialize form
  initializeScoringForm(13);
  
  // Initially, button should be disabled
  console.assert(nextButton.disabled === true, 'Button should be disabled initially');
  
  // Fill in bid
  bidInput.value = '5';
  bidInput.dispatchEvent(new Event('input'));
  console.assert(nextButton.disabled === true, 'Button should be disabled with only bid filled');
  
  // Fill in tricks
  tricksInput.value = '5';
  tricksInput.dispatchEvent(new Event('input'));
  console.assert(nextButton.disabled === true, 'Button should be disabled with bid and tricks filled');
  
  // Fill in bonus
  bonusInput.value = '0';
  bonusInput.dispatchEvent(new Event('input'));
  console.assert(nextButton.disabled === false, 'Button should be enabled when all fields filled');
  
  console.log('✓ Form completion detection tests passed');
}

// Test: Bonus points properly added
function testBonusPoints() {
  console.log('Testing bonus points...');
  
  // Test bonus added to correct bid
  let score = calculateScore(3, 3, 5);
  console.assert(score === 15, `Expected 15 (10+3+5), got ${score}`);
  
  // Test bonus added to incorrect bid
  score = calculateScore(4, 3, 7);
  console.assert(score === 7, `Expected 7 (0+7), got ${score}`);
  
  // Test zero bonus
  score = calculateScore(2, 2, 0);
  console.assert(score === 12, `Expected 12 (10+2+0), got ${score}`);
  
  console.log('✓ Bonus points tests passed');
}

// Test: validateTricks function
function testValidateTricks() {
  console.log('Testing validateTricks...');
  
  // Valid tricks
  console.assert(validateTricks(3, 5) === true, 'Should validate 3 tricks in round 5');
  console.assert(validateTricks(5, 5) === true, 'Should validate 5 tricks in round 5');
  console.assert(validateTricks(0, 5) === true, 'Should validate 0 tricks in round 5');
  
  // Invalid tricks
  console.assert(validateTricks(6, 5) === false, 'Should reject 6 tricks in round 5');
  console.assert(validateTricks(-1, 5) === false, 'Should reject negative tricks');
  
  console.log('✓ validateTricks tests passed');
}

// Test: getFormValues function
function testGetFormValues() {
  console.log('Testing getFormValues...');
  
  setupDOMMocks();
  
  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  const bonusInput = document.querySelector('#bonus-input');
  
  bidInput.value = '4';
  tricksInput.value = '3';
  bonusInput.value = '2';
  
  const values = getFormValues();
  console.assert(values.bid === 4, `Expected bid 4, got ${values.bid}`);
  console.assert(values.tricks === 3, `Expected tricks 3, got ${values.tricks}`);
  console.assert(values.bonus === 2, `Expected bonus 2, got ${values.bonus}`);
  
  console.log('✓ getFormValues tests passed');
}

// Run all tests
function runAllTests() {
  console.log('\n=== Running Scoring Tests ===\n');
  
  testCalculateScore();
  testBonusPoints();
  testValidateTricks();
  testGetFormValues();
  testInputValidation();
  testFormCompletion();
  testRealtimeScoreUpdates();
  
  console.log('\n=== All Tests Completed ===\n');
}

// Export for use in test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testCalculateScore,
    testRealtimeScoreUpdates,
    testInputValidation,
    testFormCompletion,
    testBonusPoints,
    testValidateTricks,
    testGetFormValues,
    runAllTests
  };
}
