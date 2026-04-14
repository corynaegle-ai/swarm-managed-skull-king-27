/**
 * Game state management
 * Tracks the current round and provides state getters/setters
 */

let currentRound = 0;

/**
 * Get the current round number
 * @returns {number} Current round (0-indexed)
 */
export function getCurrentRound() {
  return currentRound;
}

/**
 * Set the current round number
 * @param {number} round - Round number to set
 */
export function setCurrentRound(round) {
  if (typeof round !== 'number' || !Number.isInteger(round) || round < 0) {
    throw new Error('Round must be a non-negative integer');
  }
  currentRound = round;
}

/**
 * Increment the current round
 */
export function nextRound() {
  currentRound++;
}

/**
 * Reset game state
 * @internal
 */
export function resetGameState() {
  currentRound = 0;
}
