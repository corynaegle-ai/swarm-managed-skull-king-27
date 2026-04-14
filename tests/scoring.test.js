const {
  calculateHandScore,
  calculateRoundScores,
  updatePlayerScores,
  formatScoreBreakdown
} = require('../src/js/scoring');

describe('Scoring Engine', () => {
  describe('calculateHandScore', () => {
    describe('Non-zero bids', () => {
      test('Exact bid: +20 per trick', () => {
        const result = calculateHandScore(3, 3, 1);
        expect(result.baseScore).toBe(60);
        expect(result.total).toBe(60);
        expect(result.isExact).toBe(true);
      });

      test('Exact bid with bonus points: bonus applies', () => {
        const result = calculateHandScore(3, 3, 1, 5);
        expect(result.baseScore).toBe(60);
        expect(result.bonus).toBe(5);
        expect(result.total).toBe(65);
      });

      test('Missed bid (overbid): -10 per difference', () => {
        const result = calculateHandScore(5, 3, 1);
        expect(result.baseScore).toBe(-20);
        expect(result.total).toBe(-20);
      });

      test('Missed bid (underbid): -10 per difference', () => {
        const result = calculateHandScore(3, 5, 1);
        expect(result.baseScore).toBe(-20);
        expect(result.total).toBe(-20);
      });

      test('Missed bid: no bonus points applied', () => {
        const result = calculateHandScore(5, 3, 1, 10);
        expect(result.baseScore).toBe(-20);
        expect(result.bonus).toBe(0);
        expect(result.total).toBe(-20);
      });

      test('Bid 0 tricks, got 0: exact', () => {
        const result = calculateHandScore(1, 1, 1);
        expect(result.baseScore).toBe(20);
        expect(result.isExact).toBe(true);
      });
    });

    describe('Zero bids', () => {
      test('Zero bid exact (0 tricks): +10 × hand number', () => {
        const result = calculateHandScore(0, 0, 1);
        expect(result.baseScore).toBe(10);
        expect(result.total).toBe(10);
      });

      test('Zero bid exact with bonus: bonus applies', () => {
        const result = calculateHandScore(0, 0, 1, 5);
        expect(result.baseScore).toBe(10);
        expect(result.bonus).toBe(5);
        expect(result.total).toBe(15);
      });

      test('Zero bid exact, hand 3: +30', () => {
        const result = calculateHandScore(0, 0, 3);
        expect(result.baseScore).toBe(30);
      });

      test('Zero bid missed (took tricks): -10 × hand number', () => {
        const result = calculateHandScore(0, 1, 1);
        expect(result.baseScore).toBe(-10);
        expect(result.total).toBe(-10);
      });

      test('Zero bid missed, hand 3: -30', () => {
        const result = calculateHandScore(0, 2, 3);
        expect(result.baseScore).toBe(-30);
      });

      test('Zero bid missed: no bonus points applied', () => {
        const result = calculateHandScore(0, 1, 1, 10);
        expect(result.baseScore).toBe(-10);
        expect(result.bonus).toBe(0);
        expect(result.total).toBe(-10);
      });
    });

    describe('Error handling', () => {
      test('Throws on invalid bid', () => {
        expect(() => calculateHandScore('3', 3, 1)).toThrow();
        expect(() => calculateHandScore(-1, 3, 1)).toThrow();
      });

      test('Throws on invalid tricks', () => {
        expect(() => calculateHandScore(3, 'three', 1)).toThrow();
        expect(() => calculateHandScore(3, -1, 1)).toThrow();
      });

      test('Throws on invalid hand number', () => {
        expect(() => calculateHandScore(3, 3, 0)).toThrow();
        expect(() => calculateHandScore(3, 3, -1)).toThrow();
      });

      test('Throws on invalid bonus points', () => {
        expect(() => calculateHandScore(3, 3, 1, -1)).toThrow();
        expect(() => calculateHandScore(3, 3, 1, 'bonus')).toThrow();
      });
    });
  });

  describe('calculateRoundScores', () => {
    test('Calculates scores for multiple hands', () => {
      const hands = [
        { bid: 3, tricks: 3, handNumber: 1, bonusPoints: 0 },
        { bid: 2, tricks: 1, handNumber: 2, bonusPoints: 0 },
        { bid: 0, tricks: 0, handNumber: 3, bonusPoints: 0 }
      ];
      
      const result = calculateRoundScores(hands);
      
      expect(result.hands.length).toBe(3);
      expect(result.hands[0].total).toBe(60); // 20 * 3
      expect(result.hands[1].total).toBe(-10); // -10 * 1
      expect(result.hands[2].total).toBe(30); // 10 * 3
      expect(result.roundTotal).toBe(80);
    });

    test('Includes breakdown with all details', () => {
      const hands = [
        { bid: 2, tricks: 2, handNumber: 1, bonusPoints: 5 }
      ];
      
      const result = calculateRoundScores(hands);
      
      expect(result.breakdown.length).toBe(1);
      expect(result.breakdown[0]).toEqual({
        hand: 1,
        bid: 2,
        tricks: 2,
        exact: true,
        baseScore: 40,
        bonus: 5,
        total: 45
      });
    });

    test('Throws on invalid input', () => {
      expect(() => calculateRoundScores('not an array')).toThrow();
      expect(() => calculateRoundScores(null)).toThrow();
    });
  });

  describe('updatePlayerScores', () => {
    test('Updates player scores correctly', () => {
      const players = [
        { name: 'Player 1', score: 100 },
        { name: 'Player 2', score: 95 }
      ];
      const roundScores = [45, -10];
      
      const result = updatePlayerScores(players, roundScores);
      
      expect(result[0].score).toBe(145);
      expect(result[0].previousScore).toBe(100);
      expect(result[1].score).toBe(85);
      expect(result[1].previousScore).toBe(95);
    });

    test('Handles players with no previous score', () => {
      const players = [
        { name: 'Player 1' },
        { name: 'Player 2', score: 50 }
      ];
      const roundScores = [30, 20];
      
      const result = updatePlayerScores(players, roundScores);
      
      expect(result[0].score).toBe(30);
      expect(result[0].previousScore).toBe(0);
      expect(result[1].score).toBe(70);
    });

    test('Throws on mismatched arrays', () => {
      const players = [{}, {}];
      const roundScores = [10];
      
      expect(() => updatePlayerScores(players, roundScores)).toThrow();
    });
  });

  describe('formatScoreBreakdown', () => {
    test('Formats score breakdown as string', () => {
      const roundScoring = {
        breakdown: [
          { hand: 1, bid: 3, tricks: 3, exact: true, baseScore: 60, bonus: 0, total: 60 }
        ],
        roundTotal: 60
      };
      
      const result = formatScoreBreakdown(roundScoring);
      
      expect(result).toContain('ROUND SCORE BREAKDOWN');
      expect(result).toContain('Hand 1');
      expect(result).toContain('Bid: 3');
      expect(result).toContain('Tricks: 3');
      expect(result).toContain('Base Score: +60');
      expect(result).toContain('Round Total: +60');
    });

    test('Includes player names when provided', () => {
      const roundScoring = {
        breakdown: [
          { hand: 1, bid: 2, tricks: 2, exact: true, baseScore: 40, bonus: 0, total: 40 }
        ],
        roundTotal: 40
      };
      
      const result = formatScoreBreakdown(roundScoring, ['Alice']);
      
      expect(result).toContain('Alice:');
    });

    test('Shows bonus points when present', () => {
      const roundScoring = {
        breakdown: [
          { hand: 1, bid: 2, tricks: 2, exact: true, baseScore: 40, bonus: 5, total: 45 }
        ],
        roundTotal: 45
      };
      
      const result = formatScoreBreakdown(roundScoring);
      
      expect(result).toContain('Bonus: +5');
    });

    test('Handles negative scores correctly', () => {
      const roundScoring = {
        breakdown: [
          { hand: 1, bid: 5, tricks: 2, exact: false, baseScore: -30, bonus: 0, total: -30 }
        ],
        roundTotal: -30
      };
      
      const result = formatScoreBreakdown(roundScoring);
      
      expect(result).toContain('Base Score: -30');
      expect(result).toContain('Round Total: -30');
    });
  });
});
