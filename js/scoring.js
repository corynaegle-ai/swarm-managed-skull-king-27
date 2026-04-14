/**
 * Skull King Scoring Module
 * Implements core scoring calculation functions following Skull King game rules
 */

/**
 * Calculates the score for a single round based on bid and tricks won
 * 
 * Skull King Scoring Rules:
 * - For non-zero bids: +20 per trick if exact match, -10 per difference if not exact
 * - For zero bids: +10×handNumber if exact (no tricks taken), -10×handNumber if any tricks taken
 * 
 * @param {number} bid - The number of tricks the player bid (0 or positive integer)
 * @param {number} tricksWon - The number of tricks actually won (0 or positive integer)
 * @param {number} handNumber - The current hand/round number (1 or positive integer)
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
  
  if (bid < 0) {
    throw new Error('Bid cannot be negative');
  }
  
  if (tricksWon < 0) {
    throw new Error('Tricks won cannot be negative');
  }
  
  if (handNumber <= 0) {
    throw new Error('Hand number must be positive');
  }
  
  // Zero bid scoring
  if (bid === 0) {
    if (tricksWon === 0) {
      // Exact match: +10 per hand number
      return 10 * handNumber;
    } else {
      // Did not match: -10 per hand number
      return -10 * handNumber;
    }
  }
  
  // Non-zero bid scoring
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
 * Calculates the total score by summing all round scores
 * 
 * @param {Array<number>} playerScores - Array of individual round scores
 * @returns {number} The total score across all rounds
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
  
  for (let i = 0; i < playerScores.length; i++) {
    if (typeof playerScores[i] !== 'number' || !Number.isInteger(playerScores[i])) {
      throw new Error(`playerScores[${i}] must be an integer`);
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
