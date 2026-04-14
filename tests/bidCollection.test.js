/**
 * Test Suite for Bid Collection Module
 */

const BidCollection = require('../src/game/bidCollection');

describe('BidCollection', () => {
  let bidCollection;
  const players = ['Alice', 'Bob', 'Charlie'];

  beforeEach(() => {
    bidCollection = new BidCollection();
    bidCollection.initializeRound(1, players);
  });

  describe('Criterion 1: Display current round and hand count clearly', () => {
    test('should display current round number', () => {
      const display = bidCollection.getCurrentRoundDisplay();
      expect(display.roundNumber).toBe(1);
    });

    test('should display hand count equal to round number', () => {
      const display = bidCollection.getCurrentRoundDisplay();
      expect(display.handCount).toBe(1);
    });

    test('should have clear display text', () => {
      const display = bidCollection.getCurrentRoundDisplay();
      expect(display.displayText).toContain('Round 1');
      expect(display.displayText).toContain('1 hand');
    });

    test('should initialize correctly for round 3', () => {
      bidCollection.initializeRound(3, players);
      const display = bidCollection.getCurrentRoundDisplay();
      expect(display.roundNumber).toBe(3);
      expect(display.handCount).toBe(3);
      expect(display.displayText).toContain('3 hands');
    });
  });

  describe('Criterion 2: Prevent bids exceeding hand count', () => {
    test('should reject bid exceeding hand count', () => {
      const result = bidCollection.submitBid('Alice', 2);
      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot exceed hand count');
    });

    test('should accept bid equal to hand count', () => {
      const result = bidCollection.submitBid('Alice', 1);
      expect(result.success).toBe(true);
    });

    test('should accept bid of 0', () => {
      const result = bidCollection.submitBid('Alice', 0);
      expect(result.success).toBe(true);
    });

    test('should reject negative bid', () => {
      const result = bidCollection.submitBid('Alice', -1);
      expect(result.success).toBe(false);
    });

    test('should enforce hand count limit for round 5', () => {
      bidCollection.initializeRound(5, players);
      const validResult = bidCollection.submitBid('Alice', 5);
      expect(validResult.success).toBe(true);

      bidCollection.reset();
      const invalidResult = bidCollection.submitBid('Bob', 6);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe('Criterion 3: Require bid from every player before proceeding', () => {
    test('should indicate incomplete bids', () => {
      bidCollection.submitBid('Alice', 0);
      const state = bidCollection.areAllBidsCollected();
      expect(state.isComplete).toBe(false);
    });

    test('should list pending players', () => {
      bidCollection.submitBid('Alice', 0);
      const state = bidCollection.areAllBidsCollected();
      expect(state.pendingPlayers).toContain('Bob');
      expect(state.pendingPlayers).toContain('Charlie');
      expect(state.pendingPlayers).not.toContain('Alice');
    });

    test('should indicate complete when all bids collected', () => {
      bidCollection.submitBid('Alice', 0);
      bidCollection.submitBid('Bob', 1);
      bidCollection.submitBid('Charlie', 0);
      const state = bidCollection.areAllBidsCollected();
      expect(state.isComplete).toBe(true);
      expect(state.pendingPlayers).toHaveLength(0);
    });

    test('should track collection count', () => {
      bidCollection.submitBid('Alice', 0);
      let state = bidCollection.areAllBidsCollected();
      expect(state.collectedCount).toBe(1);
      expect(state.totalPlayers).toBe(3);

      bidCollection.submitBid('Bob', 1);
      state = bidCollection.areAllBidsCollected();
      expect(state.collectedCount).toBe(2);
    });
  });

  describe('Criterion 4: Allow bid modifications before confirming', () => {
    beforeEach(() => {
      bidCollection.submitBid('Alice', 0);
      bidCollection.submitBid('Bob', 1);
      bidCollection.submitBid('Charlie', 0);
    });

    test('should allow modifying an existing bid', () => {
      const result = bidCollection.modifyBid('Alice', 1);
      expect(result.success).toBe(true);
      expect(result.oldBid).toBe(0);
      expect(result.newBid).toBe(1);
    });

    test('should enforce hand count on modified bids', () => {
      const result = bidCollection.modifyBid('Alice', 2);
      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot exceed hand count');
    });

    test('should allow modifying to 0', () => {
      const result = bidCollection.modifyBid('Bob', 0);
      expect(result.success).toBe(true);
    });

    test('should reject modifying non-existent bid', () => {
      bidCollection.reset();
      const result = bidCollection.modifyBid('Alice', 0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No bid found');
    });

    test('should update bid state after modification', () => {
      bidCollection.modifyBid('Alice', 1);
      const state = bidCollection.getBidState();
      expect(state.collectedBids['Alice']).toBe(1);
    });
  });

  describe('Criterion 5: Show bid summary before moving to scoring phase', () => {
    beforeEach(() => {
      bidCollection.submitBid('Alice', 0);
      bidCollection.submitBid('Bob', 1);
      bidCollection.submitBid('Charlie', 0);
    });

    test('should provide complete bid summary', () => {
      const summary = bidCollection.getBidSummary();
      expect(summary.summary).toEqual({
        Alice: 0,
        Bob: 1,
        Charlie: 0
      });
    });

    test('should include round and hand count in summary', () => {
      const summary = bidCollection.getBidSummary();
      expect(summary.roundNumber).toBe(1);
      expect(summary.handCount).toBe(1);
    });

    test('should list all bids with validation status', () => {
      const summary = bidCollection.getBidSummary();
      expect(summary.bidList).toHaveLength(3);
      summary.bidList.forEach(entry => {
        expect(entry.player).toBeDefined();
        expect(entry.bid).toBeDefined();
        expect(entry.isValid).toBe(true);
      });
    });

    test('should indicate when ready for scoring', () => {
      const summary = bidCollection.getBidSummary();
      expect(summary.allBidsValid).toBe(true);
      expect(summary.readyForScoring).toBe(true);
    });

    test('should have clear display text', () => {
      const summary = bidCollection.getBidSummary();
      expect(summary.displayText).toContain('Round 1 Bid Summary');
    });
  });

  describe('Bid confirmation workflow', () => {
    test('should confirm all bids when complete', () => {
      bidCollection.submitBid('Alice', 0);
      bidCollection.submitBid('Bob', 1);
      bidCollection.submitBid('Charlie', 0);

      const result = bidCollection.confirmBids();
      expect(result.success).toBe(true);
      expect(result.confirmedBids).toEqual({
        Alice: 0,
        Bob: 1,
        Charlie: 0
      });
    });

    test('should reject confirmation with incomplete bids', () => {
      bidCollection.submitBid('Alice', 0);
      const result = bidCollection.confirmBids();
      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot confirm bids');
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle non-integer bids', () => {
      const result = bidCollection.submitBid('Alice', 0.5);
      expect(result.success).toBe(false);
    });

    test('should handle string bids', () => {
      const result = bidCollection.submitBid('Alice', '1');
      expect(result.success).toBe(false);
    });

    test('should reject bids from non-existent players', () => {
      const result = bidCollection.submitBid('Unknown', 0);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not in this game');
    });

    test('should handle round 0 edge case', () => {
      bidCollection.initializeRound(0, players);
      const display = bidCollection.getCurrentRoundDisplay();
      expect(display.roundNumber).toBe(0);
      expect(display.handCount).toBe(0);

      const result = bidCollection.submitBid('Alice', 1);
      expect(result.success).toBe(false);
    });

    test('should handle large round numbers', () => {
      bidCollection.initializeRound(13, players);
      const result = bidCollection.submitBid('Alice', 13);
      expect(result.success).toBe(true);
    });
  });
});
