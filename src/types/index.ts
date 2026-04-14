/**
 * Type definitions for Skull King game
 */

export interface Player {
  id: string;
  name: string;
  roundScores: number[];
}

export interface GameState {
  players: Player[];
  currentRound: number;
  gameEnded: boolean;
  currentPhase: GamePhase;
}

export enum GamePhase {
  BIDDING = 'bidding',
  PLAYING = 'playing',
  SCORING = 'scoring',
  FINISHED = 'finished',
}

export interface Round {
  roundNumber: number;
  bids: Map<string, number>;
  tricks: Array<{
    playerId: string;
    cards: string[];
  }>;
  scores: Map<string, number>;
}
