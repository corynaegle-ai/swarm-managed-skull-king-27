/**
 * Scoring module for Skull King card game
 * Implements the core scoring rules and calculations
 */

/**
 * Calculate the score for a single round
 * 
 * Scoring Rules:
 * - Non-zero bid: +20 points per trick if bid is exact, -10 points per difference if not exact
 * - Zero bid: +10 × handNumber points if exact (0 tricks taken), -10 × handNumber if any tricks taken
 * 
 * @param {number} bid - The bid made by the player (0 or higher)
 * @param {number} tricksWon - The number of tricks actually won
 * @param {number} handNumber - The hand number (round number, typically 1-13)
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
    // Zero bid is exact if no tricks were taken
    if (tricksWon === 0) {
      // Exact: +10 × handNumber
      return 10 * handNumber;
    } else {
      // Not exact: -10 × handNumber
      return -10 * handNumber;
    }
  }

  // Non-zero bid scoring
  if (bid === tricksWon) {
    // Exact bid: +20 per trick
    return 20 * bid;
  } else {
    // Not exact: -10 per difference
    const difference = Math.abs(bid - tricksWon);
    return -10 * difference;
  }
}

/**
 * Calculate the total score from all rounds
 * 
 * @param {number[]} playerScores - Array of scores from each round
 * @returns {number} The sum of all round scores
 * @throws {Error} If input is invalid
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
      throw new Error(`Element at index ${i} is not a number`);
    }
  }

  // Sum all scores
  return playerScores.reduce((total, score) => total + score, 0);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateRoundScore,
    calculateTotalScore
  };
}
