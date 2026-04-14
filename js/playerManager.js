import { getCurrentRound, nextRound } from './gameState.js';

// In-memory player storage
let players = [];

/**
 * Generate a UUID v4-like unique ID for players
 * @returns {string} A unique identifier
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a deep copy of a player object (excluding scores map for now)
 * @param {Object} player - The player to copy
 * @returns {Object} A deep copy of the player
 */
function copyPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    scores: new Map(player.scores), // Deep copy of the Map
    totalScore: player.totalScore
  };
}

/**
 * Add a new player to the game
 * @param {string} name - The name of the player
 * @returns {Object} The created player object
 */
export function addPlayer(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Player name must be a non-empty string');
  }

  const newPlayer = {
    id: generateUUID(),
    name: name.trim(),
    scores: new Map(), // Map<roundNumber, score>
    totalScore: 0
  };

  players.push(newPlayer);
  return copyPlayer(newPlayer);
}

/**
 * Remove a player from the game
 * @param {string} id - The player ID to remove
 * @returns {boolean} True if player was removed, false if not found
 */
export function removePlayer(id) {
  const index = players.findIndex(p => p.id === id);
  if (index === -1) {
    return false;
  }
  players.splice(index, 1);
  return true;
}

/**
 * Get a specific player by ID
 * @param {string} id - The player ID
 * @returns {Object|null} A copy of the player object, or null if not found
 */
export function getPlayer(id) {
  const player = players.find(p => p.id === id);
  return player ? copyPlayer(player) : null;
}

/**
 * Get all players
 * @returns {Array} An array of deep copies of all players
 */
export function getAllPlayers() {
  return players.map(player => copyPlayer(player));
}

/**
 * Update a player's score for the current round
 * @param {string} playerId - The player ID
 * @param {number} roundScore - The score for this round (can be negative)
 * @returns {Object} The updated player object
 */
export function updatePlayerScore(playerId, roundScore) {
  if (typeof roundScore !== 'number') {
    throw new Error('Round score must be a number');
  }

  const player = players.find(p => p.id === playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  const currentRound = getCurrentRound();

  // Store the score for this round in the Map
  // This allows negative scores and ensures one score per round
  player.scores.set(currentRound, roundScore);

  // Recalculate total score by summing all stored scores
  player.totalScore = Array.from(player.scores.values()).reduce(
    (sum, score) => sum + score,
    0
  );

  return copyPlayer(player);
}

/**
 * Calculate final scores for all players
 * @returns {Array} Array of players sorted by total score (highest first)
 */
export function calculateFinalScores() {
  // Create copies to avoid external mutation
  const playerCopies = players.map(player => copyPlayer(player));

  // Sort by totalScore in descending order (highest first)
  return playerCopies.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Clear all players (used for resetting the game)
 */
export function clearAllPlayers() {
  players = [];
}

/**
 * Get the number of players in the game
 * @returns {number} The count of players
 */
export function getPlayerCount() {
  return players.length;
}
