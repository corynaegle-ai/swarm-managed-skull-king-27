import * as readline from 'readline';

export class BidCollector {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Get bid from player with validation for hand count
   * @param playerName - Name of the player
   * @param handCount - Number of hands available in current round
   * @returns The bid value (0 to handCount)
   */
  async getBidFromPlayer(
    playerName: string,
    handCount: number
  ): Promise<number> {
    return new Promise((resolve) => {
      this.rl.question(
        `${playerName}, enter your bid (0-${handCount}): `,
        (answer) => {
          const bid = parseInt(answer, 10);
          resolve(bid);
        }
      );
    });
  }

  /**
   * Confirm bid with player - allow modification or confirmation
   * @param playerName - Name of the player
   * @param bid - The bid to confirm
   * @returns true if confirmed, false if player wants to modify
   */
  async confirmBid(
    playerName: string,
    bid: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.rl.question(
        `${playerName}, confirm bid of ${bid}? (y/n): `,
        (answer) => {
          const confirmed =
            answer.toLowerCase() === 'y' ||
            answer.toLowerCase() === 'yes';
          resolve(confirmed);
        }
      );
    });
  }

  /**
   * Close the readline interface
   */
  close(): void {
    this.rl.close();
  }
}
