import { BidCollectionService, PlayerBidInput } from '../BidCollectionService';

class MockPlayerBidInput implements PlayerBidInput {
  private inputs: string[] = [];
  private inputIndex = 0;

  constructor(inputs: string[]) {
    this.inputs = inputs;
  }

  async getInput(prompt: string): Promise<string> {
    if (this.inputIndex >= this.inputs.length) {
      throw new Error('Ran out of mock inputs');
    }
    return this.inputs[this.inputIndex++];
  }
}

describe('BidCollectionService', () => {
  it('should validate bids within [0, roundNumber]', () => {
    const service = new BidCollectionService(3, ['Player1', 'Player2']);

    // Valid bid at boundary
    expect(() => service.modifyBid('Player1', '3')).not.toThrow();
    expect(() => service.modifyBid('Player1', '0')).not.toThrow();

    // Invalid bids
    expect(() => service.modifyBid('Player1', '-1')).toThrow();
    expect(() => service.modifyBid('Player1', '4')).toThrow();
    expect(() => service.modifyBid('Player1', 'abc')).toThrow();
  });

  it('should collect all bids via inputSource', async () => {
    const mockInput = new MockPlayerBidInput(['2', '1']);
    const service = new BidCollectionService(3, ['Player1', 'Player2']);

    await service.collectAllBids(mockInput);

    const summary = service.getBidSummary();
    expect(summary).toEqual([
      { playerId: 'Player1', bid: 2 },
      { playerId: 'Player2', bid: 1 },
    ]);
  });

  it('should re-prompt on invalid bid input', async () => {
    const mockInput = new MockPlayerBidInput(['invalid', '2']);
    const service = new BidCollectionService(3, ['Player1']);

    await service.collectAllBids(mockInput);

    const summary = service.getBidSummary();
    expect(summary).toEqual([{ playerId: 'Player1', bid: 2 }]);
  });

  it('should modify bids with validation', () => {
    const service = new BidCollectionService(3, ['Player1', 'Player2']);
    service.modifyBid('Player1', '2');

    let summary = service.getBidSummary();
    expect(summary[0].bid).toBe(2);

    service.modifyBid('Player1', '3');
    summary = service.getBidSummary();
    expect(summary[0].bid).toBe(3);
  });

  it('should expose roundNumber for handCount', () => {
    const service = new BidCollectionService(5, ['Player1']);
    expect(service.roundNumber).toBe(5);
  });
});
