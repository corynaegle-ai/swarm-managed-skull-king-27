import { getCurrentRound, getTotalRounds } from './gameState.js';

// In-memory store for players
let players = [];
let nextPlayerId = 1;

/**
 * Add a new player to the game
 * @param {string} name - The player's name
 * @returns {Object} The created player object with id, name, scores array, and totalScore
 */
export function addPlayer(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Player name must be a non-empty string');
  }

  const player = {
    id: nextPlayerId++,
    name: name.trim(),
    scores: [],
    totalScore: 0
  };

  players.push(player);
  return player;
}

/**
 * Remove a player from the game by id
 * @param {number} id - The player id to remove
 * @returns {boolean} True if player was removed, false if not found
 */
export function removePlayer(id) {
  const index = players.findIndex(p => p.id === id);
  if (index !== -1) {
    players.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Update a player's score for the current round
 * @param {number} playerId - The player id
 * @param {number} roundScore - The score for this round
 * @returns {Object} The updated player object
 */
export function updatePlayerScore(playerId, roundScore) {
  const player = getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with id ${playerId} not found`);
  }

  if (typeof roundScore !== 'number' || roundScore < 0) {
    throw new Error('Round score must be a non-negative number');
  }

  const currentRound = getCurrentRound();
  
  // Ensure scores array has enough slots for current round
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
 * Get a player by id
 * @param {number} id - The player id
 * @returns {Object|null} The player object or null if not found
 */
export function getPlayer(id) {
  return players.find(p => p.id === id) || null;
}

/**
 * Get all players
 * @returns {Array} Array of all player objects
 */
export function getAllPlayers() {
  return [...players];
}

/**
 * Calculate final scores and return players sorted by total score (descending)
 * @returns {Array} Array of players sorted by total score in descending order
 */
export function calculateFinalScores() {
  // Create a new array to avoid mutating original
  const sortedPlayers = [...players].map(player => ({
    ...player,
    scores: [...player.scores],
    totalScore: player.scores.reduce((sum, score) => sum + score, 0)
  }));

  // Sort by total score in descending order
  return sortedPlayers.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Reset all players (useful for new game)
 */
export function resetPlayers() {
  players = [];
  nextPlayerId = 1;
}
