import { collectBids } from './bid-phase.js';

const gameState = {
  players: ['Player 1', 'Player 2', 'Player 3'],
  scores: [0, 0, 0],
  bids: [],
  currentPhase: 'setup',
};

function startRound() {
  gameState.bids = [];
  collectBids();
}

export { gameState, startRound };
