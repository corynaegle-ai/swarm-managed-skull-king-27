import { validateBid } from '../utils/BidValidator';

export interface BidCollectionResult {
  bids: Map<string, number>;
  roundNumber: number;
}

export interface PlayerBidInput {
  getInput(prompt: string): Promise<string>;
}

export class BidCollectionService {
  private bids: Map<string, number> = new Map();
  private roundNumber: number;
  private playerIds: string[];

  constructor(roundNumber: number, playerIds: string[]) {
    this.roundNumber = roundNumber;
    this.playerIds = playerIds;
  }

  async collectAllBids(inputSource: PlayerBidInput): Promise<BidCollectionResult> {
    for (const playerId of this.playerIds) {
      const bid = await this.collectSingleBid(playerId, inputSource);
      this.bids.set(playerId, bid);
    }
    return {
      bids: this.bids,
      roundNumber: this.roundNumber,
    };
  }

  private async collectSingleBid(
    playerId: string,
    inputSource: PlayerBidInput
  ): Promise<number> {
    while (true) {
      const input = await inputSource.getInput(
        `Player ${playerId}, enter bid (0-${this.roundNumber}):`
      );
      const result = validateBid(input, this.roundNumber);
      if (result.valid) {
        return result.value;
      }
      console.error(`Invalid bid for player ${playerId}: ${result.error}`);
    }
  }

  modifyBid(
    playerId: string,
    newBidInput: string
  ): { valid: boolean; value: number; error?: string } {
    const result = validateBid(newBidInput, this.roundNumber);
    if (result.valid) {
      this.bids.set(playerId, result.value);
    }
    return result;
  }

  getBidSummary(): Array<{ playerId: string; bid: number }> {
    const summary: Array<{ playerId: string; bid: number }> = [];
    for (const [playerId, bid] of this.bids) {
      summary.push({ playerId, bid });
    }
    return summary;
  }
}
