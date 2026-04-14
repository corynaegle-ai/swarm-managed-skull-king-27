/**
 * Calculate the score for a single player in a round based on Skull King rules.
 *
 * Scoring rules:
 * - If bid == tricks taken: 10 points + (10 * bid) + bonus points
 * - If bid != tricks taken: -(10 * abs(bid - tricks taken)) + bonus points
 *
 * @param {Object} params - Scoring parameters
 * @param {number} params.bid - The player's bid for the round
 * @param {number} params.tricksTaken - The number of tricks the player actually took
 * @param {number} params.bonusPoints - Any bonus points earned (pirate, skull king, etc)
 * @returns {number} The calculated score for the round
 */
export const calculateRoundScore = ({ bid, tricksTaken, bonusPoints = 0 }) => {
  if (bid === tricksTaken) {
    // Bid made: 10 points + 10 points per bid + bonus
    return 10 + 10 * bid + bonusPoints;
  } else {
    // Bid failed: -10 points per trick difference + bonus
    return -(10 * Math.abs(bid - tricksTaken)) + bonusPoints;
  }
};

/**
 * Calculate the total score for a player across multiple rounds.
 *
 * @param {number[]} roundScores - Array of scores from each round
 * @returns {number} The total cumulative score
 */
export const calculateTotalScore = (roundScores = []) => {
  return roundScores.reduce((total, score) => total + score, 0);
};

/**
 * Validate if the tricks taken value is legal for a given round.
 *
 * @param {number} tricksTaken - The number of tricks taken
 * @param {number} handSize - The size of the hand (number of cards dealt)
 * @returns {boolean} True if the value is valid
 */
export const isValidTrickCount = (tricksTaken, handSize) => {
  return !isNaN(tricksTaken) && tricksTaken >= 0 && tricksTaken <= handSize;
};
