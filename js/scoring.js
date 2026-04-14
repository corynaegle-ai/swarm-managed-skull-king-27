/**
 * Scoring module for Oh Hell card game
 * Implements Oh Hell scoring rules and real-time score calculations
 */

/**
 * Calculate score based on bid vs tricks taken
 * Oh Hell Scoring Rules:
 * - If bid === tricks: 10 + tricks + bonus points
 * - If bid !== tricks: 0 + bonus points
 *
 * @param {number} bid - The bid amount
 * @param {number} tricksTaken - The number of tricks actually taken
 * @param {number} bonusPoints - Bonus points awarded (default 0)
 * @returns {number} The calculated score
 */
function calculateScore(bid, tricksTaken, bonusPoints = 0) {
  // Input validation
  if (typeof bid !== 'number' || typeof tricksTaken !== 'number' || typeof bonusPoints !== 'number') {
    console.error('Invalid input types for calculateScore');
    return 0;
  }

  if (bid < 0 || tricksTaken < 0 || bonusPoints < 0) {
    console.error('Bid, tricks, and bonus points cannot be negative');
    return 0;
  }

  // Oh Hell scoring logic
  if (bid === tricksTaken) {
    return 10 + tricksTaken + bonusPoints;
  } else {
    return 0 + bonusPoints;
  }
}

/**
 * Validate form inputs for bid phase
 * @param {number} bid - The bid value
 * @param {number} maxTricks - Maximum tricks available in the round
 * @returns {object} Validation result with isValid flag and error message
 */
function validateBidInput(bid, maxTricks) {
  if (typeof bid !== 'number' || bid < 0) {
    return { isValid: false, error: 'Bid must be a non-negative number' };
  }

  if (bid > maxTricks) {
    return { isValid: false, error: `Bid cannot exceed ${maxTricks} tricks` };
  }

  return { isValid: true, error: null };
}

/**
 * Validate form inputs for tricks phase
 * @param {number} tricks - The tricks taken value
 * @param {number} maxTricks - Maximum tricks available in the round
 * @returns {object} Validation result with isValid flag and error message
 */
function validateTricksInput(tricks, maxTricks) {
  if (typeof tricks !== 'number' || tricks < 0) {
    return { isValid: false, error: 'Tricks must be a non-negative number' };
  }

  if (tricks > maxTricks) {
    return { isValid: false, error: `Tricks cannot exceed ${maxTricks}` };
  }

  return { isValid: true, error: null };
}

/**
 * Check if all required form fields are completed
 * @param {object} formData - Object containing form field values
 * @param {array} requiredFields - Array of required field names
 * @returns {boolean} True if all required fields have values
 */
function isFormComplete(formData, requiredFields) {
  return requiredFields.every(field => {
    const value = formData[field];
    return value !== null && value !== undefined && value !== '';
  });
}

/**
 * Update score display element in DOM
 * @param {string} elementId - ID of the DOM element to update
 * @param {number} score - The score value to display
 * @param {boolean} isExact - Whether the bid was exact (for styling)
 */
function updateScoreDisplay(elementId, score, isExact = false) {
  const element = document.querySelector(`#${elementId}`);
  if (!element) {
    console.error(`Element with id '${elementId}' not found`);
    return;
  }

  element.textContent = score;
  element.classList.remove('score-exact', 'score-miss');
  if (isExact && score > 0) {
    element.classList.add('score-exact');
  } else if (!isExact && score === 0) {
    element.classList.add('score-miss');
  }
}

/**
 * Update button state based on form completion
 * @param {string} buttonId - ID of the button to update
 * @param {boolean} isEnabled - Whether the button should be enabled
 */
function updateButtonState(buttonId, isEnabled) {
  const button = document.querySelector(`#${buttonId}`);
  if (!button) {
    console.error(`Button with id '${buttonId}' not found`);
    return;
  }

  button.disabled = !isEnabled;
  if (isEnabled) {
    button.classList.remove('disabled');
  } else {
    button.classList.add('disabled');
  }
}

/**
 * Set up real-time input validation listeners
 * @param {string} inputId - ID of the input element
 * @param {function} validationFn - Validation function to call
 * @param {string} errorElementId - ID of element to display error messages
 */
function setupInputValidation(inputId, validationFn, errorElementId) {
  const inputElement = document.querySelector(`#${inputId}`);
  const errorElement = document.querySelector(`#${errorElementId}`);

  if (!inputElement) {
    console.error(`Input element with id '${inputId}' not found`);
    return;
  }

  inputElement.addEventListener('input', (event) => {
    const value = parseInt(event.target.value, 10);
    const validation = validationFn(value);

    if (errorElement) {
      if (validation.isValid) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        inputElement.classList.remove('input-error');
      } else {
        errorElement.textContent = validation.error;
        errorElement.style.display = 'block';
        inputElement.classList.add('input-error');
      }
    }
  });
}

/**
 * Calculate and update round totals
 * @param {array} playerScores - Array of player score objects
 * @returns {array} Updated player scores with round totals
 */
function calculateRoundTotals(playerScores) {
  if (!Array.isArray(playerScores)) {
    console.error('playerScores must be an array');
    return [];
  }

  return playerScores.map(player => ({
    ...player,
    roundTotal: (player.roundTotal || 0) + (player.roundScore || 0)
  }));
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateScore,
    validateBidInput,
    validateTricksInput,
    isFormComplete,
    updateScoreDisplay,
    updateButtonState,
    setupInputValidation,
    calculateRoundTotals
  };
}
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
