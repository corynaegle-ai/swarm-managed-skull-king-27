// Game state management
const gameState = {
  players: [],
  scores: {},
  currentPhase: 'initial',
  bids: []
};

// Initialize game
function initGame(players) {
  gameState.players = players;
  gameState.scores = players.reduce((acc, player) => {
    acc[player.id] = 0;
    return acc;
  }, {});
}

// Start a new round
function startRound() {
  // Round logic will be implemented here
}

// Export game state and functions
export { gameState, initGame, startRound };
