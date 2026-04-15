import { collectBids } from './bid-phase.js';

// Initialize game state
const gameState = {
  players: [],
  scores: {},
  currentPhase: 'bidding',
  bids: [],
};

// Initialize player scores table
function renderPlayerScores() {
  const scoreTable = document.querySelector('#player-scores-table tbody');
  scoreTable.innerHTML = '';
  gameState.players.forEach((player) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${player}</td>
      <td>${gameState.scores[player] || 0}</td>
    `;
    scoreTable.appendChild(row);
  });
}

// Simulate round play
function startRound() {
  console.log('Round started');
  gameState.currentPhase = 'bidding';
  document.getElementById('current-phase').textContent = 'Bidding';
  collectBids();
}

// Finish round
function endRound() {
  console.log('Round ended');
  gameState.currentPhase = 'scoring';
  document.getElementById('current-phase').textContent = 'Scoring';
}

// Export functions for use in other modules
export { gameState, renderPlayerScores, startRound, endRound };
