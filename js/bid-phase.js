/**
 * Bid Phase UI and Validation Module
 * Handles bid collection interface, validation, and state management
 */

// Game state object for storing bids
const gameState = {
  currentRound: 1,
  handCount: 13,
  players: [
    { id: 1, name: 'Player 1', bid: null },
    { id: 2, name: 'Player 2', bid: null },
    { id: 3, name: 'Player 3', bid: null },
    { id: 4, name: 'Player 4', bid: null }
  ]
};

/**
 * Initialize the bid phase interface
 */
function initializeBidPhase() {
  const bidPhaseContainer = document.getElementById('bid-phase-container');
  const gameStatusDiv = document.getElementById('game-status');

  if (!bidPhaseContainer) {
    console.error('bid-phase-container element not found');
    return;
  }

  // Clear previous content
  bidPhaseContainer.innerHTML = '';

  // Update game status
  gameStatusDiv.textContent = `Round ${gameState.currentRound} - Bid Phase`;

  // Create bid info section
  const bidInfoSection = createBidInfoSection();
  bidPhaseContainer.appendChild(bidInfoSection);

  // Create players bid section
  const bidPlayersSection = createBidPlayersSection();
  bidPhaseContainer.appendChild(bidPlayersSection);

  // Create controls section
  const bidControlsSection = createBidControlsSection();
  bidPhaseContainer.appendChild(bidControlsSection);
}

/**
 * Create the bid info section showing round and hand count
 */
function createBidInfoSection() {
  const section = document.createElement('div');
  section.className = 'bid-info-section';

  const roundDiv = document.createElement('div');
  roundDiv.className = 'bid-round-info';

  const roundTitle = document.createElement('h2');
  roundTitle.textContent = `Round ${gameState.currentRound}`;
  roundDiv.appendChild(roundTitle);

  const handCountPara = document.createElement('p');
  handCountPara.innerHTML = `Hand Count: <span class="hand-count-value">${gameState.handCount}</span>`;
  roundDiv.appendChild(handCountPara);

  section.appendChild(roundDiv);
  return section;
}

/**
 * Create the players bid input section
 */
function createBidPlayersSection() {
  const section = document.createElement('div');
  section.className = 'bid-players-section';

  gameState.players.forEach((player) => {
    const playerBidDiv = createPlayerBidInput(player);
    section.appendChild(playerBidDiv);
  });

  return section;
}

/**
 * Create a single player bid input element
 */
function createPlayerBidInput(player) {
  const playerDiv = document.createElement('div');
  playerDiv.className = 'player-bid-input empty';
  playerDiv.id = `player-bid-${player.id}`;

  const label = document.createElement('label');
  label.className = 'bid-label';
  label.htmlFor = `bid-input-${player.id}`;
  label.textContent = player.name;
  playerDiv.appendChild(label);

  const input = document.createElement('input');
  input.type = 'number';
  input.id = `bid-input-${player.id}`;
  input.className = 'bid-input-field';
  input.min = '0';
  input.max = gameState.handCount;
  input.placeholder = `Enter bid (0-${gameState.handCount})`;
  input.value = player.bid || '';
  input.addEventListener('input', (e) => handleBidInput(e, player.id));
  playerDiv.appendChild(input);

  const feedback = document.createElement('div');
  feedback.className = 'bid-feedback';
  feedback.id = `feedback-${player.id}`;
  playerDiv.appendChild(feedback);

  return playerDiv;
}

/**
 * Handle bid input changes
 */
function handleBidInput(event, playerId) {
  const input = event.target;
  const bidValue = input.value.trim();
  const playerBidDiv = document.getElementById(`player-bid-${playerId}`);
  const feedbackDiv = document.getElementById(`feedback-${playerId}`);

  // Find the player
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return;

  // Remove all state classes
  playerBidDiv.classList.remove('empty', 'valid', 'invalid');
  feedbackDiv.textContent = '';

  // Handle empty input
  if (bidValue === '' || bidValue === null) {
    playerBidDiv.classList.add('empty');
    feedbackDiv.textContent = 'Bid required';
    player.bid = null;
    updateProceedButton();
    return;
  }

  // Parse bid value
  const bidNum = parseInt(bidValue, 10);

  // Validate bid is a number
  if (isNaN(bidNum)) {
    playerBidDiv.classList.add('invalid');
    feedbackDiv.textContent = 'Invalid input';
    player.bid = null;
    updateProceedButton();
    return;
  }

  // Validate bid doesn't exceed hand count
  if (bidNum > gameState.handCount) {
    playerBidDiv.classList.add('invalid');
    feedbackDiv.textContent = `Cannot exceed hand count (${gameState.handCount})`;
    player.bid = null;
    updateProceedButton();
    return;
  }

  // Validate bid is not negative
  if (bidNum < 0) {
    playerBidDiv.classList.add('invalid');
    feedbackDiv.textContent = 'Bid cannot be negative';
    player.bid = null;
    updateProceedButton();
    return;
  }

  // Valid bid
  playerBidDiv.classList.add('valid');
  feedbackDiv.textContent = '✓ Valid';
  player.bid = bidNum;
  updateProceedButton();
}

/**
 * Update proceed button state based on bid validity
 */
function updateProceedButton() {
  const proceedBtn = document.getElementById('bid-proceed-btn');
  if (!proceedBtn) return;

  // Check if all players have valid bids
  const allValid = gameState.players.every(player => player.bid !== null);
  proceedBtn.disabled = !allValid;
}

/**
 * Create the bid controls section
 */
function createBidControlsSection() {
  const section = document.createElement('div');
  section.className = 'bid-controls-section';

  const proceedBtn = document.createElement('button');
  proceedBtn.id = 'bid-proceed-btn';
  proceedBtn.className = 'bid-button bid-proceed-btn';
  proceedBtn.textContent = 'Confirm Bids';
  proceedBtn.disabled = true;
  proceedBtn.addEventListener('click', handleProceedBids);
  section.appendChild(proceedBtn);

  const resetBtn = document.createElement('button');
  resetBtn.id = 'bid-reset-btn';
  resetBtn.className = 'bid-button bid-reset-btn';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', handleResetBids);
  section.appendChild(resetBtn);

  return section;
}

/**
 * Handle proceed bids button click
 */
function handleProceedBids() {
  console.log('Bids confirmed:', gameState.players.map(p => ({
    name: p.name,
    bid: p.bid
  })));
  // Dispatch custom event for game flow integration
  const event = new CustomEvent('bidsConfirmed', {
    detail: { bids: gameState.players.map(p => ({ id: p.id, bid: p.bid })) }
  });
  document.dispatchEvent(event);
}

/**
 * Handle reset bids button click
 */
function handleResetBids() {
  gameState.players.forEach(player => {
    player.bid = null;
    const input = document.getElementById(`bid-input-${player.id}`);
    if (input) {
      input.value = '';
    }
  });
  initializeBidPhase();
}

/**
 * Update the bid phase with new round and hand count
 */
function updateBidPhase(round, handCount, players) {
  gameState.currentRound = round;
  gameState.handCount = handCount;
  if (players && Array.isArray(players)) {
    gameState.players = players.map(p => ({
      id: p.id || p.playerId,
      name: p.name || `Player ${p.id || p.playerId}`,
      bid: null
    }));
  }
  initializeBidPhase();
}

/**
 * Get current bids from game state
 */
function getBids() {
  return gameState.players.map(p => ({
    playerId: p.id,
    playerName: p.name,
    bid: p.bid
  }));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeBidPhase);
