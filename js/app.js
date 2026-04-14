/**
 * Main application entry point
 * Integrates game state and UI
 */

import { getCurrentRound, nextRound, setCurrentRound } from './gameState.js';
import { addPlayer, getAllPlayers, updatePlayerScore, calculateFinalScores } from './playerManager.js';

// Application initialization
function initializeApp() {
  console.log('Skull King Game initialized');
}

// Initialize the app
initializeApp();
