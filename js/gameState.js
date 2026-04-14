/**
 * Game State Management
 * Manages core game state including current round, game phase, and player scores.
 */

let gameState = {
  currentRound: 1,
  phase: 'setup', // 'setup' | 'bidding' | 'scoring' | 'complete'
  players: [],
  isComplete: false
};

/**
 * Initialize the game state
 * Resets to round 1, setup phase, and clears completion flag
 */
function initializeGame() {
  gameState = {
    currentRound: 1,
    phase: 'setup',
    players: [],
    isComplete: false
  };
}

/**
 * Get the current round (1-10)
 * @returns {number} The current round number
 */
function getCurrentRound() {
  return gameState.currentRound;
}

/**
 * Set the current game phase
 * @param {string} newPhase - The new phase ('setup', 'bidding', 'scoring', or 'complete')
 */
function setGamePhase(newPhase) {
  const validPhases = ['setup', 'bidding', 'scoring', 'complete'];
  if (!validPhases.includes(newPhase)) {
    throw new Error(`Invalid phase: ${newPhase}. Must be one of: ${validPhases.join(', ')}`);
  }
  gameState.phase = newPhase;
}

/**
 * Get the current game phase
 * @returns {string} The current phase
 */
function getGamePhase() {
  return gameState.phase;
}

/**
 * Advance to the next round
 * When round 10 is completed, sets isComplete to true and phase to 'complete'
 */
function advanceRound() {
  if (gameState.isComplete) {
    return; // Game is already complete, do nothing
  }

  if (gameState.currentRound < 10) {
    gameState.currentRound++;
  } else if (gameState.currentRound === 10) {
    // Mark game as complete after round 10
    gameState.isComplete = true;
    gameState.phase = 'complete';
  }
}

/**
 * Check if the game is complete
 * @returns {boolean} True if the game has reached completion
 */
function isGameComplete() {
  return gameState.isComplete;
}

/**
 * Get the current game state object
 * @returns {Object} The entire game state object
 */
function getGameState() {
  return { ...gameState };
}

// ES6 module exports
export {
  initializeGame,
  getCurrentRound,
  setGamePhase,
  getGamePhase,
  advanceRound,
  isGameComplete,
  getGameState
};
