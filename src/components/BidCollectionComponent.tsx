import React, { useMemo, useState } from 'react';
import { BidService } from '../services/BidService';
import { BidInputPanel } from './BidInputPanel';
import { BidSummary } from './BidSummary';

export interface Player {
  id: string;
  name: string;
}

export interface BidCollectionComponentProps {
  round: number;
  handCount: number;
  players: Player[];
  onBidsConfirmed: (bids: Map<string, number>) => void;
}

/**
 * Component for collecting bids from all players at the start of each round.
 * Ensures all players submit valid bids before proceeding.
 */
export const BidCollectionComponent: React.FC<BidCollectionComponentProps> = ({
  round,
  handCount,
  players,
  onBidsConfirmed,
}) => {
  // Memoize BidService to avoid recreating on every render
  const bidService = useMemo(() => new BidService(), []);
  const [bids, setBids] = useState<Map<string, number>>(new Map());
  const [showSummary, setShowSummary] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Validate a bid against the hand count constraint.
   * @param bid - The bid to validate
   * @returns Error message if invalid, empty string if valid
   */
  const validateBid = (bid: number): string => {
    if (typeof bid !== 'number' || isNaN(bid)) {
      return 'Bid must be a valid number';
    }
    if (bid < 0) {
      return 'Bid cannot be negative';
    }
    if (bid > handCount) {
      return `Bid cannot exceed ${handCount} hands`;
    }
    return '';
  };

  /**
   * Handle bid submission for a player.
   * @param playerId - The ID of the player
   * @param bidAmount - The bid amount
   */
  const handleBidSubmit = (playerId: string, bidAmount: number): void => {
    const error = validateBid(bidAmount);
    if (error) {
      setErrorMessage(error);
      return;
    }

    bidService.setBid(playerId, bidAmount);
    const newBids = new Map(bids);
    newBids.set(playerId, bidAmount);
    setBids(newBids);
    setErrorMessage('');
  };

  /**
   * Check if all players have submitted bids.
   * @returns true if all players have bids
   */
  const allPlayersHaveBids = (): boolean => {
    return bidService.allPlayersHaveBids(players.map(p => p.id));
  };

  /**
   * Handle the confirm bids action.
   * First click shows summary, second click confirms and proceeds.
   */
  const handleConfirmBids = (): void => {
    if (!allPlayersHaveBids()) {
      setErrorMessage('All players must submit bids before proceeding');
      return;
    }

    if (!showSummary) {
      setShowSummary(true);
      setErrorMessage('');
      return;
    }

    // Summary is confirmed, proceed to scoring
    onBidsConfirmed(bidService.getBids());
  };

  /**
   * Allow modification of bid after summary is shown.
   * @param playerId - The ID of the player
   * @param newBid - The new bid amount
   */
  const modifyBid = (playerId: string, newBid: number): void => {
    if (!showSummary) {
      return;
    }

    const error = validateBid(newBid);
    if (error) {
      setErrorMessage(error);
      return;
    }

    bidService.setBid(playerId, newBid);
    const newBids = new Map(bids);
    newBids.set(playerId, newBid);
    setBids(newBids);
    setErrorMessage('');
  };

  /**
   * Handle summary confirmation and proceed.
   */
  const handleSummaryConfirm = (): void => {
    onBidsConfirmed(bidService.getBids());
  };

  if (showSummary) {
    return (
      <BidSummary
        bids={bids}
        players={players}
        onConfirm={handleSummaryConfirm}
        onModifyBid={modifyBid}
      />
    );
  }

  return (
    <div className="bid-collection-container">
      <div className="bid-header">
        <h2>Round {round} - {handCount} hands available</h2>
      </div>

      {errorMessage && (
        <div className="error-message" data-testid="error-message">
          {errorMessage}
        </div>
      )}

      <div className="bid-input-section">
        {players.map(player => (
          <BidInputPanel
            key={player.id}
            player={player}
            currentBid={bids.get(player.id)}
            handCount={handCount}
            onBidSubmit={handleBidSubmit}
            onValidationError={setErrorMessage}
          />
        ))}
      </div>

      <div className="bid-actions">
        <button
          onClick={handleConfirmBids}
          disabled={!allPlayersHaveBids()}
          data-testid="confirm-bids-button"
        >
          {allPlayersHaveBids() ? 'Confirm Bids' : 'Waiting for bids...'}
        </button>
      </div>
    </div>
  );
};
