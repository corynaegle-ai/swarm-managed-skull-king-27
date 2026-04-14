import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BidCollectionPanel from '../BidCollectionPanel';

describe('BidCollectionPanel', () => {
  const mockPlayers = [
    { id: 'player1', name: 'Alice' },
    { id: 'player2', name: 'Bob' },
    { id: 'player3', name: 'Charlie' },
  ];

  const mockOnBidsSubmitted = jest.fn();

  beforeEach(() => {
    mockOnBidsSubmitted.mockClear();
  });

  describe('Criterion 1: Display current round and hand count clearly', () => {
    it('should display current round number', () => {
      render(
        <BidCollectionPanel
          roundNumber={3}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const roundLabel = screen.getByText('Round 3');
      expect(roundLabel).toBeInTheDocument();
    });

    it('should display hand count equal to round number', () => {
      render(
        <BidCollectionPanel
          roundNumber={5}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const handCountLabel = screen.getByText('5 hands available');
      expect(handCountLabel).toBeInTheDocument();
    });

    it('should display both round and hand count clearly', () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      expect(screen.getByText('Round 2')).toBeInTheDocument();
      expect(screen.getByText('2 hands available')).toBeInTheDocument();
    });
  });

  describe('Criterion 2: Prevent bids exceeding hand count', () => {
    it('should show error when bid exceeds hand count', async () => {
      render(
        <BidCollectionPanel
          roundNumber={3}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      await userEvent.type(inputs[0], '5');

      const confirmButtons = screen.getAllByText('Confirm Bid');
      fireEvent.click(confirmButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText('Bid cannot exceed 3 hands')
        ).toBeInTheDocument();
      });
    });

    it('should prevent confirming a bid that exceeds hand count', async () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      await userEvent.type(inputs[0], '10');

      const confirmButtons = screen.getAllByText('Confirm Bid');
      fireEvent.click(confirmButtons[0]);

      await waitFor(() => {
        expect(
          screen.getByText('Bid cannot exceed 2 hands')
        ).toBeInTheDocument();
      });

      // Player bid should not be confirmed
      expect(
        screen.queryByText('Confirm Bid').closest('.player-bid-card')
      ).not.toHaveClass('confirmed');
    });

    it('should allow valid bids up to hand count', async () => {
      render(
        <BidCollectionPanel
          roundNumber={3}
          players={[mockPlayers[0]]}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const input = screen.getByPlaceholderText('Enter bid');
      await userEvent.type(input, '3');

      const confirmButton = screen.getByText('Confirm Bid');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText(/Bid cannot exceed/)).not.toBeInTheDocument();
      });
    });

    it('should allow zero bids', async () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={[mockPlayers[0]]}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const input = screen.getByPlaceholderText('Enter bid');
      await userEvent.type(input, '0');

      const confirmButton = screen.getByText('Confirm Bid');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Criterion 3: Require bid from every player before proceeding', () => {
    it('should display all players for bidding', () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      mockPlayers.forEach((player) => {
        expect(screen.getByText(player.name)).toBeInTheDocument();
      });
    });

    it('should disable proceed button when not all bids are confirmed', () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const proceedButton = screen.getByText('Proceed to Summary');
      expect(proceedButton).toBeDisabled();
    });

    it('should enable proceed button only after all players bid', async () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      const confirmButtons = screen.getAllByText('Confirm Bid');

      // Confirm all bids
      for (let i = 0; i < mockPlayers.length; i++) {
        await userEvent.type(inputs[i], '1');
        fireEvent.click(confirmButtons[i]);
      }

      const proceedButton = screen.getByText('Proceed to Summary');
      await waitFor(() => {
        expect(proceedButton).not.toBeDisabled();
      });
    });

    it('should require bid from every single player', async () => {
      render(
        <BidCollectionPanel
          roundNumber={1}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      const confirmButtons = screen.getAllByText('Confirm Bid');

      // Confirm only 2 out of 3 bids
      for (let i = 0; i < 2; i++) {
        await userEvent.type(inputs[i], '1');
        fireEvent.click(confirmButtons[i]);
      }

      const proceedButton = screen.getByText('Proceed to Summary');
      expect(proceedButton).toBeDisabled();
    });
  });

  describe('Criterion 4: Allow bid modifications before confirming', () => {
    it('should show modify button for confirmed bids', async () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={[mockPlayers[0]]}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const input = screen.getByPlaceholderText('Enter bid');
      await userEvent.type(input, '1');

      const confirmButton = screen.getByText('Confirm Bid');
      fireEvent.click(confirmButton);

      const modifyButton = await screen.findByText('Modify');
      expect(modifyButton).toBeInTheDocument();
    });

    it('should allow changing a bid via modify button', async () => {
      render(
        <BidCollectionPanel
          roundNumber={3}
          players={[mockPlayers[0]]}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const input = screen.getByPlaceholderText('Enter bid');
      await userEvent.type(input, '1');

      let confirmButton = screen.getByText('Confirm Bid');
      fireEvent.click(confirmButton);

      const modifyButton = await screen.findByText('Modify');
      fireEvent.click(modifyButton);

      // The input should now be visible and editable
      const newInput = screen.getByPlaceholderText('Enter bid');
      expect(newInput).toBeInTheDocument();
    });

    it('should allow multiple bid modifications', async () => {
      render(
        <BidCollectionPanel
          roundNumber={3}
          players={[mockPlayers[0]]}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const input = screen.getByPlaceholderText('Enter bid');
      await userEvent.type(input, '1');

      let confirmButton = screen.getByText('Confirm Bid');
      fireEvent.click(confirmButton);

      // First modify
      let modifyButton = await screen.findByText('Modify');
      fireEvent.click(modifyButton);

      const editInput = screen.getByPlaceholderText('Enter bid');
      await userEvent.clear(editInput);
      await userEvent.type(editInput, '2');

      confirmButton = screen.getByText('Confirm Bid');
      fireEvent.click(confirmButton);

      // Second modify
      modifyButton = await screen.findByText('Modify');
      fireEvent.click(modifyButton);

      const editInput2 = screen.getByPlaceholderText('Enter bid');
      expect(editInput2).toBeInTheDocument();
    });
  });

  describe('Criterion 5: Show bid summary before moving to scoring phase', () => {
    it('should show summary with all bids when proceeding', async () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      const confirmButtons = screen.getAllByText('Confirm Bid');

      for (let i = 0; i < mockPlayers.length; i++) {
        await userEvent.type(inputs[i], String(i + 1));
        fireEvent.click(confirmButtons[i]);
      }

      const proceedButton = screen.getByText('Proceed to Summary');
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(screen.getByText('Bid Summary')).toBeInTheDocument();
      });
    });

    it('should display all player names in summary', async () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      const confirmButtons = screen.getAllByText('Confirm Bid');

      for (let i = 0; i < mockPlayers.length; i++) {
        await userEvent.type(inputs[i], '1');
        fireEvent.click(confirmButtons[i]);
      }

      const proceedButton = screen.getByText('Proceed to Summary');
      fireEvent.click(proceedButton);

      await waitFor(() => {
        mockPlayers.forEach((player) => {
          expect(screen.getByText(player.name)).toBeInTheDocument();
        });
      });
    });

    it('should display all bid values in summary', async () => {
      render(
        <BidCollectionPanel
          roundNumber={3}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      const confirmButtons = screen.getAllByText('Confirm Bid');

      const testBids = [1, 2, 0];
      for (let i = 0; i < mockPlayers.length; i++) {
        await userEvent.type(inputs[i], String(testBids[i]));
        fireEvent.click(confirmButtons[i]);
      }

      const proceedButton = screen.getByText('Proceed to Summary');
      fireEvent.click(proceedButton);

      await waitFor(() => {
        for (const bid of testBids) {
          expect(screen.getByText(String(bid))).toBeInTheDocument();
        }
      });
    });

    it('should show round and hand count in summary', async () => {
      render(
        <BidCollectionPanel
          roundNumber={4}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      const confirmButtons = screen.getAllByText('Confirm Bid');

      for (let i = 0; i < mockPlayers.length; i++) {
        await userEvent.type(inputs[i], '1');
        fireEvent.click(confirmButtons[i]);
      }

      const proceedButton = screen.getByText('Proceed to Summary');
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(screen.getByText('Round 4')).toBeInTheDocument();
      });
    });

    it('should allow going back from summary to edit bids', async () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      const confirmButtons = screen.getAllByText('Confirm Bid');

      for (let i = 0; i < mockPlayers.length; i++) {
        await userEvent.type(inputs[i], '1');
        fireEvent.click(confirmButtons[i]);
      }

      const proceedButton = screen.getByText('Proceed to Summary');
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(screen.getByText('Bid Summary')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Bidding');
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.queryByText('Bid Summary')).not.toBeInTheDocument();
      });
    });

    it('should call onBidsSubmitted with correct data when confirming from summary', async () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={mockPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const inputs = screen.getAllByPlaceholderText('Enter bid');
      const confirmButtons = screen.getAllByText('Confirm Bid');

      const testBids = [1, 0, 2];
      for (let i = 0; i < mockPlayers.length; i++) {
        await userEvent.type(inputs[i], String(testBids[i]));
        fireEvent.click(confirmButtons[i]);
      }

      const proceedButton = screen.getByText('Proceed to Summary');
      fireEvent.click(proceedButton);

      const submitButton = await screen.findByText('Confirm & Move to Scoring');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnBidsSubmitted).toHaveBeenCalledWith({
          player1: 1,
          player2: 0,
          player3: 2,
        });
      });
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle single player', async () => {
      render(
        <BidCollectionPanel
          roundNumber={1}
          players={[mockPlayers[0]]}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      const input = screen.getByPlaceholderText('Enter bid');
      await userEvent.type(input, '1');

      const confirmButton = screen.getByText('Confirm Bid');
      fireEvent.click(confirmButton);

      const proceedButton = screen.getByText('Proceed to Summary');
      await waitFor(() => {
        expect(proceedButton).not.toBeDisabled();
      });
    });

    it('should handle many players', () => {
      const manyPlayers = Array.from({ length: 10 }, (_, i) => ({
        id: `player${i}`,
        name: `Player ${i + 1}`,
      }));

      render(
        <BidCollectionPanel
          roundNumber={5}
          players={manyPlayers}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      manyPlayers.forEach((player) => {
        expect(screen.getByText(player.name)).toBeInTheDocument();
      });
    });

    it('should handle no players gracefully', () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={null}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      expect(screen.getByText('No players found')).toBeInTheDocument();
    });

    it('should handle empty players array', () => {
      render(
        <BidCollectionPanel
          roundNumber={2}
          players={[]}
          onBidsSubmitted={mockOnBidsSubmitted}
        />
      );

      expect(screen.getByText('No players found')).toBeInTheDocument();
    });
  });
});
