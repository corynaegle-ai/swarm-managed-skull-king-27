function calculateRoundScore(bid, tricks, hands, bonusPoints = 0) {
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
      breakdown.bonusScore = bonusPoints;
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

function calculateTotalScore(rounds) {
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

module.exports = { calculateRoundScore, calculateTotalScore };