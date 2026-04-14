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
  roundHistory: [] // Array of round results with bids
};

/**
 * Initialize game with players
 * @param {Array} playerList - Array of player objects with { id, name }
 */
function initializeGame(playerList) {
  if (!playerList || !Array.isArray(playerList) || playerList.length === 0) {
    console.error('Invalid player list provided to initializeGame');
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
  if (playerId === null || playerId === undefined) {
    console.error('Invalid playerId provided');
    return;
  }

  if (typeof bidAmount !== 'number' || bidAmount < 0) {
    console.error('Invalid bidAmount provided:', bidAmount);
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
    displayBidSummary();
  }
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
 * Transitions to scoring phase and processes round bids
 */
function handleProceedToScoring() {
  console.log('Proceeding to scoring phase');

  // Save current round bids to history (bids still available in gameState.bids)
  const roundEntry = {
    round: gameState.currentRound,
    bids: [...gameState.bids]
  };
  gameState.roundHistory.push(roundEntry);

  // Transition to scoring phase
  gameState.currentPhase = 'scoring';
  updateGameStatus();

  // Activate scoring phase
  activateScoringPhase();
}

/**
 * Activate the scoring phase
 * Processes bids, calculates scores, and prepares for next round
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

  // Create scoring content
  const scoringContent = document.createElement('div');
  scoringContent.className = 'scoring-content';

  // Show bids being validated
  const bidsList = document.createElement('p');
  bidsList.textContent = `Validating ${gameState.bids.length} player bids for scoring...`;
  scoringContent.appendChild(bidsList);

  // For now, stub out scoring logic - in full implementation, this would:
  // - Compare actual tricks won vs bids
  // - Calculate points based on game rules
  // - Update gameState.scores
  // - Display final scores for the round

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

  // Clear bids now that scoring is complete
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
 * Export functions for external use (e.g., test harness or UI controller)
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    gameState,
    initializeGame,
    startRound,
    updateGameStatus,
    renderRoundInfo,
    activateBidPhase,
    handleBidSubmitted,
    displayBidSummary,
    handleProceedToScoring,
    activateScoringPhase,
    handleNextRound,
    endGame
  };
}

// Game initialization hook - allows external code to initialize the game
// by calling window.skullKingGame.initializeGame(players)
window.skullKingGame = {
  initializeGame,
  gameState
};
