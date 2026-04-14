export interface PlayerBidInput {
  getInput(prompt: string): Promise<string>;
}

export class BidCollectionService {
  private _roundNumber: number;
  private playerIds: string[];
  private bids: Map<string, number> = new Map();

  constructor(roundNumber: number, playerIds: string[]) {
    this._roundNumber = roundNumber;
    this.playerIds = playerIds;
  }

  /**
   * Validates that a bid is within [0, roundNumber]
   */
  private validateBid(bid: number): void {
    if (isNaN(bid) || !Number.isInteger(bid)) {
      throw new Error(`Invalid bid: must be a whole number`);
    }
    if (bid < 0 || bid > this._roundNumber) {
      throw new Error(`Invalid bid: must be between 0 and ${this._roundNumber}`);
    }
  }

  /**
   * Collects bids from all players via inputSource
   */
  async collectAllBids(inputSource: PlayerBidInput): Promise<void> {
    for (const playerId of this.playerIds) {
      let bidValid = false;
      while (!bidValid) {
        const bidInput = await inputSource.getInput(`Player ${playerId}, enter your bid (0-${this._roundNumber}): `);
        try {
          const bid = parseInt(bidInput, 10);
          this.validateBid(bid);
          this.bids.set(playerId, bid);
          bidValid = true;
        } catch (error) {
          // Validation failed, loop will prompt again
        }
      }
    }
  }

  /**
   * Returns the current bid summary
   */
  getBidSummary(): Array<{ playerId: string; bid: number }> {
    return this.playerIds.map((playerId) => ({
      playerId,
      bid: this.bids.get(playerId) || 0,
    }));
  }

  /**
   * Modifies a player's bid (accepts raw input for re-validation)
   */
  modifyBid(playerId: string, newBidInput: string): void {
    const bid = parseInt(newBidInput, 10);
    this.validateBid(bid);
    this.bids.set(playerId, bid);
  }

  get roundNumber(): number {
    return this._roundNumber;
  }
}
