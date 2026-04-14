import { BidService } from '../BidService';

describe('BidService', () => {
  let bidService: BidService;

  beforeEach(() => {
    bidService = new BidService();
  });

  describe('validateBid', () => {
    it('should validate bid within hand count', () => {
      const result = bidService.validateBid(2, 5);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject bid exceeding hand count', () => {
      const result = bidService.validateBid(6, 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot exceed 5');
    });

    it('should accept bid equal to hand count', () => {
      const result = bidService.validateBid(5, 5);
      expect(result.isValid).toBe(true);
    });

    it('should accept zero bid', () => {
      const result = bidService.validateBid(0, 5);
      expect(result.isValid).toBe(true);
    });

    it('should reject negative bid', () => {
      const result = bidService.validateBid(-1, 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('non-negative');
    });

    it('should reject NaN bid', () => {
      const result = bidService.validateBid(NaN, 5);
      expect(result.isValid).toBe(false);
    });
  });

  describe('isBidSet', () => {
    it('should return true for positive bid', () => {
      expect(bidService.isBidSet(1)).toBe(true);
      expect(bidService.isBidSet(5)).toBe(true);
    });

    it('should return false for zero bid', () => {
      expect(bidService.isBidSet(0)).toBe(false);
    });

    it('should return false for negative bid', () => {
      expect(bidService.isBidSet(-1)).toBe(false);
    });
  });

  describe('validateAllBids', () => {
    it('should validate all bids correctly', () => {
      const bids = new Map([
        ['player1', 2],
        ['player2', 3],
        ['player3', 0],
      ]);

      const result = bidService.validateAllBids(bids, 5);
      expect(result.isValid).toBe(true);
    });

    it('should reject if any bid exceeds hand count', () => {
      const bids = new Map([
        ['player1', 2],
        ['player2', 6],
        ['player3', 0],
      ]);

      const result = bidService.validateAllBids(bids, 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('player2');
    });

    it('should report multiple errors', () => {
      const bids = new Map([
        ['player1', -1],
        ['player2', 6],
        ['player3', 0],
      ]);

      const result = bidService.validateAllBids(bids, 5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('player1');
      expect(result.error).toContain('player2');
    });
  });

  describe('allPlayersHaveBids', () => {
    it('should return true when all players have non-zero bids', () => {
      const bids = new Map([
        ['1', 1],
        ['2', 2],
        ['3', 1],
      ]);

      const result = bidService.allPlayersHaveBids(bids, ['1', '2', '3']);
      expect(result).toBe(true);
    });

    it('should return false when any player has zero bid', () => {
      const bids = new Map([
        ['1', 1],
        ['2', 0],
        ['3', 1],
      ]);

      const result = bidService.allPlayersHaveBids(bids, ['1', '2', '3']);
      expect(result).toBe(false);
    });

    it('should return false when player bid is missing', () => {
      const bids = new Map([
        ['1', 1],
        ['3', 1],
      ]);

      const result = bidService.allPlayersHaveBids(bids, ['1', '2', '3']);
      expect(result).toBe(false);
    });

    it('should return false for empty bids', () => {
      const bids = new Map();
      const result = bidService.allPlayersHaveBids(bids, ['1', '2', '3']);
      expect(result).toBe(false);
    });
  });

  describe('Round number = Hand count relationship', () => {
    it('should enforce round 1 has 1 hand', () => {
      const result = bidService.validateBid(2, 1);
      expect(result.isValid).toBe(false);
    });

    it('should enforce round 3 has 3 hands', () => {
      const result = bidService.validateBid(4, 3);
      expect(result.isValid).toBe(false);

      const validResult = bidService.validateBid(3, 3);
      expect(validResult.isValid).toBe(true);
    });
  });
});
