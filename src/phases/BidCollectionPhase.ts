import { BidCollectionService, PlayerBidInput } from '../services/BidCollectionService';

export interface BidPhaseSummary {
  roundNumber: number;
  handCount: number;
  bids: Array<{ playerId: string; bid: number }>;
  confirmed: boolean;
}

export class BidCollectionPhase {
  private service: BidCollectionService;

  constructor(
    private roundNumber: number,
    private playerIds: string[],
    private inputSource: PlayerBidInput
  ) {
    this.service = new BidCollectionService(roundNumber, playerIds);
  }

  async run(): Promise<BidPhaseSummary> {
    // Display round information
    console.log(`Round ${this.roundNumber} — ${this.roundNumber} hands this round`);

    // Collect all bids from players
    await this.service.collectAllBids(this.inputSource);

    // Confirmation loop
    let confirmed = false;
    while (!confirmed) {
      // Display current bid summary
      const bidSummary = this.service.getBidSummary();
      console.log('\nBid Summary:');
      bidSummary.forEach(({ playerId, bid }) => {
        console.log(`  ${playerId}: ${bid}`);
      });

      // Ask for confirmation
      const response = await this.inputSource.getInput('\nConfirm bids? (yes/modify): ');

      if (response.toLowerCase().trim() === 'yes') {
        confirmed = true;
      } else if (response.toLowerCase().trim() === 'modify') {
        // Ask which player to modify
        const playerId = await this.inputSource.getInput('Which player to modify? ');
        if (!this.playerIds.includes(playerId)) {
          console.log('Invalid player ID');
          continue;
        }

        // Ask for new bid
        const newBidInput = await this.inputSource.getInput(`New bid for ${playerId} (0-${this.roundNumber}): `);
        try {
          this.service.modifyBid(playerId, newBidInput);
        } catch (error) {
          console.log(`Error: ${(error as Error).message}`);
          // Loop continues to ask for confirmation again
        }
      } else {
        console.log('Please answer "yes" or "modify"');
      }
    }

    // Return final summary
    return {
      roundNumber: this.roundNumber,
      handCount: this.roundNumber,
      bids: this.service.getBidSummary(),
      confirmed: true,
    };
  }
}
