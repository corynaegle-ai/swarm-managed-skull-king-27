/**
 * Skull King Scoring Engine
 * Implements complex scoring rules for the Skull King card game
 */

class ScoringEngine {
  /**
   * Calculate score for a single hand
   * @param {number} bid - Number of tricks bid (0 or positive)
   * @param {number} tricks - Number of tricks actually won
   * @param {number} handNumber - Hand number (1-indexed, used for zero-bid calculation)
   * @returns {Object} Score result with breakdown
   */
  calculateHandScore(bid, tricks, handNumber) {
    if (typeof bid !== 'number' || typeof tricks !== 'number') {
      throw new Error('Bid and tricks must be numbers');
    }
    if (bid < 0 || tricks < 0) {
      throw new Error('Bid and tricks must be non-negative');
    }
    if (!Number.isInteger(bid) || !Number.isInteger(tricks)) {
      throw new Error('Bid and tricks must be integers');
    }

    const breakdown = {
      bid,
      tricks,
      handNumber,
      baseScore: 0,
      bonusScore: 0,
      totalScore: 0,
      exact: false,
      description: ''
    };

    if (bid === 0) {
      // Zero bid scoring: ±10×hands if exact, 0 if any tricks taken
      if (tricks === 0) {
        // Exact match for zero bid
        breakdown.baseScore = 10 * handNumber;
        breakdown.exact = true;
        breakdown.description = `Zero bid exact: +${breakdown.baseScore} (10×${handNumber} hands)`;
      } else {
        // Missed zero bid (took tricks when shouldn't have)
        breakdown.baseScore = -10 * handNumber;
        breakdown.exact = false;
        breakdown.description = `Zero bid missed: ${breakdown.baseScore} (-10×${handNumber} hands)`;
      }
    } else {
      // Non-zero bid scoring
      if (tricks === bid) {
        // Exact match: +20 × tricks
        breakdown.baseScore = 20 * tricks;
        breakdown.exact = true;
        breakdown.description = `Bid exact: +${breakdown.baseScore} (20×${tricks} tricks)`;
      } else {
        // Missed: -10 × difference from bid
        const difference = Math.abs(tricks - bid);
        breakdown.baseScore = -10 * difference;
        breakdown.exact = false;
        breakdown.description = `Bid missed: ${breakdown.baseScore} (-10×${difference} difference)`;
      }
    }

    breakdown.totalScore = breakdown.baseScore + breakdown.bonusScore;
    return breakdown;
  }

  /**
   * Calculate total score for a player across multiple hands
   * @param {Array<Object>} hands - Array of hand results
   *   Each hand: { bid: number, tricks: number, handNumber: number }
   * @returns {Object} Total score with hand breakdowns
   */
  calculateTotalScore(hands) {
    if (!Array.isArray(hands)) {
      throw new Error('Hands must be an array');
    }

    const breakdowns = hands.map(hand => {
      return this.calculateHandScore(hand.bid, hand.tricks, hand.handNumber);
    });

    const totalScore = breakdowns.reduce((sum, hand) => sum + hand.totalScore, 0);

    return {
      totalScore,
      hands: breakdowns,
      handCount: breakdowns.length,
      summary: `Total: ${totalScore} points across ${breakdowns.length} hands`
    };
  }
}

module.exports = ScoringEngine;
