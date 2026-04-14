import { getCurrentRound } from './gameState.js';

// In-memory player storage
let players = [];
let playerIdCounter = 1;

/**
 * Add a new player with a unique ID
 * @param {string} name - Player name
 * @returns {object} The created player object
 * @throws {Error} If name is invalid
 */
export function addPlayer(name) {
  // Validate input
  if (!name || typeof name !== 'string') {
    throw new Error('Player name must be a non-empty string');
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    throw new Error('Player name cannot be empty or whitespace only');
  }

  // Check for duplicate names
  if (players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error(`Player with name "${trimmedName}" already exists`);
  }

  const newPlayer = {
    id: playerIdCounter++,
    name: trimmedName,
    scores: [],
    totalScore: 0
  };

  players.push(newPlayer);
  return { ...newPlayer }; // Return a copy to prevent external mutation
}

/**
 * Remove a player by ID
 * @param {number} playerId - Player ID to remove
 * @returns {boolean} True if player was removed, false otherwise
 * @throws {Error} If playerId is invalid
 */
export function removePlayer(playerId) {
  // Validate input
  if (typeof playerId !== 'number' || playerId <= 0) {
    throw new Error('Player ID must be a positive number');
  }

  const initialLength = players.length;
  players = players.filter(p => p.id !== playerId);
  return players.length < initialLength;
}

/**
 * Update the score for a player in the current round
 * @param {number} playerId - Player ID
 * @param {number} roundScore - Score for the current round
 * @returns {object} The updated player object
 * @throws {Error} If playerId or roundScore is invalid
 */
export function updatePlayerScore(playerId, roundScore) {
  // Validate inputs
  if (typeof playerId !== 'number' || playerId <= 0) {
    throw new Error('Player ID must be a positive number');
  }

  if (typeof roundScore !== 'number' || !Number.isFinite(roundScore)) {
    throw new Error('Round score must be a finite number');
  }

  const player = players.find(p => p.id === playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found`);
  }

  // Get the current round from gameState
  const currentRound = getCurrentRound();

  // Ensure the scores array has enough slots for the current round
  // Rounds are typically 1-indexed, but scores array is 0-indexed
  const roundIndex = currentRound - 1;
  if (roundIndex < 0) {
    throw new Error('Current round must be 1 or greater');
  }

  // Fill any missing rounds with 0 if needed
  while (player.scores.length <= roundIndex) {
    player.scores.push(0);
  }

  // Update the score for the current round
  player.scores[roundIndex] = roundScore;

  // Recalculate totalScore
  player.totalScore = player.scores.reduce((sum, score) => sum + score, 0);

  return { ...player }; // Return a copy
}

/**
 * Get a player by ID
 * @param {number} playerId - Player ID
 * @returns {object|null} The player object or null if not found
 * @throws {Error} If playerId is invalid
 */
export function getPlayer(id) {
  // Validate input
  if (typeof id !== 'number' || id <= 0) {
    throw new Error('Player ID must be a positive number');
  }

  const player = players.find(p => p.id === id);
  return player ? { ...player } : null; // Return a copy or null
}

/**
 * Get all players
 * @returns {array} Array of all player objects
 */
export function getAllPlayers() {
  // Return a deep copy to prevent external mutation
  return players.map(p => ({ ...p }));
}

/**
 * Calculate final scores and return players sorted by total score (descending)
 * @returns {array} Players sorted by total score (highest first)
 */
export function calculateFinalScores() {
  // Create a copy of all players with their current total scores
  const sortedPlayers = players.map(p => ({ ...p }));

  // Sort by totalScore in descending order (highest first)
  sortedPlayers.sort((a, b) => b.totalScore - a.totalScore);

  return sortedPlayers;
}

/**
 * Clear all players (useful for testing or resetting the game)
 * @internal
 */
export function clearAllPlayers() {
  players = [];
  playerIdCounter = 1;
}

/**
 * Reset player ID counter (useful for testing)
 * @internal
 */
export function resetPlayerIdCounter() {
  playerIdCounter = 1;
}
