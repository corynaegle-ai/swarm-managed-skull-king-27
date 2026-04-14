import { BidCollectionPhase } from '../BidCollectionPhase';
import { PlayerBidInput } from '../../services/BidCollectionService';

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

describe('BidCollectionPhase', () => {
  it('should collect bids and confirm without modification', async () => {
    const mockInput = new MockPlayerBidInput(['2', '1', 'yes']);
    const phase = new BidCollectionPhase(3, ['Player1', 'Player2'], mockInput);

    const result = await phase.run();

    expect(result.confirmed).toBe(true);
    expect(result.roundNumber).toBe(3);
    expect(result.handCount).toBe(3);
    expect(result.bids).toEqual([
      { playerId: 'Player1', bid: 2 },
      { playerId: 'Player2', bid: 1 },
    ]);
  });

  it('should collect bids, modify one, and confirm', async () => {
    const mockInput = new MockPlayerBidInput([
      '2',        // Player1 initial bid
      '1',        // Player2 initial bid
      'modify',   // Want to modify
      'Player1',  // Which player
      '3',        // New bid for Player1
      'yes',      // Confirm
    ]);
    const phase = new BidCollectionPhase(3, ['Player1', 'Player2'], mockInput);

    const result = await phase.run();

    expect(result.confirmed).toBe(true);
    expect(result.roundNumber).toBe(3);
    expect(result.handCount).toBe(3);
    expect(result.bids).toEqual([
      { playerId: 'Player1', bid: 3 },
      { playerId: 'Player2', bid: 1 },
    ]);
  });

  it('should reject invalid bid modifications and re-prompt', async () => {
    const mockInput = new MockPlayerBidInput([
      '2',        // Player1 initial bid
      '1',        // Player2 initial bid
      'modify',   // Want to modify
      'Player1',  // Which player
      '5',        // Invalid bid (exceeds roundNumber)
      'yes',      // Confirm anyway (the service should have rejected)
    ]);
    const phase = new BidCollectionPhase(3, ['Player1', 'Player2'], mockInput);

    const result = await phase.run();

    // The bid should remain unchanged at 2 because the modification was rejected
    expect(result.confirmed).toBe(true);
    expect(result.bids[0].bid).toBe(2);
  });

  it('should handle invalid confirmation response and re-prompt', async () => {
    const mockInput = new MockPlayerBidInput([
      '2',        // Player1 initial bid
      '1',        // Player2 initial bid
      'maybe',    // Invalid confirmation
      'yes',      // Valid confirmation
    ]);
    const phase = new BidCollectionPhase(3, ['Player1', 'Player2'], mockInput);

    const result = await phase.run();

    expect(result.confirmed).toBe(true);
    expect(result.bids).toEqual([
      { playerId: 'Player1', bid: 2 },
      { playerId: 'Player2', bid: 1 },
    ]);
  });

  it('should have handCount equal to roundNumber', async () => {
    const mockInput = new MockPlayerBidInput(['1', '2', 'yes']);
    const phase = new BidCollectionPhase(5, ['Player1', 'Player2'], mockInput);

    const result = await phase.run();

    expect(result.handCount).toBe(result.roundNumber);
    expect(result.roundNumber).toBe(5);
  });

  it('should re-prompt for invalid initial bids', async () => {
    const mockInput = new MockPlayerBidInput([
      'abc',      // Invalid bid
      '2',        // Valid bid
      '1',        // Valid bid
      'yes',      // Confirm
    ]);
    const phase = new BidCollectionPhase(3, ['Player1', 'Player2'], mockInput);

    const result = await phase.run();

    expect(result.confirmed).toBe(true);
    expect(result.bids).toEqual([
      { playerId: 'Player1', bid: 2 },
      { playerId: 'Player2', bid: 1 },
    ]);
  });
});
