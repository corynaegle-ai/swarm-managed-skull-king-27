export interface Player {
  id: string;
  name: string;
}

export interface Bid {
  playerId: string;
  amount: number;
}

export interface Round {
  roundNumber: number;
  bids: Bid[];
  scores?: RoundScore[];
}

export interface RoundScore {
  playerId: string;
  tricksTaken: number;
  bonusPoints: number;
  score: number;
}

export interface GameState {
  players: Player[];
  currentRound: number;
  rounds: Round[];
  totalScores: Record<string, number>;
}
