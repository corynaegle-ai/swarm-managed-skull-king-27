/**
 * app.js - Main application controller
 * Manages UI rendering and game flow state synchronization
 */

import gameState from './gameState.js';
import playerManager from './playerManager.js';

/**
 * Escapes HTML special characters to prevent XSS vulnerabilities
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for innerHTML
 */
function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, char => map[char]);
}

/**
 * Renders round information in both the header and main section
 */
function renderRoundInfo() {
  const currentRound = gameState.getCurrentRound();
  const totalRounds = gameState.getTotalRounds();
  
  // Update header round-info
  const roundInfoElement = document.getElementById('round-info');
  if (roundInfoElement) {
    roundInfoElement.textContent = `Round ${currentRound} of ${totalRounds}`;
  }
  
  // Update main section round-number span
  const roundNumberElement = document.getElementById('round-number');
  if (roundNumberElement) {
    roundNumberElement.textContent = String(currentRound);
  }
}

/**
 * Renders player scores table with sanitized player names
 */
function renderPlayerScores() {
  const players = playerManager.getPlayers();
  const scoresTableBody = document.querySelector('#player-scores-table tbody');
  
  if (!scoresTableBody) {
    console.warn('Player scores table body not found');
    return;
  }
  
  // Clear existing rows
  scoresTableBody.innerHTML = '';
  
  // Add new rows for each player
  players.forEach(player => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const scoreCell = document.createElement('td');
    
    // Sanitize player name to prevent XSS
    nameCell.textContent = player.name;
    scoreCell.textContent = String(player.score);
    
    row.appendChild(nameCell);
    row.appendChild(scoreCell);
    scoresTableBody.appendChild(row);
  });
}

/**
 * Renders game phase information in both the header and main section
 */
function renderGamePhase() {
  const currentPhase = gameState.getCurrentPhase();
  
  // Format phase for display (e.g., "BIDDING" -> "Bidding")
  const displayPhase = currentPhase
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Update header phase-indicator
  const phaseIndicatorElement = document.getElementById('phase-indicator');
  if (phaseIndicatorElement) {
    phaseIndicatorElement.textContent = `${displayPhase} Phase`;
  }
  
  // Update main section current-phase span
  const currentPhaseElement = document.getElementById('current-phase');
  if (currentPhaseElement) {
    currentPhaseElement.textContent = displayPhase;
  }
}

/**
 * Renders final scores screen with sanitized player names
 * Shows the screen when game is over, hides otherwise
 */
function renderFinalScores() {
  const finalScoresScreen = document.getElementById('final-scores-screen');
  const finalScoresContent = document.querySelector('.final-scores-content');
  
  if (!finalScoresScreen || !finalScoresContent) {
    console.warn('Final scores screen elements not found');
    return;
  }
  
  // Check if game is over
  const isGameOver = gameState.isGameOver();
  
  if (isGameOver) {
    // Get players and sort by score descending
    const players = playerManager.getPlayers();
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    // Clear and populate final scores content
    finalScoresContent.innerHTML = '';
    
    sortedPlayers.forEach((player, index) => {
      const playerScoreDiv = document.createElement('div');
      playerScoreDiv.className = 'final-score-item';
      
      // Sanitize player name using textContent instead of innerHTML
      const playerScoreText = document.createTextNode(
        `${index + 1}. ${player.name}: ${player.score} points`
      );
      playerScoreDiv.appendChild(playerScoreText);
      
      finalScoresContent.appendChild(playerScoreDiv);
    });
    
    // Show the final scores screen
    finalScoresScreen.classList.remove('hidden');
  } else {
    // Hide the final scores screen if game is not over
    finalScoresScreen.classList.add('hidden');
  }
}

/**
 * Updates all UI elements
 */
function updateUI() {
  renderRoundInfo();
  renderPlayerScores();
  renderGamePhase();
  renderFinalScores();
}

/**
 * Handles new game button click
 */
function handleNewGame() {
  try {
    // Reset game state
    gameState.reset();
    
    // Reset player scores
    playerManager.resetAllScores();
    
    // Explicitly hide final scores screen
    const finalScoresScreen = document.getElementById('final-scores-screen');
    if (finalScoresScreen) {
      finalScoresScreen.classList.add('hidden');
    }
    
    // Update UI to reflect reset state
    updateUI();
  } catch (error) {
    console.error('Error resetting game:', error);
  }
}

/**
 * Initializes the application
 */
function initializeApp() {
  try {
    // Set up event listeners for state changes
    gameState.subscribe(() => {
      updateUI();
    });
    
    playerManager.subscribe(() => {
      updateUI();
    });
    
    // Set up new game button listener
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', handleNewGame);
    }
    
    // Initial UI render
    updateUI();
    
    console.log('Game initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    // Display user-friendly error message
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
      appContainer.insertAdjacentHTML(
        'afterbegin',
        '<div style="background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 12px; margin: 10px; border-radius: 4px;">'
        + 'Error: Failed to initialize game. Please refresh the page.'
        + '</div>'
      );
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
