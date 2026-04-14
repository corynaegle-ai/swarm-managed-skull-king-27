/**
 * Player Management Module
 * Handles player data, validation, and operations
 */

const PlayerManager = (() => {
  let players = [];

  /**
   * Validate player name
   * @param {string} name - Player name to validate
   * @returns {object} Validation result with isValid and message
   */
  const validatePlayerName = (name) => {
    if (!name || typeof name !== 'string') {
      return { isValid: false, message: 'Player name must be a non-empty string' };
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return { isValid: false, message: 'Player name cannot be empty' };
    }

    if (trimmedName.length > 20) {
      return { isValid: false, message: 'Player name must be 20 characters or less' };
    }

    if (players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      return { isValid: false, message: 'Player with this name already exists' };
    }

    return { isValid: true, message: '' };
  };

  /**
   * Add a new player
   * @param {string} name - Player name
   * @returns {object} Result with success status and player or error message
   */
  const addPlayer = (name) => {
    const validation = validatePlayerName(name);
    if (!validation.isValid) {
      return { success: false, error: validation.message };
    }

    const player = {
      id: Date.now(),
      name: name.trim()
    };

    players.push(player);
    return { success: true, player };
  };

  /**
   * Remove a player by ID
   * @param {number} playerId - Player ID
   * @returns {boolean} True if player was removed, false otherwise
   */
  const removePlayer = (playerId) => {
    const initialLength = players.length;
    players = players.filter(p => p.id !== playerId);
    return players.length < initialLength;
  };

  /**
   * Get all players
   * @returns {array} Array of player objects
   */
  const getPlayers = () => [...players];

  /**
   * Get number of players
   * @returns {number} Player count
   */
  const getPlayerCount = () => players.length;

  /**
   * Check if game can start (minimum 2 players required)
   * @returns {boolean} True if game can start
   */
  const canStartGame = () => players.length >= 2;

  /**
   * Reset all players
   */
  const resetPlayers = () => {
    players = [];
  };

  // Public API
  return {
    validatePlayerName,
    addPlayer,
    removePlayer,
    getPlayers,
    getPlayerCount,
    canStartGame,
    resetPlayers
  };
})();
