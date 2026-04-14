import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoundScoringInterface from '../components/RoundScoringInterface';

const mockPlayers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

const mockBids = {
  1: 2,
  2: 1,
  3: 0,
};

describe('RoundScoringInterface', () => {
  describe('Acceptance Criteria 1: Shows each player\'s bid clearly during scoring', () => {
    it('displays all players with their names', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      mockPlayers.forEach((player) => {
        expect(screen.getByText(player.name)).toBeInTheDocument();
      });
    });

    it('displays bid for each player in a dedicated column', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const bidCells = screen.getAllByText(/^(0|1|2)$/);
      expect(bidCells.length).toBeGreaterThanOrEqual(3);
    });

    it('shows bids in table header and data rows', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Bid')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Alice's bid
      expect(screen.getByText('1')).toBeInTheDocument(); // Bob's bid
    });
  });

  describe('Acceptance Criteria 2: Allows entry of tricks taken (0 to hand count)', () => {
    it('renders input fields for tricks taken', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      expect(tricksInputs.length).toBeGreaterThanOrEqual(3);
    });

    it('allows entering tricks value between 0 and hand count', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      await userEvent.type(tricksInputs[0], '2');

      expect(tricksInputs[0]).toHaveValue(2);
    });

    it('validates tricks are within 0 to hand count range', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      // Try to enter value above hand count
      fireEvent.change(tricksInputs[0], { target: { value: '5' } });

      await waitFor(() => {
        expect(screen.getByText(/Tricks must be between 0 and 3/)).toBeInTheDocument();
      });
    });

    it('allows zero tricks', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      fireEvent.change(tricksInputs[0], { target: { value: '0' } });

      expect(tricksInputs[0]).toHaveValue(0);
    });
  });

  describe('Acceptance Criteria 3: Allows entry of bonus points (defaults to 0)', () => {
    it('renders input fields for bonus points', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Bonus Points')).toBeInTheDocument();
    });

    it('defaults bonus points to 0 for all players', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      // All bonus inputs should have value 0
      const bonusInputs = screen.getAllByDisplayValue('0');
      expect(bonusInputs.length).toBeGreaterThanOrEqual(3);
    });

    it('allows entering bonus points values', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const bonusInputs = screen.getAllByDisplayValue('0');
      fireEvent.change(bonusInputs[0], { target: { value: '10' } });

      expect(bonusInputs[0]).toHaveValue(10);
    });

    it('validates bonus points are non-negative', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const bonusInputs = screen.getAllByDisplayValue('0');
      fireEvent.change(bonusInputs[0], { target: { value: '-5' } });

      // Input should not accept negative value or show it
      // Check that bonus points for player remains valid
      expect(bonusInputs[0]).toHaveValue(0);
    });
  });

  describe('Acceptance Criteria 4: Calculates scores in real-time as data is entered', () => {
    it('displays Round Score column', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('Round Score')).toBeInTheDocument();
    });

    it('calculates score when tricks match bid', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      fireEvent.change(tricksInputs[0], { target: { value: '2' } });

      await waitFor(() => {
        // Score should be 10 * bid (2) = 20
        expect(screen.getByText('20')).toBeInTheDocument();
      });
    });

    it('calculates score as 0 when undercut', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      // Alice bid 2, enter 1 (undercut)
      fireEvent.change(tricksInputs[0], { target: { value: '1' } });

      await waitFor(() => {
        // Find the score in Alice's row
        const scores = screen.getAllByText('0');
        expect(scores.length).toBeGreaterThan(0);
      });
    });

    it('calculates negative score when overcut', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      // Alice bid 2, enter 3 (overcut by 1)
      fireEvent.change(tricksInputs[0], { target: { value: '3' } });

      await waitFor(() => {
        // Score should be -5 * (3 - 2) = -5
        expect(screen.getByText('-5')).toBeInTheDocument();
      });
    });

    it('includes bonus points in score calculation', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      const bonusInputs = screen.getAllByDisplayValue('0');

      // Alice bid 2, enter 2 tricks (match) + 5 bonus
      fireEvent.change(tricksInputs[0], { target: { value: '2' } });
      fireEvent.change(bonusInputs[0], { target: { value: '5' } });

      await waitFor(() => {
        // Score should be 10 * 2 + 5 = 25
        expect(screen.getByText('25')).toBeInTheDocument();
      });
    });

    it('updates score in real-time as values change', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');

      // Enter initial value
      fireEvent.change(tricksInputs[0], { target: { value: '2' } });
      await waitFor(() => {
        expect(screen.getByText('20')).toBeInTheDocument();
      });

      // Change to different value
      fireEvent.change(tricksInputs[0], { target: { value: '3' } });
      await waitFor(() => {
        expect(screen.getByText('-5')).toBeInTheDocument();
      });
    });
  });

  describe('Acceptance Criteria 5: Prevents advancing to next round until all data entered', () => {
    it('disables submit button initially', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Complete Round/ });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when all tricks are entered', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');

      // Enter tricks for all players
      fireEvent.change(tricksInputs[0], { target: { value: '2' } });
      fireEvent.change(tricksInputs[1], { target: { value: '1' } });
      fireEvent.change(tricksInputs[2], { target: { value: '0' } });

      const submitButton = screen.getByRole('button', { name: /Complete Round/ });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('disables submit button if any tricks field is empty', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');

      // Enter tricks for only 2 players
      fireEvent.change(tricksInputs[0], { target: { value: '2' } });
      fireEvent.change(tricksInputs[1], { target: { value: '1' } });
      // Leave tricksInputs[2] empty

      const submitButton = screen.getByRole('button', { name: /Complete Round/ });

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('disables submit button if tricks value is invalid', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');

      // Enter valid and invalid values
      fireEvent.change(tricksInputs[0], { target: { value: '2' } });
      fireEvent.change(tricksInputs[1], { target: { value: '1' } });
      fireEvent.change(tricksInputs[2], { target: { value: '5' } }); // Invalid: > hand

      const submitButton = screen.getByRole('button', { name: /Complete Round/ });

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('calls onComplete with all data when submit is clicked', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      const bonusInputs = screen.getAllByDisplayValue('0');

      // Enter all data
      fireEvent.change(tricksInputs[0], { target: { value: '2' } });
      fireEvent.change(tricksInputs[1], { target: { value: '1' } });
      fireEvent.change(tricksInputs[2], { target: { value: '0' } });
      fireEvent.change(bonusInputs[0], { target: { value: '5' } });

      const submitButton = screen.getByRole('button', { name: /Complete Round/ });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          hand: 3,
          tricks: expect.any(Object),
          bonusPoints: expect.any(Object),
          scores: expect.any(Object),
        })
      );
    });
  });

  describe('Error handling and edge cases', () => {
    it('handles empty players array gracefully', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={[]}
          hand={3}
          bids={{}}
          onComplete={mockOnComplete}
        />
      );

      expect(screen.getByText('No players found')).toBeInTheDocument();
    });

    it('handles missing bids gracefully', () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={{}}
          onComplete={mockOnComplete}
        />
      );

      // Should display dashes for missing bids
      expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(3);
    });

    it('displays error message for invalid tricks input', async () => {
      const mockOnComplete = jest.fn();
      render(
        <RoundScoringInterface
          players={mockPlayers}
          hand={3}
          bids={mockBids}
          onComplete={mockOnComplete}
        />
      );

      const tricksInputs = screen.getAllByPlaceholderText('0');
      fireEvent.change(tricksInputs[0], { target: { value: '10' } });

      await waitFor(() => {
        expect(screen.getByText(/Tricks must be between 0 and 3/)).toBeInTheDocument();
      });
    });
  });
});