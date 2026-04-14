/**
 * PlayerSetup
 * Manages player setup for the Skull King game.
 * Handles adding, removing, and validating players before game start.
 */

export interface Player {
  id: string;
  name: string;
}

export class PlayerSetup {
  private players: Map<string, Player> = new Map();
  private nextPlayerId: number = 0;
  private readonly MIN_PLAYERS = 2;
  private readonly MAX_PLAYERS = 8;

  /**
   * Add a player with the given name
   * @param name The player's name
   * @throws Error if name is empty, duplicate, or player limit exceeded
   * @returns The created Player object
   */
  addPlayer(name: string): Player {
    // Validate name is not empty
    if (!name || name.trim().length === 0) {
      throw new Error('Player name cannot be empty');
    }

    const trimmedName = name.trim();

    // Check for duplicate names (case-insensitive)
    const nameLower = trimmedName.toLowerCase();
    for (const player of this.players.values()) {
      if (player.name.toLowerCase() === nameLower) {
        throw new Error(`Player with name "${trimmedName}" already exists`);
      }
    }

    // Check player count limit
    if (this.players.size >= this.MAX_PLAYERS) {
      throw new Error(`Cannot add more than ${this.MAX_PLAYERS} players`);
    }

    const playerId = `player-${this.nextPlayerId++}`;
    const player: Player = {
      id: playerId,
      name: trimmedName,
    };

    this.players.set(playerId, player);
    return player;
  }

  /**
   * Remove a player by ID
   * @param playerId The player's ID
   * @throws Error if player does not exist
   */
  removePlayer(playerId: string): void {
    if (!this.players.has(playerId)) {
      throw new Error(`Player with ID "${playerId}" not found`);
    }
    this.players.delete(playerId);
  }

  /**
   * Get all current players
   * @returns Array of players in order added
   */
  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  /**
   * Get the current number of players
   * @returns Number of players
   */
  getPlayerCount(): number {
    return this.players.size;
  }

  /**
   * Check if game can be started
   * Game requires at least 2 players
   * @returns true if game can be started, false otherwise
   */
  canStartGame(): boolean {
    return this.players.size >= this.MIN_PLAYERS;
  }

  /**
   * Check if more players can be added
   * @returns true if less than MAX_PLAYERS players exist
   */
  canAddMorePlayers(): boolean {
    return this.players.size < this.MAX_PLAYERS;
  }

  /**
   * Reset the setup to initial state
   */
  reset(): void {
    this.players.clear();
    this.nextPlayerId = 0;
  }

  /**
   * Get player by ID
   * @param playerId The player's ID
   * @returns The player or undefined if not found
   */
  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  /**
   * Check if a player name already exists (case-insensitive)
   * @param name The player name to check
   * @returns true if name exists, false otherwise
   */
  playerNameExists(name: string): boolean {
    const nameLower = name.toLowerCase();
    for (const player of this.players.values()) {
      if (player.name.toLowerCase() === nameLower) {
        return true;
      }
    }
    return false;
  }
}
