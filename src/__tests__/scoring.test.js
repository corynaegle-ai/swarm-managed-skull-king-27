import {
  calculateRoundScore,
  isValidTricksValue,
  isValidBonusPoints,
} from '../utils/scoring';

describe('Scoring Utilities', () => {
  describe('calculateRoundScore', () => {
    describe('Score calculation when tricks equal bid (match)', () => {
      it('returns 10 * bid when tricks match bid', () => {
        expect(calculateRoundScore(2, 2)).toBe(20);
        expect(calculateRoundScore(3, 3)).toBe(30);
        expect(calculateRoundScore(0, 0)).toBe(0);
      });

      it('includes bonus points when tricks match bid', () => {
        expect(calculateRoundScore(2, 2, 5)).toBe(25);
        expect(calculateRoundScore(3, 3, 10)).toBe(40);
        expect(calculateRoundScore(1, 1, 0)).toBe(10);
      });
    });

    describe('Score calculation when tricks less than bid (undercut)', () => {
      it('returns 0 when tricks are less than bid', () => {
        expect(calculateRoundScore(1, 2)).toBe(0);
        expect(calculateRoundScore(0, 1)).toBe(0);
        expect(calculateRoundScore(2, 3)).toBe(0);
      });

      it('returns 0 regardless of bonus when undercut', () => {
        expect(calculateRoundScore(1, 2, 10)).toBe(0);
        expect(calculateRoundScore(0, 3, 50)).toBe(0);
      });
    });

    describe('Score calculation when tricks more than bid (overcut)', () => {
      it('returns negative points when tricks exceed bid', () => {
        expect(calculateRoundScore(3, 2)).toBe(-5); // 1 over
        expect(calculateRoundScore(4, 2)).toBe(-10); // 2 over
        expect(calculateRoundScore(5, 0)).toBe(-25); // 5 over
      });

      it('ignores bonus points when overcut', () => {
        expect(calculateRoundScore(3, 2, 10)).toBe(-5); // Still -5, bonus ignored
        expect(calculateRoundScore(4, 2, 50)).toBe(-10);
      });
    });

    describe('Edge cases', () => {
      it('handles zero bid correctly', () => {
        expect(calculateRoundScore(0, 0)).toBe(0);
        expect(calculateRoundScore(1, 0)).toBe(-5);
        expect(calculateRoundScore(0, 0, 10)).toBe(10);
      });

      it('handles large bid values', () => {
        expect(calculateRoundScore(10, 10)).toBe(100);
        expect(calculateRoundScore(13, 13, 5)).toBe(135);
      });

      it('handles default bonus parameter', () => {
        expect(calculateRoundScore(2, 2)).toBe(20); // bonus defaults to 0
      });
    });
  });

  describe('isValidTricksValue', () => {
    it('returns true for valid tricks values', () => {
      expect(isValidTricksValue(0, 3)).toBe(true);
      expect(isValidTricksValue(1, 3)).toBe(true);
      expect(isValidTricksValue(3, 3)).toBe(true);
    });

    it('returns false for tricks greater than hand', () => {
      expect(isValidTricksValue(4, 3)).toBe(false);
      expect(isValidTricksValue(10, 3)).toBe(false);
    });

    it('returns false for negative tricks', () => {
      expect(isValidTricksValue(-1, 3)).toBe(false);
    });

    it('returns false for non-numeric values', () => {
      expect(isValidTricksValue(NaN, 3)).toBe(false);
      expect(isValidTricksValue('abc', 3)).toBe(false);
    });
  });

  describe('isValidBonusPoints', () => {
    it('returns true for non-negative bonus points', () => {
      expect(isValidBonusPoints(0)).toBe(true);
      expect(isValidBonusPoints(5)).toBe(true);
      expect(isValidBonusPoints(100)).toBe(true);
    });

    it('returns false for negative bonus points', () => {
      expect(isValidBonusPoints(-1)).toBe(false);
      expect(isValidBonusPoints(-50)).toBe(false);
    });

    it('returns false for non-numeric values', () => {
      expect(isValidBonusPoints(NaN)).toBe(false);
      expect(isValidBonusPoints('abc')).toBe(false);
    });
  });
});