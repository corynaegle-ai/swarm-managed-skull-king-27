/**
 * Skull King Scoring Engine
 * Implements complex scoring rules for Skull King card game
 */

/**
 * Calculates the score for a single hand
 * @param {number} bid - The number of tricks bid (can be 0)
 * @param {number} tricks - The number of tricks actually won
 * @param {number} handNumber - The hand number (1-indexed), used for zero bid scoring
 * @param {number} bonusPoints - Bonus points earned (skull/parrot modifiers)
 * @returns {Object} Score object with base, bonus, and total
 */
function calculateHandScore(bid, tricks, handNumber, bonusPoints = 0) {
  if (typeof bid !== 'number' || typeof tricks !== 'number' || bid < 0 || tricks < 0) {
    throw new Error('Bid and tricks must be non-negative numbers');
  }
  
  if (typeof handNumber !== 'number' || handNumber < 1) {
    throw new Error('Hand number must be a positive number');
  }
  
  if (typeof bonusPoints !== 'number' || bonusPoints < 0) {
    throw new Error('Bonus points must be a non-negative number');
  }
  
  let baseScore = 0;
  let bonus = 0;
  
  if (bid === 0) {
    // Zero bid scoring: ±10 × hand number
    if (tricks === 0) {
      // Exact: no tricks taken
      baseScore = 10 * handNumber;
      // Bonus points apply only when bid is exactly met
      bonus = bonusPoints;
    } else {
      // Missed: took tricks when shouldn't have
      baseScore = -10 * handNumber;
      // No bonus points on penalties
    }
  } else {
    // Non-zero bid scoring
    if (bid === tricks) {
      // Exact bid: +20 per trick
      baseScore = 20 * bid;
      // Bonus points apply only when bid is exactly met
      bonus = bonusPoints;
    } else {
      // Missed bid: -10 per trick difference
      const difference = Math.abs(bid - tricks);
      baseScore = -10 * difference;
      // No bonus points on penalties
    }
  }
  
  return {
    baseScore: baseScore,
    bonus: bonus,
    total: baseScore + bonus,
    bid: bid,
    tricks: tricks,
    handNumber: handNumber,
    isExact: bid === tricks,
    bonusPoints: bonusPoints
  };
}

/**
 * Calculates scores for all hands of a round
 * @param {Array} hands - Array of hand objects with {bid, tricks, handNumber, bonusPoints}
 * @returns {Object} Round scoring with breakdown and totals
 */
function calculateRoundScores(hands) {
  if (!Array.isArray(hands)) {
    throw new Error('Hands must be an array');
  }
  
  const handScores = hands.map(hand => {
    return calculateHandScore(
      hand.bid,
      hand.tricks,
      hand.handNumber,
      hand.bonusPoints || 0
    );
  });
  
  const totalRoundScore = handScores.reduce((sum, hand) => sum + hand.total, 0);
  
  return {
    hands: handScores,
    roundTotal: totalRoundScore,
    breakdown: handScores.map((score, index) => ({
      hand: index + 1,
      bid: score.bid,
      tricks: score.tricks,
      exact: score.isExact,
      baseScore: score.baseScore,
      bonus: score.bonus,
      total: score.total
    }))
  };
}

/**
 * Updates cumulative player scores
 * @param {Array} players - Array of player objects with current scores
 * @param {Array} roundScores - Array of round score totals for each player
 * @returns {Array} Updated player objects with new scores
 */
function updatePlayerScores(players, roundScores) {
  if (!Array.isArray(players) || !Array.isArray(roundScores)) {
    throw new Error('Players and round scores must be arrays');
  }
  
  if (players.length !== roundScores.length) {
    throw new Error('Number of players must match number of round scores');
  }
  
  return players.map((player, index) => ({
    ...player,
    score: (player.score || 0) + roundScores[index],
    previousScore: player.score || 0
  }));
}

/**
 * Gets score breakdown as human-readable string
 * @param {Object} roundScoring - Result from calculateRoundScores
 * @param {Array} playerNames - Names of players
 * @returns {string} Formatted score breakdown
 */
function formatScoreBreakdown(roundScoring, playerNames = []) {
  let breakdown = 'ROUND SCORE BREAKDOWN\n';
  breakdown += '='.repeat(50) + '\n';
  
  roundScoring.breakdown.forEach((hand, index) => {
    const playerName = playerNames[index] ? `${playerNames[index]}: ` : '';
    breakdown += `\n${playerName}Hand ${hand.hand}\n`;
    breakdown += `  Bid: ${hand.bid} | Tricks: ${hand.tricks} | Exact: ${hand.exact}\n`;
    breakdown += `  Base Score: ${hand.baseScore > 0 ? '+' : ''}${hand.baseScore}\n`;
    if (hand.bonus > 0) {
      breakdown += `  Bonus: +${hand.bonus}\n`;
    }
    breakdown += `  Hand Total: ${hand.total > 0 ? '+' : ''}${hand.total}\n`;
  });
  
  breakdown += '\n' + '='.repeat(50) + '\n';
  breakdown += `Round Total: ${roundScoring.roundTotal > 0 ? '+' : ''}${roundScoring.roundTotal}\n`;
  
  return breakdown;
}

module.exports = {
  calculateHandScore,
  calculateRoundScores,
  updatePlayerScores,
  formatScoreBreakdown
};
