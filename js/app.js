// Main game controller - imports and orchestrates gameState and playerManager
import gameState from './gameState.js';
import playerManager from './playerManager.js';

/**
 * Render current round information
 */
function renderRoundInfo() {
  const roundInfoEl = document.getElementById('round-info');
  if (!roundInfoEl) return;
  
  const currentRound = gameState.getCurrentRound();
  roundInfoEl.textContent = `Round ${currentRound} of 10`;
}

/**
 * Render player scores table
 */
function renderPlayerScores() {
  const scoresTableEl = document.getElementById('player-scores-table');
  if (!scoresTableEl) return;
  
  const players = playerManager.getPlayers();
  
  // Clear existing rows except header
  const rows = scoresTableEl.querySelectorAll('tbody tr');
  rows.forEach(row => row.remove());
  
  const tbody = scoresTableEl.querySelector('tbody');
  if (!tbody) return;
  
  players.forEach(player => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${player.name}</td>
      <td>${player.totalScore}</td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Render current game phase indicator
 */
function renderGamePhase() {
  const phaseEl = document.getElementById('phase-indicator');
  if (!phaseEl) return;
  
  const currentPhase = gameState.getCurrentPhase();
  const phaseNames = {
    'bid': 'Bidding Phase',
    'play': 'Play Phase',
    'score': 'Scoring Phase'
  };
  
  phaseEl.textContent = phaseNames[currentPhase] || 'Unknown Phase';
}

/**
 * Render final scores screen (shown after round 10)
 */
function renderFinalScores() {
  const finalScoresEl = document.getElementById('final-scores-screen');
  if (!finalScoresEl) return;
  
  const currentRound = gameState.getCurrentRound();
  if (currentRound <= 10) {
    finalScoresEl.classList.add('hidden');
    return;
  }
  
  finalScoresEl.classList.remove('hidden');
  const scoresContent = finalScoresEl.querySelector('.final-scores-content');
  if (!scoresContent) return;
  
  const players = playerManager.getPlayers();
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  
  scoresContent.innerHTML = '';
  sortedPlayers.forEach((player, index) => {
    const scoreEl = document.createElement('div');
    scoreEl.className = 'final-score-entry';
    scoreEl.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <span class="name">${player.name}</span>
      <span class="score">${player.totalScore}</span>
    `;
    scoresContent.appendChild(scoreEl);
  });
}

/**
 * Update all UI elements
 */
function updateUI() {
  renderRoundInfo();
  renderPlayerScores();
  renderGamePhase();
  renderFinalScores();
}

/**
 * Initialize the game
 */
function initializeGame() {
  // Set up event listeners for state transitions
  gameState.on('roundChanged', () => {
    updateUI();
  });
  
  gameState.on('phaseChanged', () => {
    updateUI();
  });
  
  playerManager.on('scoresUpdated', () => {
    updateUI();
  });
  
  // Set up new game button
  const newGameBtn = document.getElementById('new-game-btn');
  if (newGameBtn) {
    newGameBtn.addEventListener('click', () => {
      gameState.reset();
      playerManager.resetAllScores();
      updateUI();
    });
  }
  
  // Initial render
  updateUI();
}

/**
 * Start the application when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}

export { renderRoundInfo, renderPlayerScores, renderGamePhase, renderFinalScores, updateUI };
