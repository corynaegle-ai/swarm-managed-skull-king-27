import { GameState, GamePhase, PlayerScore, GameAction, RoundScorePayload } from './types/GameState';

/**
 * GameStateManager - Manages game progression through 10 rounds
 * Handles phase transitions: setup → bidding → scoring → repeat/complete
 */
export class GameStateManager {
  private state: GameState;
  private readonly TOTAL_ROUNDS = 10;

  constructor(gameId: string, playerNames: string[]) {
    this.state = {
      gameId,
      currentRound: 1,
      totalRounds: this.TOTAL_ROUNDS,
      phase: 'setup',
      players: playerNames.map((name) => ({
        playerId: `player-${Math.random().toString(36).substr(2, 9)}`,
        playerName: name,
        cumulativeScore: 0,
        roundScores: [],
      })),
      createdAt: new Date(),
    };
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return { ...this.state };
  }

  /**
   * Move game to bidding phase
   */
  startBidding(): void {
    if (this.state.phase !== 'setup') {
      throw new Error(`Cannot start bidding from ${this.state.phase} phase`);
    }
    this.state.phase = 'bidding';
  }

  /**
   * Move game to scoring phase
   */
  startScoring(): void {
    if (this.state.phase !== 'bidding') {
      throw new Error(`Cannot start scoring from ${this.state.phase} phase`);
    }
    this.state.phase = 'scoring';
  }

  /**
   * Record a player's round score and update cumulative score
   */
  recordRoundScore(playerId: string, roundScore: number): void {
    if (this.state.phase !== 'scoring') {
      throw new Error(`Cannot record scores in ${this.state.phase} phase`);
    }

    const player = this.state.players.find((p) => p.playerId === playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    // Ensure we have enough space for this round
    if (player.roundScores.length !== this.state.currentRound - 1) {
      throw new Error(
        `Invalid round score state for player ${playerId}. Expected ${this.state.currentRound - 1} scores, got ${player.roundScores.length}`,
      );
    }

    // Record the score
    player.roundScores.push(roundScore);
    player.cumulativeScore += roundScore;
  }

  /**
   * Check if all players have submitted their round scores
   */
  areAllScoresRecorded(): boolean {
    return this.state.players.every((p) => p.roundScores.length === this.state.currentRound);
  }

  /**
   * Advance to next round or complete game if all rounds are done
   */
  advanceRound(): void {
    if (this.state.phase !== 'scoring') {
      throw new Error(`Cannot advance round from ${this.state.phase} phase`);
    }

    if (!this.areAllScoresRecorded()) {
      throw new Error('Cannot advance round before all players submit scores');
    }

    if (this.state.currentRound >= this.TOTAL_ROUNDS) {
      // Game is complete
      this.state.phase = 'complete';
      this.state.completedAt = new Date();
    } else {
      // Move to next round
      this.state.currentRound += 1;
      this.state.phase = 'setup';
    }
  }

  /**
   * Get final scores when game is complete
   */
  getFinalScores(): PlayerScore[] {
    if (this.state.phase !== 'complete') {
      throw new Error('Game is not complete yet');
    }

    // Return players sorted by cumulative score (descending)
    return [...this.state.players].sort((a, b) => b.cumulativeScore - a.cumulativeScore);
  }

  /**
   * Check if game is complete
   */
  isGameComplete(): boolean {
    return this.state.phase === 'complete';
  }

  /**
   * Get current round number (1-10)
   */
  getCurrentRound(): number {
    return this.state.currentRound;
  }

  /**
   * Get all player scores
   */
  getPlayerScores(): PlayerScore[] {
    return this.state.players.map((p) => ({ ...p }));
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): GamePhase {
    return this.state.phase;
  }

  /**
   * Start a new game with the same players
   */
  startNewGame(): GameStateManager {
    const playerNames = this.state.players.map((p) => p.playerName);
    return new GameStateManager(`game-${Math.random().toString(36).substr(2, 9)}`, playerNames);
  }
}
