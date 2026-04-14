import React, { useState } from 'react';

export interface Player {
  id: string;
  name: string;
}

export interface BidInputPanelProps {
  player: Player;
  currentBid: number | undefined;
  handCount: number;
  onBidSubmit: (playerId: string, bid: number) => void;
  onValidationError: (error: string) => void;
}

/**
 * Component for a single player to input their bid.
 */
export const BidInputPanel: React.FC<BidInputPanelProps> = ({
  player,
  currentBid,
  handCount,
  onBidSubmit,
  onValidationError,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    currentBid !== undefined ? String(currentBid) : ''
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    const bid = parseInt(inputValue, 10);

    if (isNaN(bid)) {
      onValidationError('Bid must be a valid number');
      return;
    }

    onBidSubmit(player.id, bid);
    // Keep the input value as-is so the player can see their submitted bid
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const isBidSet = currentBid !== undefined;

  return (
    <div className="bid-input-panel" data-testid={`bid-input-${player.id}`}>
      <label className="player-label">{player.name}</label>
      <div className="bid-input-group">
        <input
          type="number"
          min="0"
          max={handCount}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={`0 - ${handCount}`}
          data-testid={`bid-input-field-${player.id}`}
        />
        <button
          onClick={handleSubmit}
          data-testid={`bid-submit-${player.id}`}
          className={isBidSet ? 'bid-set' : ''}
        >
          {isBidSet ? '✓ Bid Set' : 'Submit'}
        </button>
      </div>
      {isBidSet && (
        <div className="bid-confirmation" data-testid={`bid-confirmation-${player.id}`}>
          Current bid: {currentBid}
        </div>
      )}
    </div>
  );
};
