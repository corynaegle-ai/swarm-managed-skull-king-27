const ScoringEngine = require('./scoring');

describe('Skull King Scoring Engine', () => {
  let engine;

  beforeEach(() => {
    engine = new ScoringEngine();
  });

  describe('Non-zero bid scoring (Criterion 1)', () => {
    test('should score +20 per trick when bid is exact', () => {
      const result = engine.calculateHandScore(5, 5, 1);
      expect(result.baseScore).toBe(100); // 20 * 5
      expect(result.exact).toBe(true);
      expect(result.totalScore).toBe(100);
    });

    test('should score +20 per trick for small exact bids', () => {
      const result = engine.calculateHandScore(1, 1, 1);
      expect(result.baseScore).toBe(20); // 20 * 1
      expect(result.exact).toBe(true);
      expect(result.totalScore).toBe(20);
    });

    test('should score -10 per difference when bid is not exact (too few)', () => {
      const result = engine.calculateHandScore(5, 3, 1);
      expect(result.baseScore).toBe(-20); // -10 * 2 (difference)
      expect(result.exact).toBe(false);
      expect(result.totalScore).toBe(-20);
    });

    test('should score -10 per difference when bid is not exact (too many)', () => {
      const result = engine.calculateHandScore(5, 7, 1);
      expect(result.baseScore).toBe(-20); // -10 * 2 (difference)
      expect(result.exact).toBe(false);
      expect(result.totalScore).toBe(-20);
    });

    test('should score -10 when bid is 5 but got 0', () => {
      const result = engine.calculateHandScore(5, 0, 1);
      expect(result.baseScore).toBe(-50); // -10 * 5
      expect(result.exact).toBe(false);
      expect(result.totalScore).toBe(-50);
    });
  });

  describe('Zero bid scoring (Criterion 2)', () => {
    test('should score +10×hands when zero bid is exact (0 tricks)', () => {
      const result = engine.calculateHandScore(0, 0, 3);
      expect(result.baseScore).toBe(30); // 10 * 3
      expect(result.exact).toBe(true);
      expect(result.totalScore).toBe(30);
    });

    test('should score -10×hands when zero bid is missed (any tricks taken)', () => {
      const result = engine.calculateHandScore(0, 1, 3);
      expect(result.baseScore).toBe(-30); // -10 * 3
      expect(result.exact).toBe(false);
      expect(result.totalScore).toBe(-30);
    });

    test('should score -10×hands when zero bid is missed with many tricks', () => {
      const result = engine.calculateHandScore(0, 5, 3);
      expect(result.baseScore).toBe(-30); // -10 * 3 (penalty is same regardless)
      expect(result.exact).toBe(false);
      expect(result.totalScore).toBe(-30);
    });

    test('should handle early hand zero bids', () => {
      const result = engine.calculateHandScore(0, 0, 1);
      expect(result.baseScore).toBe(10); // 10 * 1
      expect(result.exact).toBe(true);
      expect(result.totalScore).toBe(10);
    });
  });

  describe('Bonus points only on exact (Criterion 3)', () => {
    test('should only apply scoring multiplier when bid is exact for non-zero', () => {
      const exact = engine.calculateHandScore(5, 5, 1);
      const notExact = engine.calculateHandScore(5, 4, 1);

      // Exact: 20 * 5 = 100
      expect(exact.baseScore).toBe(100);
      expect(exact.exact).toBe(true);

      // Not exact: -10 * 1 = -10
      expect(notExact.baseScore).toBe(-10);
      expect(notExact.exact).toBe(false);
    });

    test('should only apply scoring multiplier when zero bid is exact', () => {
      const exact = engine.calculateHandScore(0, 0, 3);
      const notExact = engine.calculateHandScore(0, 1, 3);

      // Exact: 10 * 3 = 30
      expect(exact.baseScore).toBe(30);
      expect(exact.exact).toBe(true);

      // Not exact: -10 * 3 = -30
      expect(notExact.baseScore).toBe(-30);
      expect(notExact.exact).toBe(false);
    });
  });

  describe('Total score updates (Criterion 4)', () => {
    test('should correctly sum scores across multiple hands', () => {
      const hands = [
        { bid: 5, tricks: 5, handNumber: 1 },    // +100
        { bid: 3, tricks: 2, handNumber: 2 },    // -10
        { bid: 0, tricks: 0, handNumber: 3 }     // +30
      ];

      const result = engine.calculateTotalScore(hands);
      expect(result.totalScore).toBe(120); // 100 - 10 + 30
      expect(result.hands.length).toBe(3);
      expect(result.handCount).toBe(3);
    });

    test('should handle mixed exact and inexact bids', () => {
      const hands = [
        { bid: 2, tricks: 2, handNumber: 1 },    // +40 (exact)
        { bid: 4, tricks: 3, handNumber: 2 },    // -10 (miss by 1)
        { bid: 1, tricks: 1, handNumber: 3 }     // +20 (exact)
      ];

      const result = engine.calculateTotalScore(hands);
      expect(result.totalScore).toBe(50); // 40 - 10 + 20
    });

    test('should handle all zero bids', () => {
      const hands = [
        { bid: 0, tricks: 0, handNumber: 1 },    // +10
        { bid: 0, tricks: 0, handNumber: 2 },    // +20
        { bid: 0, tricks: 0, handNumber: 3 }     // +30
      ];

      const result = engine.calculateTotalScore(hands);
      expect(result.totalScore).toBe(60); // 10 + 20 + 30
    });

    test('should handle negative total scores', () => {
      const hands = [
        { bid: 5, tricks: 0, handNumber: 1 },    // -50 (miss by 5)
        { bid: 3, tricks: 0, handNumber: 2 },    // -30 (miss by 3)
        { bid: 0, tricks: 1, handNumber: 3 }     // -30 (zero bid miss)
      ];

      const result = engine.calculateTotalScore(hands);
      expect(result.totalScore).toBe(-110); // -50 - 30 - 30
    });
  });

  describe('Score breakdown (Criterion 5)', () => {
    test('should provide description for exact non-zero bid', () => {
      const result = engine.calculateHandScore(5, 5, 1);
      expect(result.description).toContain('exact');
      expect(result.description).toContain('+100');
      expect(result.description).toContain('20×5');
    });

    test('should provide description for missed non-zero bid', () => {
      const result = engine.calculateHandScore(5, 3, 1);
      expect(result.description).toContain('missed');
      expect(result.description).toContain('-20');
      expect(result.description).toContain('2 difference');
    });

    test('should provide description for exact zero bid', () => {
      const result = engine.calculateHandScore(0, 0, 3);
      expect(result.description).toContain('exact');
      expect(result.description).toContain('+30');
      expect(result.description).toContain('10×3');
    });

    test('should provide description for missed zero bid', () => {
      const result = engine.calculateHandScore(0, 2, 3);
      expect(result.description).toContain('missed');
      expect(result.description).toContain('-30');
      expect(result.description).toContain('10×3');
    });

    test('should include all necessary fields in breakdown', () => {
      const result = engine.calculateHandScore(5, 5, 1);
      expect(result).toHaveProperty('bid');
      expect(result).toHaveProperty('tricks');
      expect(result).toHaveProperty('handNumber');
      expect(result).toHaveProperty('baseScore');
      expect(result).toHaveProperty('bonusScore');
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('exact');
      expect(result).toHaveProperty('description');
    });

    test('should provide summary for total score', () => {
      const hands = [
        { bid: 5, tricks: 5, handNumber: 1 },
        { bid: 3, tricks: 2, handNumber: 2 }
      ];
      const result = engine.calculateTotalScore(hands);
      expect(result).toHaveProperty('summary');
      expect(result.summary).toContain('Total');
      expect(result.summary).toContain('points');
      expect(result.summary).toContain('hands');
    });
  });

  describe('Error handling', () => {
    test('should throw error for non-numeric bid', () => {
      expect(() => engine.calculateHandScore('5', 5, 1)).toThrow();
    });

    test('should throw error for non-numeric tricks', () => {
      expect(() => engine.calculateHandScore(5, '5', 1)).toThrow();
    });

    test('should throw error for negative bid', () => {
      expect(() => engine.calculateHandScore(-5, 5, 1)).toThrow();
    });

    test('should throw error for negative tricks', () => {
      expect(() => engine.calculateHandScore(5, -5, 1)).toThrow();
    });

    test('should throw error for non-integer bid', () => {
      expect(() => engine.calculateHandScore(5.5, 5, 1)).toThrow();
    });

    test('should throw error for non-array hands in calculateTotalScore', () => {
      expect(() => engine.calculateTotalScore('not an array')).toThrow();
    });
  });

  describe('Edge cases', () => {
    test('should handle bid of 0 tricks', () => {
      const result = engine.calculateHandScore(0, 0, 1);
      expect(result.baseScore).toBe(10);
      expect(result.exact).toBe(true);
    });

    test('should handle large bid values', () => {
      const result = engine.calculateHandScore(100, 100, 1);
      expect(result.baseScore).toBe(2000); // 20 * 100
      expect(result.exact).toBe(true);
    });

    test('should handle large hand numbers for zero bids', () => {
      const result = engine.calculateHandScore(0, 0, 13);
      expect(result.baseScore).toBe(130); // 10 * 13
      expect(result.exact).toBe(true);
    });

    test('should handle single hand in total score', () => {
      const hands = [{ bid: 3, tricks: 3, handNumber: 1 }];
      const result = engine.calculateTotalScore(hands);
      expect(result.totalScore).toBe(60); // 20 * 3
      expect(result.handCount).toBe(1);
    });
  });
});
