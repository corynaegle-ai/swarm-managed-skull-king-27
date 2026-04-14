/**
 * Scoring module for Oh Hell card game
 * Implements scoring logic, real-time calculations, and form validation
 */

/**
 * Calculate score based on bid vs tricks taken
 * Oh Hell scoring: bid === tricks ? 10 + tricks + bonus : 0 + bonus
 * @param {number} bid - The number of tricks player bid
 * @param {number} tricks - The number of tricks player took
 * @param {number} bonus - Bonus points (default 0)
 * @returns {number} The calculated score
 */
function calculateScore(bid, tricks, bonus = 0) {
  // Input validation
  if (typeof bid !== 'number' || typeof tricks !== 'number' || typeof bonus !== 'number') {
    return 0;
  }
  
  if (bid < 0 || tricks < 0 || bonus < 0) {
    return 0;
  }
  
  // Oh Hell scoring logic
  if (bid === tricks) {
    return 10 + tricks + bonus;
  } else {
    return 0 + bonus;
  }
}

/**
 * Initialize scoring form with event listeners
 * Sets up real-time updates and validation
 * @param {number} roundNumber - Current round number (used to determine max tricks)
 */
function initializeScoringForm(roundNumber = 1) {
  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  const bonusInput = document.querySelector('#bonus-input');
  const scoreDisplay = document.querySelector('#score-display');
  const nextButton = document.querySelector('#next-button');
  const form = document.querySelector('#scoring-form');
  
  // Validate form elements exist
  if (!bidInput || !tricksInput || !bonusInput || !scoreDisplay || !nextButton || !form) {
    console.warn('Scoring form elements not found. Make sure HTML has correct IDs.');
    return;
  }
  
  // Helper function to update score display
  function updateScore() {
    const bid = parseInt(bidInput.value) || 0;
    const tricks = parseInt(tricksInput.value) || 0;
    const bonus = parseInt(bonusInput.value) || 0;
    
    const score = calculateScore(bid, tricks, bonus);
    scoreDisplay.textContent = score;
    
    // Update next button state based on form completion
    updateButtonState();
  }
  
  // Helper function to validate tricks input
  function validateTricksInput() {
    const tricks = parseInt(tricksInput.value) || 0;
    const maxTricks = roundNumber;
    
    if (tricks > maxTricks) {
      tricksInput.value = maxTricks;
      // Optionally show validation error
      tricksInput.classList.add('error');
      setTimeout(() => {
        tricksInput.classList.remove('error');
      }, 1500);
    }
  }
  
  // Helper function to check if form is complete
  function isFormComplete() {
    const bid = bidInput.value.trim();
    const tricks = tricksInput.value.trim();
    
    // Bid and tricks are required; bonus defaults to 0 if empty
    return bid !== '' && tricks !== '';
  }
  
  // Helper function to update button state
  function updateButtonState() {
    if (isFormComplete()) {
      nextButton.disabled = false;
      nextButton.classList.remove('disabled');
    } else {
      nextButton.disabled = true;
      nextButton.classList.add('disabled');
    }
  }
  
  // Add event listeners for real-time updates
  bidInput.addEventListener('input', updateScore);
  tricksInput.addEventListener('input', function() {
    validateTricksInput();
    updateScore();
  });
  bonusInput.addEventListener('input', updateScore);
  
  // Initialize button state
  updateButtonState();
  updateScore();
}

/**
 * Update score display in real-time
 * Called when any scoring input changes
 */
function updateScoreDisplay() {
  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  const bonusInput = document.querySelector('#bonus-input');
  const scoreDisplay = document.querySelector('#score-display');
  
  if (!bidInput || !tricksInput || !bonusInput || !scoreDisplay) {
    return;
  }
  
  const bid = parseInt(bidInput.value) || 0;
  const tricks = parseInt(tricksInput.value) || 0;
  const bonus = parseInt(bonusInput.value) || 0;
  
  const score = calculateScore(bid, tricks, bonus);
  scoreDisplay.textContent = score;
}

/**
 * Check if scoring form is complete
 * @returns {boolean} True if all required fields have values
 */
function isScoringFormComplete() {
  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  
  if (!bidInput || !tricksInput) {
    return false;
  }
  
  const bid = bidInput.value.trim();
  const tricks = tricksInput.value.trim();
  
  return bid !== '' && tricks !== '';
}

/**
 * Validate tricks input against round maximum
 * @param {number} tricks - Number of tricks taken
 * @param {number} roundNumber - Current round number
 * @returns {boolean} True if tricks is valid
 */
function validateTricks(tricks, roundNumber) {
  if (typeof tricks !== 'number' || tricks < 0) {
    return false;
  }
  
  return tricks <= roundNumber;
}

/**
 * Get current form values
 * @returns {object} Object with bid, tricks, and bonus values
 */
function getFormValues() {
  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  const bonusInput = document.querySelector('#bonus-input');
  
  return {
    bid: parseInt(bidInput?.value) || 0,
    tricks: parseInt(tricksInput?.value) || 0,
    bonus: parseInt(bonusInput?.value) || 0
  };
}

/**
 * Reset scoring form to initial state
 */
function resetScoringForm() {
  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  const bonusInput = document.querySelector('#bonus-input');
  const scoreDisplay = document.querySelector('#score-display');
  const nextButton = document.querySelector('#next-button');
  
  if (bidInput) bidInput.value = '';
  if (tricksInput) tricksInput.value = '';
  if (bonusInput) bonusInput.value = '';
  if (scoreDisplay) scoreDisplay.textContent = '0';
  if (nextButton) {
    nextButton.disabled = true;
    nextButton.classList.add('disabled');
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateScore,
    initializeScoringForm,
    updateScoreDisplay,
    isScoringFormComplete,
    validateTricks,
    getFormValues,
    resetScoringForm
  };
}
