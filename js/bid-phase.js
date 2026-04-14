/**
 * Bid Phase Manager
 * Handles bid collection UI, validation, and state management
 */

const BidPhase = (() => {
  let gameState = {};
  let currentRound = 1;
  let handCount = 1;
  let players = [];

  /**
   * Initialize bid phase with game state and players
   * @param {Object} state - Game state object to store bids
   * @param {number} round - Current round number
   * @param {number} hand - Number of cards in current hand
   * @param {Array} playerList - List of players
   */
  const initializeBidPhase = (state, round, hand, playerList) => {
    gameState = state;
    currentRound = round;
    handCount = hand;
    players = playerList;

    // Initialize bids in game state if not present
    if (!gameState.bids) {
      gameState.bids = {};
    }

    renderBidInterface();
  };

  /**
   * Render the bid collection interface
   */
  const renderBidInterface = () => {
    const bidContainer = document.getElementById('bid-phase-container');
    if (!bidContainer) {
      console.error('Bid phase container not found in DOM');
      return;
    }

    // Clear previous content
    bidContainer.innerHTML = '';

    // Create round and hand info section
    const infoSection = document.createElement('div');
    infoSection.className = 'bid-info-section';
    infoSection.innerHTML = `
      <div class="bid-round-info">
        <h2>Round ${currentRound}</h2>
        <p>Hand Count: <span class="hand-count-value">${handCount}</span></p>
      </div>
    `;
    bidContainer.appendChild(infoSection);

    // Create player bids section
    const playersSection = document.createElement('div');
    playersSection.className = 'bid-players-section';
    playersSection.id = 'bid-players-container';

    // Render input field for each player
    players.forEach((player, index) => {
      const playerBidDiv = document.createElement('div');
      playerBidDiv.className = 'player-bid-input';
      playerBidDiv.id = `bid-player-${index}`;

      const label = document.createElement('label');
      label.htmlFor = `bid-input-${index}`;
      label.textContent = `${player}:`;
      label.className = 'bid-label';

      const input = document.createElement('input');
      input.type = 'number';
      input.id = `bid-input-${index}`;
      input.min = '0';
      input.max = handCount;
      input.placeholder = `0 - ${handCount}`;
      input.className = 'bid-input-field';
      input.dataset.playerIndex = index;

      // Event listener for validation on input
      input.addEventListener('input', (e) => validateBidInput(e.target));
      input.addEventListener('blur', (e) => validateBidInput(e.target));

      const feedbackSpan = document.createElement('span');
      feedbackSpan.className = 'bid-feedback';
      feedbackSpan.id = `bid-feedback-${index}`;
      feedbackSpan.textContent = '';

      playerBidDiv.appendChild(label);
      playerBidDiv.appendChild(input);
      playerBidDiv.appendChild(feedbackSpan);

      playersSection.appendChild(playerBidDiv);
    });

    bidContainer.appendChild(playersSection);

    // Create control buttons section
    const controlsSection = document.createElement('div');
    controlsSection.className = 'bid-controls-section';

    const proceedBtn = document.createElement('button');
    proceedBtn.id = 'bid-proceed-btn';
    proceedBtn.className = 'bid-button bid-proceed-btn';
    proceedBtn.textContent = 'Confirm Bids';
    proceedBtn.disabled = true;

    proceedBtn.addEventListener('click', onProceed);

    const resetBtn = document.createElement('button');
    resetBtn.id = 'bid-reset-btn';
    resetBtn.className = 'bid-button bid-reset-btn';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', onReset);

    controlsSection.appendChild(proceedBtn);
    controlsSection.appendChild(resetBtn);

    bidContainer.appendChild(controlsSection);
  };

  /**
   * Validate a single bid input
   * @param {HTMLInputElement} inputElement - The input element to validate
   */
  const validateBidInput = (inputElement) => {
    const playerIndex = inputElement.dataset.playerIndex;
    const bidValue = inputElement.value.trim();
    const feedbackElement = document.getElementById(`bid-feedback-${playerIndex}`);
    const parentDiv = inputElement.parentElement;

    // Remove all validation classes
    parentDiv.classList.remove('valid', 'invalid', 'empty');
    feedbackElement.textContent = '';

    if (bidValue === '' || bidValue === null) {
      parentDiv.classList.add('empty');
      feedbackElement.textContent = 'Required';
      return false;
    }

    const bid = parseInt(bidValue, 10);

    if (isNaN(bid) || bid < 0) {
      parentDiv.classList.add('invalid');
      feedbackElement.textContent = 'Must be a non-negative number';
      return false;
    }

    if (bid > handCount) {
      parentDiv.classList.add('invalid');
      feedbackElement.textContent = `Cannot exceed hand count (${handCount})`;
      return false;
    }

    parentDiv.classList.add('valid');
    feedbackElement.textContent = '✓';
    gameState.bids[playerIndex] = bid;
    return true;
  };

  /**
   * Check if all players have valid bids
   * @returns {boolean} True if all bids are valid
   */
  const areAllBidsValid = () => {
    const inputs = document.querySelectorAll('.bid-input-field');
    let allValid = true;

    inputs.forEach((input) => {
      const playerIndex = input.dataset.playerIndex;
      const parentDiv = input.parentElement;

      // Re-validate each input
      const isValid = validateBidInput(input);

      if (!isValid) {
        allValid = false;
      }
    });

    return allValid;
  };

  /**
   * Update proceed button state based on bid validity
   */
  const updateProceedButtonState = () => {
    const proceedBtn = document.getElementById('bid-proceed-btn');
    if (!proceedBtn) return;

    const allValid = areAllBidsValid();
    proceedBtn.disabled = !allValid;
  };

  /**
   * Handle proceed button click
   */
  const onProceed = () => {
    if (!areAllBidsValid()) {
      console.warn('Cannot proceed: Invalid bids detected');
      return;
    }

    // Dispatch custom event for game flow integration
    const event = new CustomEvent('bidsConfirmed', {
      detail: {
        bids: gameState.bids,
        round: currentRound
      }
    });
    document.dispatchEvent(event);
  };

  /**
   * Handle reset button click
   */
  const onReset = () => {
    const inputs = document.querySelectorAll('.bid-input-field');
    inputs.forEach((input) => {
      input.value = '';
      validateBidInput(input);
    });
    gameState.bids = {};
    updateProceedButtonState();
  };

  /**
   * Get all bids from game state
   * @returns {Object} Object with player indices as keys and bid values
   */
  const getBids = () => {
    return gameState.bids || {};
  };

  /**
   * Attach validation listeners to all bid inputs
   */
  const attachValidationListeners = () => {
    const inputs = document.querySelectorAll('.bid-input-field');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        validateBidInput(input);
        updateProceedButtonState();
      });
      input.addEventListener('change', () => {
        validateBidInput(input);
        updateProceedButtonState();
      });
    });
  };

  // Public API
  return {
    initializeBidPhase,
    renderBidInterface,
    validateBidInput,
    areAllBidsValid,
    getBids,
    updateProceedButtonState,
    attachValidationListeners
  };
})();
