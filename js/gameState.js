/**
 * Game State Management Module
 * Manages core game state including rounds (1-10), phases, and game completion
 */

// Initialize the game state object
const gameState = {
  currentRound: 0,
  phase: 'setup', // 'setup', 'bidding', 'scoring', 'complete'
  players: [],
  isComplete: false
};

/**
 * Initialize the game to starting state
 * Resets round to 1, phase to 'setup', clears players array, and marks game as not complete
 */
function initializeGame() {
  gameState.currentRound = 1;
  gameState.phase = 'setup';
  gameState.players = [];
  gameState.isComplete = false;
}

/**
 * Get the current round number (1-10)
 * @returns {number} Current round number
 */
function getCurrentRound() {
  return gameState.currentRound;
}

/**
 * Set the game phase
 * @param {string} newPhase - The phase to set: 'setup', 'bidding', 'scoring', or 'complete'
 */
function setGamePhase(newPhase) {
  if (['setup', 'bidding', 'scoring', 'complete'].includes(newPhase)) {
    gameState.phase = newPhase;
  }
}

/**
 * Get the current game phase
 * @returns {string} Current phase: 'setup', 'bidding', 'scoring', or 'complete'
 */
function getGamePhase() {
  return gameState.phase;
}

/**
 * Advance to the next round
 * Increments currentRound. Marks game complete only when attempting to advance past round 10.
 * This allows round 10 to be fully playable with its own phases.
 */
function advanceRound() {
  if (gameState.currentRound < 10) {
    gameState.currentRound += 1;
    // Transition to bidding phase for the new round
    gameState.phase = 'bidding';
  } else if (gameState.currentRound === 10) {
    // Attempting to advance past round 10 - mark game complete
    gameState.isComplete = true;
    gameState.phase = 'complete';
  }
  // If currentRound > 10, do nothing (already complete)
}

/**
 * Check if the game is complete
 * @returns {boolean} True if game is complete, false otherwise
 */
function isGameComplete() {
  return gameState.isComplete;
}

/**
 * Get a deep copy of the current game state
 * Uses structuredClone to ensure nested objects (players) are fully cloned
 * preventing external mutations from corrupting internal state
 * @returns {object} Deep copy of gameState with properties: currentRound, phase, players array, isComplete
 */
function getGameState() {
  // Use structuredClone for deep copying of nested objects
  return structuredClone({
    currentRound: gameState.currentRound,
    phase: gameState.phase,
    players: gameState.players,
    isComplete: gameState.isComplete
  });
}

// Export for ES modules and browser environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js / CommonJS
  module.exports = {
    initializeGame,
    getCurrentRound,
    setGamePhase,
    getGamePhase,
    advanceRound,
    isGameComplete,
    getGameState
  };
}

// Also export as ES modules
if (typeof exports !== 'undefined') {
  exports.initializeGame = initializeGame;
  exports.getCurrentRound = getCurrentRound;
  exports.setGamePhase = setGamePhase;
  exports.getGamePhase = getGamePhase;
  exports.advanceRound = advanceRound;
  exports.isGameComplete = isGameComplete;
  exports.getGameState = getGameState;
}

// Export to window for browser environment
if (typeof window !== 'undefined') {
  window.GameState = {
    initializeGame,
    getCurrentRound,
    setGamePhase,
    getGamePhase,
    advanceRound,
    isGameComplete,
    getGameState
  };
}
