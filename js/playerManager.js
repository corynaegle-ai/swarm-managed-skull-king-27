/**
 * Player Manager Module
 * Handles all player-related operations including creation, score management, and final score calculations
 */

import { getCurrentRound } from './gameState.js';

// Store all players
let players = [];
let nextPlayerId = 1;

/**
 * Generate a unique player ID
 * @returns {number} Unique player ID
 */
function generatePlayerId() {
  return nextPlayerId++;
}

/**
 * Create a new player object
 * @param {string} name - Player name
 * @returns {Object} Player object with id, name, scores array, and totalScore
 */
function createPlayerObject(name) {
  return {
    id: generatePlayerId(),
    name: name,
    scores: [],
    totalScore: 0
  };
}

/**
 * Add a new player to the game
 * @param {string} name - Player name
 * @returns {Object} The newly created player object
 * @throws {Error} If name is invalid
 */
export function addPlayer(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Player name must be a non-empty string');
  }

  const newPlayer = createPlayerObject(name.trim());
  players.push(newPlayer);
  return newPlayer;
}

/**
 * Remove a player from the game
 * @param {number} id - Player ID
 * @returns {boolean} True if player was removed, false if not found
 */
export function removePlayer(id) {
  const initialLength = players.length;
  players = players.filter(player => player.id !== id);
  return players.length < initialLength;
}

/**
 * Update a player's score for the current round
 * @param {number} playerId - Player ID
 * @param {number} roundScore - Score for the current round
 * @throws {Error} If player not found or score is invalid
 */
export function updatePlayerScore(playerId, roundScore) {
  const player = players.find(p => p.id === playerId);
  
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }
  
  if (typeof roundScore !== 'number' || !isFinite(roundScore)) {
    throw new Error('Round score must be a valid number');
  }

  const currentRound = getCurrentRound();
  
  // Ensure scores array is large enough
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
 * @param {number} id - Player ID
 * @returns {Object|null} Player object or null if not found
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
 * Calculate final scores and return sorted by total score (descending)
 * @returns {Array} Players sorted by total score in descending order
 */
export function calculateFinalScores() {
  // Sort players by total score in descending order
  return [...players].sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Reset all players (utility function for new games)
 */
export function resetAllPlayers() {
  players = [];
  nextPlayerId = 1;
}
