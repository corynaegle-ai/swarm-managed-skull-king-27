/**
 * Player Manager Module
 * Handles all player setup functionality including validation, addition, removal,
 * and state management.
 */

const playerManager = (() => {
  // Private state
  let players = [];
  let idCounter = 0;

  /**
   * Generate a unique ID for a player
   * @returns {string} Unique player ID
   */
  const generateId = () => {
    return `player_${Date.now()}_${idCounter++}`;
  };

  /**
   * Add a new player with validation
   * @param {string} name - Player name
   * @returns {object} Result object with success flag and message/player data
   */
  const addPlayer = (name) => {
    // Validate non-empty name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return {
        success: false,
        error: 'Player name cannot be empty'
      };
    }

    // Trim whitespace
    const trimmedName = name.trim();

    // Validate uniqueness
    const nameExists = players.some(
      (player) => player.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (nameExists) {
      return {
        success: false,
        error: 'Player name must be unique'
      };
    }

    // Check player count limit
    if (players.length >= 8) {
      return {
        success: false,
        error: 'Maximum 8 players allowed'
      };
    }

    // Create new player
    const newPlayer = {
      id: generateId(),
      name: trimmedName,
      score: 0
    };

    players.push(newPlayer);

    return {
      success: true,
      player: newPlayer
    };
  };

  /**
   * Remove a player from the list
   * @param {string} id - Player ID to remove
   * @returns {object} Result object with success flag and message
   */
  const removePlayer = (id) => {
    const initialLength = players.length;
    players = players.filter((player) => player.id !== id);

    if (players.length === initialLength) {
      return {
        success: false,
        error: 'Player not found'
      };
    }

    return {
      success: true,
      message: 'Player removed successfully'
    };
  };

  /**
   * Validate player count is within allowed range (2-8)
   * @returns {object} Result object with success flag and message
   */
  const validatePlayerCount = () => {
    const count = players.length;

    if (count < 2) {
      return {
        success: false,
        error: 'Minimum 2 players required'
      };
    }

    if (count > 8) {
      return {
        success: false,
        error: 'Maximum 8 players allowed'
      };
    }

    return {
      success: true,
      message: `Valid player count: ${count}`,
      count: count
    };
  };

  /**
   * Get current list of players
   * @returns {array} Copy of players array
   */
  const getPlayers = () => {
    return [...players];
  };

  /**
   * Clear all players (utility function for reset)
   */
  const clearPlayers = () => {
    players = [];
    idCounter = 0;
  };

  // Public API
  return {
    addPlayer,
    removePlayer,
    validatePlayerCount,
    getPlayers,
    clearPlayers
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = playerManager;
}
