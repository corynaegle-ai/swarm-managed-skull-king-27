/**
 * Skull King Game - Core Scoring Calculation Module
 * Implements scoring rules for the Skull King card game
 */

/**
 * Calculate the score for a single round based on bid and tricks won
 * 
 * Scoring Rules:
 * - Non-zero bid: +20 per trick if exact match, -10 per difference if not exact
 * - Zero bid: +10×handNumber if exact (0 tricks), -10×handNumber if any tricks taken
 * 
 * @param {number} bid - The number of tricks the player bid (0 or positive)
 * @param {number} tricksWon - The number of tricks actually won (0 or positive)
 * @param {number} handNumber - The current hand number (1-indexed, used for zero-bid scoring)
 * @returns {number} The score for this round
 * @throws {Error} If parameters are invalid
 */
function calculateRoundScore(bid, tricksWon, handNumber) {
  // Input validation
  if (typeof bid !== 'number' || typeof tricksWon !== 'number' || typeof handNumber !== 'number') {
    throw new Error('All parameters must be numbers');
  }
  
  if (!Number.isInteger(bid) || !Number.isInteger(tricksWon) || !Number.isInteger(handNumber)) {
    throw new Error('All parameters must be integers');
  }
  
  if (bid < 0 || tricksWon < 0 || handNumber <= 0) {
    throw new Error('Bid and tricksWon must be non-negative, handNumber must be positive');
  }
  
  // Handle zero bid case
  if (bid === 0) {
    // Zero bid: exactly 0 tricks won earns +10×handNumber
    if (tricksWon === 0) {
      return 10 * handNumber;
    } else {
      // Any tricks taken with zero bid: -10×handNumber
      return -10 * handNumber;
    }
  }
  
  // Handle non-zero bid case
  if (bid === tricksWon) {
    // Exact match: +20 per trick
    return 20 * bid;
  } else {
    // Not exact: -10 per difference
    const difference = Math.abs(bid - tricksWon);
    return -10 * difference;
  }
}

/**
 * Calculate total score by summing all round scores
 * 
 * @param {Array<number>} playerScores - Array of scores from each round
 * @returns {number} The total cumulative score
 * @throws {Error} If playerScores is not a valid array of numbers
 */
function calculateTotalScore(playerScores) {
  // Input validation
  if (!Array.isArray(playerScores)) {
    throw new Error('playerScores must be an array');
  }
  
  if (playerScores.length === 0) {
    return 0;
  }
  
  // Validate all elements are numbers
  for (let i = 0; i < playerScores.length; i++) {
    if (typeof playerScores[i] !== 'number') {
      throw new Error(`playerScores[${i}] is not a number`);
    }
    if (!Number.isFinite(playerScores[i])) {
      throw new Error(`playerScores[${i}] is not a finite number`);
    }
  }
  
  // Sum all scores
  return playerScores.reduce((sum, score) => sum + score, 0);
}

// Export functions for use by game engine
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateRoundScore,
    calculateTotalScore
  };
}