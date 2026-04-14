/**
 * Represents a player in the game
 */
export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Represents a single player's score for a round
 */
export interface RoundScore {
  playerId: string;
  score: number;
  tricks?: number;
  bid?: number;
}

/**
 * Represents the full state of a game
 */
export interface GameState {
  id: string;
  players: Player[];
  status: 'setup' | 'in-progress' | 'finished';
  currentRound: number;
  roundScores: RoundScore[][];
  startedAt: Date;
  completedAt?: Date;
}
