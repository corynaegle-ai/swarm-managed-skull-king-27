// ============================= //
// Bid Phase State & Management   //
// ============================= //

/**
 * GameState for bid collection phase.
 * Maintains bids keyed by player name, round info, and validation state.
 */
const gameState = {
  round: 1,
  handCount: 10,
  players: [
    { name: 'Player 1', bid: null },
    { name: 'Player 2', bid: null },
    { name: 'Player 3', bid: null },
    { name: 'Player 4', bid: null }
  ],
  bids: {} // { [playerName]: bidValue }
};

// ============================= //
// Pure Validation Logic         //
// ============================= //

/**
 * Validates a single bid against game rules.
 * Pure function: no side-effects, returns validation status.
 * @param {number|string} bidValue - The bid value to validate
 * @param {number} handCount - Maximum hand count
 * @returns {object} - { isValid: bool, status: 'valid'|'invalid'|'empty', message: string }
 */
function validateBid(bidValue, handCount) {
  // Empty check
  if (bidValue === null || bidValue === undefined || bidValue === '') {
    return {
      isValid: false,
      status: 'empty',
      message: 'Bid required'
    };
  }

  const bid = Number(bidValue);

  // NaN check (non-numeric input)
  if (isNaN(bid)) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Must be a number'
    };
  }

  // Integer check (no decimals)
  if (!Number.isInteger(bid)) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Must be a whole number'
    };
  }

  // Negative check
  if (bid < 0) {
    return {
      isValid: false,
      status: 'invalid',
      message: 'Must be non-negative'
    };
  }

  // Hand count check
  if (bid > handCount) {
    return {
      isValid: false,
      status: 'invalid',
      message: `Cannot exceed hand count (${handCount})`
    };
  }

  return {
    isValid: true,
    status: 'valid',
    message: `Bid: ${bid}`
  };
}

/**
 * Checks if all players have valid bids.
 * Pure function: reads gameState without side-effects.
 * @returns {boolean} - True if all players have valid bids
 */
function areAllBidsValid() {
  return gameState.players.every(player => {
    const bidValue = gameState.bids[player.name];
    const validation = validateBid(bidValue, gameState.handCount);
    return validation.isValid;
  });
}

// ============================= //
// DOM Manipulation Functions    //
// ============================= //

/**
 * Renders the bid collection interface.
 * Creates the HTML structure and attaches event listeners.
 * @returns {void}
 */
function renderBidInterface() {
  const container = document.getElementById('bid-phase-container');

  // Build HTML structure
  const html = `
    <div class="bid-info-section">
      <div class="bid-round-info">
        <h2>Round ${gameState.round}</h2>
        <p>Hand Count: <span class="hand-count-value">${gameState.handCount}</span></p>
      </div>
    </div>

    <div class="bid-players-section" id="bid-players-list">
      ${gameState.players
        .map(
          player => `
        <div class="player-bid-input empty" data-player="${player.name}">
          <label class="bid-label">${player.name}</label>
          <input
            type="number"
            class="bid-input-field"
            min="0"
            max="${gameState.handCount}"
            placeholder="Enter bid (0-${gameState.handCount})"
            data-player="${player.name}"
          />
          <div class="bid-feedback">Bid required</div>
        </div>
      `
        )
        .join('')}
    </div>

    <div class="bid-controls-section">
      <button class="bid-button bid-proceed-btn" id="bid-proceed-btn" disabled>
        Confirm Bids
      </button>
      <button class="bid-button bid-reset-btn" id="bid-reset-btn">
        Reset
      </button>
    </div>
  `;

  container.innerHTML = html;

  // Attach event listeners
  attachEventListeners();
}

/**
 * Attaches event listeners to bid inputs and control buttons.
 * Called once after renderBidInterface to wire up user interactions.
 * @returns {void}
 */
function attachEventListeners() {
  const inputs = document.querySelectorAll('.bid-input-field');
  const proceedBtn = document.getElementById('bid-proceed-btn');
  const resetBtn = document.getElementById('bid-reset-btn');

  // Input validation listeners
  inputs.forEach(input => {
    input.addEventListener('input', handleBidInput);
    input.addEventListener('blur', handleBidInput);
  });

  // Control button listeners
  proceedBtn.addEventListener('click', handleProceed);
  resetBtn.addEventListener('click', handleReset);
}

/**
 * Handles bid input change and updates state and UI.
 * Called on 'input' and 'blur' events.
 * @param {Event} event - The input event
 * @returns {void}
 */
function handleBidInput(event) {
  const input = event.target;
  const playerName = input.dataset.player;
  const bidValue = input.value.trim();

  // Update gameState
  gameState.bids[playerName] = bidValue === '' ? null : bidValue;

  // Validate and update UI
  const validation = validateBid(bidValue, gameState.handCount);
  updateBidInputUI(playerName, validation);

  // Sync proceed button state
  updateProceedButtonState();
}

/**
 * Updates the UI for a single bid input based on validation result.
 * @param {string} playerName - The player's name
 * @param {object} validation - Validation result from validateBid()
 * @returns {void}
 */
function updateBidInputUI(playerName, validation) {
  const container = document.querySelector(
    `.player-bid-input[data-player="${playerName}"]`
  );

  if (!container) return;

  // Remove old status classes
  container.classList.remove('empty', 'invalid', 'valid');

  // Add new status class
  container.classList.add(validation.status);

  // Update feedback message
  const feedback = container.querySelector('.bid-feedback');
  if (feedback) {
    feedback.textContent = validation.message;
  }
}

/**
 * Updates the proceed button state based on bid validity.
 * Called after every user interaction that changes bids.
 * @returns {void}
 */
function updateProceedButtonState() {
  const proceedBtn = document.getElementById('bid-proceed-btn');

  if (!proceedBtn) return;

  const allValid = areAllBidsValid();
  proceedBtn.disabled = !allValid;
}

/**
 * Handles the proceed button click.
 * Dispatches a custom event with confirmed bids.
 * @returns {void}
 */
function handleProceed() {
  const confirmedBids = {};
  gameState.players.forEach(player => {
    confirmedBids[player.name] = Number(gameState.bids[player.name]);
  });

  // Dispatch custom event for consumers
  const event = new CustomEvent('bidsConfirmed', {
    detail: {
      round: gameState.round,
      bids: confirmedBids
    }
  });
  document.dispatchEvent(event);

  // Optional: Log for debugging
  console.log('Bids confirmed:', confirmedBids);
}

/**
 * Handles the reset button click.
 * Clears all bids and resets UI to initial state.
 * @returns {void}
 */
function handleReset() {
  // Clear bids in gameState
  gameState.players.forEach(player => {
    gameState.bids[player.name] = null;
  });

  // Clear input fields and reset UI
  const inputs = document.querySelectorAll('.bid-input-field');
  inputs.forEach(input => {
    input.value = '';
  });

  // Reset all inputs to 'empty' state
  const containers = document.querySelectorAll('.player-bid-input');
  containers.forEach(container => {
    const playerName = container.dataset.player;
    const validation = validateBid('', gameState.handCount);
    updateBidInputUI(playerName, validation);
  });

  // Disable proceed button
  updateProceedButtonState();
}

// ============================= //
// Public API                    //
// ============================= //

/**
 * Initializes the bid phase UI.
 * Must be called once to set up the interface.
 * @param {object} config - Configuration object
 * @param {number} config.round - Current round number
 * @param {number} config.handCount - Number of cards in hand
 * @param {array} config.players - Array of player names
 * @returns {void}
 */
function initializeBidPhase(config) {
  if (config.round !== undefined) {
    gameState.round = config.round;
  }
  if (config.handCount !== undefined) {
    gameState.handCount = config.handCount;
  }
  if (config.players && Array.isArray(config.players)) {
    gameState.players = config.players.map(name =>
      typeof name === 'string' ? { name, bid: null } : name
    );
  }

  // Initialize bids object
  gameState.bids = {};
  gameState.players.forEach(player => {
    gameState.bids[player.name] = null;
  });

  // Render UI
  renderBidInterface();
}

/**
 * Gets the current game state (for debugging/testing).
 * @returns {object} - Current gameState
 */
function getGameState() {
  return { ...gameState };
}
