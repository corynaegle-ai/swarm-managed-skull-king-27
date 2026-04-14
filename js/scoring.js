/**
 * Scoring module for Oh Hell card game
 * Handles score calculation, real-time updates, and form validation
 */

/**
 * Calculates the score based on Oh Hell scoring rules
 * @param {number} bid - The bid (tricks player predicted)
 * @param {number} tricks - The tricks player actually took
 * @param {number} bonus - Optional bonus points
 * @returns {number} The calculated score
 */
function calculateScore(bid, tricks, bonus = 0) {
  // Validate inputs
  if (typeof bid !== 'number' || typeof tricks !== 'number' || typeof bonus !== 'number') {
    return 0;
  }

  // Oh Hell scoring rules: exact bid = 10 + tricks + bonus, wrong bid = 0 + bonus
  if (bid === tricks) {
    return 10 + tricks + bonus;
  } else {
    return 0 + bonus;
  }
}

/**
 * Initializes the scoring form with event listeners and validation
 * @param {Object} config - Configuration object
 * @param {number} config.maxTricks - Maximum tricks allowed in the game
 */
function initializeScoringForm(config = {}) {
  const maxTricks = config.maxTricks || 13;

  // Get DOM elements
  const bidInput = document.getElementById('bid-input');
  const tricksInput = document.getElementById('tricks-input');
  const bonusInput = document.getElementById('bonus-input');
  const scoreDisplay = document.getElementById('score-display');
  const nextButton = document.getElementById('next-button');

  // Validate that all required elements exist
  if (!bidInput || !tricksInput || !bonusInput || !scoreDisplay || !nextButton) {
    console.error('Error: Could not find all required form elements');
    return;
  }

  /**
   * Updates the score display and button state based on current input values
   */
  function updateScoreDisplay() {
    const bid = bidInput.value ? parseInt(bidInput.value, 10) : null;
    const tricks = tricksInput.value ? parseInt(tricksInput.value, 10) : null;
    const bonus = bonusInput.value ? parseInt(bonusInput.value, 10) : 0;

    // Check if form is complete
    const isFormComplete = bid !== null && tricks !== null;

    if (isFormComplete) {
      // Calculate and display score
      const score = calculateScore(bid, tricks, bonus);
      scoreDisplay.textContent = score;
      nextButton.disabled = false;
    } else {
      // Clear display and disable button
      scoreDisplay.textContent = '--';
      nextButton.disabled = true;
    }
  }

  /**
   * Validates bid input
   */
  function validateBid() {
    const bid = bidInput.value ? parseInt(bidInput.value, 10) : null;
    if (bid !== null) {
      // Bid must be between 0 and maxTricks
      if (bid < 0 || bid > maxTricks) {
        bidInput.setCustomValidity(`Bid must be between 0 and ${maxTricks}`);
        return false;
      }
      bidInput.setCustomValidity('');
      return true;
    }
    bidInput.setCustomValidity('');
    return true;
  }

  /**
   * Validates tricks input
   */
  function validateTricks() {
    const tricks = tricksInput.value ? parseInt(tricksInput.value, 10) : null;
    if (tricks !== null) {
      // Tricks taken must be between 0 and maxTricks
      if (tricks < 0 || tricks > maxTricks) {
        tricksInput.setCustomValidity(`Tricks must be between 0 and ${maxTricks}`);
        return false;
      }
      tricksInput.setCustomValidity('');
      return true;
    }
    tricksInput.setCustomValidity('');
    return true;
  }

  /**
   * Validates bonus input
   */
  function validateBonus() {
    const bonus = bonusInput.value ? parseInt(bonusInput.value, 10) : null;
    if (bonus !== null && bonus < 0) {
      bonusInput.setCustomValidity('Bonus must be non-negative');
      return false;
    }
    bonusInput.setCustomValidity('');
    return true;
  }

  // Add event listeners for real-time updates
  bidInput.addEventListener('input', () => {
    validateBid();
    updateScoreDisplay();
  });

  tricksInput.addEventListener('input', () => {
    validateTricks();
    updateScoreDisplay();
  });

  bonusInput.addEventListener('input', () => {
    validateBonus();
    updateScoreDisplay();
  });

  // Initialize display
  updateScoreDisplay();
}
