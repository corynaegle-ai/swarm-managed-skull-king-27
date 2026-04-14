/**
 * BidService manages bid collection and validation for the Skull King game.
 * Tracks bids for each player and validates against hand count constraints.
 */
export class BidService {
  private bids: Map<string, number> = new Map();

  /**
   * Set a bid for a player.
   * @param playerId - The ID of the player
   * @param bid - The bid amount (0 to hand_count inclusive)
   */
  setBid(playerId: string, bid: number): void {
    if (typeof bid !== 'number' || bid < 0) {
      throw new Error('Bid must be a non-negative number');
    }
    this.bids.set(playerId, bid);
  }

  /**
   * Get a player's bid.
   * @param playerId - The ID of the player
   * @returns The bid amount, or undefined if not set
   */
  getBid(playerId: string): number | undefined {
    return this.bids.get(playerId);
  }

  /**
   * Get all bids as a Map.
   * @returns Map of playerId to bid amount
   */
  getBids(): Map<string, number> {
    return new Map(this.bids);
  }

  /**
   * Check if all players have submitted bids.
   * A bid is considered submitted if the player has a key in the bids Map.
   * Valid bids are from 0 to hand_count (inclusive).
   * @param playerIds - Array of all player IDs
   * @returns true if every player has a bid set
   */
  allPlayersHaveBids(playerIds: string[]): boolean {
    return playerIds.every(playerId => this.bids.has(playerId));
  }

  /**
   * Reset all bids (for testing or round restart).
   */
  reset(): void {
    this.bids.clear();
  }

  /**
   * Get the total of all bids.
   * @returns Sum of all bid amounts
   */
  getTotalBids(): number {
    let total = 0;
    this.bids.forEach(bid => {
      total += bid;
    });
    return total;
  }
}
