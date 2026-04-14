export interface Player {
  id: string;
  name: string;
  score?: number;
}

export interface Bid {
  playerId: string;
  playerName: string;
  bidAmount: number;
  round: number;
}

export interface Round {
  roundNumber: number;
  handCount: number;
  bids: Bid[];
  tricks?: number[];
  scores?: number[];
}
