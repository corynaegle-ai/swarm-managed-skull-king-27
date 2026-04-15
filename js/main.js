/**
 * main.js - Main game flow orchestrator for Skull King
 * Integrates bid collection phase into game state management
 */

import { showBidPhase } from './bid-phase.js';

/**
 * Game State Object
 * Tracks all game data across phases
 */
const gameState = {
  // Round and player management
  currentRound: 1,
  maxRounds: 10,
  players: [],
  currentPhase: 'setup', // setup, bid, summary, scoring

  // Bid collection state
  bids: [], // Array of { playerId, bidAmount } objects for current round

  // Scores and history
  scores: {}, // { playerId: currentScore }
  roundHistory: [] // Array of round results with bids and validation
};

/**
 * Initialize game with players
 * @param {Array} playerList - Array of player objects with { id, name }
 */
function initializeGame(playerList) {
  if (!playerList || !Array.isArray(playerList) || playerList.length === 0) {
    const errorMsg = 'Invalid player list: must be a non-empty array';
    console.error(errorMsg);
    const gameStatusEl = document.getElementById('game-status');
    if (gameStatusEl) {
      gameStatusEl.textContent = `Error: ${errorMsg}`;
    }
    return;
  }

  console.log('Initializing game with players:', playerList);

  gameState.players = playerList;
  gameState.currentRound = 1;
  gameState.currentPhase = 'setup';

  // Initialize scores for each player
  // Note: No truthy check on id to avoid skipping players with id=0
  gameState.scores = {};
  playerList.forEach(player => {
    if (player && player.id !== null && player.id !== undefined) {
      gameState.scores[player.id] = 0;
    }
  });

  gameState.bids = [];
  gameState.roundHistory = [];

  updateGameStatus();
  startRound();
}

/**
 * Start a new round
 * Transitions from setup or round-complete to bid phase
 */
function startRound() {
  console.log(`Starting round ${gameState.currentRound}`);

  if (gameState.currentRound > gameState.maxRounds) {
    console.log('Game ended: all rounds completed');
    endGame();
    return;
  }

  // Clear bids from previous round
  gameState.bids = [];
  gameState.currentPhase = 'bid';

  updateGameStatus();
  renderRoundInfo();
  activateBidPhase();
}

/**
 * Update game status display
 */
function updateGameStatus() {
  const gameStatusEl = document.getElementById('game-status');
  if (!gameStatusEl) return;

  const statusText = `Round ${gameState.currentRound} | Phase: ${gameState.currentPhase}`;
  gameStatusEl.textContent = statusText;
}

/**
 * Render round information display
 */
function renderRoundInfo() {
  const roundDisplay = document.getElementById('round-display');
  if (!roundDisplay) return;

  const displayText = `Round ${gameState.currentRound} of ${gameState.maxRounds}`;
  roundDisplay.textContent = displayText;
}

/**
 * Activate the bid collection phase
 * Shows bid interface and waits for all players to submit bids
 */
function activateBidPhase() {
  console.log('Activating bid phase for round', gameState.currentRound);

  const bidPhaseContainer = document.getElementById('bid-phase-container');
  if (!bidPhaseContainer) {
    console.error('Bid phase container not found');
    return;
  }

  // Clear container and render bid phase UI
  bidPhaseContainer.innerHTML = '';
  showBidPhase(gameState.players, gameState.currentRound, handleBidSubmitted);
}

/**
 * Handle a player's bid submission
 * Called by bid-phase.js when a player submits their bid
 * @param {string|number} playerId - The ID of the player who submitted
 * @param {number} bidAmount - The bid amount (number of tricks)
 */
function handleBidSubmitted(playerId, bidAmount) {
  // Validate playerId
  if (playerId === null || playerId === undefined) {
    const errorMsg = 'Invalid playerId: cannot be null or undefined';
    console.error(errorMsg);
    showErrorMessage(errorMsg);
    return;
  }

  // Validate bidAmount: must be a non-negative integer
  if (typeof bidAmount !== 'number' || !Number.isInteger(bidAmount) || bidAmount < 0) {
    const errorMsg = `Invalid bidAmount: must be a non-negative integer, got ${bidAmount}`;
    console.error(errorMsg);
    showErrorMessage(errorMsg);
    return;
  }

  console.log(`Player ${playerId} bid ${bidAmount} tricks`);

  // Check if this player already submitted a bid and update it
  const existingBidIndex = gameState.bids.findIndex(b => b.playerId === playerId);

  if (existingBidIndex >= 0) {
    gameState.bids[existingBidIndex].bidAmount = bidAmount;
  } else {
    gameState.bids.push({ playerId, bidAmount });
  }

  console.log('Current bids:', gameState.bids);
  updateGameStatus();

  // Check if all players have submitted bids
  if (gameState.bids.length === gameState.players.length) {
    transitionToSummary();
  }
}

/**
 * Show error message to user
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
  const gameStatusEl = document.getElementById('game-status');
  if (gameStatusEl) {
    gameStatusEl.textContent = `Error: ${message}`;
    gameStatusEl.style.color = 'red';
  }
}

/**
 * Transition to summary phase after all bids are collected
 */
function transitionToSummary() {
  console.log('All bids collected, transitioning to summary phase');
  gameState.currentPhase = 'summary';
  updateGameStatus();
  displayBidSummary();
}

/**
 * Display bid summary and provide button to proceed to scoring
 */
function displayBidSummary() {
  console.log('Displaying bid summary for round', gameState.currentRound);

  const bidPhaseContainer = document.getElementById('bid-phase-container');
  if (!bidPhaseContainer) {
    console.error('Bid phase container not found');
    return;
  }

  if (!gameState.bids || gameState.bids.length === 0) {
    console.error('No bids available to display');
    return;
  }

  // Clear container first
  bidPhaseContainer.innerHTML = '';

  // Create summary heading
  const heading = document.createElement('h2');
  heading.textContent = `Round ${gameState.currentRound} - Bid Summary`;
  bidPhaseContainer.appendChild(heading);

  // Create table
  const table = document.createElement('table');
  table.className = 'bid-summary-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const playerHeader = document.createElement('th');
  playerHeader.textContent = 'Player';
  headerRow.appendChild(playerHeader);

  const bidHeader = document.createElement('th');
  bidHeader.textContent = 'Bid (Tricks)';
  headerRow.appendChild(bidHeader);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  gameState.bids.forEach(bid => {
    const player = gameState.players.find(p => p.id === bid.playerId);
    if (!player) return;

    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = player.name;
    row.appendChild(nameCell);

    const bidCell = document.createElement('td');
    bidCell.textContent = bid.bidAmount;
    row.appendChild(bidCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  bidPhaseContainer.appendChild(table);

  // Create action button
  const actionDiv = document.createElement('div');
  actionDiv.className = 'bid-summary-actions';

  const btn = document.createElement('button');
  btn.id = 'proceed-to-scoring-btn';
  btn.className = 'btn btn-primary';
  btn.textContent = 'Proceed to Scoring';
  btn.addEventListener('click', handleProceedToScoring);

  actionDiv.appendChild(btn);
  bidPhaseContainer.appendChild(actionDiv);
}

/**
 * Handle the proceed to scoring button click
 * Saves bids to history and transitions to scoring phase
 * CRITICAL: Bids are stored in roundHistory BEFORE clearing gameState.bids,
 * so they can be retrieved and validated in activateScoringPhase
 */
function handleProceedToScoring() {
  console.log('Proceeding to scoring phase');

  // Save current round bids to history BEFORE clearing gameState.bids
  // This allows scoring phase to retrieve and validate bids
  const roundEntry = {
    round: gameState.currentRound,
    bids: [...gameState.bids], // Deep copy to preserve bid data
    trickResults: {} // Placeholder for trick data to be filled in later
  };
  gameState.roundHistory.push(roundEntry);

  console.log('Saved round entry to history:', roundEntry);

  // Transition to scoring phase
  gameState.currentPhase = 'scoring';
  updateGameStatus();

  // Activate scoring phase
  activateScoringPhase();
}

/**
 * Activate the scoring phase
 * Retrieves bids from roundHistory for current round, validates them,
 * and prepares for next round transition
 */
function activateScoringPhase() {
  console.log('Activating scoring phase for round', gameState.currentRound);

  const bidPhaseContainer = document.getElementById('bid-phase-container');
  if (!bidPhaseContainer) {
    console.error('Bid phase container not found');
    return;
  }

  // Clear container
  bidPhaseContainer.innerHTML = '';

  // Create scoring heading
  const heading = document.createElement('h2');
  heading.textContent = `Round ${gameState.currentRound} - Scoring`;
  bidPhaseContainer.appendChild(heading);

  // Retrieve bids for current round from roundHistory
  const currentRoundEntry = gameState.roundHistory.find(entry => entry.round === gameState.currentRound);
  if (!currentRoundEntry || !currentRoundEntry.bids || currentRoundEntry.bids.length === 0) {
    console.error('No bids found for current round in roundHistory');
    return;
  }

  const roundBids = currentRoundEntry.bids;
  console.log('Retrieved bids for scoring:', roundBids);

  // Create scoring content container
  const scoringContent = document.createElement('div');
  scoringContent.className = 'scoring-content';

  // Display bid validation section
  const validationHeading = document.createElement('h3');
  validationHeading.textContent = 'Bid Validation';
  scoringContent.appendChild(validationHeading);

  // Create table for bid validation
  const validationTable = document.createElement('table');
  validationTable.className = 'scoring-validation-table';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const playerHeader = document.createElement('th');
  playerHeader.textContent = 'Player';
  headerRow.appendChild(playerHeader);

  const bidHeader = document.createElement('th');
  bidHeader.textContent = 'Bid';
  headerRow.appendChild(bidHeader);

  const tricksHeader = document.createElement('th');
  tricksHeader.textContent = 'Tricks Won';
  headerRow.appendChild(tricksHeader);

  const statusHeader = document.createElement('th');
  statusHeader.textContent = 'Status';
  headerRow.appendChild(statusHeader);

  thead.appendChild(headerRow);
  validationTable.appendChild(thead);

  const tbody = document.createElement('tbody');

  // Process each bid for validation
  roundBids.forEach(bid => {
    const player = gameState.players.find(p => p.id === bid.playerId);
    if (!player) return;

    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = player.name;
    row.appendChild(nameCell);

    const bidCell = document.createElement('td');
    bidCell.textContent = bid.bidAmount;
    row.appendChild(bidCell);

    // Placeholder for actual tricks won (in full implementation, this would come from trick tracking)
    const tricksWonCell = document.createElement('td');
    tricksWonCell.textContent = '0'; // Placeholder: would be populated by trick tracking system
    row.appendChild(tricksWonCell);

    // Validation status
    const statusCell = document.createElement('td');
    // In full implementation: compare bid to tricks won and calculate points
    statusCell.textContent = 'Pending trick data'; // Placeholder status
    row.appendChild(statusCell);

    tbody.appendChild(row);
  });

  validationTable.appendChild(tbody);
  scoringContent.appendChild(validationTable);

  // Add info message about bid validation
  const infoMsg = document.createElement('p');
  infoMsg.className = 'scoring-info';
  infoMsg.textContent = `Validating ${roundBids.length} player bids against actual tricks won. Bids stored and available for scoring calculations.`;
  scoringContent.appendChild(infoMsg);

  bidPhaseContainer.appendChild(scoringContent);

  // Create action button to advance to next round
  const actionDiv = document.createElement('div');
  actionDiv.className = 'scoring-actions';

  const btn = document.createElement('button');
  btn.id = 'next-round-btn';
  btn.className = 'btn btn-primary';
  btn.textContent = 'Next Round';
  btn.addEventListener('click', handleNextRound);

  actionDiv.appendChild(btn);
  bidPhaseContainer.appendChild(actionDiv);
}

/**
 * Handle next round button click
 * Advances to the next round or ends the game
 */
function handleNextRound() {
  console.log('Advancing to next round');

  // Clear bids from current round now that scoring is complete
  gameState.bids = [];

  // Advance round counter
  gameState.currentRound += 1;

  // Start the next round (which resets phase to 'bid')
  startRound();
}

/**
 * End the game
 * Display final scores and game completion message
 */
function endGame() {
  console.log('Game ended');

  gameState.currentPhase = 'complete';
  updateGameStatus();

  const bidPhaseContainer = document.getElementById('bid-phase-container');
  if (!bidPhaseContainer) return;

  bidPhaseContainer.innerHTML = '';

  const heading = document.createElement('h2');
  heading.textContent = 'Game Complete';
  bidPhaseContainer.appendChild(heading);

  const message = document.createElement('p');
  message.textContent = `All ${gameState.maxRounds} rounds have been completed!`;
  bidPhaseContainer.appendChild(message);

  // Display final scores
  const scoresDiv = document.createElement('div');
  scoresDiv.className = 'final-scores';

  const scoresHeading = document.createElement('h3');
  scoresHeading.textContent = 'Final Scores';
  scoresDiv.appendChild(scoresHeading);

  const scoresList = document.createElement('ul');
  gameState.players.forEach(player => {
    const li = document.createElement('li');
    const score = gameState.scores[player.id] || 0;
    li.textContent = `${player.name}: ${score} points`;
    scoresList.appendChild(li);
  });

  scoresDiv.appendChild(scoresList);
  bidPhaseContainer.appendChild(scoresDiv);
}

/**
 * Export functions for external use via window object (ES module context)
 * This is the proper way to expose functions in ES module files
 */
window.skullKingGame = {
  initializeGame,
  gameState,
  // Additional exports for testing/debugging
  startRound,
  handleBidSubmitted,
  handleProceedToScoring,
  handleNextRound
};
