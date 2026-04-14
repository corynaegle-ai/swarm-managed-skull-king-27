import { Player } from './Player';
import { GameRound } from './GameRound';

export interface GameState {
  players: Player[];
  currentRound: GameRound;
  roundNumber: number;
  bids: Map<string, number>;
  scores: Map<string, number>;
}
