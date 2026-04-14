import { BidCollectionService } from '../services/BidCollectionService';
import { PlayerBidInput } from '../services/BidCollectionService';

export interface BidPhaseSummary {
  roundNumber: number;
  handCount: number;
  bids: Array<{
    playerId: string;
    bid: number;
  }>;
  confirmed: boolean;
}

export class BidCollectionPhase {
  private service: BidCollectionService;

  constructor(
    private roundNumber: number,
    playerIds: string[],
    private inputSource: PlayerBidInput
  ) {
    this.service = new BidCollectionService(roundNumber, playerIds);
  }

  async run(): Promise<BidPhaseSummary> {
    // Step 5a: Log/display the round information
    console.log(`Round ${this.roundNumber} — ${this.roundNumber} hands this round`);

    // Step 5b: Collect all initial bids
    await this.service.collectAllBids(this.inputSource);

    // Step 5c: Enter confirmation loop
    let confirmed = false;
    while (!confirmed) {
      // Display bid summary
      const summary = this.service.getBidSummary();
      console.log('Bid Summary:', summary);

      // Ask for confirmation
      const response = await this.inputSource.prompt('Confirm bids? (yes/modify): ');

      if (response.toLowerCase() === 'yes') {
        confirmed = true;
      } else if (response.toLowerCase() === 'modify') {
        // Ask which player to modify
        const playerIdToModify = await this.inputSource.prompt('Which player ID to modify? ');
        const newBidStr = await this.inputSource.prompt('New bid value: ');
        const newBid = parseInt(newBidStr, 10);

        // Call service to modify bid
        // Note: modifyBid should validate and throw if invalid
        this.service.modifyBid(playerIdToModify, newBid);
      }
    }

    // Return the final summary with confirmed flag
    const finalSummary = this.service.getBidSummary();
    return {
      roundNumber: this.roundNumber,
      handCount: this.roundNumber,
      bids: finalSummary,
      confirmed: true,
    };
  }
}
