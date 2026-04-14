// Game state management module
// Tracks round progression (1-10), game phases, player data, and completion status

// Internal state object
const gameState = {
  currentRound: 1,
  phase: 'setup', // setup, bidding, scoring, complete
  players: [],
  isComplete: false
};

/**
 * Initialize the game state
 * Resets to round 1, setup phase with empty players array
 * @param {Array} initialPlayers - Optional array of player objects to initialize
 */
function initializeGame(initialPlayers = []) {
  gameState.currentRound = 1;
  gameState.phase = 'setup';
  gameState.players = initialPlayers.length > 0
    ? JSON.parse(JSON.stringify(initialPlayers)) // Deep clone initial players
    : [];
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
 * @param {string} newPhase - Phase to set: 'setup', 'bidding', 'scoring', or 'complete'
 * @throws {Error} If invalid phase is provided
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
 * @returns {string} Current phase: 'setup', 'bidding', 'scoring', or 'complete'
 */
function getGamePhase() {
  return gameState.phase;
}

/**
 * Advance to the next round
 * Increments currentRound and transitions phase to 'bidding'
 * If advancing past round 10, caps at round 10 and marks game as complete
 */
function advanceRound() {
  // Increment the round, but cap at 10
  if (gameState.currentRound < 10) {
    gameState.currentRound += 1;
    gameState.phase = 'bidding';
  } else if (gameState.currentRound === 10) {
    // Game completes after round 10
    gameState.isComplete = true;
    gameState.phase = 'complete';
  }
  // If currentRound is already 10 and game is complete, do nothing
}

/**
 * Check if the game is complete
 * @returns {boolean} True if game has finished (all 10 rounds completed)
 */
function isGameComplete() {
  return gameState.isComplete;
}

/**
 * Get a deep copy of the current game state
 * Returns a snapshot that won't affect internal state if mutated
 * @returns {Object} Game state object with properties: currentRound, phase, players, isComplete
 */
function getGameState() {
  // Deep clone the state using JSON serialization to prevent reference leaks
  return JSON.parse(JSON.stringify(gameState));
}

// Export functions for both CommonJS and ES6 modules
if (typeof module !== 'undefined' && module.exports) {
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

// ES6 module exports
if (typeof export !== 'undefined') {
  export {
    initializeGame,
    getCurrentRound,
    setGamePhase,
    getGamePhase,
    advanceRound,
    isGameComplete,
    getGameState
  };
}
