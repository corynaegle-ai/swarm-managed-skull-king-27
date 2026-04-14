/**
 * Bid Collection UI Module
 * Handles the user interface for bid collection
 */

const BidCollection = require('./bidCollection');

class BidCollectionUI {
  constructor() {
    this.bidCollection = new BidCollection();
    this.currentPlayerIndex = 0;
  }

  /**
   * Start the bid collection process for a new round
   * @param {number} roundNumber - Current round number
   * @param {Array<string>} players - List of players
   * @returns {Object} Initial bid screen
   */
  startBidCollection(roundNumber, players) {
    const roundInfo = this.bidCollection.initializeRound(roundNumber, players);
    this.currentPlayerIndex = 0;

    return {
      phase: 'BID_COLLECTION_START',
      ...roundInfo,
      instruction: `Round ${roundNumber} starting. Each player will bid 0-${roundNumber} hands.`
    };
  }

  /**
   * Get the next player to bid
   * @returns {Object} Next player info
   */
  getNextPlayerToBid() {
    const state = this.bidCollection.getBidState();
    
    if (state.isComplete) {
      return {
        phase: 'ALL_BIDS_COLLECTED',
        message: 'All bids collected!',
        readyForReview: true
      };
    }

    const nextPlayer = state.pendingPlayers[0];
    const roundInfo = this.bidCollection.getCurrentRoundDisplay();

    return {
      phase: 'AWAITING_BID',
      currentPlayer: nextPlayer,
      roundNumber: roundInfo.roundNumber,
      handCount: roundInfo.handCount,
      collectedBids: state.collectedBids,
      pendingCount: state.pendingPlayers.length,
      totalPlayers: this.bidCollection.players.length,
      instruction: `${nextPlayer}, enter your bid (0-${roundInfo.handCount})`
    };
  }

  /**
   * Process a bid submission
   * @param {string} player - Player submitting bid
   * @param {number} bid - Bid amount
   * @returns {Object} Result of bid submission
   */
  submitBid(player, bid) {
    const result = this.bidCollection.submitBid(player, bid);

    if (!result.success) {
      return {
        phase: 'BID_ERROR',
        error: result.error,
        player,
        attemptedBid: bid
      };
    }

    const state = this.bidCollection.getBidState();

    return {
      phase: 'BID_ACCEPTED',
      message: result.message,
      player,
      bid: result.playerBid,
      collectedBids: state.collectedBids,
      remainingPlayers: state.pendingPlayers.length
    };
  }

  /**
   * Get bid review screen
   * @returns {Object} Review data with all bids
   */
  getBidReview() {
    const summary = this.bidCollection.getBidSummary();

    return {
      phase: 'BID_REVIEW',
      roundNumber: summary.roundNumber,
      handCount: summary.handCount,
      bids: summary.bidList,
      summary: summary.summary,
      allValid: summary.allBidsValid,
      instruction: 'Review all bids. Any changes needed?'
    };
  }

  /**
   * Modify a bid during review
   * @param {string} player - Player to modify
   * @param {number} newBid - New bid value
   * @returns {Object} Modification result
   */
  modifyBidReview(player, newBid) {
    const result = this.bidCollection.modifyBid(player, newBid);

    if (!result.success) {
      return {
        phase: 'MODIFY_BID_ERROR',
        error: result.error,
        player
      };
    }

    return {
      phase: 'BID_MODIFIED',
      message: result.message,
      player,
      oldBid: result.oldBid,
      newBid: result.newBid
    };
  }

  /**
   * Proceed to scoring after bid confirmation
   * @returns {Object} Final bid state or error
   */
  proceedToScoring() {
    const result = this.bidCollection.confirmBids();

    if (!result.success) {
      return {
        phase: 'CONFIRM_ERROR',
        error: result.error,
        pendingPlayers: result.pendingPlayers
      };
    }

    return {
      phase: 'BIDS_CONFIRMED',
      message: result.message,
      bids: result.confirmedBids,
      readyForScoring: true
    };
  }

  /**
   * Get complete bid collection flow
   * @returns {Object} Full workflow description
   */
  getWorkflow() {
    return {
      phases: [
        {
          name: 'BID_COLLECTION_START',
          description: 'Display round and hand count information'
        },
        {
          name: 'AWAITING_BID',
          description: 'Collect bids from each player sequentially'
        },
        {
          name: 'ALL_BIDS_COLLECTED',
          description: 'All players have submitted bids'
        },
        {
          name: 'BID_REVIEW',
          description: 'Show summary and allow modifications'
        },
        {
          name: 'BIDS_CONFIRMED',
          description: 'Bids finalized, ready for scoring'
        }
      ]
    };
  }
}

module.exports = BidCollectionUI;
