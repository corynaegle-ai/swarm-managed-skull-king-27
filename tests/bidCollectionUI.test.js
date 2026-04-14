/**
 * Test Suite for Bid Collection UI Module
 */

const BidCollectionUI = require('../src/game/bidCollectionUI');

describe('BidCollectionUI', () => {
  let ui;
  const players = ['Alice', 'Bob', 'Charlie'];

  beforeEach(() => {
    ui = new BidCollectionUI();
  });

  describe('Bid collection flow', () => {
    test('should start bid collection with round info', () => {
      const screen = ui.startBidCollection(1, players);
      expect(screen.phase).toBe('BID_COLLECTION_START');
      expect(screen.roundNumber).toBe(1);
      expect(screen.handCount).toBe(1);
    });

    test('should request next player to bid', () => {
      ui.startBidCollection(1, players);
      const screen = ui.getNextPlayerToBid();
      expect(screen.phase).toBe('AWAITING_BID');
      expect(screen.currentPlayer).toBe('Alice');
    });

    test('should accept valid bid', () => {
      ui.startBidCollection(1, players);
      const result = ui.submitBid('Alice', 0);
      expect(result.phase).toBe('BID_ACCEPTED');
      expect(result.player).toBe('Alice');
    });

    test('should reject invalid bid', () => {
      ui.startBidCollection(1, players);
      const result = ui.submitBid('Alice', 2);
      expect(result.phase).toBe('BID_ERROR');
      expect(result.error).toContain('cannot exceed hand count');
    });
  });

  describe('Bid review and modification', () => {
    beforeEach(() => {
      ui.startBidCollection(1, players);
      ui.submitBid('Alice', 0);
      ui.submitBid('Bob', 1);
      ui.submitBid('Charlie', 0);
    });

    test('should provide bid review', () => {
      const review = ui.getBidReview();
      expect(review.phase).toBe('BID_REVIEW');
      expect(review.bids).toHaveLength(3);
      expect(review.allValid).toBe(true);
    });

    test('should allow bid modification during review', () => {
      const result = ui.modifyBidReview('Alice', 1);
      expect(result.phase).toBe('BID_MODIFIED');
      expect(result.newBid).toBe(1);
    });

    test('should reject invalid modification', () => {
      const result = ui.modifyBidReview('Alice', 2);
      expect(result.phase).toBe('MODIFY_BID_ERROR');
    });
  });

  describe('Bid confirmation and scoring', () => {
    beforeEach(() => {
      ui.startBidCollection(1, players);
      ui.submitBid('Alice', 0);
      ui.submitBid('Bob', 1);
      ui.submitBid('Charlie', 0);
    });

    test('should proceed to scoring with confirmed bids', () => {
      const result = ui.proceedToScoring();
      expect(result.phase).toBe('BIDS_CONFIRMED');
      expect(result.readyForScoring).toBe(true);
    });

    test('should reject scoring with incomplete bids', () => {
      const ui2 = new BidCollectionUI();
      ui2.startBidCollection(1, players);
      ui2.submitBid('Alice', 0);
      const result = ui2.proceedToScoring();
      expect(result.phase).toBe('CONFIRM_ERROR');
    });
  });

  describe('Multi-round workflow', () => {
    test('should handle multiple rounds', () => {
      // Round 1
      ui.startBidCollection(1, players);
      ui.submitBid('Alice', 0);
      ui.submitBid('Bob', 1);
      ui.submitBid('Charlie', 0);
      let result = ui.proceedToScoring();
      expect(result.phase).toBe('BIDS_CONFIRMED');

      // Round 2
      ui = new BidCollectionUI();
      ui.startBidCollection(2, players);
      ui.submitBid('Alice', 1);
      ui.submitBid('Bob', 0);
      ui.submitBid('Charlie', 2);
      result = ui.proceedToScoring();
      expect(result.phase).toBe('BIDS_CONFIRMED');
    });
  });

  describe('Error handling', () => {
    test('should handle non-existent player bid', () => {
      ui.startBidCollection(1, players);
      const result = ui.submitBid('Unknown', 0);
      expect(result.phase).toBe('BID_ERROR');
    });
  });
});
