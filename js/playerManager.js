import * as gameState from './gameState.js';

// In-memory storage for players
let players = [];
let nextPlayerId = 1;

/**
 * Creates a unique player ID
 * @returns {number} Unique player ID
 */
function generatePlayerId() {
  return nextPlayerId++;
}

/**
 * Adds a new player to the game
 * @param {string} name - Player name
 * @returns {Object} Created player object with id, name, scores array, and totalScore
 * @throws {Error} If name is empty or invalid
 */
export function addPlayer(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
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
 * Removes a player from the game
 * @param {number} id - Player ID to remove
 * @returns {boolean} True if player was removed, false otherwise
 */
export function removePlayer(id) {
  const initialLength = players.length;
  players = players.filter(p => p.id !== id);
  return players.length < initialLength;
}

/**
 * Updates a player's score for the current round
 * @param {number} playerId - Player ID
 * @param {number} roundScore - Score for this round
 * @throws {Error} If player not found or score is invalid
 */
export function updatePlayerScore(playerId, roundScore) {
  if (typeof roundScore !== 'number' || roundScore < 0) {
    throw new Error('Round score must be a non-negative number');
  }

  const player = getPlayer(playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  player.scores.push(roundScore);
  player.totalScore += roundScore;
}

/**
 * Gets a player by ID
 * @param {number} id - Player ID
 * @returns {Object|null} Player object or null if not found
 */
export function getPlayer(id) {
  return players.find(p => p.id === id) || null;
}

/**
 * Gets all players
 * @returns {Array} Array of all player objects
 */
export function getAllPlayers() {
  return [...players];
}

/**
 * Calculates final scores and returns players sorted by total score (highest first)
 * @returns {Array} Array of players sorted by totalScore in descending order
 */
export function calculateFinalScores() {
  return [...players]
    .map(player => ({
      ...player,
      scores: [...player.scores]
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Resets all players and the ID counter (useful for testing)
 */
export function resetPlayers() {
  players = [];
  nextPlayerId = 1;
}

/**
 * Gets the count of current players
 * @returns {number} Number of players in the game
 */
export function getPlayerCount() {
  return players.length;
}
