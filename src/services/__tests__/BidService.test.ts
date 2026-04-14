import { BidService } from '../BidService';

describe('BidService', () => {
  let bidService: BidService;

  beforeEach(() => {
    bidService = new BidService();
  });

  describe('setBid and getBid', () => {
    it('should set and retrieve a bid', () => {
      bidService.setBid('player-1', 3);
      expect(bidService.getBid('player-1')).toBe(3);
    });

    it('should accept bid of 0', () => {
      bidService.setBid('player-1', 0);
      expect(bidService.getBid('player-1')).toBe(0);
    });

    it('should update a bid when set again', () => {
      bidService.setBid('player-1', 2);
      bidService.setBid('player-1', 3);
      expect(bidService.getBid('player-1')).toBe(3);
    });

    it('should return undefined for non-existent player', () => {
      expect(bidService.getBid('player-unknown')).toBeUndefined();
    });

    it('should reject negative bids', () => {
      expect(() => bidService.setBid('player-1', -1)).toThrow();
    });

    it('should reject NaN', () => {
      expect(() => bidService.setBid('player-1', NaN)).toThrow();
    });
  });

  describe('allPlayersHaveBids', () => {
    it('should return false when players have no bids', () => {
      const playerIds = ['player-1', 'player-2'];
      expect(bidService.allPlayersHaveBids(playerIds)).toBe(false);
    });

    it('should return false when only some players have bids', () => {
      bidService.setBid('player-1', 2);
      const playerIds = ['player-1', 'player-2'];
      expect(bidService.allPlayersHaveBids(playerIds)).toBe(false);
    });

    it('should return true when all players have bids', () => {
      bidService.setBid('player-1', 2);
      bidService.setBid('player-2', 1);
      const playerIds = ['player-1', 'player-2'];
      expect(bidService.allPlayersHaveBids(playerIds)).toBe(true);
    });

    it('should return true when all players have bids including zero', () => {
      bidService.setBid('player-1', 0);
      bidService.setBid('player-2', 2);
      const playerIds = ['player-1', 'player-2'];
      expect(bidService.allPlayersHaveBids(playerIds)).toBe(true);
    });

    it('should return true for empty player list', () => {
      const playerIds: string[] = [];
      expect(bidService.allPlayersHaveBids(playerIds)).toBe(true);
    });
  });

  describe('getBids', () => {
    it('should return all bids as a Map', () => {
      bidService.setBid('player-1', 2);
      bidService.setBid('player-2', 1);
      const bids = bidService.getBids();
      expect(bids.get('player-1')).toBe(2);
      expect(bids.get('player-2')).toBe(1);
    });

    it('should return a copy of the bids map', () => {
      bidService.setBid('player-1', 2);
      const bids1 = bidService.getBids();
      const bids2 = bidService.getBids();
      expect(bids1).not.toBe(bids2);
      expect(bids1.get('player-1')).toBe(bids2.get('player-1'));
    });
  });

  describe('getTotalBids', () => {
    it('should return 0 when no bids', () => {
      expect(bidService.getTotalBids()).toBe(0);
    });

    it('should return sum of all bids', () => {
      bidService.setBid('player-1', 2);
      bidService.setBid('player-2', 3);
      bidService.setBid('player-3', 1);
      expect(bidService.getTotalBids()).toBe(6);
    });

    it('should include zero bids in total', () => {
      bidService.setBid('player-1', 0);
      bidService.setBid('player-2', 3);
      expect(bidService.getTotalBids()).toBe(3);
    });
  });

  describe('reset', () => {
    it('should clear all bids', () => {
      bidService.setBid('player-1', 2);
      bidService.setBid('player-2', 1);
      bidService.reset();
      expect(bidService.getBid('player-1')).toBeUndefined();
      expect(bidService.getBid('player-2')).toBeUndefined();
    });
  });
});
