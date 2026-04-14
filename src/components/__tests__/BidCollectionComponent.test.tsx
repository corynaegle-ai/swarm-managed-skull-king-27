import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BidCollectionComponent } from '../BidCollectionComponent';

describe('BidCollectionComponent', () => {
  const mockPlayers = [
    { id: 'player-1', name: 'Alice' },
    { id: 'player-2', name: 'Bob' },
  ];

  const mockOnBidsConfirmed = jest.fn();

  beforeEach(() => {
    mockOnBidsConfirmed.mockClear();
  });

  describe('Criterion 1: Display current round and hand count clearly', () => {
    it('should display round number and hand count', () => {
      render(
        <BidCollectionComponent
          round={3}
          handCount={3}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      const header = screen.getByText('Round 3 - 3 hands available');
      expect(header).toBeInTheDocument();
    });

    it('should update display when round changes', () => {
      const { rerender } = render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      expect(screen.getByText('Round 2 - 2 hands available')).toBeInTheDocument();

      rerender(
        <BidCollectionComponent
          round={4}
          handCount={4}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      expect(screen.getByText('Round 4 - 4 hands available')).toBeInTheDocument();
    });
  });

  describe('Criterion 2: Prevent bids exceeding hand count', () => {
    it('should prevent bids greater than hand count', async () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      const bidInput = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput, { target: { value: '5' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Bid cannot exceed 2 hands');
      });
    });

    it('should accept bids equal to hand count', async () => {
      render(
        <BidCollectionComponent
          round={3}
          handCount={3}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      const bidInput1 = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput1, { target: { value: '3' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      await waitFor(() => {
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });

    it('should prevent negative bids', async () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      const bidInput = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput, { target: { value: '-1' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Bid cannot be negative');
      });
    });
  });

  describe('Criterion 3: Require bid from every player before proceeding', () => {
    it('should disable confirm button when no bids are submitted', () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      const confirmButton = screen.getByTestId('confirm-bids-button') as HTMLButtonElement;
      expect(confirmButton).toBeDisabled();
    });

    it('should allow confirmation when all players have bids including zero', async () => {
      render(
        <BidCollectionComponent
          round={3}
          handCount={3}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      // Player 1 bids 0
      const bidInput1 = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput1, { target: { value: '0' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      // Player 2 bids 2
      const bidInput2 = screen.getByTestId('bid-input-field-player-2') as HTMLInputElement;
      fireEvent.change(bidInput2, { target: { value: '2' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-2'));

      await waitFor(() => {
        const confirmButton = screen.getByTestId('confirm-bids-button') as HTMLButtonElement;
        expect(confirmButton).not.toBeDisabled();
      });
    });

    it('should block confirmation if any player has not submitted a bid', async () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      // Only player 1 submits a bid
      const bidInput1 = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput1, { target: { value: '1' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      await waitFor(() => {
        const confirmButton = screen.getByTestId('confirm-bids-button') as HTMLButtonElement;
        expect(confirmButton).toBeDisabled();
      });
    });
  });

  describe('Criterion 4: Allow bid modifications before confirming', () => {
    it('should allow modifying bids after summary is shown', async () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      // Submit initial bids
      const bidInput1 = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput1, { target: { value: '1' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      const bidInput2 = screen.getByTestId('bid-input-field-player-2') as HTMLInputElement;
      fireEvent.change(bidInput2, { target: { value: '2' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-2'));

      // Show summary
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('confirm-bids-button'));
      });

      // Summary should be displayed
      await waitFor(() => {
        expect(screen.getByTestId('bid-summary')).toBeInTheDocument();
      });

      // Modify a bid
      const modifyButton = await screen.findByTestId('modify-button-player-1');
      fireEvent.click(modifyButton);

      const modifyInput = screen.getByTestId('modify-input-player-1') as HTMLInputElement;
      fireEvent.change(modifyInput, { target: { value: '2' } });
      fireEvent.click(screen.getByTestId('modify-confirm-player-1'));

      await waitFor(() => {
        expect(screen.getByTestId('bid-value-player-1')).toHaveTextContent('2');
      });
    });
  });

  describe('Criterion 5: Show bid summary before moving to scoring phase', () => {
    it('should display bid summary when all bids are confirmed', async () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      // Submit bids
      const bidInput1 = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput1, { target: { value: '1' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      const bidInput2 = screen.getByTestId('bid-input-field-player-2') as HTMLInputElement;
      fireEvent.change(bidInput2, { target: { value: '1' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-2'));

      // Click confirm to show summary
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('confirm-bids-button'));
      });

      // Summary should be displayed
      await waitFor(() => {
        expect(screen.getByTestId('bid-summary')).toBeInTheDocument();
        expect(screen.getByText('Bid Summary')).toBeInTheDocument();
      });
    });

    it('should show total bids in summary', async () => {
      render(
        <BidCollectionComponent
          round={3}
          handCount={3}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      // Submit bids: 2 + 1 = 3
      const bidInput1 = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput1, { target: { value: '2' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      const bidInput2 = screen.getByTestId('bid-input-field-player-2') as HTMLInputElement;
      fireEvent.change(bidInput2, { target: { value: '1' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-2'));

      // Show summary
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('confirm-bids-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('bid-total')).toHaveTextContent('Total Bids: 3');
      });
    });

    it('should list all players and their bids in summary', async () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      // Submit bids
      const bidInput1 = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput1, { target: { value: '0' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      const bidInput2 = screen.getByTestId('bid-input-field-player-2') as HTMLInputElement;
      fireEvent.change(bidInput2, { target: { value: '2' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-2'));

      // Show summary
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('confirm-bids-button'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('summary-item-player-1')).toBeInTheDocument();
        expect(screen.getByTestId('summary-item-player-2')).toBeInTheDocument();
        expect(screen.getByTestId('bid-value-player-1')).toHaveTextContent('0');
        expect(screen.getByTestId('bid-value-player-2')).toHaveTextContent('2');
      });
    });

    it('should proceed to scoring phase when summary is confirmed', async () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      // Submit bids
      const bidInput1 = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput1, { target: { value: '1' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      const bidInput2 = screen.getByTestId('bid-input-field-player-2') as HTMLInputElement;
      fireEvent.change(bidInput2, { target: { value: '1' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-2'));

      // Show summary
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('confirm-bids-button'));
      });

      // Confirm summary to proceed
      await waitFor(() => {
        fireEvent.click(screen.getByTestId('summary-confirm-button'));
      });

      // onBidsConfirmed should be called with the bids
      await waitFor(() => {
        expect(mockOnBidsConfirmed).toHaveBeenCalled();
        const passedBids = mockOnBidsConfirmed.mock.calls[0][0] as Map<string, number>;
        expect(passedBids.get('player-1')).toBe(1);
        expect(passedBids.get('player-2')).toBe(1);
      });
    });
  });

  describe('Edge cases and validation', () => {
    it('should accept bid of 0 (zero is valid)', async () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      const bidInput1 = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput1, { target: { value: '0' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      const bidInput2 = screen.getByTestId('bid-input-field-player-2') as HTMLInputElement;
      fireEvent.change(bidInput2, { target: { value: '1' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-2'));

      // Both players should have valid bids
      await waitFor(() => {
        const confirmButton = screen.getByTestId('confirm-bids-button') as HTMLButtonElement;
        expect(confirmButton).not.toBeDisabled();
      });
    });

    it('should reject non-numeric input', async () => {
      render(
        <BidCollectionComponent
          round={2}
          handCount={2}
          players={mockPlayers}
          onBidsConfirmed={mockOnBidsConfirmed}
        />
      );

      const bidInput = screen.getByTestId('bid-input-field-player-1') as HTMLInputElement;
      fireEvent.change(bidInput, { target: { value: 'abc' } });
      fireEvent.click(screen.getByTestId('bid-submit-player-1'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Bid must be a valid number');
      });
    });
  });
});
