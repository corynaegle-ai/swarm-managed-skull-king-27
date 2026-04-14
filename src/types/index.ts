export interface Round {
  bid: number;
  tricks: number;
  score: number;
}

export interface Player {
  id: string;
  name: string;
  rounds: Round[];
}

export interface Game {
  id: string;
  players: Player[];
  currentRound: number;
  status: 'active' | 'ended';
}
