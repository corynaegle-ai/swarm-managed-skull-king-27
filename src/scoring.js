/**
 * Skull King Scoring Engine
 * 
 * Implements the complete Skull King scoring rules:
 * - Non-zero bids: +20 per correct trick, -10 per missed trick
 * - Zero bids: +10×hands if exact, -10×hands if any tricks taken
 * - Bonus points only apply when bid is exactly met
 */

/**
 * Calculate score for a single player's round
 * 
 * @param {number} bid - The bid amount (0 or higher)
 * @param {number} tricks - The number of tricks actually won
 * @param {number} hands - The hand/round number (for multiplier)
 * @returns {Object} Score breakdown with base score, bonus, and total
 */
function calculateRoundScore(bid, tricks, hands) {
  // Input validation
  if (typeof bid !== 'number' || bid < 0) {
    throw new Error('Invalid bid: must be a non-negative number');
  }
  if (typeof tricks !== 'number' || tricks < 0) {
    throw new Error('Invalid tricks: must be a non-negative number');
  }
  if (typeof hands !== 'number' || hands <= 0) {
    throw new Error('Invalid hands: must be a positive number');
  }

  const isExactBid = bid === tricks;
  let baseScore = 0;
  let bonusScore = 0;

  if (bid === 0) {
    // Zero bid scoring: ±10×hands
    if (tricks === 0) {
      // Exact: took no tricks as bid
      baseScore = 10 * hands;
    } else {
      // Miss: took any tricks when bid 0
      baseScore = -10 * hands;
    }
  } else {
    // Non-zero bid scoring
    if (isExactBid) {
      // Exact bid: +20 per trick
      baseScore = 20 * tricks;
      // Bonus only if exact
      bonusScore = 10 * hands;
    } else {
      // Missed bid: -10 per trick difference
      const difference = Math.abs(bid - tricks);
      baseScore = -10 * difference;
    }
  }

  const totalScore = baseScore + bonusScore;

  return {
    bid,
    tricks,
    hands,
    baseScore,
    bonusScore,
    totalScore,
    isExact: isExactBid,
    breakdown: {
      bid,
      tricks,
      hands,
      baseScore,
      bonusScore,
      totalScore,
      type: bid === 0 ? 'zero-bid' : 'non-zero-bid',
      message: getScoreMessage(bid, tricks, hands, baseScore, bonusScore)
    }
  };
}

/**
 * Get a human-readable message describing the score
 * 
 * @param {number} bid - The bid amount
 * @param {number} tricks - The number of tricks actually won
 * @param {number} hands - The hand/round number
 * @param {number} baseScore - The calculated base score
 * @param {number} bonusScore - The calculated bonus score
 * @returns {string} Human-readable score message
 */
function getScoreMessage(bid, tricks, hands, baseScore, bonusScore) {
  if (bid === 0) {
    if (tricks === 0) {
      return `Perfect! Won 0 tricks as bid. +${baseScore} points (10 × ${hands} hands)`;
    } else {
      return `Failed. Bid 0 but won ${tricks} tricks. ${baseScore} points (-10 × ${hands} hands)`;
    }
  } else {
    if (bid === tricks) {
      const bonusMsg = bonusScore > 0 ? ` + ${bonusScore} bonus (10 × ${hands} hands)` : '';
      return `Exact! Bid ${bid} and won ${bid} tricks. +${baseScore} points${bonusMsg}`;
    } else {
      const difference = Math.abs(bid - tricks);
      return `Missed. Bid ${bid} but won ${tricks} tricks. ${baseScore} points (-10 × ${difference} difference)`;
    }
  }
}

/**
 * Calculate total score for a player across multiple rounds
 * 
 * @param {Array<Object>} rounds - Array of round results with bid, tricks, hands properties
 * @returns {Object} Total score with breakdown by round
 */
function calculateTotalScore(rounds) {
  if (!Array.isArray(rounds)) {
    throw new Error('Rounds must be an array');
  }

  let totalScore = 0;
  const roundScores = [];

  rounds.forEach((round, index) => {
    const roundScore = calculateRoundScore(round.bid, round.tricks, round.hands);
    roundScores.push(roundScore);
    totalScore += roundScore.totalScore;
  });

  return {
    totalScore,
    rounds: roundScores,
    breakdown: {
      totalScore,
      roundCount: rounds.length,
      roundScores: roundScores.map(r => r.totalScore),
      details: roundScores.map(r => r.breakdown)
    }
  };
}

/**
 * Validate scoring for a round
 * 
 * @param {number} bid - The bid amount
 * @param {number} tricks - The number of tricks won
 * @returns {Object} Validation result with isValid and messages
 */
function validateRoundScoring(bid, tricks) {
  const errors = [];
  const warnings = [];

  if (typeof bid !== 'number' || bid < 0) {
    errors.push('Bid must be a non-negative number');
  }
  if (typeof tricks !== 'number' || tricks < 0) {
    errors.push('Tricks must be a non-negative number');
  }

  if (bid >= 0 && tricks >= 0) {
    if (tricks > 13) {
      warnings.push('Tricks exceeds typical maximum of 13');
    }
    if (bid > 13) {
      warnings.push('Bid exceeds typical maximum of 13');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Export for use in Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateRoundScore,
    calculateTotalScore,
    validateRoundScoring,
    getScoreMessage
  };
}

// Export for ES6 modules
if (typeof exports !== 'undefined') {
  exports.calculateRoundScore = calculateRoundScore;
  exports.calculateTotalScore = calculateTotalScore;
  exports.validateRoundScoring = validateRoundScoring;
  exports.getScoreMessage = getScoreMessage;
}
