import { BidCollectionPhase, BidPhaseSummary } from '../BidCollectionPhase';
import { PlayerBidInput } from '../../services/BidCollectionService';

// Mock implementation of PlayerBidInput
class MockPlayerBidInput implements PlayerBidInput {
  private promptResponses: string[] = [];
  private currentIndex = 0;

  constructor(responses: string[]) {
    this.promptResponses = responses;
  }

  async prompt(question: string): Promise<string> {
    const response = this.promptResponses[this.currentIndex];
    this.currentIndex++;
    return response;
  }
}

// Mock BidCollectionService for testing
jest.mock('../../services/BidCollectionService', () => {
  return {
    BidCollectionService: class MockBidCollectionService {
      private bids: Map<string, number> = new Map();
      private playerIds: string[];
      private roundNumber: number;

      constructor(roundNumber: number, playerIds: string[]) {
        this.roundNumber = roundNumber;
        this.playerIds = playerIds;
        // Initialize bids with 0
        playerIds.forEach((id) => this.bids.set(id, 0));
      }

      async collectAllBids(inputSource: PlayerBidInput): Promise<void> {
        // Simulate collecting bids from input source
        for (const playerId of this.playerIds) {
          const bidStr = await inputSource.prompt(`Bid for ${playerId}: `);
          const bid = parseInt(bidStr, 10);
          if (isNaN(bid) || bid < 0) {
            throw new Error(`Invalid bid for ${playerId}`);
          }
          this.bids.set(playerId, bid);
        }
      }

      getBidSummary(): Array<{ playerId: string; bid: number }> {
        return this.playerIds.map((id) => ({
          playerId: id,
          bid: this.bids.get(id) || 0,
        }));
      }

      modifyBid(playerId: string, newBid: number): void {
        if (!this.bids.has(playerId)) {
          throw new Error(`Player ${playerId} not found`);
        }
        if (isNaN(newBid) || newBid < 0) {
          throw new Error(`Invalid bid value: ${newBid}`);
        }
        this.bids.set(playerId, newBid);
      }
    },
  };
});

describe('BidCollectionPhase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Test 1: All valid bids then confirm', async () => {
    // Arrange: Mock input for straight-through flow
    // Player 1 bids 3, Player 2 bids 2, then confirm with 'yes'
    const mockInput = new MockPlayerBidInput(['3', '2', 'yes']);
    const phase = new BidCollectionPhase(2, ['player1', 'player2'], mockInput);

    // Act
    const result = await phase.run();

    // Assert
    expect(result.confirmed).toBe(true);
    expect(result.roundNumber).toBe(2);
    expect(result.handCount).toBe(2);
    expect(result.bids).toHaveLength(2);
    expect(result.bids[0]).toEqual({ playerId: 'player1', bid: 3 });
    expect(result.bids[1]).toEqual({ playerId: 'player2', bid: 2 });
  });

  test('Test 2: One modification then confirm', async () => {
    // Arrange: Mock input for modify flow
    // Player 1 bids 3, Player 2 bids 2, user says 'modify'
    // Then modify player2's bid to 5, and confirm with 'yes'
    const mockInput = new MockPlayerBidInput(['3', '2', 'modify', 'player2', '5', 'yes']);
    const phase = new BidCollectionPhase(2, ['player1', 'player2'], mockInput);

    // Act
    const result = await phase.run();

    // Assert
    expect(result.confirmed).toBe(true);
    expect(result.roundNumber).toBe(2);
    expect(result.handCount).toBe(2);
    expect(result.bids).toHaveLength(2);
    expect(result.bids[0]).toEqual({ playerId: 'player1', bid: 3 });
    expect(result.bids[1]).toEqual({ playerId: 'player2', bid: 5 });
  });

  test('BidPhaseSummary has confirmed true after confirmation', async () => {
    const mockInput = new MockPlayerBidInput(['1', '1', 'yes']);
    const phase = new BidCollectionPhase(1, ['player1', 'player2'], mockInput);

    const result = await phase.run();

    expect(result.confirmed).toBe(true);
  });

  test('roundNumber equals handCount', async () => {
    const mockInput = new MockPlayerBidInput(['1', '2', 'yes']);
    const roundNum = 3;
    const phase = new BidCollectionPhase(roundNum, ['player1', 'player2'], mockInput);

    const result = await phase.run();

    expect(result.roundNumber).toBe(roundNum);
    expect(result.handCount).toBe(roundNum);
    expect(result.roundNumber).toBe(result.handCount);
  });
});
