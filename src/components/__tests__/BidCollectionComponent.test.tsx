import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BidCollectionComponent } from '../BidCollectionComponent';
import { Player } from '../../types';

describe('BidCollectionComponent', () => {
  const mockPlayers: Player[] = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
  ];

  const mockOnBidsConfirmed = jest.fn();

  beforeEach(() => {
    mockOnBidsConfirmed.mockClear();
  });

  describe('Criterion 1: Display current round and hand count clearly', () => {
    it('should display the current round number clearly', () => {
      render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={3}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      expect(screen.getByText('Round 3')).toBeInTheDocument();
    });

    it('should display hand count that equals round number', () => {
      render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={5}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      expect(screen.getByText('Hands Available: 5')).toBeInTheDocument();
    });

    it('should display hand count in bid summary', () => {
      const { getByDisplayValue, getByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={2}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      // Enter bids
      fireEvent.change(getByDisplayValue('0'), { target: { value: '1' } });
      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[1], { target: { value: '1' } });
      fireEvent.change(inputs[2], { target: { value: '0' } });

      // Click confirm
      fireEvent.click(getByText('Confirm All Bids'));

      // Check summary displays hand count
      waitFor(() => {
        expect(screen.getByText('Hands available: 2')).toBeInTheDocument();
      });
    });
  });

  describe('Criterion 2: Prevent bids exceeding hand count', () => {
    it('should show error when bid exceeds hand count', async () => {
      const { getByDisplayValue } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={2}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      const input = getByDisplayValue('0');
      await userEvent.clear(input);
      await userEvent.type(input, '5');

      expect(screen.getByText('Bid cannot exceed 2 hands')).toBeInTheDocument();
    });

    it('should not allow submitting bids that exceed hand count', async () => {
      const { getByDisplayValue, getByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={3}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      // Set one bid to exceed hand count
      const input = getByDisplayValue('0');
      await userEvent.clear(input);
      await userEvent.type(input, '5');

      // Confirm button should be disabled
      const confirmBtn = getByText('Confirm All Bids');
      expect(confirmBtn).toBeDisabled();
    });

    it('should accept bids equal to hand count', async () => {
      const { getByDisplayValue, getByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={3}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      const inputs = screen.getAllByRole('spinbutton');
      await userEvent.clear(inputs[0]);
      await userEvent.type(inputs[0], '3');
      await userEvent.clear(inputs[1]);
      await userEvent.type(inputs[1], '0');
      await userEvent.clear(inputs[2]);
      await userEvent.type(inputs[2], '0');

      // No error should be shown
      expect(screen.queryByText(/Bid cannot exceed/)).not.toBeInTheDocument();
    });
  });

  describe('Criterion 3: Require bid from every player before proceeding', () => {
    it('should not allow confirmation if any player bid is 0', () => {
      const { getByDisplayValue, getByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={3}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      // Only set bids for 2 players
      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '1' } });
      // Leave inputs[2] as 0

      const confirmBtn = getByText('Confirm All Bids');
      expect(confirmBtn).toBeDisabled();
    });

    it('should allow confirmation only when all players have non-zero bids', () => {
      const { getByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={3}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '1' } });
      fireEvent.change(inputs[2], { target: { value: '1' } });

      const confirmBtn = getByText('Confirm All Bids');
      expect(confirmBtn).not.toBeDisabled();
    });
  });

  describe('Criterion 4: Allow bid modifications before confirming', () => {
    it('should allow changing bids after entering them', async () => {
      const { getByDisplayValue } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={3}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      const inputs = screen.getAllByRole('spinbutton');

      // Set initial bids
      await userEvent.clear(inputs[0]);
      await userEvent.type(inputs[0], '1');

      // Modify the bid
      await userEvent.clear(inputs[0]);
      await userEvent.type(inputs[0], '2');

      expect(inputs[0]).toHaveValue(2);
    });

    it('should allow modifying bids after showing summary', () => {
      const { getByText, queryByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={2}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      // Set bids
      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '1' } });
      fireEvent.change(inputs[2], { target: { value: '0' } });

      // Confirm to show summary
      fireEvent.click(getByText('Confirm All Bids'));

      waitFor(() => {
        expect(screen.getByText('Bid Summary - Round 2')).toBeInTheDocument();

        // Click modify bids
        fireEvent.click(getByText('Modify Bids'));

        // Should be back to input form
        expect(queryByText('Bid Summary - Round 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Criterion 5: Show bid summary before moving to scoring phase', () => {
    it('should display bid summary with all player bids', () => {
      const { getByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={2}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      // Set bids for all players
      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '1' } });
      fireEvent.change(inputs[2], { target: { value: '0' } });

      // Click confirm
      fireEvent.click(getByText('Confirm All Bids'));

      waitFor(() => {
        expect(screen.getByText('Bid Summary - Round 2')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
      });
    });

    it('should show total bids in summary', () => {
      const { getByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={3}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '2' } });
      fireEvent.change(inputs[2], { target: { value: '0' } });

      fireEvent.click(getByText('Confirm All Bids'));

      waitFor(() => {
        expect(screen.getByText('Total bids: 3')).toBeInTheDocument();
      });
    });

    it('should call onBidsConfirmed when confirming from summary', async () => {
      const { getByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={2}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '1' } });
      fireEvent.change(inputs[2], { target: { value: '0' } });

      fireEvent.click(getByText('Confirm All Bids'));

      await waitFor(() => {
        fireEvent.click(getByText('Confirm & Proceed to Scoring'));
      });

      expect(mockOnBidsConfirmed).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            playerId: '1',
            playerName: 'Alice',
            bidAmount: 1,
            round: 2,
          }),
          expect.objectContaining({
            playerId: '2',
            playerName: 'Bob',
            bidAmount: 1,
            round: 2,
          }),
          expect.objectContaining({
            playerId: '3',
            playerName: 'Charlie',
            bidAmount: 0,
            round: 2,
          }),
        ]),
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle round 1 with 1 hand', () => {
      render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={1}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      expect(screen.getByText('Hands Available: 1')).toBeInTheDocument();
    });

    it('should handle zero as valid bid', async () => {
      const { getByText } = render(
        <BidCollectionComponent
          players={mockPlayers}
          roundNumber={3}
          onBidsConfirmed={mockOnBidsConfirmed}
        />,
      );

      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '1' } });
      fireEvent.change(inputs[2], { target: { value: '1' } });

      const confirmBtn = getByText('Confirm All Bids');
      expect(confirmBtn).not.toBeDisabled();
    });
  });
});
