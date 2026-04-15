export const gameState = {
  bids: {},
  currentPhase: 'setup',
  players: [],
  scores: {},
  round: 1,
  maxRounds: 10,
};

export function startRound() {
  gameState.currentPhase = 'bidding';
}
