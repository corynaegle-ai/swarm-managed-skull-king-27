/**
 * Game State Management Module
 * Manages core game state including rounds, phases, and player scores
 */

const gameState = {
  currentRound: 1,
  phase: 'setup', // 'setup', 'bidding', 'scoring', 'complete'
  players: [],
  isComplete: false
};

/**
 * Initialize the game state
 * Resets to round 1, setup phase, and clears all player scores
 * @param {Array} playerList - Array of player objects with at least id property
 */
function initializeGame(playerList = []) {
  gameState.currentRound = 1;
  gameState.phase = 'setup';
  gameState.isComplete = false;
  
  // Initialize players with score tracking
  gameState.players = playerList.map(player => ({
    id: player.id,
    name: player.name || `Player ${player.id}`,
    score: 0,
    roundScores: []
  }));
}

/**
 * Get the current round number
 * @returns {number} Current round (1-10)
 */
function getCurrentRound() {
  return gameState.currentRound;
}

/**
 * Set the current game phase
 * @param {string} newPhase - Phase to set ('setup', 'bidding', 'scoring', 'complete')
 * @returns {boolean} True if phase was set successfully
 */
function setGamePhase(newPhase) {
  const validPhases = ['setup', 'bidding', 'scoring', 'complete'];
  
  if (!validPhases.includes(newPhase)) {
    console.error(`Invalid phase: ${newPhase}. Must be one of: ${validPhases.join(', ')}`);
    return false;
  }
  
  gameState.phase = newPhase;
  return true;
}

/**
 * Get the current game phase
 * @returns {string} Current phase ('setup', 'bidding', 'scoring', 'complete')
 */
function getGamePhase() {
  return gameState.phase;
}

/**
 * Advance to the next round
 * Automatically sets phase to 'setup' and handles game completion at round 10
 * @returns {boolean} True if round was advanced, false if game is complete
 */
function advanceRound() {
  if (gameState.isComplete) {
    console.warn('Game is already complete. Cannot advance round.');
    return false;
  }
  
  gameState.currentRound += 1;
  gameState.phase = 'setup';
  
  // Check if game is complete (after round 10)
  if (gameState.currentRound > 10) {
    gameState.isComplete = true;
    gameState.phase = 'complete';
    return false;
  }
  
  return true;
}

/**
 * Check if the game is complete
 * @returns {boolean} True if game has completed all 10 rounds
 */
function isGameComplete() {
  return gameState.isComplete;
}

/**
 * Get the complete game state
 * @returns {Object} Current game state object
 */
function getGameState() {
  return {
    currentRound: gameState.currentRound,
    phase: gameState.phase,
    players: gameState.players,
    isComplete: gameState.isComplete
  };
}

/**
 * Update a player's score (helper function)
 * @param {string|number} playerId - ID of the player
 * @param {number} score - Score to add for this round
 * @returns {boolean} True if score was updated
 */
function updatePlayerScore(playerId, score) {
  const player = gameState.players.find(p => p.id === playerId);
  
  if (!player) {
    console.error(`Player with id ${playerId} not found`);
    return false;
  }
  
  player.roundScores[gameState.currentRound - 1] = score;
  player.score += score;
  return true;
}

/**
 * Get player scores
 * @returns {Array} Array of player score objects
 */
function getPlayerScores() {
  return gameState.players.map(player => ({
    id: player.id,
    name: player.name,
    score: player.score
  }));
}

// Export functions using module pattern
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeGame,
    getCurrentRound,
    setGamePhase,
    getGamePhase,
    advanceRound,
    isGameComplete,
    getGameState,
    updatePlayerScore,
    getPlayerScores
  };
}
