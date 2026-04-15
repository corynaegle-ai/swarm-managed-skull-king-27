/**
 * Main game module for Skull King
 */

import { collectBids } from './bid-phase.js';

/**
 * Main game state object
 * Tracks game progress and player information
 */
const gameState = {
  players: [],
  scores: {},
  currentRound: 1,
  totalRounds: 10,
  bids: {},
  currentPhase: 'setup',
};

/**
 * Initialize the game with player names
 * @param {string[]} playerNames - Array of player names
 */
function initGame(playerNames) {
  gameState.players = playerNames;
  gameState.scores = {};
  playerNames.forEach(player => {
    gameState.scores[player] = 0;
  });
}

/**
 * Start a new round
 */
function startRound() {
  gameState.currentPhase = 'bidding';
  collectBids(gameState.players, (bids) => {
    gameState.bids = bids;
    gameState.currentPhase = 'scoring';
  });
}

export { gameState, initGame, startRound };
