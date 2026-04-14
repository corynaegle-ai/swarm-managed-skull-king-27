/**
 * Calculate the score for a single round based on tricks taken and bid
 * Scoring rules:
 * - If tricks taken equals bid: 10 * bid + bonus points
 * - If tricks taken is less than bid (undercut): 0 points
 * - If tricks taken is greater than bid (overcut): -5 points per over
 * 
 * @param {number} tricks - Actual tricks taken by the player
 * @param {number} bid - The bid made by the player
 * @param {number} bonus - Bonus points earned (defaults to 0)
 * @returns {number} The score for this round
 */
export const calculateRoundScore = (tricks, bid, bonus = 0) => {
  if (tricks === bid) {
    return 10 * bid + bonus;
  } else if (tricks < bid) {
    // Undercut: 0 points
    return 0;
  } else {
    // Overcut: -5 points per trick over bid
    return -5 * (tricks - bid);
  }
};

/**
 * Validate that tricks value is within acceptable range
 * @param {number} tricks - Tricks taken
 * @param {number} hand - Current hand number (max possible tricks)
 * @returns {boolean} True if valid
 */
export const isValidTricksValue = (tricks, hand) => {
  return !isNaN(tricks) && tricks >= 0 && tricks <= hand;
};

/**
 * Validate that bonus points is a non-negative number
 * @param {number} bonus - Bonus points
 * @returns {boolean} True if valid
 */
export const isValidBonusPoints = (bonus) => {
  return !isNaN(bonus) && bonus >= 0;
};