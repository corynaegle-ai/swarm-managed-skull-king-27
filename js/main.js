// Game state object
const gameState = {
  players: [
    { id: 'player1', name: 'Player 1', score: 0 },
    { id: 'player2', name: 'Player 2', score: 0 },
    { id: 'player3', name: 'Player 3', score: 0 },
    { id: 'player4', name: 'Player 4', score: 0 }
  ],
  currentRound: 1,
  totalRounds: 10,
  bids: [],
  currentPhase: 'setup'
};

// Initialize the game
function initGame() {
  renderScores();
  startRound();
}

// Render player scores table
function renderScores() {
  const table = document.getElementById('player-scores-table');
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';
  
  gameState.players.forEach(player => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${player.name}</td><td>${player.score}</td>`;
    tbody.appendChild(row);
  });
}

// Start a new round
function startRound() {
  if (gameState.currentRound > gameState.totalRounds) {
    endGame();
    return;
  }
  
  // Update UI
  document.getElementById('round-number').textContent = gameState.currentRound;
  document.getElementById('current-phase').textContent = 'Bidding';
  
  // Reset bids for this round
  gameState.bids = [];
  gameState.currentPhase = 'bidding';
}

// End game and show final scores
function endGame() {
  gameState.currentPhase = 'setup';
  const finalScoresScreen = document.getElementById('final-scores-screen');
  finalScoresScreen.classList.remove('hidden');
  
  const content = finalScoresScreen.querySelector('.final-scores-content');
  content.innerHTML = '';
  
  gameState.players.forEach(player => {
    const div = document.createElement('div');
    div.className = 'final-score-item';
    div.innerHTML = `<strong>${player.name}</strong>: ${player.score}`;
    content.appendChild(div);
  });
}

// Event listener for new game
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('new-game-btn').addEventListener('click', () => {
    gameState.currentRound = 1;
    gameState.players.forEach(player => player.score = 0);
    gameState.bids = [];
    gameState.currentPhase = 'setup';
    document.getElementById('final-scores-screen').classList.add('hidden');
    renderScores();
    startRound();
  });
  
  initGame();
});
