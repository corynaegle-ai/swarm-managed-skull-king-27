export interface BidValidationResult {
  isValid: boolean;
  error?: string;
}

export interface Bid {
  playerId: string;
  playerName: string;
  bidAmount: number;
  round: number;
}

export class BidService {
  /**
   * Validates a bid against the maximum allowed hands in the current round
   * @param bidAmount The bid amount to validate
   * @param handCount The maximum number of hands available (equals round number)
   * @returns Validation result with error message if invalid
   */
  validateBid(bidAmount: number, handCount: number): BidValidationResult {
    // Check if bid is a valid number
    if (isNaN(bidAmount) || bidAmount < 0) {
      return {
        isValid: false,
        error: 'Bid must be a non-negative number',
      };
    }

    // Check if bid exceeds hand count
    if (bidAmount > handCount) {
      return {
        isValid: false,
        error: `Bid cannot exceed ${handCount} hands`,
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Checks if a bid value has been set (not the default 0)
   * @param bidAmount The bid amount to check
   * @returns True if the bid has been explicitly set
   */
  isBidSet(bidAmount: number): boolean {
    return bidAmount > 0;
  }

  /**
   * Validates all bids for a round
   * @param bids Map of player IDs to bid amounts
   * @param handCount The maximum number of hands available
   * @returns Validation result with error details
   */
  validateAllBids(
    bids: Map<string, number>,
    handCount: number,
  ): BidValidationResult {
    const errors: string[] = [];

    bids.forEach((bidAmount, playerId) => {
      const validation = this.validateBid(bidAmount, handCount);
      if (!validation.isValid) {
        errors.push(`Player ${playerId}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      return {
        isValid: false,
        error: errors.join('; '),
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Checks if all players have submitted bids
   * @param bids Map of player IDs to bid amounts
   * @param playerIds List of all player IDs that must have bids
   * @returns True if all players have bids
   */
  allPlayersHaveBids(bids: Map<string, number>, playerIds: string[]): boolean {
    return playerIds.every((playerId) => {
      const bid = bids.get(playerId);
      return bid !== undefined && bid > 0;
    });
  }
}
