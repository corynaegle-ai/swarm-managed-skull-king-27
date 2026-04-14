/**
 * Bid Phase Manager
 * Handles bid collection UI, validation, and state management
 */

// Global game state for bid collection
const gameState = {
  currentRound: 1,
  handCount: 1,
  players: [
    { id: 'player-1', name: 'Player 1', bid: null },
    { id: 'player-2', name: 'Player 2', bid: null },
    { id: 'player-3', name: 'Player 3', bid: null },
    { id: 'player-4', name: 'Player 4', bid: null }
  ],
  bids: {}
};

/**
 * Initialize bid phase UI
 */
function initializeBidPhase() {
  const container = document.getElementById('bid-phase-container');
  if (!container) {
    console.error('Bid phase container not found');
    return;
  }

  container.innerHTML = '';
  renderBidInfo();
  renderPlayerBidInputs();
  renderBidControls();
  updateGameStatus();
}

/**
 * Render round info and hand count display
 */
function renderBidInfo() {
  const container = document.getElementById('bid-phase-container');
  const infoSection = document.createElement('div');
  infoSection.className = 'bid-info-section';
  infoSection.innerHTML = `
    <div class="bid-round-info">
      <h2>Round ${gameState.currentRound}</h2>
      <p>Hand Count: <span class="hand-count-value">${gameState.handCount}</span></p>
    </div>
  `;
  container.appendChild(infoSection);
}

/**
 * Render player bid input fields
 */
function renderPlayerBidInputs() {
  const container = document.getElementById('bid-phase-container');
  const playersSection = document.createElement('div');
  playersSection.className = 'bid-players-section';

  gameState.players.forEach(player => {
    const playerInput = document.createElement('div');
    playerInput.className = 'player-bid-input empty';
    playerInput.id = `bid-input-${player.id}`;
    playerInput.innerHTML = `
      <label class="bid-label" for="input-${player.id}">${player.name}</label>
      <input
        type="number"
        id="input-${player.id}"
        class="bid-input-field"
        min="0"
        max="${gameState.handCount}"
        placeholder="Enter bid (0-${gameState.handCount})"
        aria-label="Bid for ${player.name}"
      />
      <div class="bid-feedback"></div>
    `;
    playersSection.appendChild(playerInput);

    // Add event listener for bid input
    const inputField = playerInput.querySelector('.bid-input-field');
    inputField.addEventListener('input', (e) => handleBidInput(player.id, e));
  });

  container.appendChild(playersSection);
}

/**
 * Handle bid input and validation
 */
function handleBidInput(playerId, event) {
  const bidValue = event.target.value.trim();
  const inputContainer = document.getElementById(`bid-input-${playerId}`);
  const feedbackElement = inputContainer.querySelector('.bid-feedback');

  // Update game state
  gameState.bids[playerId] = bidValue ? parseInt(bidValue) : null;

  // Validation logic
  if (!bidValue) {
    // Empty state
    inputContainer.className = 'player-bid-input empty';
    feedbackElement.textContent = 'Bid required';
  } else {
    const bid = parseInt(bidValue);
    if (bid < 0 || bid > gameState.handCount) {
      // Invalid state - exceeds hand count
      inputContainer.className = 'player-bid-input invalid';
      feedbackElement.textContent = `Bid must be 0-${gameState.handCount}`;
    } else {
      // Valid state
      inputContainer.className = 'player-bid-input valid';
      feedbackElement.textContent = `✓ Bid: ${bid}`;
    }
  }

  // Update proceed button state
  updateProceedButton();
}

/**
 * Render bid control buttons
 */
function renderBidControls() {
  const container = document.getElementById('bid-phase-container');
  const controlsSection = document.createElement('div');
  controlsSection.className = 'bid-controls-section';
  controlsSection.innerHTML = `
    <button class="bid-button bid-proceed-btn" id="proceed-btn" disabled>
      Confirm Bids
    </button>
    <button class="bid-button bid-reset-btn" id="reset-btn">
      Reset
    </button>
  `;
  container.appendChild(controlsSection);

  // Add event listeners
  document.getElementById('proceed-btn').addEventListener('click', handleProceed);
  document.getElementById('reset-btn').addEventListener('click', handleReset);
}

/**
 * Update proceed button state based on bid validation
 */
function updateProceedButton() {
  const proceedBtn = document.getElementById('proceed-btn');
  const allBidsValid = areAllBidsValid();
  proceedBtn.disabled = !allBidsValid;
}

/**
 * Check if all bids are valid and complete
 */
function areAllBidsValid() {
  return gameState.players.every(player => {
    const bid = gameState.bids[player.id];
    return bid !== null && bid !== undefined && bid >= 0 && bid <= gameState.handCount;
  });
}

/**
 * Handle proceed button click
 */
function handleProceed() {
  if (!areAllBidsValid()) {
    alert('Please ensure all bids are valid before proceeding.');
    return;
  }

  console.log('Bids confirmed:', gameState.bids);
  alert('Bids have been submitted!');
  // In a real application, this would trigger the next game phase
}

/**
 * Handle reset button click
 */
function handleReset() {
  // Clear all bids
  gameState.players.forEach(player => {
    gameState.bids[player.id] = null;
    const inputField = document.getElementById(`input-${player.id}`);
    if (inputField) {
      inputField.value = '';
    }
  });

  // Re-render to update UI state
  gameState.players.forEach(player => {
    const inputContainer = document.getElementById(`bid-input-${player.id}`);
    const feedbackElement = inputContainer.querySelector('.bid-feedback');
    inputContainer.className = 'player-bid-input empty';
    feedbackElement.textContent = 'Bid required';
  });

  updateProceedButton();
}

/**
 * Update game status display
 */
function updateGameStatus() {
  const statusElement = document.getElementById('game-status');
  if (statusElement) {
    statusElement.textContent = `Round ${gameState.currentRound} - Bid Collection Phase`;
  }
}

/**
 * Set up game with specific parameters
 */
function setupGame(roundNumber, handCount, playerNames = []) {
  gameState.currentRound = roundNumber || 1;
  gameState.handCount = handCount || 1;

  if (playerNames && playerNames.length > 0) {
    gameState.players = playerNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name: name,
      bid: null
    }));
  }

  gameState.bids = {};
  initializeBidPhase();
}

/**
 * Get current bid state
 */
function getBidState() {
  return {
    round: gameState.currentRound,
    handCount: gameState.handCount,
    bids: { ...gameState.bids },
    allValid: areAllBidsValid()
  };
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Set default game parameters
  setupGame(1, 1, ['Player 1', 'Player 2', 'Player 3', 'Player 4']);
});
