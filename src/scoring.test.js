const {
  calculateHandScore,
  calculateRoundScores,
  updateTotalScores,
  getScoreBreakdown
} = require('./scoring');

describe('Skull King Scoring Engine', () => {
  describe('calculateHandScore - Non-zero bid scoring', () => {
    it('Criterion 1a: should score +20 per trick for exact non-zero bid', () => {
      const result = calculateHandScore(5, 5, 1);
      expect(result.baseScore).toBe(100); // 20 × 5 tricks
      expect(result.totalScore).toBe(100);
      expect(result.isBidExact).toBe(true);
    });

    it('Criterion 1a: should score +20 per trick for exact bid with 0 tricks', () => {
      // Edge case: bid exactly but for 0 tricks shouldn't happen in non-zero bids,
      // but mathematically: 20 × 0 = 0
      const result = calculateHandScore(1, 1, 1);
      expect(result.baseScore).toBe(20); // 20 × 1 trick
      expect(result.totalScore).toBe(20);
      expect(result.isBidExact).toBe(true);
    });

    it('Criterion 1b: should score -10 per trick difference for missed non-zero bid (bid > tricks)', () => {
      const result = calculateHandScore(5, 3, 1);
      expect(result.baseScore).toBe(-20); // -10 × (5-3)
      expect(result.totalScore).toBe(-20);
      expect(result.isBidExact).toBe(false);
    });

    it('Criterion 1b: should score -10 per trick difference for missed non-zero bid (bid < tricks)', () => {
      const result = calculateHandScore(3, 5, 1);
      expect(result.baseScore).toBe(-20); // -10 × (5-3)
      expect(result.totalScore).toBe(-20);
      expect(result.isBidExact).toBe(false);
    });

    it('Criterion 1b: should handle bid 13 exactly', () => {
      const result = calculateHandScore(13, 13, 1);
      expect(result.baseScore).toBe(260); // 20 × 13
      expect(result.isBidExact).toBe(true);
    });

    it('Criterion 1b: should handle bid 13 with miss', () => {
      const result = calculateHandScore(13, 12, 1);
      expect(result.baseScore).toBe(-10); // -10 × 1
      expect(result.isBidExact).toBe(false);
    });
  });

  describe('calculateHandScore - Zero bid scoring', () => {
    it('Criterion 2a: should score +10×hands for exact zero bid (0 tricks)', () => {
      const result = calculateHandScore(0, 0, 2);
      expect(result.baseScore).toBe(20); // +10 × 2
      expect(result.totalScore).toBe(20);
      expect(result.isBidExact).toBe(true);
    });

    it('Criterion 2a: should score +10×hands for exact zero bid on hand 5', () => {
      const result = calculateHandScore(0, 0, 5);
      expect(result.baseScore).toBe(50); // +10 × 5
      expect(result.totalScore).toBe(50);
      expect(result.isBidExact).toBe(true);
    });

    it('Criterion 2b: should score -10×hands if any tricks taken on zero bid', () => {
      const result = calculateHandScore(0, 1, 3);
      expect(result.baseScore).toBe(-30); // -10 × 3
      expect(result.totalScore).toBe(-30);
      expect(result.isBidExact).toBe(false);
    });

    it('Criterion 2b: should score -10×hands if multiple tricks taken on zero bid', () => {
      const result = calculateHandScore(0, 5, 2);
      expect(result.baseScore).toBe(-20); // -10 × 2 (regardless of how many tricks)
      expect(result.totalScore).toBe(-20);
      expect(result.isBidExact).toBe(false);
    });

    it('Criterion 2b: should score -10×hands if all tricks taken on zero bid', () => {
      const result = calculateHandScore(0, 13, 1);
      expect(result.baseScore).toBe(-10); // -10 × 1
      expect(result.totalScore).toBe(-10);
      expect(result.isBidExact).toBe(false);
    });
  });

  describe('calculateHandScore - Bonus points', () => {
    it('Criterion 3a: should apply bonus only when bid is exactly met (non-zero exact)', () => {
      const result = calculateHandScore(5, 5, 1, 30);
      expect(result.baseScore).toBe(100); // 20 × 5
      expect(result.bonusApplied).toBe(30);
      expect(result.totalScore).toBe(130); // 100 + 30
      expect(result.isBidExact).toBe(true);
    });

    it('Criterion 3b: should NOT apply bonus when bid is missed (non-zero)', () => {
      const result = calculateHandScore(5, 3, 1, 30);
      expect(result.baseScore).toBe(-20); // -10 × 2
      expect(result.bonusApplied).toBe(0);
      expect(result.totalScore).toBe(-20); // No bonus added
      expect(result.isBidExact).toBe(false);
    });

    it('Criterion 3a: should apply bonus only when zero bid is exactly met', () => {
      const result = calculateHandScore(0, 0, 2, 50);
      expect(result.baseScore).toBe(20); // +10 × 2
      expect(result.bonusApplied).toBe(50);
      expect(result.totalScore).toBe(70); // 20 + 50
      expect(result.isBidExact).toBe(true);
    });

    it('Criterion 3b: should NOT apply bonus when zero bid is missed', () => {
      const result = calculateHandScore(0, 2, 2, 50);
      expect(result.baseScore).toBe(-20); // -10 × 2
      expect(result.bonusApplied).toBe(0);
      expect(result.totalScore).toBe(-20); // No bonus added
      expect(result.isBidExact).toBe(false);
    });

    it('should handle bonus of 0', () => {
      const result = calculateHandScore(5, 5, 1, 0);
      expect(result.baseScore).toBe(100);
      expect(result.bonusApplied).toBe(0);
      expect(result.totalScore).toBe(100);
    });
  });

  describe('calculateHandScore - Error handling', () => {
    it('should reject invalid bid (non-integer)', () => {
      expect(() => calculateHandScore(5.5, 5, 1)).toThrow(RangeError);
    });

    it('should reject invalid bid (negative)', () => {
      expect(() => calculateHandScore(-1, 5, 1)).toThrow(RangeError);
    });

    it('should reject invalid bid (>13)', () => {
      expect(() => calculateHandScore(14, 5, 1)).toThrow(RangeError);
    });

    it('should reject invalid tricks (non-integer)', () => {
      expect(() => calculateHandScore(5, 5.5, 1)).toThrow(RangeError);
    });

    it('should reject invalid tricks (negative)', () => {
      expect(() => calculateHandScore(5, -1, 1)).toThrow(RangeError);
    });

    it('should reject invalid tricks (>13)', () => {
      expect(() => calculateHandScore(5, 14, 1)).toThrow(RangeError);
    });

    it('should reject invalid handNumber (0)', () => {
      expect(() => calculateHandScore(5, 5, 0)).toThrow(RangeError);
    });

    it('should reject invalid handNumber (negative)', () => {
      expect(() => calculateHandScore(5, 5, -1)).toThrow(RangeError);
    });

    it('should reject invalid handNumber (non-integer)', () => {
      expect(() => calculateHandScore(5, 5, 1.5)).toThrow(RangeError);
    });

    it('should reject non-numeric bid', () => {
      expect(() => calculateHandScore('5', 5, 1)).toThrow(TypeError);
    });

    it('should reject non-numeric tricks', () => {
      expect(() => calculateHandScore(5, '5', 1)).toThrow(TypeError);
    });

    it('should reject non-numeric handNumber', () => {
      expect(() => calculateHandScore(5, 5, '1')).toThrow(TypeError);
    });
  });

  describe('calculateRoundScores', () => {
    it('Criterion 4: should calculate scores for multiple players in a round', () => {
      const roundResults = [
        { bid: 5, tricks: 5, handNumber: 1, playerId: 'p1' },
        { bid: 3, tricks: 2, handNumber: 1, playerId: 'p2' },
        { bid: 0, tricks: 0, handNumber: 1, playerId: 'p3' }
      ];

      const scores = calculateRoundScores(roundResults);

      expect(scores.p1.totalScore).toBe(100); // 20 × 5
      expect(scores.p2.totalScore).toBe(-10); // -10 × 1
      expect(scores.p3.totalScore).toBe(10); // +10 × 1
    });

    it('should handle players without explicit playerId', () => {
      const roundResults = [
        { bid: 5, tricks: 5, handNumber: 1 },
        { bid: 3, tricks: 2, handNumber: 1 }
      ];

      const scores = calculateRoundScores(roundResults);

      expect(scores[0].totalScore).toBe(100);
      expect(scores[1].totalScore).toBe(-10);
    });

    it('should reject empty roundResults', () => {
      expect(() => calculateRoundScores([])).toThrow(Error);
    });

    it('should reject non-array roundResults', () => {
      expect(() => calculateRoundScores({ bid: 5 })).toThrow(TypeError);
    });
  });

  describe('updateTotalScores', () => {
    it('Criterion 4: should update cumulative scores correctly', () => {
      const currentTotals = { p1: 100, p2: 50 };
      const roundScores = {
        p1: { totalScore: 20, baseScore: 20, bonusApplied: 0, breakdown: '' },
        p2: { totalScore: -10, baseScore: -10, bonusApplied: 0, breakdown: '' }
      };

      const updated = updateTotalScores(currentTotals, roundScores);

      expect(updated.p1).toBe(120); // 100 + 20
      expect(updated.p2).toBe(40); // 50 - 10
    });

    it('should initialize new players with 0', () => {
      const currentTotals = { p1: 100 };
      const roundScores = {
        p1: { totalScore: 20, baseScore: 20, bonusApplied: 0, breakdown: '' },
        p2: { totalScore: 30, baseScore: 30, bonusApplied: 0, breakdown: '' }
      };

      const updated = updateTotalScores(currentTotals, roundScores);

      expect(updated.p1).toBe(120);
      expect(updated.p2).toBe(30); // 0 + 30
    });

    it('should not mutate original object', () => {
      const currentTotals = { p1: 100 };
      const roundScores = {
        p1: { totalScore: 20, baseScore: 20, bonusApplied: 0, breakdown: '' }
      };

      updateTotalScores(currentTotals, roundScores);

      expect(currentTotals.p1).toBe(100); // Original unchanged
    });
  });

  describe('getScoreBreakdown', () => {
    it('Criterion 5: should provide transparent score breakdown', () => {
      const roundScores = {
        p1: {
          baseScore: 100,
          bonusApplied: 0,
          totalScore: 100,
          breakdown: 'Non-zero bid exact: +20 × 5 tricks = 100',
          isBidExact: true
        },
        p2: {
          baseScore: -10,
          bonusApplied: 0,
          totalScore: -10,
          breakdown: 'Non-zero bid missed: -10 × |3 - 2| = -10 × 1 = -10',
          isBidExact: false
        }
      };

      const breakdown = getScoreBreakdown(roundScores);

      expect(breakdown).toHaveLength(2);
      expect(breakdown[0].playerId).toBe('p1');
      expect(breakdown[0].totalScore).toBe(100);
      expect(breakdown[0].breakdown).toBeDefined();
      expect(breakdown[1].playerId).toBe('p2');
      expect(breakdown[1].totalScore).toBe(-10);
    });

    it('should handle empty roundScores', () => {
      const breakdown = getScoreBreakdown({});
      expect(breakdown).toEqual([]);
    });
  });

  describe('Integration tests', () => {
    it('should handle a complete game scenario', () => {
      // Hand 1
      let totals = {};
      let roundResults = [
        { bid: 3, tricks: 3, handNumber: 1, playerId: 'Alice' },
        { bid: 2, tricks: 1, handNumber: 1, playerId: 'Bob' },
        { bid: 5, tricks: 5, handNumber: 1, playerId: 'Charlie', bonusPoints: 10 }
      ];
      let roundScores = calculateRoundScores(roundResults);
      totals = updateTotalScores(totals, roundScores);

      expect(totals.Alice).toBe(60); // 20 × 3
      expect(totals.Bob).toBe(-10); // -10 × 1
      expect(totals.Charlie).toBe(110); // 20 × 5 + 10 bonus

      // Hand 2
      roundResults = [
        { bid: 0, tricks: 0, handNumber: 2, playerId: 'Alice' },
        { bid: 4, tricks: 3, handNumber: 2, playerId: 'Bob', bonusPoints: 15 },
        { bid: 0, tricks: 1, handNumber: 2, playerId: 'Charlie' }
      ];
      roundScores = calculateRoundScores(roundResults);
      totals = updateTotalScores(totals, roundScores);

      expect(totals.Alice).toBe(80); // 60 + 20 (+10×2)
      expect(totals.Bob).toBe(-20); // -10 + (-10) (bid missed, no bonus)
      expect(totals.Charlie).toBe(100); // 110 + (-20) (-10×2)
    });
  });
});
