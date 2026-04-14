/**
 * gameState.js - Core game state management
 * Manages game rounds (1-10), phases (setup/bidding/scoring/complete), and player data
 */

(function() {
  // Private gameState object
  let gameState = {
    currentRound: 1,
    phase: 'setup',
    players: [],
    isComplete: false
  };

  // Valid phases for the game
  const VALID_PHASES = ['setup', 'bidding', 'scoring', 'complete'];
  const MAX_ROUNDS = 10;
  const MIN_ROUNDS = 1;

  /**
   * Initialize game to default state
   * Resets to round 1, setup phase, clears players
   */
  function initializeGame() {
    gameState = {
      currentRound: MIN_ROUNDS,
      phase: 'setup',
      players: [],
      isComplete: false
    };
    return getGameState();
  }

  /**
   * Get the current round number (1-10)
   * @returns {number} Current round
   */
  function getCurrentRound() {
    return gameState.currentRound;
  }

  /**
   * Set the game phase
   * @param {string} newPhase - Valid phases: setup, bidding, scoring, complete
   * @throws {Error} If phase is invalid
   */
  function setGamePhase(newPhase) {
    if (!VALID_PHASES.includes(newPhase)) {
      throw new Error(`Invalid phase: ${newPhase}. Valid phases are: ${VALID_PHASES.join(', ')}`);
    }
    gameState.phase = newPhase;
  }

  /**
   * Get the current game phase
   * @returns {string} Current phase
   */
  function getGamePhase() {
    return gameState.phase;
  }

  /**
   * Advance to the next round
   * Handles game completion when round exceeds MAX_ROUNDS
   * @returns {boolean} True if game is complete, false otherwise
   */
  function advanceRound() {
    if (gameState.currentRound >= MAX_ROUNDS) {
      gameState.currentRound = MAX_ROUNDS;
      gameState.isComplete = true;
      gameState.phase = 'complete';
      return true;
    }
    gameState.currentRound += 1;
    if (gameState.currentRound === MAX_ROUNDS) {
      // On the last round, mark as complete after advancing
      gameState.isComplete = true;
      gameState.phase = 'complete';
      return true;
    }
    return false;
  }

  /**
   * Check if the game is complete
   * @returns {boolean} True if game is complete, false otherwise
   */
  function isGameComplete() {
    return gameState.isComplete;
  }

  /**
   * Get the current game state
   * @returns {object} Copy of the current game state
   */
  function getGameState() {
    return {
      currentRound: gameState.currentRound,
      phase: gameState.phase,
      players: [...gameState.players],
      isComplete: gameState.isComplete
    };
  }

  // Export functions as a module
  window.GameState = {
    initializeGame,
    getCurrentRound,
    setGamePhase,
    getGamePhase,
    advanceRound,
    isGameComplete,
    getGameState
  };
})();
