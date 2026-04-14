/**
 * Skull King Scoring Engine
 * 
 * Implements complex scoring rules:
 * - Non-zero bids: +20 per correct trick, -10 per missed trick
 * - Zero bids: +10×hands if exact, -10×hands if any tricks taken
 * - Bonus points only apply when bid is exactly met
 */

/**
 * Calculate score for a single hand/round
 * @param {number} bid - The bid amount (0-13)
 * @param {number} tricks - Actual tricks taken (0-13)
 * @param {number} handNumber - The hand number (1-indexed, used for zero bid multiplier)
 * @param {number} bonusPoints - Bonus points if available (only applied on exact bid)
 * @returns {Object} {baseScore, bonusApplied, totalScore, breakdown}
 */
function calculateHandScore(bid, tricks, handNumber, bonusPoints = 0) {
  // Input validation
  if (typeof bid !== 'number' || typeof tricks !== 'number' || typeof handNumber !== 'number') {
    throw new TypeError('bid, tricks, and handNumber must be numbers');
  }
  
  if (bid < 0 || bid > 13 || !Number.isInteger(bid)) {
    throw new RangeError('bid must be an integer between 0 and 13');
  }
  
  if (tricks < 0 || tricks > 13 || !Number.isInteger(tricks)) {
    throw new RangeError('tricks must be an integer between 0 and 13');
  }
  
  if (handNumber < 1 || !Number.isInteger(handNumber)) {
    throw new RangeError('handNumber must be a positive integer');
  }
  
  if (typeof bonusPoints !== 'number') {
    throw new TypeError('bonusPoints must be a number');
  }

  let baseScore = 0;
  let bonusApplied = 0;
  let breakdown = '';

  const isBidExact = (bid === tricks);

  if (bid === 0) {
    // Zero bid scoring: ±10 × hand_number
    if (tricks === 0) {
      // Exact zero bid - all tricks avoided
      baseScore = 10 * handNumber;
      breakdown = `Zero bid exactly met: +10 × ${handNumber} = ${baseScore}`;
    } else {
      // Missed zero bid - took at least one trick
      baseScore = -10 * handNumber;
      breakdown = `Zero bid missed (${tricks} trick(s) taken): -10 × ${handNumber} = ${baseScore}`;
    }
  } else {
    // Non-zero bid scoring
    if (isBidExact) {
      // Exact bid: +20 per trick
      baseScore = 20 * tricks;
      breakdown = `Non-zero bid exact: +20 × ${tricks} tricks = ${baseScore}`;
      
      // Apply bonus only on exact bid
      if (bonusPoints > 0) {
        bonusApplied = bonusPoints;
        breakdown += `; Bonus: +${bonusPoints}`;
      }
    } else {
      // Missed bid: -10 per trick difference
      const difference = Math.abs(bid - tricks);
      baseScore = -10 * difference;
      breakdown = `Non-zero bid missed: -10 × |${bid} - ${tricks}| = -10 × ${difference} = ${baseScore}`;
    }
  }

  const totalScore = baseScore + bonusApplied;

  return {
    baseScore,
    bonusApplied,
    totalScore,
    breakdown,
    isBidExact
  };
}

/**
 * Calculate total score for a game round (all players)
 * @param {Array} roundResults - Array of {bid, tricks, handNumber, bonusPoints} for each player
 * @returns {Object} scores object with player scores and breakdown
 */
function calculateRoundScores(roundResults) {
  if (!Array.isArray(roundResults)) {
    throw new TypeError('roundResults must be an array');
  }

  if (roundResults.length === 0) {
    throw new Error('roundResults cannot be empty');
  }

  const result = {};

  roundResults.forEach((playerRound, index) => {
    const { bid, tricks, handNumber, bonusPoints = 0, playerId = index } = playerRound;
    
    const score = calculateHandScore(bid, tricks, handNumber, bonusPoints);
    result[playerId] = score;
  });

  return result;
}

/**
 * Update cumulative game scores
 * @param {Object} currentTotals - Current cumulative scores by player
 * @param {Object} roundScores - Round scores from calculateRoundScores
 * @returns {Object} Updated total scores
 */
function updateTotalScores(currentTotals, roundScores) {
  if (typeof currentTotals !== 'object' || currentTotals === null) {
    throw new TypeError('currentTotals must be an object');
  }

  if (typeof roundScores !== 'object' || roundScores === null) {
    throw new TypeError('roundScores must be an object');
  }

  const updated = { ...currentTotals };

  Object.keys(roundScores).forEach(playerId => {
    if (!(playerId in updated)) {
      updated[playerId] = 0;
    }
    updated[playerId] += roundScores[playerId].totalScore;
  });

  return updated;
}

/**
 * Get detailed score breakdown for a round
 * @param {Object} roundScores - Round scores from calculateRoundScores
 * @returns {Array} Array of score breakdown objects
 */
function getScoreBreakdown(roundScores) {
  if (typeof roundScores !== 'object' || roundScores === null) {
    throw new TypeError('roundScores must be an object');
  }

  return Object.keys(roundScores).map(playerId => ({
    playerId,
    ...roundScores[playerId]
  }));
}

module.exports = {
  calculateHandScore,
  calculateRoundScores,
  updateTotalScores,
  getScoreBreakdown
};
