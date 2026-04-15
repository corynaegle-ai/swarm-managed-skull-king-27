const {
  calculateRoundScore,
  calculateTotalScore,
  validateRoundScoring
} = require('./scoring');

describe('Skull King Scoring Engine', () => {
  describe('calculateRoundScore - Non-zero bids', () => {
    test('AC1: Exact non-zero bid scores 20 per trick with bonus', () => {
      const result = calculateRoundScore(5, 5, 1);
      expect(result.baseScore).toBe(100); // 20 * 5
      expect(result.bonusScore).toBe(10); // 10 * 1 (hands)
      expect(result.totalScore).toBe(110);
      expect(result.exact).toBe(true);
    });

    test('AC1: Exact non-zero bid with multiple hands includes bonus', () => {
      const result = calculateRoundScore(3, 3, 2);
      expect(result.baseScore).toBe(60); // 20 * 3
      expect(result.bonusScore).toBe(20); // 10 * 2 (hands)
      expect(result.totalScore).toBe(80);
    });

    test('AC1: Missed non-zero bid scores -10 per difference, no bonus', () => {
      const result = calculateRoundScore(5, 3, 1);
      expect(result.baseScore).toBe(-20); // -10 * |5-3|
      expect(result.bonusScore).toBe(0); // No bonus on missed bid
      expect(result.totalScore).toBe(-20);
      expect(result.exact).toBe(false);
    });

    test('AC1: Missed bid with more tricks taken than bid', () => {
      const result = calculateRoundScore(2, 4, 1);
      expect(result.baseScore).toBe(-20); // -10 * |2-4|
      expect(result.bonusScore).toBe(0);
      expect(result.totalScore).toBe(-20);
    });

    test('AC1: Zero tricks with non-zero bid', () => {
      const result = calculateRoundScore(3, 0, 1);
      expect(result.baseScore).toBe(-30); // -10 * |3-0|
      expect(result.bonusScore).toBe(0);
      expect(result.totalScore).toBe(-30);
    });
  });

  describe('calculateRoundScore - Zero bids', () => {
    test('AC2: Exact zero bid (0 tricks) scores +10 per hand', () => {
      const result = calculateRoundScore(0, 0, 1);
      expect(result.baseScore).toBe(10); // 10 * 1
      expect(result.totalScore).toBe(10);
      expect(result.exact).toBe(true);
    });

    test('AC2: Exact zero bid with multiple hands', () => {
      const result = calculateRoundScore(0, 0, 3);
      expect(result.baseScore).toBe(30); // 10 * 3
      expect(result.totalScore).toBe(30);
    });

    test('AC2: Missed zero bid (any tricks) scores -10 per hand', () => {
      const result = calculateRoundScore(0, 1, 1);
      expect(result.baseScore).toBe(-10); // -10 * 1
      expect(result.totalScore).toBe(-10);
      expect(result.exact).toBe(false);
    });

    test('AC2: Missed zero bid with multiple tricks', () => {
      const result = calculateRoundScore(0, 2, 2);
      expect(result.baseScore).toBe(-20); // -10 * 2
      expect(result.totalScore).toBe(-20);
    });
  });

  describe('calculateRoundScore - Bonus points policy', () => {
    test('AC3: Bonus points only apply when bid is exact (non-zero)', () => {
      const exactBid = calculateRoundScore(5, 5, 3);
      const missedBid = calculateRoundScore(5, 4, 3);
      expect(exactBid.bonusScore).toBe(30);
      expect(missedBid.bonusScore).toBe(0);
    });

    test('AC3: No bonus for zero bids even if exact', () => {
      const result = calculateRoundScore(0, 0, 2);
      expect(result.bonusScore).toBe(0);
      expect(result.totalScore).toBe(20); // Only base score
    });
  });

  describe('calculateTotalScore - Score accumulation', () => {
    test('AC4: Accumulates scores across multiple rounds correctly', () => {
      const rounds = [
        { bid: 5, tricks: 5, hands: 1 }, // 20*5 + 10*1 = 110
        { bid: 3, tricks: 3, hands: 1 }  // 20*3 + 10*1 = 70
      ];
      const result = calculateTotalScore(rounds);
      expect(result.totalScore).toBe(180);
      expect(result.roundCount).toBe(2);
    });

    test('AC4: Example from acceptance criteria', () => {
      const rounds = [
        { bid: 5, tricks: 5, hands: 1 }, // 110
        { bid: 3, tricks: 3, hands: 1 }, // 70
        { bid: 0, tricks: 0, hands: 1 }  // 10
      ];
      const result = calculateTotalScore(rounds);
      expect(result.totalScore).toBe(190);
      expect(result.roundCount).toBe(3);
    });

    test('AC4: Handles mixed exact and missed bids', () => {
      const rounds = [
        { bid: 4, tricks: 4, hands: 1 }, // 20*4 + 10*1 = 90
        { bid: 3, tricks: 1, hands: 1 }, // -10*|3-1| = -20
        { bid: 0, tricks: 0, hands: 1 }  // 10*1 = 10
      ];
      const result = calculateTotalScore(rounds);
      expect(result.totalScore).toBe(80);
    });

    test('AC4: Handles negative total scores', () => {
      const rounds = [
        { bid: 5, tricks: 2, hands: 1 }, // -10*|5-2| = -30
        { bid: 0, tricks: 1, hands: 1 }  // -10*1 = -10
      ];
      const result = calculateTotalScore(rounds);
      expect(result.totalScore).toBe(-40);
    });
  });

  describe('calculateTotalScore - Round breakdown', () => {
    test('AC5: Provides score breakdown for each round', () => {
      const rounds = [
        { bid: 5, tricks: 5, hands: 1 },
        { bid: 3, tricks: 2, hands: 1 }
      ];
      const result = calculateTotalScore(rounds);
      
      expect(result.rounds).toHaveLength(2);
      expect(result.rounds[0]).toMatchObject({
        bid: 5,
        tricks: 5,
        baseScore: 100,
        bonusScore: 10,
        totalScore: 110
      });
      expect(result.rounds[1]).toMatchObject({
        bid: 3,
        tricks: 2,
        baseScore: -10,
        bonusScore: 0,
        totalScore: -10
      });
    });

    test('AC5: Breakdown shows exact flag for transparency', () => {
      const rounds = [
        { bid: 4, tricks: 4, hands: 1 },
        { bid: 4, tricks: 3, hands: 1 }
      ];
      const result = calculateTotalScore(rounds);
      
      expect(result.rounds[0].exact).toBe(true);
      expect(result.rounds[1].exact).toBe(false);
    });
  });

  describe('validateRoundScoring', () => {
    test('Validates valid round', () => {
      const result = validateRoundScoring({ bid: 5, tricks: 5, hands: 1 });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('Rejects negative bid', () => {
      const result = validateRoundScoring({ bid: -1, tricks: 0, hands: 1 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Bid cannot be negative');
    });

    test('Rejects negative tricks', () => {
      const result = validateRoundScoring({ bid: 5, tricks: -1, hands: 1 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tricks cannot be negative');
    });

    test('Rejects non-positive hands', () => {
      const result = validateRoundScoring({ bid: 5, tricks: 5, hands: 0 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Hands must be positive');
    });
  });

  describe('Error handling', () => {
    test('calculateRoundScore throws on invalid bid', () => {
      expect(() => calculateRoundScore(-1, 0, 1)).toThrow();
      expect(() => calculateRoundScore('5', 0, 1)).toThrow();
    });

    test('calculateRoundScore throws on invalid tricks', () => {
      expect(() => calculateRoundScore(5, -1, 1)).toThrow();
      expect(() => calculateRoundScore(5, 'two', 1)).toThrow();
    });

    test('calculateRoundScore throws on invalid hands', () => {
      expect(() => calculateRoundScore(5, 5, 0)).toThrow();
      expect(() => calculateRoundScore(5, 5, -1)).toThrow();
    });

    test('calculateTotalScore throws on empty rounds', () => {
      expect(() => calculateTotalScore([])).toThrow('At least one round is required');
    });

    test('calculateTotalScore throws if rounds is not array', () => {
      expect(() => calculateTotalScore({ bid: 5 })).toThrow('Rounds must be an array');
    });
  });
});
