import { getCurrentRound } from './gameState.js';

// Player storage and ID management
let players = [];
let playerIdCounter = 0;

/**
 * Add a new player to the game
 * @param {string} name - Player name
 * @returns {object} Created player object with id, name, scores array, and totalScore
 */
export function addPlayer(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Player name must be a non-empty string');
  }

  const player = {
    id: playerIdCounter++,
    name: name.trim(),
    scores: [],
    totalScore: 0,
  };

  players.push(player);
  return player;
}

/**
 * Remove a player from the game by id
 * @param {number} id - Player id
 * @returns {boolean} True if player was removed, false otherwise
 */
export function removePlayer(id) {
  if (typeof id !== 'number' || !Number.isInteger(id) || id < 0) {
    throw new Error('Player id must be a non-negative integer');
  }

  const initialLength = players.length;
  players = players.filter((player) => player.id !== id);
  return players.length < initialLength;
}

/**
 * Get a player by id
 * @param {number} id - Player id
 * @returns {object|null} Player object or null if not found
 */
export function getPlayer(id) {
  if (typeof id !== 'number' || !Number.isInteger(id) || id < 0) {
    throw new Error('Player id must be a non-negative integer');
  }

  return players.find((player) => player.id === id) || null;
}

/**
 * Get all players
 * @returns {array} Array of all player objects
 */
export function getAllPlayers() {
  return [...players];
}

/**
 * Update a player's score for the current round
 * @param {number} playerId - Player id
 * @param {number} roundScore - Score for this round
 */
export function updatePlayerScore(playerId, roundScore) {
  if (typeof playerId !== 'number' || !Number.isInteger(playerId) || playerId < 0) {
    throw new Error('Player id must be a non-negative integer');
  }

  if (typeof roundScore !== 'number' || roundScore < 0) {
    throw new Error('Round score must be a non-negative number');
  }

  const player = getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with id ${playerId} not found`);
  }

  const currentRound = getCurrentRound();
  
  // Extend scores array if necessary to fill gaps
  while (player.scores.length <= currentRound) {
    player.scores.push(undefined);
  }
  
  // Set the score for the current round
  player.scores[currentRound] = roundScore;
  
  // Recalculate totalScore: filter out undefined values and sum
  player.totalScore = player.scores.filter((score) => score !== undefined).reduce((sum, score) => sum + score, 0);
}

/**
 * Calculate and return all players sorted by total score (descending)
 * @returns {array} Array of players sorted by totalScore in descending order
 */
export function calculateFinalScores() {
  return players.slice().sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Clear all players (for testing/reset)
 * @internal
 */
export function clearAllPlayers() {
  players = [];
  playerIdCounter = 0;
}

/**
 * Reset the player ID counter (for testing isolation)
 * @internal
 */
export function resetPlayerIdCounter() {
  playerIdCounter = 0;
}
