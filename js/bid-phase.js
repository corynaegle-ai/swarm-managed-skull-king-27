// Bid Phase State Management
const gameState = {
  currentRound: 1,
  handCount: 13,
  players: [],
  bids: {}
};

/**
 * Initialize the bid phase with players and game state
 * @param {number} round - Current round number
 * @param {number} handCount - Number of cards in hand
 * @param {string[]} playerNames - Array of player names
 */
function initializeBidPhase(round, handCount, playerNames) {
  gameState.currentRound = round;
  gameState.handCount = handCount;
  gameState.players = playerNames;
  gameState.bids = {};
  playerNames.forEach(player => {
    gameState.bids[player] = null;
  });
  renderBidPhaseUI();
}

/**
 * Render the complete bid phase UI
 */
function renderBidPhaseUI() {
  const container = document.getElementById('bid-phase-container');
  if (!container) {
    console.error('Bid phase container not found');
    return;
  }

  container.innerHTML = '';

  // Info Section
  const infoSection = document.createElement('div');
  infoSection.className = 'bid-info-section';
  infoSection.innerHTML = `
    <div class="bid-round-info">
      <h2>Round ${gameState.currentRound}</h2>
      <p>Hand Count: <span class="hand-count-value">${gameState.handCount}</span></p>
    </div>
  `;
  container.appendChild(infoSection);

  // Players Section
  const playersSection = document.createElement('div');
  playersSection.className = 'bid-players-section';
  gameState.players.forEach((player, index) => {
    const playerInput = createPlayerBidInput(player);
    playersSection.appendChild(playerInput);
  });
  container.appendChild(playersSection);

  // Controls Section
  const controlsSection = document.createElement('div');
  controlsSection.className = 'bid-controls-section';
  controlsSection.innerHTML = `
    <button class="bid-button bid-proceed-btn" id="proceed-btn" disabled>
      Confirm Bids
    </button>
    <button class="bid-button bid-reset-btn" id="reset-btn">
      Reset Bids
    </button>
  `;
  container.appendChild(controlsSection);

  // Attach event listeners
  attachBidEventListeners();
  updateProceedButtonState();
}

/**
 * Create a player bid input element
 * @param {string} playerName - Name of the player
 * @returns {HTMLElement} Player bid input container
 */
function createPlayerBidInput(playerName) {
  const container = document.createElement('div');
  container.className = 'player-bid-input empty';
  container.id = `bid-input-${playerName}`;

  container.innerHTML = `
    <label class="bid-label" for="${playerName}-input">${playerName}</label>
    <input
      type="number"
      id="${playerName}-input"
      class="bid-input-field"
      min="0"
      max="${gameState.handCount}"
      placeholder="Enter your bid"
      data-player="${playerName}"
    />
    <div class="bid-feedback"></div>
  `;

  return container;
}

/**
 * Validate a single bid
 * @param {string} playerName - Name of the player
 * @param {number|null} bidValue - The bid value to validate
 * @returns {object} Validation result with status and message
 */
function validateBid(playerName, bidValue) {
  // Empty bid
  if (bidValue === null || bidValue === '' || bidValue === undefined) {
    return { isValid: false, status: 'empty', message: 'Please enter a bid' };
  }

  const numBid = Number(bidValue);

  // Invalid number
  if (isNaN(numBid) || !Number.isInteger(numBid)) {
    return { isValid: false, status: 'invalid', message: 'Bid must be a whole number' };
  }

  // Negative bid
  if (numBid < 0) {
    return { isValid: false, status: 'invalid', message: 'Bid cannot be negative' };
  }

  // Bid exceeds hand count
  if (numBid > gameState.handCount) {
    return { isValid: false, status: 'invalid', message: `Bid cannot exceed ${gameState.handCount}` };
  }

  return { isValid: true, status: 'valid', message: 'Bid accepted' };
}

/**
 * Update a player's bid in game state and UI
 * @param {string} playerName - Name of the player
 * @param {string} bidValue - The bid value from input
 */
function updatePlayerBid(playerName, bidValue) {
  // Update game state
  gameState.bids[playerName] = bidValue === '' ? null : Number(bidValue);

  // Validate and update UI
  const validation = validateBid(playerName, gameState.bids[playerName]);
  updateBidInputUI(playerName, validation);

  // Update button state
  updateProceedButtonState();
}

/**
 * Update the UI for a bid input based on validation result
 * @param {string} playerName - Name of the player
 * @param {object} validation - Validation result
 */
function updateBidInputUI(playerName, validation) {
  const container = document.getElementById(`bid-input-${playerName}`);
  if (!container) return;

  // Remove all validation classes
  container.classList.remove('empty', 'invalid', 'valid');
  // Add appropriate class
  container.classList.add(validation.status);

  // Update feedback message
  const feedback = container.querySelector('.bid-feedback');
  if (feedback) {
    feedback.textContent = validation.message;
  }
}

/**
 * Check if all bids are valid
 * @returns {boolean} True if all players have valid bids
 */
function areAllBidsValid() {
  return gameState.players.every(player => {
    const bid = gameState.bids[player];
    const validation = validateBid(player, bid);
    return validation.isValid;
  });
}

/**
 * Update the proceed button state based on bid validity
 */
function updateProceedButtonState() {
  const proceedBtn = document.getElementById('proceed-btn');
  if (!proceedBtn) return;

  const allValid = areAllBidsValid();
  proceedBtn.disabled = !allValid;
}

/**
 * Attach event listeners to bid inputs and buttons
 */
function attachBidEventListeners() {
  // Bid input listeners
  gameState.players.forEach(player => {
    const input = document.getElementById(`${player}-input`);
    if (input) {
      input.addEventListener('input', (e) => {
        updatePlayerBid(player, e.target.value);
      });
      input.addEventListener('change', (e) => {
        updatePlayerBid(player, e.target.value);
      });
    }
  });

  // Proceed button listener
  const proceedBtn = document.getElementById('proceed-btn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', handleProceedBids);
  }

  // Reset button listener
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetBids);
  }
}

/**
 * Handle proceed button click
 */
function handleProceedBids() {
  if (!areAllBidsValid()) {
    console.warn('Cannot proceed: not all bids are valid');
    return;
  }

  // Dispatch custom event with bids
  const event = new CustomEvent('bidsConfirmed', {
    detail: { bids: { ...gameState.bids }, round: gameState.currentRound }
  });
  document.dispatchEvent(event);
}

/**
 * Handle reset button click
 */
function handleResetBids() {
  gameState.players.forEach(player => {
    gameState.bids[player] = null;
    const input = document.getElementById(`${player}-input`);
    if (input) {
      input.value = '';
    }
    const validation = validateBid(player, null);
    updateBidInputUI(player, validation);
  });
  updateProceedButtonState();
}

/**
 * Get the current bids (useful for external integration)
 * @returns {object} Current bids object
 */
function getBids() {
  return { ...gameState.bids };
}

/**
 * Get current game state (useful for debugging/testing)
 * @returns {object} Current game state
 */
function getGameState() {
  return { ...gameState };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeBidPhase,
    renderBidPhaseUI,
    updatePlayerBid,
    handleProceedBids,
    handleResetBids,
    getBids,
    getGameState,
    validateBid,
    areAllBidsValid
  };
}
