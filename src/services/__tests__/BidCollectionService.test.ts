import { BidCollectionService, PlayerBidInput } from '../BidCollectionService';

class MockPlayerBidInput implements PlayerBidInput {
  private responses: string[];
  private callCount: number = 0;

  constructor(responses: string[]) {
    this.responses = responses;
  }

  async getInput(prompt: string): Promise<string> {
    if (this.callCount >= this.responses.length) {
      throw new Error('No more responses available');
    }
    const response = this.responses[this.callCount];
    this.callCount++;
    return response;
  }
}

describe('BidCollectionService', () => {
  it('should collect bids from all players', async () => {
    const playerIds = ['player1', 'player2', 'player3'];
    const service = new BidCollectionService(5, playerIds);
    const mockInput = new MockPlayerBidInput(['1', '2', '3']);

    const result = await service.collectAllBids(mockInput);

    expect(result.bids.size).toBe(3);
    expect(result.bids.get('player1')).toBe(1);
    expect(result.bids.get('player2')).toBe(2);
    expect(result.bids.get('player3')).toBe(3);
    expect(result.roundNumber).toBe(5);
  });

  it('should retry on invalid input', async () => {
    const playerIds = ['player1'];
    const service = new BidCollectionService(5, playerIds);
    const mockInput = new MockPlayerBidInput(['abc', '2']);

    const result = await service.collectAllBids(mockInput);

    expect(result.bids.get('player1')).toBe(2);
  });

  it('should return false for modifyBid with invalid input "abc"', () => {
    const service = new BidCollectionService(5, ['player1']);
    service['bids'].set('player1', 1);

    const result = service.modifyBid('player1', 'abc');

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(service['bids'].get('player1')).toBe(1);
  });

  it('should not update bid if modifyBid returns invalid', () => {
    const service = new BidCollectionService(5, ['player1']);
    service['bids'].set('player1', 1);

    service.modifyBid('player1', 'abc');

    expect(service['bids'].get('player1')).toBe(1);
  });

  it('should return false for modifyBid with out-of-range value', () => {
    const service = new BidCollectionService(5, ['player1']);
    service['bids'].set('player1', 1);

    const result = service.modifyBid('player1', '99');

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
    expect(service['bids'].get('player1')).toBe(1);
  });

  it('should update bid if modifyBid is valid', () => {
    const service = new BidCollectionService(5, ['player1']);
    service['bids'].set('player1', 1);

    const result = service.modifyBid('player1', '4');

    expect(result.valid).toBe(true);
    expect(result.value).toBe(4);
    expect(service['bids'].get('player1')).toBe(4);
  });

  it('should return bid summary', async () => {
    const playerIds = ['player1', 'player2'];
    const service = new BidCollectionService(5, playerIds);
    const mockInput = new MockPlayerBidInput(['1', '2']);

    await service.collectAllBids(mockInput);
    const summary = service.getBidSummary();

    expect(summary.length).toBe(2);
    expect(summary).toContainEqual({ playerId: 'player1', bid: 1 });
    expect(summary).toContainEqual({ playerId: 'player2', bid: 2 });
  });
});
