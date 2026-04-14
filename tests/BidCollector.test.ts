import { BidCollector } from '../src/utils/BidCollector';

describe('BidCollector', () => {
  let bidCollector: BidCollector;

  beforeEach(() => {
    // Mock readline to avoid actual I/O in tests
    jest.mock('readline');
    bidCollector = new BidCollector();
  });

  afterEach(() => {
    // Close the interface after each test
    jest.restoreAllMocks();
  });

  /**
   * Test bid collection utility
   */
  describe('getBidFromPlayer', () => {
    it('should be callable for each player', () => {
      expect(bidCollector).toHaveProperty('getBidFromPlayer');
    });
  });

  describe('confirmBid', () => {
    it('should be callable to confirm or modify bids', () => {
      expect(bidCollector).toHaveProperty('confirmBid');
    });
  });

  describe('close', () => {
    it('should have method to close readline interface', () => {
      expect(bidCollector).toHaveProperty('close');
    });
  });
});
