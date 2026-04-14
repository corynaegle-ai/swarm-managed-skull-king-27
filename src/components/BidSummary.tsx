import React, { useState } from 'react';

export interface Player {
  id: string;
  name: string;
}

export interface BidSummaryProps {
  bids: Map<string, number>;
  players: Player[];
  onConfirm: () => void;
  onModifyBid: (playerId: string, newBid: number) => void;
}

/**
 * Component displaying a summary of all submitted bids.
 * Allows players to modify bids before final confirmation.
 */
export const BidSummary: React.FC<BidSummaryProps> = ({
  bids,
  players,
  onConfirm,
  onModifyBid,
}) => {
  const [modifyingPlayerId, setModifyingPlayerId] = useState<string | null>(null);
  const [modifyValue, setModifyValue] = useState<string>('');

  const handleModifyClick = (playerId: string, currentBid: number) => {
    setModifyingPlayerId(playerId);
    setModifyValue(String(currentBid));
  };

  const handleModifyConfirm = (playerId: string) => {
    const newBid = parseInt(modifyValue, 10);
    if (!isNaN(newBid)) {
      onModifyBid(playerId, newBid);
    }
    setModifyingPlayerId(null);
    setModifyValue('');
  };

  const calculateTotal = (): number => {
    let total = 0;
    bids.forEach(bid => {
      total += bid;
    });
    return total;
  };

  return (
    <div className="bid-summary-container" data-testid="bid-summary">
      <h2>Bid Summary</h2>

      <div className="bid-summary-list" data-testid="bid-summary-list">
        {players.map(player => {
          const playerBid = bids.get(player.id) ?? 0;
          const isModifying = modifyingPlayerId === player.id;

          return (
            <div key={player.id} className="bid-summary-item" data-testid={`summary-item-${player.id}`}>
              <span className="player-name">{player.name}</span>
              {isModifying ? (
                <div className="bid-modify-input">
                  <input
                    type="number"
                    value={modifyValue}
                    onChange={e => setModifyValue(e.target.value)}
                    data-testid={`modify-input-${player.id}`}
                  />
                  <button
                    onClick={() => handleModifyConfirm(player.id)}
                    data-testid={`modify-confirm-${player.id}`}
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <div className="bid-display">
                  <span className="bid-value" data-testid={`bid-value-${player.id}`}>
                    {playerBid}
                  </span>
                  <button
                    onClick={() => handleModifyClick(player.id, playerBid)}
                    data-testid={`modify-button-${player.id}`}
                    className="modify-button"
                  >
                    Modify
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bid-total" data-testid="bid-total">
        <strong>Total Bids: {calculateTotal()}</strong>
      </div>

      <div className="bid-summary-actions">
        <button
          onClick={onConfirm}
          data-testid="summary-confirm-button"
          className="confirm-button"
        >
          Confirm and Proceed
        </button>
      </div>
    </div>
  );
};
