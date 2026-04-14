/**
 * Skull King Scoring Engine
 * 
 * Implements complex scoring rules for the Skull King card game:
 * - Non-zero bids: +20 per correct trick, -10 per missed trick
 * - Zero bids: +10×hands if exact, -10×hands if any tricks taken
 * - Automatic bonus: +10×hands applied ONLY when bid is exactly met (non-zero only)
 */

/**
 * Calculates the score for a single round.
 * 
 * @param {number} bid - The number of tricks bid (0 or positive)
 * @param {number} tricks - The number of tricks actually taken
 * @param {number} hands - The number of hands/rounds in this game
 * @returns {object} Score breakdown with base score, bonus, and total
 * @throws {Error} If parameters are invalid
 */
function calculateRoundScore(bid, tricks, hands) {
  // Validate inputs
  validateRoundInputs(bid, tricks, hands);
  
  let baseScore = 0;
  let bonus = 0;
  let scoreBreakdown = {};
  
  if (bid === 0) {
    // Zero bid scoring: +10×hands if exact, -10×hands if any tricks taken
    if (tricks === 0) {
      baseScore = 10 * hands;
      scoreBreakdown.rule = 'Zero bid - exact';
      scoreBreakdown.formula = `+10 × ${hands}`;
    } else {
      baseScore = -10 * hands;
      scoreBreakdown.rule = 'Zero bid - missed';
      scoreBreakdown.formula = `-10 × ${hands}`;
    }
    // Zero bids never receive bonus points
    bonus = 0;
    scoreBreakdown.bonus = 'No bonus for zero bids';
  } else {
    // Non-zero bid scoring
    if (tricks === bid) {
      // Exact bid: +20 per trick
      baseScore = 20 * tricks;
      scoreBreakdown.rule = 'Non-zero bid - exact';
      scoreBreakdown.formula = `+20 × ${tricks}`;
      
      // Apply automatic bonus for exact non-zero bid
      bonus = 10 * hands;
      scoreBreakdown.bonus = `+10 × ${hands} (automatic for exact bid)`;
    } else {
      // Missed bid: -10 per difference
      const difference = Math.abs(bid - tricks);
      baseScore = -10 * difference;
      scoreBreakdown.rule = 'Non-zero bid - missed';
      scoreBreakdown.formula = `-10 × ${difference}`;
      
      // No bonus for missed bids
      bonus = 0;
      scoreBreakdown.bonus = 'No bonus for missed bid';
    }
  }
  
  const totalScore = baseScore + bonus;
  
  return {
    baseScore,
    bonus,
    totalScore,
    breakdown: {
      bid,
      tricks,
      hands,
      ...scoreBreakdown,
      calculation: `${baseScore} + ${bonus} = ${totalScore}`
    }
  };
}

/**
 * Validates inputs for round score calculation.
 * 
 * @param {number} bid - The bid (0 or positive)
 * @param {number} tricks - Tricks taken (0 or positive)
 * @param {number} hands - Number of hands (positive)
 * @throws {Error} If any input is invalid
 */
function validateRoundInputs(bid, tricks, hands) {
  if (!Number.isInteger(bid) || bid < 0) {
    throw new Error(`Invalid bid: ${bid}. Bid must be a non-negative integer.`);
  }
  if (!Number.isInteger(tricks) || tricks < 0) {
    throw new Error(`Invalid tricks: ${tricks}. Tricks must be a non-negative integer.`);
  }
  if (!Number.isInteger(hands) || hands <= 0) {
    throw new Error(`Invalid hands: ${hands}. Hands must be a positive integer.`);
  }
}

/**
 * Calculates total score across multiple rounds.
 * 
 * @param {array} rounds - Array of round objects with bid, tricks, hands properties
 * @returns {object} Total score and detailed breakdown per round
 * @throws {Error} If any round is invalid
 */
function calculateTotalScore(rounds) {
  if (!Array.isArray(rounds)) {
    throw new Error('Rounds must be an array');
  }
  
  let totalScore = 0;
  const roundBreakdowns = [];
  
  rounds.forEach((round, index) => {
    const roundScore = calculateRoundScore(round.bid, round.tricks, round.hands);
    totalScore += roundScore.totalScore;
    
    roundBreakdowns.push({
      roundNumber: index + 1,
      ...roundScore.breakdown,
      roundTotal: roundScore.totalScore
    });
  });
  
  return {
    totalScore,
    rounds: roundBreakdowns
  };
}

/**
 * Validates that a round's scoring is correct.
 * Given a bid, tricks, and hands, verify the expected score is achieved.
 * 
 * @param {number} bid - The bid
 * @param {number} tricks - Tricks taken
 * @param {number} hands - Number of hands
 * @param {number} expectedScore - The score expected
 * @returns {boolean} True if the calculated score matches expected
 * @throws {Error} If inputs are invalid
 */
function validateRoundScoring(bid, tricks, hands, expectedScore) {
  const result = calculateRoundScore(bid, tricks, hands);
  return result.totalScore === expectedScore;
}

module.exports = {
  calculateRoundScore,
  calculateTotalScore,
  validateRoundScoring,
  validateRoundInputs
};
