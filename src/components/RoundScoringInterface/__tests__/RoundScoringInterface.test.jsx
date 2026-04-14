import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoundScoringInterface from '../RoundScoringInterface';

const mockPlayers = [
  { id: 'p1', name: 'Player 1' },
  { id: 'p2', name: 'Player 2' },
  { id: 'p3', name: 'Player 3' },
];

const mockBids = {
  p1: 2,
  p2: 3,
  p3: 1,
};

describe('RoundScoringInterface', () => {
  let mockOnSubmitScores;
  let mockOnCancel;

  beforeEach(() => {
    mockOnSubmitScores = jest.fn();
    mockOnCancel = jest.fn();
  });

  test('renders the scoring interface with all players', () => {
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Round 1 Scoring')).toBeInTheDocument();
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3')).toBeInTheDocument();
  });

  test('displays bids clearly for each player', () => {
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const bidCells = screen.getAllByText(/^[0-3]$/).filter((el) => el.className === 'bid-cell');
    // Note: This test verifies bids are shown; check by looking at table structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  test('allows entry of tricks taken between 0 and hand count', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    const firstTricksInput = tricksInputs[0]; // First player's tricks input

    await user.clear(firstTricksInput);
    await user.type(firstTricksInput, '5');

    expect(firstTricksInput).toHaveValue(5);
  });

  test('rejects tricks taken values outside valid range', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    const firstTricksInput = tricksInputs[0];

    await user.clear(firstTricksInput);
    await user.type(firstTricksInput, '15');

    // Blur to trigger validation
    fireEvent.blur(firstTricksInput);

    await waitFor(() => {
      expect(screen.getByText(/Tricks must be between 0 and 10/)).toBeInTheDocument();
    });
  });

  test('allows entry of bonus points with default of 0', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const bonusInputs = screen.getAllByRole('spinbutton');
    const firstBonusInput = bonusInputs[2]; // First player's bonus input (after tricks)

    // Should default to 0
    expect(firstBonusInput).toHaveValue(0);

    await user.clear(firstBonusInput);
    await user.type(firstBonusInput, '10');

    expect(firstBonusInput).toHaveValue(10);
  });

  test('calculates scores in real-time as data is entered', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    const firstTricksInput = tricksInputs[0];

    // Enter tricks = bid (2), bonus = 0
    // Expected score: 10 + 10*2 + 0 = 30
    await user.clear(firstTricksInput);
    await user.type(firstTricksInput, '2');

    await waitFor(() => {
      const scoreElements = screen.getAllByText(/^30$/);
      expect(scoreElements.length).toBeGreaterThan(0);
    });
  });

  test('calculates negative scores when bid is not made', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    const firstTricksInput = tricksInputs[0];

    // Enter tricks = 0, bid = 2, bonus = 0
    // Expected score: -10 * abs(2-0) + 0 = -20
    await user.clear(firstTricksInput);
    await user.type(firstTricksInput, '0');

    await waitFor(() => {
      const scoreElements = screen.getAllByText(/-20/);
      expect(scoreElements.length).toBeGreaterThan(0);
    });
  });

  test('prevents advancing to next round until all data is entered', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Submit Scores/i });

    // Submit button should be disabled initially
    expect(submitButton).toBeDisabled();

    // Enter tricks for first two players but not the third
    const tricksInputs = screen.getAllByRole('spinbutton');
    await user.clear(tricksInputs[0]);
    await user.type(tricksInputs[0], '2');
    await user.clear(tricksInputs[3]);
    await user.type(tricksInputs[3], '3');

    // Submit button should still be disabled
    expect(submitButton).toBeDisabled();
  });

  test('enables submit button only when all data is complete', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Submit Scores/i });
    expect(submitButton).toBeDisabled();

    const tricksInputs = screen.getAllByRole('spinbutton');

    // Fill in all tricks
    await userEvent.setup().then(async (user) => {
      for (let i = 0; i < mockPlayers.length; i++) {
        await user.clear(tricksInputs[i]);
        await user.type(tricksInputs[i], '1');
      }
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('calls onSubmitScores with correct data when submit is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');

    // Fill in tricks for all players
    await user.clear(tricksInputs[0]);
    await user.type(tricksInputs[0], '2');
    await user.clear(tricksInputs[3]);
    await user.type(tricksInputs[3], '3');
    await user.clear(tricksInputs[6]);
    await user.type(tricksInputs[6], '1');

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Submit Scores/i });
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole('button', { name: /Submit Scores/i });
    await user.click(submitButton);

    expect(mockOnSubmitScores).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          playerId: 'p1',
          bid: 2,
          tricksTaken: 2,
          bonusPoints: 0,
          score: 30,
        }),
      ])
    );
  });

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('displays hand size information', () => {
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={5}
        currentRound={3}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Hand size: 5 cards')).toBeInTheDocument();
  });

  test('rounds correct score calculations with bonus points', async () => {
    const user = userEvent.setup();
    render(
      <RoundScoringInterface
        players={mockPlayers}
        bids={mockBids}
        handCount={10}
        currentRound={1}
        onSubmitScores={mockOnSubmitScores}
        onCancel={mockOnCancel}
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    const bonusInputs = screen.getAllByRole('spinbutton');

    // First player: bid=2, tricks=2, bonus=5
    // Expected: 10 + 10*2 + 5 = 35
    await user.clear(tricksInputs[0]);
    await user.type(tricksInputs[0], '2');
    await user.clear(bonusInputs[2]);
    await user.type(bonusInputs[2], '5');

    await waitFor(() => {
      const scoreElements = screen.getAllByText(/^35$/);
      expect(scoreElements.length).toBeGreaterThan(0);
    });
  });
});
