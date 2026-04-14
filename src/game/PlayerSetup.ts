export class Player {
  constructor(public name: string) {
    if (!name || name.trim().length === 0) {
      throw new Error('Player name cannot be empty');
    }
  }
}

export class PlayerSetup {
  private players: Player[] = [];
  private readonly MIN_PLAYERS = 2;
  private readonly MAX_PLAYERS = 8;

  /**
   * Add a player with validation for uniqueness and count limits
   * @param name - The name of the player to add
   * @throws Error if name is empty, duplicate, or player limit exceeded
   */
  addPlayer(name: string): void {
    const trimmedName = name.trim();

    // Validate name is not empty
    if (!trimmedName) {
      throw new Error('Player name cannot be empty');
    }

    // Check for duplicate names (case-insensitive)
    const isDuplicate = this.players.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      throw new Error(`Player with name "${trimmedName}" already exists`);
    }

    // Check max players limit
    if (this.players.length >= this.MAX_PLAYERS) {
      throw new Error(
        `Cannot add more than ${this.MAX_PLAYERS} players. Current count: ${this.players.length}`
      );
    }

    this.players.push(new Player(trimmedName));
  }

  /**
   * Remove a player by name
   * @param name - The name of the player to remove
   * @returns true if player was found and removed, false otherwise
   */
  removePlayer(name: string): boolean {
    const initialLength = this.players.length;
    this.players = this.players.filter(
      (p) => p.name.toLowerCase() !== name.trim().toLowerCase()
    );
    return this.players.length < initialLength;
  }

  /**
   * Get all current players
   * @returns Array of players
   */
  getPlayers(): Player[] {
    return [...this.players];
  }

  /**
   * Get the current player count
   * @returns Number of players
   */
  getPlayerCount(): number {
    return this.players.length;
  }

  /**
   * Check if the game can be started (minimum 2 players)
   * @returns true if game can start, false otherwise
   */
  canStartGame(): boolean {
    return this.players.length >= this.MIN_PLAYERS;
  }

  /**
   * Check if another player can be added
   * @returns true if another player can be added, false if at max limit
   */
  canAddMorePlayers(): boolean {
    return this.players.length < this.MAX_PLAYERS;
  }

  /**
   * Get the maximum number of players allowed
   * @returns Maximum player count
   */
  getMaxPlayers(): number {
    return this.MAX_PLAYERS;
  }

  /**
   * Get the minimum number of players required
   * @returns Minimum player count
   */
  getMinPlayers(): number {
    return this.MIN_PLAYERS;
  }
}
