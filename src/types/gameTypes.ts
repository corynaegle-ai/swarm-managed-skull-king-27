export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export interface Bid {
  playerId: string;
  bid: number;
}

export interface RoundResult {
  playerId: string;
  bid: number;
  tricksTaken: number;
  bonusPoints: number;
  roundScore: number;
}

export interface Round {
  roundNumber: number;
  handCount: number;
  bids: Bid[];
  results: RoundResult[];
  completed: boolean;
}

export interface GameState {
  id: string;
  players: Player[];
  rounds: Round[];
  currentRoundIndex: number;
  gameCompleted: boolean;
}
