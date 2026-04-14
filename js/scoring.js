/**
 * Scoring module for Skull King card game
 * Implements scoring rules for both zero and non-zero bids
 */

/**
 * Calculates the score for a single round
 * 
 * Scoring rules:
 * - Non-zero bid: +20 per trick if exact match, -10 per difference if not
 * - Zero bid: +10×handNumber if exact (0 tricks), -10×handNumber if any tricks taken
 * 
 * @param {number} bid - The number of tricks bid (0 or positive integer)
 * @param {number} tricksWon - The actual number of tricks won (0 or positive integer)
 * @param {number} handNumber - The hand/round number (1-13 for Skull King)
 * @returns {number} The score for this round
 * @throws {Error} If parameters are invalid
 */
function calculateRoundScore(bid, tricksWon, handNumber) {
  // Input validation
  if (typeof bid !== 'number' || bid < 0 || !Number.isInteger(bid)) {
    throw new Error(`Invalid bid: must be a non-negative integer, received ${bid}`);
  }
  
  if (typeof tricksWon !== 'number' || tricksWon < 0 || !Number.isInteger(tricksWon)) {
    throw new Error(`Invalid tricksWon: must be a non-negative integer, received ${tricksWon}`);
  }
  
  if (typeof handNumber !== 'number' || handNumber <= 0 || !Number.isInteger(handNumber)) {
    throw new Error(`Invalid handNumber: must be a positive integer, received ${handNumber}`);
  }
  
  // Zero bid scoring: +10×handNumber if exact (0 tricks), -10×handNumber if any tricks
  if (bid === 0) {
    if (tricksWon === 0) {
      return 10 * handNumber;
    } else {
      return -10 * handNumber;
    }
  }
  
  // Non-zero bid scoring: +20 per trick if exact, -10 per difference if not
  if (bid === tricksWon) {
    return 20 * bid;
  } else {
    const difference = Math.abs(bid - tricksWon);
    return -10 * difference;
  }
}

/**
 * Calculates the total score across all rounds
 * 
 * @param {Array<number>} playerScores - Array of round scores for a player
 * @returns {number} The sum of all round scores
 * @throws {Error} If playerScores is not a valid array of numbers
 */
function calculateTotalScore(playerScores) {
  // Input validation
  if (!Array.isArray(playerScores)) {
    throw new Error(`Invalid playerScores: must be an array, received ${typeof playerScores}`);
  }
  
  if (playerScores.length === 0) {
    return 0;
  }
  
  // Validate all elements are numbers
  for (let i = 0; i < playerScores.length; i++) {
    if (typeof playerScores[i] !== 'number') {
      throw new Error(`Invalid score at index ${i}: must be a number, received ${typeof playerScores[i]}`);
    }
  }
  
  // Sum all scores
  return playerScores.reduce((total, score) => total + score, 0);
}

// Export functions for use by game engine
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateRoundScore,
    calculateTotalScore
  };
}
