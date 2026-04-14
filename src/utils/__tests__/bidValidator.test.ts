import { validateBid, validateAllBids, areAllBidsValid } from '../bidValidator';

describe('bidValidator', () => {
  describe('validateBid', () => {
    const handCount = 5;

    it('should return error for null bid', () => {
      const error = validateBid(null, handCount);
      expect(error).not.toBe('');
      expect(error).toContain('required');
    });

    it('should return error for undefined bid', () => {
      const error = validateBid(undefined, handCount);
      expect(error).not.toBe('');
      expect(error).toContain('required');
    });

    it('should return error for empty string', () => {
      const error = validateBid('' as any, handCount);
      expect(error).not.toBe('');
      expect(error).toContain('required');
    });

    it('should return error for NaN', () => {
      const error = validateBid(NaN, handCount);
      expect(error).not.toBe('');
      expect(error).toContain('number');
    });

    it('should return error for negative numbers', () => {
      const error = validateBid(-1, handCount);
      expect(error).not.toBe('');
      expect(error).toContain('negative');
    });

    it('should return error for non-integer numbers', () => {
      const error = validateBid(2.5, handCount);
      expect(error).not.toBe('');
      expect(error).toContain('whole number');
    });

    it('should return error when bid exceeds hand count', () => {
      const error = validateBid(6, handCount);
      expect(error).not.toBe('');
      expect(error).toContain('cannot exceed');
      expect(error).toContain(String(handCount));
    });

    it('should accept zero bid', () => {
      const error = validateBid(0, handCount);
      expect(error).toBe('');
    });

    it('should accept bid equal to hand count', () => {
      const error = validateBid(handCount, handCount);
      expect(error).toBe('');
    });

    it('should accept valid bid below hand count', () => {
      const error = validateBid(3, handCount);
      expect(error).toBe('');
    });

    it('should work with different hand counts', () => {
      expect(validateBid(1, 1)).toBe('');
      expect(validateBid(2, 2)).toBe('');
      expect(validateBid(3, 3)).toBe('');
      expect(validateBid(10, 10)).toBe('');
    });

    it('should reject bids exceeding different hand counts', () => {
      expect(validateBid(2, 1)).not.toBe('');
      expect(validateBid(3, 2)).not.toBe('');
      expect(validateBid(11, 10)).not.toBe('');
    });
  });

  describe('validateAllBids', () => {
    const handCount = 3;

    it('should return empty object for all valid bids', () => {
      const bids = {
        player1: 1,
        player2: 2,
        player3: 0,
      };
      const errors = validateAllBids(bids, handCount);
      expect(errors).toEqual({});
    });

    it('should identify invalid bids', () => {
      const bids = {
        player1: 1,
        player2: 5,
        player3: -1,
      };
      const errors = validateAllBids(bids, handCount);
      expect(errors.player2).toBeDefined();
      expect(errors.player3).toBeDefined();
      expect(errors.player1).toBeUndefined();
    });

    it('should handle multiple invalid bids', () => {
      const bids = {
        player1: null,
        player2: 5,
        player3: 2.5,
      };
      const errors = validateAllBids(bids, handCount);
      expect(Object.keys(errors).length).toBe(3);
    });

    it('should provide specific error messages for each player', () => {
      const bids = {
        player1: null,
        player2: 10,
      };
      const errors = validateAllBids(bids, handCount);
      expect(errors.player1).toContain('required');
      expect(errors.player2).toContain('cannot exceed');
    });
  });

  describe('areAllBidsValid', () => {
    const handCount = 4;

    it('should return true when all bids are valid', () => {
      const bids = {
        player1: 1,
        player2: 2,
        player3: 0,
        player4: 4,
      };
      expect(areAllBidsValid(bids, handCount)).toBe(true);
    });

    it('should return false when any bid is missing', () => {
      const bids = {
        player1: 1,
        player2: null,
        player3: 0,
      };
      expect(areAllBidsValid(bids, handCount)).toBe(false);
    });

    it('should return false when any bid exceeds hand count', () => {
      const bids = {
        player1: 1,
        player2: 2,
        player3: 5,
      };
      expect(areAllBidsValid(bids, handCount)).toBe(false);
    });

    it('should return false for negative bids', () => {
      const bids = {
        player1: 1,
        player2: -1,
      };
      expect(areAllBidsValid(bids, handCount)).toBe(false);
    });

    it('should return true for zero bids', () => {
      const bids = {
        player1: 0,
        player2: 0,
        player3: 0,
      };
      expect(areAllBidsValid(bids, handCount)).toBe(true);
    });

    it('should work with single player', () => {
      const bids = { player1: 4 };
      expect(areAllBidsValid(bids, handCount)).toBe(true);
    });

    it('should work with many players', () => {
      const bids: Record<string, number> = {};
      for (let i = 0; i < 20; i++) {
        bids[`player${i}`] = Math.floor(Math.random() * (handCount + 1));
      }
      const result = areAllBidsValid(bids, handCount);
      expect(typeof result).toBe('boolean');
    });
  });
});
