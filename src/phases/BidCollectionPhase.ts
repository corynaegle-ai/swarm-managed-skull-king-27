import { GameState } from '../types/GameState';
import { Player } from '../types/Player';
import { BidCollector } from '../utils/BidCollector';
import { GameRound } from '../types/GameRound';

export class BidCollectionPhase {
  private gameState: GameState;
  private bidCollector: BidCollector;
  private currentRound: GameRound;
  private playerBids: Map<string, number> = new Map();

  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.bidCollector = new BidCollector();
    this.currentRound = gameState.currentRound;
  }

  /**
   * Execute the bid collection phase
   * Returns the final bids map when all players have confirmed
   */
  async execute(): Promise<Map<string, number>> {
    this.displayRoundInfo();
    await this.collectBidsFromAllPlayers();
    this.displayBidSummary();
    return this.playerBids;
  }

  /**
   * Display current round and hand count information
   * Satisfies Criterion 1: Display current round and hand count clearly
   */
  private displayRoundInfo(): void {
    const handCount = this.currentRound.roundNumber;
    console.log('\n========================================');
    console.log(`ROUND ${this.currentRound.roundNumber}`);
    console.log(`Hands per player: ${handCount}`);
    console.log('========================================\n');
  }

  /**
   * Collect bids from all players
   * Satisfies Criteria 2, 3, 4: Validation, requirement, and modification
   */
  private async collectBidsFromAllPlayers(): Promise<void> {
    const players = this.gameState.players;

    for (const player of players) {
      await this.collectBidFromPlayer(player);
    }
  }

  /**
   * Collect bid from a single player with modification capability
   * Satisfies Criteria 2, 4: Validation and modification
   */
  private async collectBidFromPlayer(player: Player): Promise<void> {
    let bidConfirmed = false;

    while (!bidConfirmed) {
      // Get initial bid or modified bid from player
      let bid = await this.bidCollector.getBidFromPlayer(
        player.name,
        this.currentRound.roundNumber
      );

      // Validate bid doesn't exceed hand count
      while (bid < 0 || bid > this.currentRound.roundNumber) {
        console.log(
          `Invalid bid. Please enter a bid between 0 and ${this.currentRound.roundNumber}.`
        );
        bid = await this.bidCollector.getBidFromPlayer(
          player.name,
          this.currentRound.roundNumber
        );
      }

      // Allow player to confirm or modify bid
      const confirmed = await this.bidCollector.confirmBid(
        player.name,
        bid
      );

      if (confirmed) {
        this.playerBids.set(player.id, bid);
        bidConfirmed = true;
      }
      // If not confirmed, loop continues for modification
    }
  }

  /**
   * Display bid summary before moving to scoring phase
   * Satisfies Criterion 5: Show bid summary before moving to scoring phase
   */
  private displayBidSummary(): void {
    const players = this.gameState.players;
    console.log('\n========================================');
    console.log('BID SUMMARY');
    console.log('========================================');

    for (const player of players) {
      const bid = this.playerBids.get(player.id);
      console.log(`${player.name}: ${bid} bid(s)`);
    }

    console.log('========================================\n');
  }

  /**
   * Get the collected bids
   */
  getBids(): Map<string, number> {
    return this.playerBids;
  }
}
