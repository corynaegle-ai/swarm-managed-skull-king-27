/**
 * Game state type definitions for Skull King card game
 */

export type GamePhase = 'setup' | 'bidding' | 'scoring' | 'complete';

export interface PlayerScore {
  playerId: string;
  playerName: string;
  cumulativeScore: number;
  roundScores: number[];
}

export interface GameState {
  gameId: string;
  currentRound: number;
  totalRounds: number;
  phase: GamePhase;
  players: PlayerScore[];
  createdAt: Date;
  completedAt?: Date;
}

export interface GameAction {
  type: 'START_GAME' | 'MOVE_TO_BIDDING' | 'MOVE_TO_SCORING' | 'RECORD_ROUND_SCORE' | 'ADVANCE_ROUND' | 'COMPLETE_GAME' | 'START_NEW_GAME';
  payload?: unknown;
}

export interface RoundScorePayload {
  playerId: string;
  roundScore: number;
}
