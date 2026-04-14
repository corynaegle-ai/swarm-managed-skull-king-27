import React, { useState, useEffect } from 'react';
import { BidService } from '../services/BidService';
import { Player, Bid } from '../types';
import './BidCollectionComponent.css';

interface BidCollectionComponentProps {
  players: Player[];
  roundNumber: number;
  onBidsConfirmed: (bids: Bid[]) => void;
}

export const BidCollectionComponent: React.FC<BidCollectionComponentProps> = ({
  players,
  roundNumber,
  onBidsConfirmed,
}) => {
  const handCount = roundNumber;
  const [bids, setBids] = useState<Map<string, number>>(new Map());
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const bidService = new BidService();

  // Initialize empty bids for all players
  useEffect(() => {
    const initialBids = new Map<string, number>();
    players.forEach((player) => {
      initialBids.set(player.id, 0);
    });
    setBids(initialBids);
  }, [players, roundNumber]);

  const handleBidChange = (playerId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    const newErrors = new Map(errors);

    // Validate bid
    const validation = bidService.validateBid(numValue, handCount);
    if (!validation.isValid) {
      newErrors.set(playerId, validation.error);
    } else {
      newErrors.delete(playerId);
    }

    const newBids = new Map(bids);
    newBids.set(playerId, numValue);
    setBids(newBids);
    setErrors(newErrors);
  };

  const allPlayersHaveBids = (): boolean => {
    for (const player of players) {
      if ((bids.get(player.id) ?? 0) === 0 && !bidService.isBidSet(bids.get(player.id) ?? 0)) {
        return false;
      }
    }
    return true;
  };

  const hasErrors = (): boolean => {
    return errors.size > 0;
  };

  const handleConfirmBids = () => {
    // Validate all bids before showing summary
    const newErrors = new Map<string, string>();
    let isValid = true;

    players.forEach((player) => {
      const bid = bids.get(player.id) ?? 0;
      const validation = bidService.validateBid(bid, handCount);
      if (!validation.isValid) {
        newErrors.set(player.id, validation.error);
        isValid = false;
      }
      // Check that bid is set (not 0)
      if (bid === 0) {
        newErrors.set(player.id, 'Bid is required');
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (isValid) {
      setShowSummary(true);
    }
  };

  const handleModifyBids = () => {
    setShowSummary(false);
  };

  const handleConfirmSummary = () => {
    const bidsList: Bid[] = players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      bidAmount: bids.get(player.id) ?? 0,
      round: roundNumber,
    }));
    onBidsConfirmed(bidsList);
  };

  if (showSummary) {
    return (
      <div className="bid-collection-container">
        <div className="bid-summary">
          <h2>Bid Summary - Round {roundNumber}</h2>
          <div className="summary-table">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Bid</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id}>
                    <td>{player.name}</td>
                    <td>{bids.get(player.id) ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="summary-info">
            <p>Hands available: {handCount}</p>
            <p>Total bids: {Array.from(bids.values()).reduce((a, b) => a + b, 0)}</p>
          </div>
          <div className="summary-actions">
            <button onClick={handleModifyBids} className="btn-modify">
              Modify Bids
            </button>
            <button onClick={handleConfirmSummary} className="btn-confirm">
              Confirm & Proceed to Scoring
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bid-collection-container">
      <div className="bid-header">
        <h1>Bid Collection</h1>
        <div className="round-info">
          <p className="round-display">
            <strong>Round {roundNumber}</strong>
          </p>
          <p className="hand-count">
            <strong>Hands Available: {handCount}</strong>
          </p>
        </div>
      </div>

      <div className="bid-form">
        <div className="players-bid-list">
          {players.map((player) => (
            <div key={player.id} className="player-bid-item">
              <label htmlFor={`bid-${player.id}`}>{player.name}</label>
              <input
                id={`bid-${player.id}`}
                type="number"
                min="0"
                max={handCount}
                value={bids.get(player.id) ?? 0}
                onChange={(e) => handleBidChange(player.id, e.target.value)}
                className={errors.has(player.id) ? 'input-error' : ''}
              />
              {errors.has(player.id) && (
                <span className="error-message">{errors.get(player.id)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bid-actions">
        <button
          onClick={handleConfirmBids}
          disabled={hasErrors() || !allPlayersHaveBids()}
          className="btn-confirm-bids"
        >
          Confirm All Bids
        </button>
      </div>
    </div>
  );
};
