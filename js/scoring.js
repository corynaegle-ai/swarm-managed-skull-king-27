/**
 * Scoring module for Oh Hell card game
 * Implements score calculation, input validation, real-time updates, and form management
 */

/**
 * Calculate score based on Oh Hell rules
 * @param {number} bid - The number of tricks bid
 * @param {number} tricks - The number of tricks actually taken
 * @param {number} bonus - Bonus points to add
 * @returns {number} The calculated score
 * @throws {Error} If inputs are invalid
 */
function calculateScore(bid, tricks, bonus) {
  // Validate that inputs are numbers and not NaN
  if (typeof bid !== 'number' || isNaN(bid) || bid < 0) {
    throw new Error('Invalid bid: must be a non-negative number');
  }
  if (typeof tricks !== 'number' || isNaN(tricks) || tricks < 0) {
    throw new Error('Invalid tricks: must be a non-negative number');
  }
  if (typeof bonus !== 'number' || isNaN(bonus) || bonus < 0) {
    throw new Error('Invalid bonus: must be a non-negative number');
  }

  // Oh Hell scoring: exact bid = 10 + tricks + bonus, wrong bid = 0 + bonus
  if (bid === tricks) {
    return 10 + tricks + bonus;
  }
  return 0 + bonus;
}

/**
 * Validate tricks input against maximum allowed
 * @param {number} tricksValue - The tricks value to validate
 * @param {number} maxTricks - The maximum allowed tricks
 * @returns {boolean} True if valid (0 <= tricksValue <= maxTricks)
 */
function validateTricksInput(tricksValue, maxTricks) {
  // Check that tricks is a non-negative number and doesn't exceed max
  if (isNaN(tricksValue) || tricksValue < 0 || tricksValue > maxTricks) {
    return false;
  }
  return true;
}

/**
 * Get current form values from the scoring form
 * @returns {Object} Object with bid, tricks, and bonus values (or null if not found)
 */
function getFormValues() {
  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  const bonusInput = document.querySelector('#bonus-input');

  if (!bidInput || !tricksInput) {
    return null;
  }

  const bid = bidInput.value.trim() !== '' ? parseInt(bidInput.value, 10) : null;
  const tricks = tricksInput.value.trim() !== '' ? parseInt(tricksInput.value, 10) : null;
  const bonus = bonusInput && bonusInput.value.trim() !== '' ? parseInt(bonusInput.value, 10) : 0;

  return { bid, tricks, bonus };
}

/**
 * Update the score display element with the current calculated score
 * Also handles button state enabling/disabling
 */
function updateScoreDisplay() {
  const scoreDisplay = document.querySelector('#score-display');
  const nextButton = document.querySelector('#next-button');

  if (!scoreDisplay) {
    return;
  }

  const values = getFormValues();
  if (!values) {
    return;
  }

  const { bid, tricks, bonus } = values;

  // Check if form is complete: bid and tricks must be provided (bonus is optional)
  const isFormComplete = bid !== null && tricks !== null;

  // Enable/disable next button based on form completion
  if (nextButton) {
    nextButton.disabled = !isFormComplete;
  }

  // Only update score display if we have both bid and tricks
  if (isFormComplete) {
    try {
      const score = calculateScore(bid, tricks, bonus);
      scoreDisplay.textContent = score;
    } catch (error) {
      // If calculation fails due to validation, display error or fallback
      scoreDisplay.textContent = 'Invalid';
    }
  } else {
    scoreDisplay.textContent = '--';
  }
}

/**
 * Initialize the scoring form with event listeners and validation
 * @param {Object} config - Configuration object
 * @param {number} config.maxTricks - Maximum tricks allowed for this round
 */
function initializeScoringForm(config = {}) {
  const { maxTricks = 13 } = config;

  const bidInput = document.querySelector('#bid-input');
  const tricksInput = document.querySelector('#tricks-input');
  const bonusInput = document.querySelector('#bonus-input');
  const scoreDisplay = document.querySelector('#score-display');

  // Validate that required elements exist
  if (!bidInput || !tricksInput || !scoreDisplay) {
    throw new Error('Required form elements not found');
  }

  // Set up event listeners for real-time updates
  bidInput.addEventListener('input', () => {
    const bidValue = bidInput.value.trim();
    if (bidValue !== '') {
      const bid = parseInt(bidValue, 10);
      // Basic validation: bid should be non-negative
      if (isNaN(bid) || bid < 0) {
        bidInput.classList.add('error');
      } else {
        bidInput.classList.remove('error');
      }
    }
    updateScoreDisplay();
  });

  tricksInput.addEventListener('input', () => {
    const tricksValue = tricksInput.value.trim();
    if (tricksValue !== '') {
      const tricks = parseInt(tricksValue, 10);
      // Validate: tricks must be non-negative and <= maxTricks
      if (!validateTricksInput(tricks, maxTricks)) {
        tricksInput.classList.add('error');
      } else {
        tricksInput.classList.remove('error');
      }
    }
    updateScoreDisplay();
  });

  if (bonusInput) {
    bonusInput.addEventListener('input', () => {
      const bonusValue = bonusInput.value.trim();
      if (bonusValue !== '') {
        const bonus = parseInt(bonusValue, 10);
        // Validate: bonus should be non-negative
        if (isNaN(bonus) || bonus < 0) {
          bonusInput.classList.add('error');
        } else {
          bonusInput.classList.remove('error');
        }
      }
      updateScoreDisplay();
    });
  }

  // Initialize button state
  updateScoreDisplay();
}

// Export functions for use in browser or testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateScore,
    validateTricksInput,
    getFormValues,
    updateScoreDisplay,
    initializeScoringForm
  };
}
