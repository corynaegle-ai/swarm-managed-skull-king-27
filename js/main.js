// Game state object with bids property and currentPhase field
const gameState = {
  players: [],
  scores: {},
  bids: [],
  currentPhase: 'setup',
};

function startRound() {
  // Start the bidding phase
  console.log('Starting round...');
  // collectBids callback will be integrated by bid-phase module
}

export { gameState, startRound };
