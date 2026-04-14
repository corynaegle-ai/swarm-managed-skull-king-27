/**
 * main.js - Main game flow orchestrator for Skull King
 * Integrates bid collection phase with game state management
 */

// Import bid phase functions (assuming bid-phase.js is loaded before this)
// Note: In a real module system, we would use: import { showBidPhase, getBidPhaseState } from './bid-phase.js';

/**
 * Game State Object
 * Tracks all game data across phases
 */
const gameState = {
  // Round and player management
  currentRound: 1,
  maxRounds: 13,
  players: [],
  currentPhase: 'setup', // setup, bid, scoring, round-complete

  // Bid collection state
  bids: [], // Array of { playerId, bidAmount } objects

  // Scores and history
  scores: {}, // { playerId: currentScore }
  roundHistory: [], // Array of round results with bids and actual tricks

  // UI and control state
  isTransitioning: false,
  bidPhaseSummary: null
};

/**
 * Initialize game with players
 * @param {Array} playerList - Array of player objects with { id, name }
 */
function initializeGame(playerList) {
  console.log('Initializing game with players:', playerList);

  gameState.players = playerList;
  gameState.currentRound = 1;
  gameState.currentPhase = 'setup';

  // Initialize scores for each player
  gameState.scores = {};
  playerList.forEach(player => {
    gameState.scores[player.id] = 0;
  });

  // Initialize empty bids array
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
    endGame();
    return;
  }

  // Reset bids for new round
  gameState.bids = [];
  gameState.currentPhase = 'bid';
  gameState.bidPhaseSummary = null;

  updateGameStatus();
  activateBidPhase();
}

/**
 * Activate the bid collection phase
 * Shows bid interface and waits for all players to submit bids
 */
function activateBidPhase() {
  console.log('Activating bid phase for round', gameState.currentRound);

  const bidPhaseContainer = document.getElementById('bid-phase-container');
  if (!bidPhaseContainer) {
    console.error('Bid phase container not found in DOM');
    return;
  }

  // Check if bid phase functions are available (from bid-phase.js)
  if (typeof showBidPhase !== 'function') {
    console.error('showBidPhase function not available. Make sure bid-phase.js is loaded.');
    return;
  }

  // Show bid collection interface
  showBidPhase({
    round: gameState.currentRound,
    players: gameState.players,
    onBidSubmitted: handleBidSubmitted,
    onBidPhaseComplete: handleBidPhaseComplete
  });
}

/**
 * Handle a single player's bid submission
 * @param {string} playerId - The ID of the player who submitted
 * @param {number} bidAmount - The bid amount
 */
function handleBidSubmitted(playerId, bidAmount) {
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

  // Check if all players have submitted bids
  checkAllBidsSubmitted();
}

/**
 * Check if all players have submitted their bids
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
 * Show summary and prepare for scoring phase
 */
function handleAllBidsSubmitted() {
  console.log('All bids submitted for round', gameState.currentRound);

  // Create bid summary
  const summary = createBidSummary();
  gameState.bidPhaseSummary = summary;

  // Show bid summary to players
  displayBidSummary(summary);
}

/**
 * Create a formatted summary of all bids for the current round
 * @returns {Object} Summary object with bid information
 */
function createBidSummary() {
  const summary = {
    round: gameState.currentRound,
    bids: []
  };

  // Create bid summary entries
  gameState.bids.forEach(bid => {
    const player = gameState.players.find(p => p.id === bid.playerId);
    if (player) {
      summary.bids.push({
        playerId: bid.playerId,
        playerName: player.name,
        bidAmount: bid.bidAmount
      });
    }
  });

  // Sort by player order for consistent display
  summary.bids.sort((a, b) => {
    const playerAIndex = gameState.players.findIndex(p => p.id === a.playerId);
    const playerBIndex = gameState.players.findIndex(p => p.id === b.playerId);
    return playerAIndex - playerBIndex;
  });

  return summary;
}

/**
 * Display bid summary and provide option to proceed to scoring
 * @param {Object} summary - The bid summary object
 */
function displayBidSummary(summary) {
  console.log('Displaying bid summary for round', summary.round);

  const bidPhaseContainer = document.getElementById('bid-phase-container');
  if (!bidPhaseContainer) {
    console.error('Bid phase container not found');
    return;
  }

  // Create summary HTML
  const summaryHTML = `
    <div class="bid-summary">
      <h2>Round ${summary.round} - Bid Summary</h2>
      <table class="bid-summary-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Bid (Tricks)</th>
          </tr>
        </thead>
        <tbody>
          ${summary.bids.map(bid => `
            <tr>
              <td>${bid.playerName}</td>
              <td>${bid.bidAmount}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="bid-summary-actions">
        <button id="proceed-to-scoring-btn" class="btn btn-primary">Proceed to Scoring</button>
      </div>
    </div>
  `;

  // Insert summary into container without replacing the container itself
  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = summaryHTML;
  bidPhaseContainer.appendChild(summaryDiv);

  // Attach event listener to proceed button
  const proceedBtn = document.getElementById('proceed-to-scoring-btn');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', handleProceedToScoring);
  }
}

/**
 * Handle the proceed to scoring button click
 */
function handleProceedToScoring() {
  console.log('Proceeding to scoring phase from round', gameState.currentRound);

  // Validate that we have bids stored
  if (!gameState.bids || gameState.bids.length === 0) {
    console.error('No bids available for scoring');
    return;
  }

  // Transition to scoring phase
  transitionToScoringPhase();
}

/**
 * Handle when bid phase is complete (all bids collected and confirmed)
 */
function handleBidPhaseComplete() {
  console.log('Bid phase complete for round', gameState.currentRound);
  // This is called when the bid phase UI signals completion
  // The actual transition happens after summary confirmation
}

/**
 * Transition to the scoring phase
 */
function transitionToScoringPhase() {
  if (gameState.isTransitioning) {
    console.warn('Transition already in progress');
    return;
  }

  gameState.isTransitioning = true;
  gameState.currentPhase = 'scoring';

  console.log('Transitioning to scoring phase');
  updateGameStatus();

  // Clear bid phase container
  const bidPhaseContainer = document.getElementById('bid-phase-container');
  if (bidPhaseContainer) {
    bidPhaseContainer.innerHTML = '';
  }

  // TODO: In a full implementation, call scoring phase function here
  // startScoringPhase();

  // For now, simulate completing the round after a short delay
  setTimeout(() => {
    completeRound();
  }, 1000);
}

/**
 * Complete the current round
 * Store round results and prepare for next round
 */
function completeRound() {
  console.log('Completing round', gameState.currentRound);

  // Store round history
  gameState.roundHistory.push({
    round: gameState.currentRound,
    bids: [...gameState.bids],
    timestamp: new Date().toISOString()
  });

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
    gameStatusDiv.innerHTML = '<p>Game Complete! Final scores displayed.</p>';
  }

  // TODO: Display final leaderboard
}

/**
 * Update the game status display
 */
function updateGameStatus() {
  const gameStatusDiv = document.getElementById('game-status');
  if (!gameStatusDiv) return;

  let statusHTML = `
    <p>Round: ${gameState.currentRound}/${gameState.maxRounds}</p>
    <p>Phase: ${gameState.currentPhase}</p>
  `;

  if (gameState.bids.length > 0) {
    statusHTML += `<p>Bids Collected: ${gameState.bids.length}/${gameState.players.length}</p>`;
  }

  gameStatusDiv.innerHTML = statusHTML;
}

/**
 * Get the current game state
 * @returns {Object} Current game state
 */
function getGameState() {
  return { ...gameState };
}

/**
 * Get bids for the current round
 * @returns {Array} Array of { playerId, bidAmount } objects
 */
function getCurrentRoundBids() {
  return [...gameState.bids];
}

/**
 * Get the round history
 * @returns {Array} Array of round result objects
 */
function getRoundHistory() {
  return [...gameState.roundHistory];
}

// Export functions for use in other modules (if using module system)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeGame,
    getGameState,
    getCurrentRoundBids,
    getRoundHistory,
    startRound,
    activateBidPhase,
    handleBidSubmitted,
    handleAllBidsSubmitted,
    transitionToScoringPhase
  };
}

// Example initialization (comment out for production)
// This would typically be triggered by a game setup interface
/*
document.addEventListener('DOMContentLoaded', () => {
  const testPlayers = [
    { id: 'player1', name: 'Player 1' },
    { id: 'player2', name: 'Player 2' },
    { id: 'player3', name: 'Player 3' }
  ];
  initializeGame(testPlayers);
});
*/
