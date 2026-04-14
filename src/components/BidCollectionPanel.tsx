import React, { useState, useEffect } from 'react';
import './BidCollectionPanel.css';

interface BidCollectionPanelProps {
  roundNumber: number;
  players: Array<{ id: string; name: string }> | null;
  onBidsSubmitted: (bids: Record<string, number>) => void;
  onCancel?: () => void;
}

interface PlayerBidState {
  playerId: string;
  playerName: string;
  bid: number | null;
  isConfirmed: boolean;
}

const BidCollectionPanel: React.FC<BidCollectionPanelProps> = ({
  roundNumber,
  players,
  onBidsSubmitted,
  onCancel,
}) => {
  const handCount = roundNumber;
  const [playerBids, setPlayerBids] = useState<PlayerBidState[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize player bids on mount or when players change
  useEffect(() => {
    if (players && players.length > 0) {
      const initialBids: PlayerBidState[] = players.map((player) => ({
        playerId: player.id,
        playerName: player.name,
        bid: null,
        isConfirmed: false,
      }));
      setPlayerBids(initialBids);
      setErrors({});
    }
  }, [players]);

  // Validate bid input
  const validateBid = (bid: number | null, playerId: string): string => {
    if (bid === null || bid === undefined) {
      return 'Bid is required';
    }

    const bidValue = Number(bid);

    if (isNaN(bidValue)) {
      return 'Bid must be a number';
    }

    if (bidValue < 0) {
      return 'Bid cannot be negative';
    }

    if (!Number.isInteger(bidValue)) {
      return 'Bid must be a whole number';
    }

    if (bidValue > handCount) {
      return `Bid cannot exceed ${handCount} hands`;
    }

    return '';
  };

  // Handle bid change
  const handleBidChange = (playerId: string, bidInput: string) => {
    const bidValue = bidInput === '' ? null : Number(bidInput);
    const error = bidInput === '' ? '' : validateBid(bidValue, playerId);

    setPlayerBids((prev) =>
      prev.map((pb) =>
        pb.playerId === playerId
          ? { ...pb, bid: bidValue, isConfirmed: false }
          : pb
      )
    );

    if (error) {
      setErrors((prev) => ({ ...prev, [playerId]: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[playerId];
        return newErrors;
      });
    }
  };

  // Handle bid confirmation
  const handleConfirmBid = (playerId: string) => {
    const playerBid = playerBids.find((pb) => pb.playerId === playerId);
    if (!playerBid) return;

    const error = validateBid(playerBid.bid, playerId);

    if (error) {
      setErrors((prev) => ({ ...prev, [playerId]: error }));
      return;
    }

    setPlayerBids((prev) =>
      prev.map((pb) =>
        pb.playerId === playerId ? { ...pb, isConfirmed: true } : pb
      )
    );

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[playerId];
      return newErrors;
    });
  };

  // Handle bid modification
  const handleModifyBid = (playerId: string) => {
    setPlayerBids((prev) =>
      prev.map((pb) =>
        pb.playerId === playerId ? { ...pb, isConfirmed: false } : pb
      )
    );
  };

  // Check if all bids are collected and confirmed
  const allBidsConfirmed = playerBids.every(
    (pb) => pb.bid !== null && pb.isConfirmed
  );

  // Handle submit
  const handleSubmit = () => {
    if (!allBidsConfirmed) {
      return;
    }

    const bids: Record<string, number> = {};
    playerBids.forEach((pb) => {
      if (pb.bid !== null) {
        bids[pb.playerId] = pb.bid;
      }
    });

    onBidsSubmitted(bids);
  };

  if (!players || players.length === 0) {
    return <div className="bid-collection-error">No players found</div>;
  }

  return (
    <div className="bid-collection-panel">
      <div className="bid-collection-header">
        <h2>Bid Collection</h2>
        <div className="round-info">
          <span className="round-label">Round {roundNumber}</span>
          <span className="hand-count-label">{handCount} hands available</span>
        </div>
      </div>

      {!showSummary ? (
        <div className="bid-input-section">
          <div className="players-bid-grid">
            {playerBids.map((playerBid) => (
              <div
                key={playerBid.playerId}
                className={`player-bid-card ${
                  playerBid.isConfirmed ? 'confirmed' : ''
                } ${errors[playerBid.playerId] ? 'error' : ''}`}
              >
                <div className="player-bid-header">
                  <h3 className="player-name">{playerBid.playerName}</h3>
                  {playerBid.isConfirmed && (
                    <span className="confirmed-badge">✓</span>
                  )}
                </div>

                {!playerBid.isConfirmed ? (
                  <div className="bid-input-group">
                    <div className="input-wrapper">
                      <input
                        type="number"
                        min="0"
                        max={handCount}
                        value={playerBid.bid ?? ''}
                        onChange={(e) =>
                          handleBidChange(playerBid.playerId, e.target.value)
                        }
                        placeholder="Enter bid"
                        className="bid-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleConfirmBid(playerBid.playerId);
                          }
                        }}
                      />
                      <span className="max-bid-hint">Max: {handCount}</span>
                    </div>
                    {errors[playerBid.playerId] && (
                      <div className="error-message">
                        {errors[playerBid.playerId]}
                      </div>
                    )}
                    <button
                      onClick={() => handleConfirmBid(playerBid.playerId)}
                      className="confirm-bid-btn"
                      disabled={!
                        (playerBid.bid !== null && !errors[playerBid.playerId])
                      }
                    >
                      Confirm Bid
                    </button>
                  </div>
                ) : (
                  <div className="bid-display">
                    <div className="bid-value">{playerBid.bid}</div>
                    <button
                      onClick={() => handleModifyBid(playerBid.playerId)}
                      className="modify-bid-btn"
                    >
                      Modify
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bid-collection-actions">
            <button
              onClick={() => setShowSummary(true)}
              className="proceed-btn"
              disabled={!allBidsConfirmed}
            >
              Proceed to Summary
            </button>
            {onCancel && (
              <button onClick={onCancel} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bid-summary-section">
          <h3>Bid Summary</h3>
          <div className="round-info-summary">
            <span>Round {roundNumber}</span>
            <span>{handCount} hands available</span>
          </div>
          <table className="bid-summary-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Bid</th>
              </tr>
            </thead>
            <tbody>
              {playerBids.map((playerBid) => (
                <tr key={playerBid.playerId}>
                  <td>{playerBid.playerName}</td>
                  <td className="bid-value-cell">{playerBid.bid}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bid-summary-actions">
            <button
              onClick={() => setShowSummary(false)}
              className="back-btn"
            >
              Back to Bidding
            </button>
            <button
              onClick={handleSubmit}
              className="submit-btn"
              disabled={!allBidsConfirmed}
            >
              Confirm & Move to Scoring
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BidCollectionPanel;
