/**
 * Player Manager Module
 * Handles all player-related operations including creation, score tracking, and final score calculation.
 * Imports gameState functions to synchronize with current round.
 */

import { getCurrentRound } from './gameState.js';

/**
 * Array to store all players in the game
 * Each player object has: id, name, scores array, totalScore
 */
let players = [];
let playerIdCounter = 1;

/**
 * Generates a unique player ID
 * @private
 * @returns {number} Unique player ID
 */
function generatePlayerId() {
  return playerIdCounter++;
}

/**
 * Creates a new player with a unique ID and empty scores array
 * @param {string} name - The player's name
 * @returns {Object} The created player object
 * @throws {Error} If name is not provided or is empty
 */
export function addPlayer(name) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Player name must be a non-empty string');
  }

  const player = {
    id: generatePlayerId(),
    name: name.trim(),
    scores: [],
    totalScore: 0
  };

  players.push(player);
  return player;
}

/**
 * Removes a player from the game by their ID
 * @param {number} id - The player's ID
 * @returns {boolean} True if player was removed, false if not found
 */
export function removePlayer(id) {
  const initialLength = players.length;
  players = players.filter(player => player.id !== id);
  return players.length < initialLength;
}

/**
 * Updates a player's score for the current round
 * Automatically adds score to the player's scores array at the correct round index
 * @param {number} playerId - The player's ID
 * @param {number} roundScore - The score earned in this round
 * @returns {Object} The updated player object
 * @throws {Error} If player not found or roundScore is invalid
 */
export function updatePlayerScore(playerId, roundScore) {
  const player = players.find(p => p.id === playerId);
  
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  if (typeof roundScore !== 'number' || isNaN(roundScore)) {
    throw new Error('Round score must be a valid number');
  }

  const currentRound = getCurrentRound();
  
  // Ensure the scores array is large enough for the current round
  while (player.scores.length <= currentRound) {
    player.scores.push(0);
  }

  // Update the score for the current round
  player.scores[currentRound] = roundScore;
  
  // Recalculate total score
  player.totalScore = player.scores.reduce((sum, score) => sum + score, 0);
  
  return player;
}

/**
 * Retrieves a single player by their ID
 * @param {number} id - The player's ID
 * @returns {Object|null} The player object or null if not found
 */
export function getPlayer(id) {
  return players.find(player => player.id === id) || null;
}

/**
 * Retrieves all players currently in the game
 * @returns {Array} Array of all player objects
 */
export function getAllPlayers() {
  // Return a copy to prevent external mutation
  return [...players];
}

/**
 * Calculates and returns all players sorted by total score (highest first)
 * @returns {Array} Array of players sorted by total score in descending order
 */
export function calculateFinalScores() {
  // Create a copy and sort by totalScore in descending order
  return [...players].sort((playerA, playerB) => {
    return playerB.totalScore - playerA.totalScore;
  });
}

/**
 * Resets all player data (for new game)
 * @private
 */
export function resetPlayers() {
  players = [];
  playerIdCounter = 1;
}
