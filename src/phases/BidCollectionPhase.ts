import { BidService } from '../services/BidService';

export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  roundNumber: number;
  players: Player[];
  totalRounds: number;
}

/**
 * BidCollectionPhase manages the bid collection phase of the Skull King game.
 * Orchestrates the process of collecting, validating, and confirming bids from all players.
 */
export class BidCollectionPhase {
  private bidService: BidService;
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
    this.bidService = new BidService();
  }

  /**
   * Get the number of hands available in the current round.
   * Rounds start at 1, and the hand count equals the round number.
   * @returns Number of hands available
   */
  private getHandCount(): number {
    return this.state.roundNumber;
  }

  /**
   * Validate a bid against game rules.
   * @param bid - The bid to validate
   * @param handCount - The number of hands available
   * @throws Error if bid is invalid
   */
  private validateBid(bid: number, handCount: number): void {
    if (typeof bid !== 'number' || isNaN(bid)) {
      throw new Error('Bid must be a valid number');
    }
    if (bid < 0) {
      throw new Error('Bid cannot be negative');
    }
    if (bid > handCount) {
      throw new Error(`Bid cannot exceed ${handCount} hands in round ${this.state.roundNumber}`);
    }
  }

  /**
   * Execute the bid collection phase.
   * @returns Promise resolving to the collected bids
   */
  public async execute(): Promise<Map<string, number>> {
    const handCount = this.getHandCount();
    console.log(`\nRound ${this.state.roundNumber}: Collecting bids for ${handCount} hands`);

    // In a CLI context, this would collect bids interactively
    // In a component context, this is handled by BidCollectionComponent
    // This method serves as the coordinator

    // Collect bids from all players
    for (const player of this.state.players) {
      console.log(`Waiting for bid from ${player.name}...`);
    }

    // Return the collected bids
    return this.bidService.getBids();
  }

  /**
   * Submit a bid for a player.
   * @param playerId - The ID of the player
   * @param bid - The bid amount
   * @throws Error if bid is invalid
   */
  public submitBid(playerId: string, bid: number): void {
    const handCount = this.getHandCount();
    this.validateBid(bid, handCount);
    this.bidService.setBid(playerId, bid);
  }

  /**
   * Check if all players have submitted bids.
   * @returns true if all players have bids
   */
  public areAllBidsSubmitted(): boolean {
    return this.bidService.allPlayersHaveBids(this.state.players.map(p => p.id));
  }

  /**
   * Get the current collected bids.
   * @returns Map of playerId to bid amount
   */
  public getBids(): Map<string, number> {
    return this.bidService.getBids();
  }

  /**
   * Get the total of all submitted bids.
   * @returns Sum of all bids
   */
  public getTotalBids(): number {
    return this.bidService.getTotalBids();
  }

  /**
   * Reset the phase (clear all bids).
   */
  public reset(): void {
    this.bidService.reset();
  }
}
