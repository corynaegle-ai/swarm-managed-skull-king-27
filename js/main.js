/**
 * main.js - Main game flow orchestrator for Skull King
 * Integrates bid collection phase with game state management
 */

import { showBidPhase } from './bid-phase.js';

/**
 * Utility function to escape HTML special characters for safe DOM insertion
 * Prevents XSS vulnerabilities when displaying user-provided content
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for innerHTML
 */
function escapeHTML(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, char => map[char]);
}

/**
 * Game State Object
 * Tracks all game data across phases
 */
const gameState = {
  // Round and player management
  currentRound: 1,
  maxRounds: 10, // Skull King standard: 10 rounds
  players: [],
  currentPhase: 'setup', // setup, bid, summary, scoring, round-complete, game-end

  // Bid collection state
  bids: [], // Array of { playerId, bidAmount } objects for current round

  // Scores and history
  scores: {}, // { playerId: currentScore }
  roundHistory: [], // Array of round results with bids and actual tricks

  // UI and control state
  isTransitioning: false
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

  // Initialize empty bids array and round history
  gameState.bids = [];
  gameState.roundHistory = [];
  gameState.isTransitioning = false;

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
    endGame();
    return;
  }

  // Reset bids for new round
  gameState.bids = [];
  gameState.currentPhase = 'bid';
  gameState.isTransitioning = false;

  updateGameStatus();
  renderRoundInfo();
  activateBidPhase();
}

/**
 * Render round information display
 */
function renderRoundInfo() {
  const roundDisplay = document.getElementById('round-display');
  if (!roundDisplay) {
    console.error('round-display element not found in DOM');
    return;
  }

  const phaseText = gameState.currentPhase.charAt(0).toUpperCase() + gameState.currentPhase.slice(1);
  roundDisplay.textContent = `Round ${gameState.currentRound} of ${gameState.maxRounds} | Phase: ${phaseText}`;
}

/**
 * Activate the bid collection phase
 * Shows bid interface and waits for all players to submit bids
 */
function activateBidPhase() {
  console.log('Activating bid phase for round', gameState.currentRound);

  const bidPhaseContainer = document.getElementById('bid-phase-container');
  if (!bidPhaseContainer) {
    console.error('Bid phase container (#bid-phase-container) not found in DOM');
    return;
  }

  // Clear any existing content
  bidPhaseContainer.innerHTML = '';

  // Call showBidPhase from bid-phase.js with proper callback
  // Expected signature: showBidPhase(players, round, onBidCallback)
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
    console.error('Invalid playerId provided to handleBidSubmitted');
    return;
  }

  if (typeof bidAmount !== 'number' || bidAmount < 0) {
    console.error('Invalid bidAmount provided:', bidAmount);
    return;
  }

  console.log(`Player ${playerId} bid ${bidAmount} tricks`);

  // Check if player already has a bid
  const existingBidIndex = gameState.bids.findIndex(b => b.playerId === playerId);

  if (existingBidIndex >= 0) {
    // Update existing bid
    gameState.bids[existingBidIndex].bidAmount = bidAmount;
  } else {
    // Add new bid
    gameState.bids.push({
      playerId: playerId,
      bidAmount: bidAmount
    });
  }

  console.log('Current bids:', gameState.bids);
  updateGameStatus();

  // Check if all players have submitted bids
  checkAllBidsSubmitted();
}

/**
 * Check if all players have submitted their bids
 * If yes, transition to summary phase
 */
function checkAllBidsSubmitted() {
  const allPlayersCount = gameState.players.length;
  const bidsCount = gameState.bids.length;

  console.log(`Bids submitted: ${bidsCount}/${allPlayersCount}`);

  if (bidsCount === allPlayersCount) {
    handleAllBidsSubmitted();
  }
}

/**
 * Handle when all players have submitted bids
 * Transition to summary phase to display bids
 */
function handleAllBidsSubmitted() {
  console.log('All bids submitted for round', gameState.currentRound);

  gameState.currentPhase = 'summary';
  updateGameStatus();
  displayBidSummary();
}

/**
 * Display bid summary and provide button to proceed to scoring
 * User must confirm with button click to transition to scoring phase
 */
function displayBidSummary() {
  console.log('Displaying bid summary for round', gameState.currentRound);

  const bidPhaseContainer = document.getElementById('bid-phase-container');
  if (!bidPhaseContainer) {
    console.error('Bid phase container (#bid-phase-container) not found in DOM');
    return;
  }

  // Validate we have bids
  if (!gameState.bids || gameState.bids.length === 0) {
    console.error('No bids available to display');
    return;
  }

  // Build bid summary HTML with escaped player names
  const bidSummaryRows = gameState.bids.map(bid => {
    const player = gameState.players.find(p => p.id === bid.playerId);
    if (!player) {
      console.warn(`Player with id ${bid.playerId} not found`);
      return '';
    }
    const escapedName = escapeHTML(player.name);
    return `
      <tr>
        <td>${escapedName}</td>
        <td>${bid.bidAmount}</td>
      </tr>
    `;
  }).join('');

  const summaryHTML = `
    <div class="bid-summary">
      <h2>Round ${gameState.currentRound} - Bid Summary</h2>
      <table class="bid-summary-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Bid (Tricks)</th>
          </tr>
        </thead>
        <tbody>
          ${bidSummaryRows}
        </tbody>
      </table>
      <div class="bid-summary-actions">
        <button id="proceed-to-scoring-btn" class="btn btn-primary">Proceed to Scoring</button>
      </div>
    </div>
  `;

  // Create a wrapper div and insert summary without replacing container
  const summaryWrapper = document.createElement('div');
  summaryWrapper.innerHTML = summaryHTML;
  bidPhaseContainer.appendChild(summaryWrapper);

  // Attach event listener to proceed button
  const proceedBtn = document.getElementById('proceed-to-scoring-btn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', handleProceedToScoring);
  }
}

/**
 * Handle the proceed to scoring button click
 * User-driven transition to scoring phase
 */
function handleProceedToScoring() {
  console.log('User confirmed: proceeding to scoring phase from round', gameState.currentRound);

  // Validate that we have bids stored
  if (!gameState.bids || gameState.bids.length === 0) {
    console.error('No bids available for scoring');
    return;
  }

  // Persist bids to round history BEFORE clearing them
  persistRoundBids();

  // Transition to scoring phase
  transitionToScoringPhase();
}

/**
 * Persist the current round's bids to round history
 * This ensures bids are stored for validation before being reset
 */
function persistRoundBids() {
  console.log('Persisting bids for round', gameState.currentRound);

  const roundRecord = {
    round: gameState.currentRound,
    bids: gameState.bids.map(bid => ({
      playerId: bid.playerId,
      bidAmount: bid.bidAmount
    })),
    timestamp: new Date().toISOString()
  };

  gameState.roundHistory.push(roundRecord);
  console.log('Round history updated:', gameState.roundHistory);
}

/**
 * Transition to the scoring phase
 * Clear bid interface and show scoring interface
 */
function transitionToScoringPhase() {
  if (gameState.isTransitioning) {
    console.warn('Transition already in progress');
    return;
  }

  gameState.isTransitioning = true;
  gameState.currentPhase = 'scoring';

  console.log('Transitioning to scoring phase for round', gameState.currentRound);
  updateGameStatus();

  // Hide bid phase container and show scoring phase container
  const bidPhaseContainer = document.getElementById('bid-phase-container');
  const scoringPhaseContainer = document.getElementById('scoring-phase-container');

  if (bidPhaseContainer) {
    bidPhaseContainer.style.display = 'none';
  }

  if (scoringPhaseContainer) {
    scoringPhaseContainer.style.display = 'block';
    // TODO: Initialize scoring phase interface here when scoring-phase.js is implemented
    // For now, auto-complete after delay
    setTimeout(() => {
      completeRound();
    }, 2000);
  }
}

/**
 * Complete the current round and prepare for next round
 */
function completeRound() {
  console.log('Completing round', gameState.currentRound);

  // Move to next round
  gameState.currentRound += 1;
  gameState.currentPhase = 'round-complete';
  gameState.isTransitioning = false;

  updateGameStatus();

  // Start next round or end game
  if (gameState.currentRound <= gameState.maxRounds) {
    setTimeout(() => {
      startRound();
    }, 2000);
  } else {
    endGame();
  }
}

/**
 * End the game and display final scores
 */
function endGame() {
  console.log('Game ended after', gameState.currentRound - 1, 'rounds');

  gameState.currentPhase = 'game-end';
  updateGameStatus();

  const gameStatusDiv = document.getElementById('game-status');
  if (gameStatusDiv) {
    gameStatusDiv.textContent = 'Game Complete!';
  }

  // Display final scores
  displayFinalScores();
}

/**
 * Display final scores sorted by rank
 */
function displayFinalScores() {
  const finalScoresContainer = document.getElementById('final-scores-container');
  const gamePhaseContainer = document.getElementById('game-phase-container');

  if (!finalScoresContainer || !gamePhaseContainer) {
    console.error('Final scores containers not found in DOM');
    return;
  }

  // Hide game phase containers
  gamePhaseContainer.style.display = 'none';
  finalScoresContainer.style.display = 'block';

  // Sort players by final score (descending)
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    const scoreA = gameState.scores[a.id] || 0;
    const scoreB = gameState.scores[b.id] || 0;
    return scoreB - scoreA;
  });

  // Build final scores HTML with escaped player names
  const finalScoresHtml = sortedPlayers.map((player, index) => {
    const escapedName = escapeHTML(player.name);
    const score = gameState.scores[player.id] || 0;
    return `
      <div class="final-score-row" data-rank="${index + 1}">
        <span class="rank">${index + 1}.</span>
        <span class="player-name">${escapedName}</span>
        <span class="final-score">${score}</span>
      </div>
    `;
  }).join('');

  const finalScoresDisplay = document.getElementById('final-scores-display');
  if (finalScoresDisplay) {
    finalScoresDisplay.innerHTML = `
      <h2>Final Scores</h2>
      <div class="final-scores-list">
        ${finalScoresHtml}
      </div>
      <button id="new-game-btn" class="btn btn-primary">Start New Game</button>
    `;

    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', handleNewGame);
    }
  }
}

/**
 * Render current player scores
 */
function renderPlayerScores() {
  const scoresDisplay = document.getElementById('scores-display');
  if (!scoresDisplay) {
    console.error('scores-display element not found in DOM');
    return;
  }

  const scoresHtml = gameState.players.map(player => {
    const escapedName = escapeHTML(player.name);
    const score = gameState.scores[player.id] || 0;
    return `
      <div class="player-score-row">
        <span class="player-name">${escapedName}</span>
        <span class="player-score">${score}</span>
      </div>
    `;
  }).join('');

  scoresDisplay.innerHTML = `
    <table class="scores-table">
      <thead>
        <tr>
          <th>Player</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        ${scoresHtml}
      </tbody>
    </table>
  `;
}

/**
 * Update the game status display
 */
function updateGameStatus() {
  const gameStatusDiv = document.getElementById('game-status');
  if (!gameStatusDiv) return;

  let statusHTML = `<p>Round: ${gameState.currentRound}/${gameState.maxRounds} | Phase: ${gameState.currentPhase}</p>`;

  if (gameState.currentPhase === 'bid' && gameState.bids.length > 0) {
    statusHTML += `<p>Bids Collected: ${gameState.bids.length}/${gameState.players.length}</p>`;
  }

  gameStatusDiv.innerHTML = statusHTML;
}

/**
 * Handle new game button click
 */
function handleNewGame() {
  console.log('Starting new game');
  initializeGame(gameState.players);
}

/**
 * Get the current game state (read-only copy)
 * @returns {Object} Copy of current game state
 */
function getGameState() {
  return JSON.parse(JSON.stringify(gameState));
}

/**
 * Get bids for the current round
 * @returns {Array} Array of { playerId, bidAmount } objects
 */
function getCurrentRoundBids() {
  return gameState.bids.map(bid => ({ ...bid }));
}

/**
 * Get the round history
 * @returns {Array} Array of round result objects with bids
 */
function getRoundHistory() {
  return JSON.parse(JSON.stringify(gameState.roundHistory));
}

// Export functions for use in other modules
export {
  initializeGame,
  getGameState,
  getCurrentRoundBids,
  getRoundHistory,
  startRound,
  activateBidPhase,
  handleBidSubmitted,
  handleAllBidsSubmitted,
  transitionToScoringPhase,
  renderPlayerScores,
  displayBidSummary
};

// Initialize game on page load with test players
// This can be overridden by external game setup interface
window.addEventListener('DOMContentLoaded', () => {
  const testPlayers = [
    { id: 1, name: 'Player 1' },
    { id: 2, name: 'Player 2' },
    { id: 3, name: 'Player 3' },
    { id: 4, name: 'Player 4' }
  ];
  initializeGame(testPlayers);
});
