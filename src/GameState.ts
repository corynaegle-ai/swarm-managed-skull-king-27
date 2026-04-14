/**
 * GameState - Manages overall game state including player setup
 */

import { PlayerManager, Player } from './PlayerManager';

export type GamePhase = 'setup' | 'playing' | 'finished';

export interface GameStateInterface {
  phase: GamePhase;
  players: Player[];
  playerCount: number;
  canStartGame: boolean;
}

export class GameState {
  private playerManager: PlayerManager = new PlayerManager();
  private phase: GamePhase = 'setup';

  /**
   * Add a player during setup phase
   */
  addPlayer(name: string): Player {
    if (this.phase !== 'setup') {
      throw new Error('Cannot add players outside of setup phase');
    }
    return this.playerManager.addPlayer(name);
  }

  /**
   * Remove a player during setup phase
   */
  removePlayer(playerId: string): void {
    if (this.phase !== 'setup') {
      throw new Error('Cannot remove players outside of setup phase');
    }
    this.playerManager.removePlayer(playerId);
  }

  /**
   * Get current players
   */
  getPlayers(): Player[] {
    return this.playerManager.getPlayers();
  }

  /**
   * Get player count
   */
  getPlayerCount(): number {
    return this.playerManager.getPlayerCount();
  }

  /**
   * Check if game can start (2-8 players required)
   */
  canStartGame(): boolean {
    const count = this.playerManager.getPlayerCount();
    return count >= 2 && count <= 8;
  }

  /**
   * Start the game (transition from setup to playing)
   * @throws Error if cannot start game
   */
  startGame(): void {
    const count = this.playerManager.getPlayerCount();
    if (count < 2 || count > 8) {
      throw new Error(
        `Cannot start game with ${count} players. Must have between 2 and 8 players.`
      );
    }
    this.phase = 'playing';
  }

  /**
   * Get current game phase
   */
  getPhase(): GamePhase {
    return this.phase;
  }

  /**
   * Get current game state snapshot
   */
  getState(): GameStateInterface {
    return {
      phase: this.phase,
      players: this.getPlayers(),
      playerCount: this.getPlayerCount(),
      canStartGame: this.canStartGame(),
    };
  }

  /**
   * Reset game to initial state
   */
  reset(): void {
    this.playerManager.reset();
    this.phase = 'setup';
  }
}
