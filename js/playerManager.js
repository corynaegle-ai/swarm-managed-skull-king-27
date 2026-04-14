/**
 * Player Manager Module
 * Handles player-related operations and score management
 */

import { getCurrentRound, getTotalRounds } from './gameState.js';

let players = [];
let nextPlayerId = 1;

/**
 * Add a new player to the game
 * @param {string} name - The player's name
 * @returns {object} The created player object with id, name, scores array, and totalScore
 */
export function addPlayer(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Player name must be a non-empty string');
  }
  
  const player = {
    id: nextPlayerId++,
    name: name.trim(),
    scores: [],
    totalScore: 0
  };
  
  players.push(player);
  return { ...player };
}

/**
 * Remove a player from the game
 * @param {number} id - The player's ID
 * @returns {boolean} True if player was removed, false if not found
 */
export function removePlayer(id) {
  const initialLength = players.length;
  players = players.filter(p => p.id !== id);
  return players.length < initialLength;
}

/**
 * Update a player's score for the current round
 * @param {number} playerId - The player's ID
 * @param {number} roundScore - The score for the current round
 */
export function updatePlayerScore(playerId, roundScore) {
  if (typeof roundScore !== 'number' || isNaN(roundScore)) {
    throw new Error('Round score must be a valid number');
  }
  
  const player = players.find(p => p.id === playerId);
  if (!player) {
    throw new Error(`Player with id ${playerId} not found`);
  }
  
  const currentRound = getCurrentRound();
  
  // Ensure scores array is large enough for current round
  while (player.scores.length <= currentRound) {
    player.scores.push(0);
  }
  
  // Update score for current round
  player.scores[currentRound] = roundScore;
  
  // Recalculate total score
  player.totalScore = player.scores.reduce((sum, score) => sum + score, 0);
}

/**
 * Get a specific player by ID
 * @param {number} id - The player's ID
 * @returns {object} The player object, or null if not found
 */
export function getPlayer(id) {
  const player = players.find(p => p.id === id);
  return player ? { ...player, scores: [...player.scores] } : null;
}

/**
 * Get all players
 * @returns {array} Array of all player objects
 */
export function getAllPlayers() {
  return players.map(p => ({
    ...p,
    scores: [...p.scores]
  }));
}

/**
 * Calculate final scores and return players sorted by total score (highest first)
 * @returns {array} Players sorted by total score in descending order
 */
export function calculateFinalScores() {
  // Create a copy and sort by totalScore descending
  const sorted = players
    .map(p => ({
      ...p,
      scores: [...p.scores]
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
  
  return sorted;
}

/**
 * Reset all players (for testing or game restart)
 */
export function resetPlayers() {
  players = [];
  nextPlayerId = 1;
}

/**
 * Get the total score for a specific player
 * @param {number} id - The player's ID
 * @returns {number} The player's total score, or null if not found
 */
export function getPlayerTotalScore(id) {
  const player = players.find(p => p.id === id);
  return player ? player.totalScore : null;
}
