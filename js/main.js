import { collectBids } from './bid-phase.js';

// Game state object with bids property and currentPhase field
const gameState = {
  players: [],
  currentPhase: 'initial',
  bids: [],
  scores: {}
};

/**
 * Start a new round of the game
 */
function startRound() {
  gameState.currentPhase = 'bidding';
  gameState.bids = [];
  collectBids(gameState.players, (bids) => {
    gameState.bids = bids;
  });
}

export { gameState, startRound };
