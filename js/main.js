// Game state management
const gameState = {
  players: [],
  scores: {},
  currentPhase: 'bidding',
  bids: []
};

// Initialize the game
function initializeGame(playerNames) {
  gameState.players = playerNames;
  gameState.scores = playerNames.reduce((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {});
  gameState.currentPhase = 'bidding';
  gameState.bids = [];
}

// Start a new round
function startRound() {
  gameState.currentPhase = 'bidding';
  gameState.bids = [];
  // Additional round logic will be added by sibling tickets
}

// Update game phase
function setPhase(phase) {
  gameState.currentPhase = phase;
}

// Get current game state
function getGameState() {
  return gameState;
}

export { gameState, initializeGame, startRound, setPhase, getGameState };
