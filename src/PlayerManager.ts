/**
 * PlayerManager - Manages player setup for Skull King game
 * Handles adding, removing, and validating players before game begins
 */

export interface Player {
  id: string;
  name: string;
  createdAt: number;
}

export class PlayerManager {
  private players: Map<string, Player> = new Map();
  private playerNameSet: Set<string> = new Set();
  private nextId: number = 1;

  private readonly MIN_PLAYERS = 2;
  private readonly MAX_PLAYERS = 8;

  /**
   * Add a new player with validation
   * @param name - Player name (must be unique and non-empty)
   * @returns Player object if successful
   * @throws Error if validation fails
   */
  addPlayer(name: string): Player {
    this.validatePlayerName(name);
    this.validatePlayerCount();

    const player: Player = {
      id: `player_${this.nextId++}`,
      name: name.trim(),
      createdAt: Date.now(),
    };

    this.players.set(player.id, player);
    this.playerNameSet.add(player.name.toLowerCase());

    return player;
  }

  /**
   * Remove a player by ID
   * @param playerId - ID of player to remove
   * @throws Error if player not found
   */
  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    this.players.delete(playerId);
    this.playerNameSet.delete(player.name.toLowerCase());
  }

  /**
   * Get all current players
   */
  getPlayers(): Player[] {
    return Array.from(this.players.values()).sort(
      (a, b) => a.createdAt - b.createdAt
    );
  }

  /**
   * Get player count
   */
  getPlayerCount(): number {
    return this.players.size;
  }

  /**
   * Check if game can start (2-8 players required)
   */
  canStartGame(): boolean {
    return this.players.size >= this.MIN_PLAYERS && this.players.size <= this.MAX_PLAYERS;
  }

  /**
   * Reset all players (for new game)
   */
  reset(): void {
    this.players.clear();
    this.playerNameSet.clear();
    this.nextId = 1;
  }

  /**
   * Validate player name
   * @throws Error if name is invalid or duplicate
   */
  private validatePlayerName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Player name must be a non-empty string');
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Player name cannot be empty or whitespace only');
    }

    if (trimmedName.length > 50) {
      throw new Error('Player name must be 50 characters or less');
    }

    const nameLowercase = trimmedName.toLowerCase();
    if (this.playerNameSet.has(nameLowercase)) {
      throw new Error(
        `Player name "${trimmedName}" is already taken. Player names must be unique.`
      );
    }
  }

  /**
   * Validate player count doesn't exceed maximum
   * @throws Error if at max capacity
   */
  private validatePlayerCount(): void {
    if (this.players.size >= this.MAX_PLAYERS) {
      throw new Error(
        `Maximum of ${this.MAX_PLAYERS} players reached. Cannot add more players.`
      );
    }
  }
}
