// Game state object with bids property and currentPhase field
const gameState = {
  currentPhase: 'initial',
  scores: {},
  bids: [],
  currentPhase: 'setup'
};

function startRound() {
  gameState.currentPhase = 'bidding';
  // Bid collection will be integrated here by another ticket
  console.log('Round started - waiting for bid collection integration');
}

function initializeGame(playerNames) {
  gameState.scores = {};
  playerNames.forEach(name => {
    gameState.scores[name] = 0;
  });
  console.log('Game initialized with players:', playerNames);
}

function recordBid(playerId, bidAmount) {
  gameState.bids.push({ playerId, bidAmount });
}

function resetBidsForRound() {
  gameState.bids = [];
}

export { gameState, startRound, initializeGame, recordBid, resetBidsForRound };