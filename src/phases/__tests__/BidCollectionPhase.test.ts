import { BidCollectionPhase } from '../BidCollectionPhase';

describe('BidCollectionPhase', () => {
  const mockPlayers = [
    { id: 'player-1', name: 'Alice' },
    { id: 'player-2', name: 'Bob' },
  ];

  const mockGameState = {
    roundNumber: 3,
    players: mockPlayers,
    totalRounds: 10,
  };

  let bidPhase: BidCollectionPhase;

  beforeEach(() => {
    bidPhase = new BidCollectionPhase(mockGameState);
  });

  describe('submitBid', () => {
    it('should accept valid bids', () => {
      bidPhase.submitBid('player-1', 2);
      expect(bidPhase.getBids().get('player-1')).toBe(2);
    });

    it('should accept bid of 0', () => {
      bidPhase.submitBid('player-1', 0);
      expect(bidPhase.getBids().get('player-1')).toBe(0);
    });

    it('should accept bid equal to hand count', () => {
      bidPhase.submitBid('player-1', 3);
      expect(bidPhase.getBids().get('player-1')).toBe(3);
    });

    it('should reject bids exceeding hand count', () => {
      expect(() => bidPhase.submitBid('player-1', 4)).toThrow(
        'Bid cannot exceed 3 hands in round 3'
      );
    });

    it('should reject negative bids', () => {
      expect(() => bidPhase.submitBid('player-1', -1)).toThrow('Bid cannot be negative');
    });

    it('should reject non-numeric bids', () => {
      expect(() => bidPhase.submitBid('player-1', NaN)).toThrow('Bid must be a valid number');
    });
  });

  describe('areAllBidsSubmitted', () => {
    it('should return false when no bids submitted', () => {
      expect(bidPhase.areAllBidsSubmitted()).toBe(false);
    });

    it('should return false when only some players have submitted', () => {
      bidPhase.submitBid('player-1', 2);
      expect(bidPhase.areAllBidsSubmitted()).toBe(false);
    });

    it('should return true when all players have submitted bids', () => {
      bidPhase.submitBid('player-1', 2);
      bidPhase.submitBid('player-2', 1);
      expect(bidPhase.areAllBidsSubmitted()).toBe(true);
    });

    it('should return true when all players have submitted including zero bids', () => {
      bidPhase.submitBid('player-1', 0);
      bidPhase.submitBid('player-2', 2);
      expect(bidPhase.areAllBidsSubmitted()).toBe(true);
    });
  });

  describe('getBids', () => {
    it('should return submitted bids', () => {
      bidPhase.submitBid('player-1', 2);
      bidPhase.submitBid('player-2', 1);
      const bids = bidPhase.getBids();
      expect(bids.get('player-1')).toBe(2);
      expect(bids.get('player-2')).toBe(1);
    });
  });

  describe('getTotalBids', () => {
    it('should return sum of all bids', () => {
      bidPhase.submitBid('player-1', 2);
      bidPhase.submitBid('player-2', 1);
      expect(bidPhase.getTotalBids()).toBe(3);
    });

    it('should include zero bids in total', () => {
      bidPhase.submitBid('player-1', 0);
      bidPhase.submitBid('player-2', 3);
      expect(bidPhase.getTotalBids()).toBe(3);
    });
  });

  describe('reset', () => {
    it('should clear all bids', () => {
      bidPhase.submitBid('player-1', 2);
      bidPhase.submitBid('player-2', 1);
      bidPhase.reset();
      expect(bidPhase.areAllBidsSubmitted()).toBe(false);
      expect(bidPhase.getBids().size).toBe(0);
    });
  });

  describe('Hand count validation', () => {
    it('should use round number as hand count', () => {
      const phaseRound2 = new BidCollectionPhase({
        ...mockGameState,
        roundNumber: 2,
      });

      phaseRound2.submitBid('player-1', 2);
      expect(() => phaseRound2.submitBid('player-2', 3)).toThrow(
        'Bid cannot exceed 2 hands in round 2'
      );
    });

    it('should update validation based on round number', () => {
      const phaseRound1 = new BidCollectionPhase({
        ...mockGameState,
        roundNumber: 1,
      });

      expect(() => phaseRound1.submitBid('player-1', 2)).toThrow(
        'Bid cannot exceed 1 hands in round 1'
      );
    });
  });
});
