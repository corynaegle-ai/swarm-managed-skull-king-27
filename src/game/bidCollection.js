/**
 * Bid Collection Module for Skull King Game
 * Handles the collection and validation of bids from all players
 */

class BidCollection {
  constructor() {
    this.bids = {};
    this.currentRound = 0;
    this.handCount = 0;
    this.players = [];
  }

  /**
   * Initialize bid collection for a new round
   * @param {number} roundNumber - Current round number (1-indexed)
   * @param {Array<string>} playerList - Array of player names/IDs
   */
  initializeRound(roundNumber, playerList) {
    this.currentRound = roundNumber;
    this.handCount = roundNumber; // Hand count equals round number
    this.players = playerList;
    this.bids = {};
    
    // Initialize bid slots for all players
    playerList.forEach(player => {
      this.bids[player] = null;
    });
    
    return this.getCurrentRoundDisplay();
  }

  /**
   * Get current round and hand count display
   * Criterion 1: Display current round and hand count clearly
   * @returns {Object} Display information
   */
  getCurrentRoundDisplay() {
    return {
      roundNumber: this.currentRound,
      handCount: this.handCount,
      displayText: `Round ${this.currentRound} - Each player will play ${this.handCount} hand(s)`,
      players: this.players
    };
  }

  /**
   * Submit a bid for a player
   * Criterion 2: Prevent bids exceeding hand count
   * Criterion 3: Require bid from every player before proceeding
   * @param {string} player - Player name/ID
   * @param {number} bid - Bid amount
   * @returns {Object} Validation result
   */
  submitBid(player, bid) {
    // Validate player exists
    if (!this.players.includes(player)) {
      return {
        success: false,
        error: `Player "${player}" is not in this game.`
      };
    }

    // Validate bid is a number
    if (typeof bid !== 'number' || bid < 0 || !Number.isInteger(bid)) {
      return {
        success: false,
        error: `Bid must be a non-negative integer. Received: ${bid}`
      };
    }

    // Criterion 2: Prevent bids exceeding hand count
    if (bid > this.handCount) {
      return {
        success: false,
        error: `Bid cannot exceed hand count of ${this.handCount}. You bid ${bid}.`
      };
    }

    // Record the bid
    this.bids[player] = bid;

    return {
      success: true,
      message: `Bid of ${bid} recorded for ${player}`,
      playerBid: bid
    };
  }

  /**
   * Get the current state of bid collection
   * @returns {Object} Current bid state
   */
  getBidState() {
    const collectedBids = {};
    const pendingPlayers = [];

    this.players.forEach(player => {
      if (this.bids[player] === null || this.bids[player] === undefined) {
        pendingPlayers.push(player);
      } else {
        collectedBids[player] = this.bids[player];
      }
    });

    return {
      collectedBids,
      pendingPlayers,
      isComplete: pendingPlayers.length === 0
    };
  }

  /**
   * Check if all players have submitted bids
   * Criterion 3: Require bid from every player before proceeding
   * @returns {Object} Completion status
   */
  areAllBidsCollected() {
    const state = this.getBidState();
    return {
      isComplete: state.isComplete,
      pendingPlayers: state.pendingPlayers,
      collectedCount: Object.keys(state.collectedBids).length,
      totalPlayers: this.players.length
    };
  }

  /**
   * Modify a previously submitted bid
   * Criterion 4: Allow bid modifications before confirming
   * @param {string} player - Player name/ID
   * @param {number} newBid - New bid amount
   * @returns {Object} Modification result
   */
  modifyBid(player, newBid) {
    // Check if bid exists
    if (this.bids[player] === null || this.bids[player] === undefined) {
      return {
        success: false,
        error: `No bid found for ${player}. Submit a bid first.`
      };
    }

    const oldBid = this.bids[player];

    // Validate new bid
    if (typeof newBid !== 'number' || newBid < 0 || !Number.isInteger(newBid)) {
      return {
        success: false,
        error: `Bid must be a non-negative integer. Received: ${newBid}`
      };
    }

    // Criterion 2: Prevent bids exceeding hand count
    if (newBid > this.handCount) {
      return {
        success: false,
        error: `Bid cannot exceed hand count of ${this.handCount}. You bid ${newBid}.`
      };
    }

    // Update the bid
    this.bids[player] = newBid;

    return {
      success: true,
      message: `Bid modified for ${player}: ${oldBid} → ${newBid}`,
      oldBid,
      newBid
    };
  }

  /**
   * Get bid summary before confirming
   * Criterion 5: Show bid summary before moving to scoring phase
   * @returns {Object} Summary data
   */
  getBidSummary() {
    const bidSummary = {};
    const bidList = [];

    this.players.forEach(player => {
      const bid = this.bids[player];
      bidSummary[player] = bid;
      bidList.push({
        player,
        bid,
        isValid: bid !== null && bid !== undefined && bid >= 0 && bid <= this.handCount
      });
    });

    const state = this.getBidState();
    const allValid = state.isComplete && state.pendingPlayers.length === 0;

    return {
      roundNumber: this.currentRound,
      handCount: this.handCount,
      summary: bidSummary,
      bidList,
      allBidsValid: allValid,
      totalBids: Object.keys(state.collectedBids).length,
      totalPlayers: this.players.length,
      displayText: `Round ${this.currentRound} Bid Summary:`,
      readyForScoring: allValid
    };
  }

  /**
   * Confirm and finalize bids
   * @returns {Object} Finalized bids
   */
  confirmBids() {
    const summary = this.getBidSummary();

    if (!summary.readyForScoring) {
      return {
        success: false,
        error: `Cannot confirm bids. ${summary.totalPlayers - summary.totalBids} player(s) have not submitted bids.`,
        pendingPlayers: this.getBidState().pendingPlayers
      };
    }

    return {
      success: true,
      message: 'All bids confirmed. Ready to proceed to scoring phase.',
      confirmedBids: summary.summary
    };
  }

  /**
   * Reset bid collection for next round
   */
  reset() {
    this.bids = {};
    this.players.forEach(player => {
      this.bids[player] = null;
    });
  }
}

module.exports = BidCollection;
