import { collectBids } from './bid-phase.js';

const gameState = {
  round: 1,
  totalRounds: 10,
  players: [],
  scores: {},
  currentPhase: 'initial'
};

function startRound() {
  // Implementation for starting a round
  // This function will be modified by a sibling ticket to call collectBids()
}

export { startRound };
