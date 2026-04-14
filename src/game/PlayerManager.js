/**
 * PlayerManager handles player setup and validation
 * Enforces rules for player count (2-8), unique names, and game start validation
 */
class PlayerManager {
  constructor() {
    this.players = [];
    this.MAX_PLAYERS = 8;
    this.MIN_PLAYERS = 2;
  }

  /**
   * Add a player with validation
   * @param {string} name - Player name
   * @returns {object} Result object with success flag and message
   * @throws {Error} If validation fails
   */
  addPlayer(name) {
    // Trim and validate name
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return {
        success: false,
        message: 'Player name cannot be empty'
      };
    }

    // Check for duplicate names (case-insensitive)
    const nameLowerCase = trimmedName.toLowerCase();
    const isDuplicate = this.players.some(
      player => player.name.toLowerCase() === nameLowerCase
    );
    
    if (isDuplicate) {
      return {
        success: false,
        message: `Player "${trimmedName}" already exists`
      };
    }

    // Check player count limit
    if (this.players.length >= this.MAX_PLAYERS) {
      return {
        success: false,
        message: `Maximum of ${this.MAX_PLAYERS} players allowed`
      };
    }

    // Add the player
    const newPlayer = {
      id: this.generatePlayerId(),
      name: trimmedName,
      addedAt: new Date()
    };
    
    this.players.push(newPlayer);
    
    return {
      success: true,
      message: `Player "${trimmedName}" added successfully`,
      player: newPlayer
    };
  }

  /**
   * Remove a player from the setup
   * @param {string|number} playerIdOrName - Player ID or name
   * @returns {object} Result object with success flag and message
   */
  removePlayer(playerIdOrName) {
    const initialLength = this.players.length;
    
    this.players = this.players.filter(player => {
      // Match by ID (number) or name (string)
      if (typeof playerIdOrName === 'number') {
        return player.id !== playerIdOrName;
      }
      return player.name.toLowerCase() !== playerIdOrName.toLowerCase();
    });

    if (this.players.length < initialLength) {
      return {
        success: true,
        message: 'Player removed successfully'
      };
    }
    
    return {
      success: false,
      message: 'Player not found'
    };
  }

  /**
   * Get all current players
   * @returns {array} Array of player objects
   */
  getPlayers() {
    return [...this.players];
  }

  /**
   * Get player count
   * @returns {number} Current number of players
   */
  getPlayerCount() {
    return this.players.length;
  }

  /**
   * Check if game can start
   * @returns {object} Validation result with canStart flag and message
   */
  canStartGame() {
    if (this.players.length < this.MIN_PLAYERS) {
      return {
        canStart: false,
        message: `Minimum of ${this.MIN_PLAYERS} players required to start game`,
        playerCount: this.players.length,
        minRequired: this.MIN_PLAYERS
      };
    }

    if (this.players.length > this.MAX_PLAYERS) {
      return {
        canStart: false,
        message: `Too many players. Maximum is ${this.MAX_PLAYERS}`,
        playerCount: this.players.length,
        maxAllowed: this.MAX_PLAYERS
      };
    }

    return {
      canStart: true,
      message: 'Game can start',
      playerCount: this.players.length
    };
  }

  /**
   * Reset the player setup
   */
  reset() {
    this.players = [];
  }

  /**
   * Generate a unique player ID
   * @private
   * @returns {number} Unique player ID
   */
  generatePlayerId() {
    if (this.players.length === 0) {
      return 1;
    }
    return Math.max(...this.players.map(p => p.id)) + 1;
  }

  /**
   * Check if a name is available
   * @param {string} name - Player name to check
   * @returns {boolean} True if name is available
   */
  isNameAvailable(name) {
    const nameLowerCase = name.trim().toLowerCase();
    return !this.players.some(
      player => player.name.toLowerCase() === nameLowerCase
    );
  }
}

module.exports = PlayerManager;
