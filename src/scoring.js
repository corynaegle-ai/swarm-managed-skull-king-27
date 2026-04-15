/**
 * Skull King Scoring Engine
 * Implements complex scoring rules with transparency and validation
 */

/**
 * Calculates the score for a single round
 * @param {number} bid - The bid for this round (0 or greater)
 * @param {number} tricks - The tricks actually taken
 * @param {number} hands - The hand count for this round
 * @returns {object} Score breakdown with total
 */
function calculateRoundScore(bid, tricks, hands) {
  // Input validation
  if (typeof bid !== 'number' || bid < 0) {
    throw new Error('Bid must be a non-negative number');
  }
  if (typeof tricks !== 'number' || tricks < 0) {
    throw new Error('Tricks must be a non-negative number');
  }
  if (typeof hands !== 'number' || hands <= 0) {
    throw new Error('Hands must be a positive number');
  }

  const breakdown = {
    bid,
    tricks,
    hands,
    baseScore: 0,
    bonusScore: 0,
    totalScore: 0,
    exact: bid === tricks
  };

  // Non-zero bid scoring
  if (bid !== 0) {
    if (bid === tricks) {
      // Exact bid: +20 per trick
      breakdown.baseScore = 20 * tricks;
      // Bonus only if bid is exact
      breakdown.bonusScore = 10 * hands;
      breakdown.totalScore = breakdown.baseScore + breakdown.bonusScore;
    } else {
      // Missed bid: -10 per trick difference
      const difference = Math.abs(bid - tricks);
      breakdown.baseScore = -10 * difference;
      breakdown.bonusScore = 0;
      breakdown.totalScore = breakdown.baseScore;
    }
  } else {
    // Zero bid scoring
    if (tricks === 0) {
      // Exact zero bid: +10 per hand
      breakdown.baseScore = 10 * hands;
      breakdown.bonusScore = 0;
      breakdown.totalScore = breakdown.baseScore;
    } else {
      // Missed zero bid: -10 per hand
      breakdown.baseScore = -10 * hands;
      breakdown.bonusScore = 0;
      breakdown.totalScore = breakdown.baseScore;
    }
  }

  return breakdown;
}

/**
 * Calculates the total score across multiple rounds
 * @param {array} rounds - Array of round objects with {bid, tricks, hands} properties
 * @returns {object} Total score with detailed breakdown per round
 */
function calculateTotalScore(rounds) {
  // Input validation
  if (!Array.isArray(rounds)) {
    throw new Error('Rounds must be an array');
  }
  if (rounds.length === 0) {
    throw new Error('At least one round is required');
  }

  let totalScore = 0;
  const roundBreakdowns = [];

  for (const round of rounds) {
    const breakdown = calculateRoundScore(round.bid, round.tricks, round.hands);
    roundBreakdowns.push(breakdown);
    totalScore += breakdown.totalScore;
  }

  return {
    totalScore,
    rounds: roundBreakdowns,
    roundCount: rounds.length
  };
}

/**
 * Validates that round scoring follows all Skull King rules
 * @param {object} round - Round object with {bid, tricks, hands} properties
 * @returns {object} Validation result with status and details
 */
function validateRoundScoring(round) {
  const validation = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check bid is non-negative
  if (round.bid < 0) {
    validation.valid = false;
    validation.errors.push('Bid cannot be negative');
  }

  // Check tricks is non-negative
  if (round.tricks < 0) {
    validation.valid = false;
    validation.errors.push('Tricks cannot be negative');
  }

  // Check hands is positive
  if (round.hands <= 0) {
    validation.valid = false;
    validation.errors.push('Hands must be positive');
  }

  // Check tricks doesn't exceed bid (for non-zero bids)
  if (round.bid > 0 && round.tricks > round.bid) {
    validation.warnings.push(
      `Tricks (${round.tricks}) exceed bid (${round.bid}) - negative score will apply`
    );
  }

  // Check zero bid constraint
  if (round.bid === 0 && round.tricks !== 0) {
    validation.warnings.push(
      `Zero bid with ${round.tricks} tricks taken - penalty applies`
    );
  }

  return validation;
}

module.exports = {
  calculateRoundScore,
  calculateTotalScore,
  validateRoundScoring
};
