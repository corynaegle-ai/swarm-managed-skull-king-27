/**
 * Skull King Scoring Engine
 * Implements complex scoring rules for the card game Skull King
 */

/**
 * Calculate score for a single player's trick attempt
 * @param {number} bid - Number of tricks bid by the player (0 or positive)
 * @param {number} tricks - Actual number of tricks taken
 * @param {number} hands - Number of hands/rounds played
 * @returns {object} Score breakdown with base, bonus, and total
 * @throws {Error} If parameters are invalid
 */
function calculateScore(bid, tricks, hands) {
  // Validate inputs
  if (!Number.isInteger(bid) || bid < 0) {
    throw new Error(`Invalid bid: must be a non-negative integer, got ${bid}`);
  }
  if (!Number.isInteger(tricks) || tricks < 0) {
    throw new Error(`Invalid tricks: must be a non-negative integer, got ${tricks}`);
  }
  if (!Number.isInteger(hands) || hands <= 0) {
    throw new Error(`Invalid hands: must be a positive integer, got ${hands}`);
  }

  const isExactBid = bid === tricks;

  if (bid === 0) {
    // Zero bid scoring
    let baseScore;
    if (tricks === 0) {
      // Exact zero bid: +10 × hands
      baseScore = 10 * hands;
    } else {
      // Non-exact zero bid (took tricks when bid zero): -10 × hands
      baseScore = -10 * hands;
    }

    return {
      bid,
      tricks,
      hands,
      baseScore,
      bonusPoints: 0,
      total: baseScore,
      breakdown: {
        description: tricks === 0 ? `Exact zero bid: 10 × ${hands} hands` : `Failed zero bid: -10 × ${hands} hands`,
        base: baseScore,
        bonus: 0,
        total: baseScore,
      },
    };
  }

  // Non-zero bid scoring
  let baseScore;
  let bonusPoints = 0;

  if (isExactBid) {
    // Exact bid: base score is 20 × tricks
    baseScore = 20 * tricks;
    // Bonus: 10 × hands only if bid is exact
    bonusPoints = 10 * hands;
  } else {
    // Missed bid: -10 × difference
    const difference = Math.abs(bid - tricks);
    baseScore = -10 * difference;
    bonusPoints = 0; // No bonus if bid is not exact
  }

  const total = baseScore + bonusPoints;

  return {
    bid,
    tricks,
    hands,
    baseScore,
    bonusPoints,
    total,
    breakdown: {
      description: isExactBid
        ? `Exact bid of ${bid} tricks: (20 × ${tricks}) + (10 × ${hands} bonus)`
        : `Missed bid: bid ${bid}, got ${tricks} tricks`,
      base: baseScore,
      bonus: bonusPoints,
      total,
    },
  };
}

/**
 * Calculate total score for a player across multiple rounds
 * @param {array} rounds - Array of round results, each with {bid, tricks, hands}
 * @returns {object} Total score and breakdown of all rounds
 * @throws {Error} If any round has invalid parameters
 */
function calculateTotalScore(rounds) {
  if (!Array.isArray(rounds)) {
    throw new Error('Rounds must be an array');
  }

  let totalScore = 0;
  const roundScores = [];

  for (const round of rounds) {
    const scoreResult = calculateScore(round.bid, round.tricks, round.hands);
    roundScores.push(scoreResult);
    totalScore += scoreResult.total;
  }

  return {
    totalScore,
    rounds: roundScores,
    summary: {
      totalRounds: rounds.length,
      totalScore,
      roundBreakdown: roundScores.map((r) => ({
        bid: r.bid,
        tricks: r.tricks,
        hands: r.hands,
        score: r.total,
      })),
    },
  };
}

module.exports = {
  calculateScore,
  calculateTotalScore,
};
