/**
 * Core scoring calculation module for Skull King game
 * Implements Skull King scoring rules for round and total score calculations
 */

/**
 * Calculates the score for a single round based on Skull King rules
 * 
 * Rules:
 * - Non-zero bid: +20 points per trick if exact bid matched, -10 points per difference if not
 * - Zero bid: +10×handNumber if exact (no tricks), -10×handNumber if any tricks taken
 * 
 * @param {number} bid - The number of tricks bid (0 or greater)
 * @param {number} tricksWon - The number of tricks actually won
 * @param {number} handNumber - The current hand/round number (1 or greater, used for zero bid scoring)
 * @returns {number} The score for this round
 * @throws {Error} If inputs are invalid (negative numbers, non-integers, etc.)
 */
function calculateRoundScore(bid, tricksWon, handNumber) {
  // Input validation
  if (typeof bid !== 'number' || typeof tricksWon !== 'number' || typeof handNumber !== 'number') {
    throw new Error('All parameters must be numbers');
  }
  
  if (!Number.isInteger(bid) || !Number.isInteger(tricksWon) || !Number.isInteger(handNumber)) {
    throw new Error('All parameters must be integers');
  }
  
  if (bid < 0 || tricksWon < 0 || handNumber < 1) {
    throw new Error('Bid and tricksWon must be non-negative, handNumber must be at least 1');
  }
  
  // Non-zero bid scoring
  if (bid !== 0) {
    if (bid === tricksWon) {
      // Exact bid: +20 per trick
      return 20 * bid;
    } else {
      // Missed/extra tricks: -10 per difference
      const difference = Math.abs(bid - tricksWon);
      return -10 * difference;
    }
  }
  
  // Zero bid scoring
  if (tricksWon === 0) {
    // Exact zero bid (no tricks taken): +10×handNumber
    return 10 * handNumber;
  } else {
    // Failed zero bid (tricks taken): -10×handNumber
    return -10 * handNumber;
  }
}

/**
 * Calculates the total score by summing all round scores
 * 
 * @param {number[]} playerScores - Array of scores from each round
 * @returns {number} The total score (sum of all rounds)
 * @throws {Error} If input is not an array or contains non-numbers
 */
function calculateTotalScore(playerScores) {
  // Input validation
  if (!Array.isArray(playerScores)) {
    throw new Error('Input must be an array of scores');
  }
  
  if (playerScores.length === 0) {
    return 0;
  }
  
  // Validate all elements are numbers
  if (!playerScores.every(score => typeof score === 'number')) {
    throw new Error('All scores must be numbers');
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
