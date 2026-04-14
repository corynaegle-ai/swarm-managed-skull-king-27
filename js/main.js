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
  gameState.scores = {};
  playerList.forEach(player => {
    if (player && player.id) {
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
    return;
  }

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

  const existingBidIndex = gameState.bids.findIndex(b => b.playerId === playerId);

  if (existingBidIndex >= 0) {
    gameState.bids[existingBidIndex].bidAmount = bidAmount;
  } else {
    gameState.bids.push({ playerId, bidAmount });
  }

  console.log('Current bids:', gameState.bids);
  updateGameStatus();

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
 */
function handleProceedToScoring() {
  console.log('Proceeding to scoring phase');

  const roundEntry = {
    round: gameState.currentRound,
    bids: [...gameState.bids]
  };
  gameState.roundHistory.push(roundEntry);

  gameState.bids = [];
  gameState.currentPhase = 'scoring';
}

// Initialize game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const testPlayers = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'Diana' }
  ];

  initializeGame(testPlayers);
});
