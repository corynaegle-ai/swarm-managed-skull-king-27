import {
  calculateRoundScore,
  calculateTotalScore,
  isValidTrickCount,
} from '../scoringCalculator';

describe('scoringCalculator', () => {
  describe('calculateRoundScore', () => {
    test('calculates correct score when bid is made', () => {
      const score = calculateRoundScore({
        bid: 2,
        tricksTaken: 2,
        bonusPoints: 0,
      });

      // 10 + 10*2 + 0 = 30
      expect(score).toBe(30);
    });

    test('calculates correct score when bid is made with bonus points', () => {
      const score = calculateRoundScore({
        bid: 3,
        tricksTaken: 3,
        bonusPoints: 20,
      });

      // 10 + 10*3 + 20 = 60
      expect(score).toBe(60);
    });

    test('calculates negative score when bid is not made', () => {
      const score = calculateRoundScore({
        bid: 2,
        tricksTaken: 0,
        bonusPoints: 0,
      });

      // -10 * abs(2 - 0) + 0 = -20
      expect(score).toBe(-20);
    });

    test('calculates negative score with bonus when bid is not made', () => {
      const score = calculateRoundScore({
        bid: 3,
        tricksTaken: 1,
        bonusPoints: 10,
      });

      // -10 * abs(3 - 1) + 10 = -20 + 10 = -10
      expect(score).toBe(-10);
    });

    test('calculates score for zero bid made', () => {
      const score = calculateRoundScore({
        bid: 0,
        tricksTaken: 0,
        bonusPoints: 0,
      });

      // 10 + 10*0 + 0 = 10
      expect(score).toBe(10);
    });

    test('calculates penalty when zero bid is not made', () => {
      const score = calculateRoundScore({
        bid: 0,
        tricksTaken: 1,
        bonusPoints: 0,
      });

      // -10 * abs(0 - 1) + 0 = -10
      expect(score).toBe(-10);
    });

    test('defaults bonusPoints to 0 when not provided', () => {
      const score = calculateRoundScore({
        bid: 2,
        tricksTaken: 2,
      });

      expect(score).toBe(30);
    });
  });

  describe('calculateTotalScore', () => {
    test('returns 0 for empty array', () => {
      const total = calculateTotalScore([]);
      expect(total).toBe(0);
    });

    test('returns single score when array has one element', () => {
      const total = calculateTotalScore([25]);
      expect(total).toBe(25);
    });

    test('sums multiple round scores correctly', () => {
      const total = calculateTotalScore([30, -20, 40, 10]);
      expect(total).toBe(60);
    });

    test('handles mix of positive and negative scores', () => {
      const total = calculateTotalScore([50, -30, 20, -10, 25]);
      expect(total).toBe(55);
    });

    test('returns 0 when scores sum to zero', () => {
      const total = calculateTotalScore([30, -30]);
      expect(total).toBe(0);
    });
  });

  describe('isValidTrickCount', () => {
    test('validates correct trick count within range', () => {
      expect(isValidTrickCount(0, 10)).toBe(true);
      expect(isValidTrickCount(5, 10)).toBe(true);
      expect(isValidTrickCount(10, 10)).toBe(true);
    });

    test('rejects trick count greater than hand size', () => {
      expect(isValidTrickCount(11, 10)).toBe(false);
      expect(isValidTrickCount(15, 10)).toBe(false);
    });

    test('rejects negative trick count', () => {
      expect(isValidTrickCount(-1, 10)).toBe(false);
    });

    test('rejects non-numeric values', () => {
      expect(isValidTrickCount('5', 10)).toBe(false);
      expect(isValidTrickCount(null, 10)).toBe(false);
      expect(isValidTrickCount(undefined, 10)).toBe(false);
    });

    test('validates edge cases', () => {
      expect(isValidTrickCount(0, 1)).toBe(true);
      expect(isValidTrickCount(1, 1)).toBe(true);
      expect(isValidTrickCount(2, 1)).toBe(false);
    });
  });
});
