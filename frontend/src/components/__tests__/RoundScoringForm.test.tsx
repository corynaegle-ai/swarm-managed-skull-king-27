import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoundScoringForm from '../RoundScoringForm';

describe('RoundScoringForm', () => {
  const mockPlayers = [
    { id: '1', name: 'Player 1', bid: 2 },
    { id: '2', name: 'Player 2', bid: 3 },
    { id: '3', name: 'Player 3', bid: 1 },
  ];

  const mockOnScoresSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Criterion 1: Shows each player's bid clearly during scoring
  test('should display each player\'s bid clearly', () => {
    render(
      <RoundScoringForm
        players={mockPlayers}
        handCount={5}
        onScoresSubmit={mockOnScoresSubmit}
      />
    );

    // Check that each player's bid is displayed
    expect(screen.getByText('2')).toBeInTheDocument(); // Player 1 bid
    expect(screen.getByText('3')).toBeInTheDocument(); // Player 2 bid
    expect(screen.getByText('1')).toBeInTheDocument(); // Player 3 bid

    // Check that all player names are displayed
    mockPlayers.forEach((player) => {
      expect(screen.getByText(player.name)).toBeInTheDocument();
    });
  });

  // Criterion 2: Allows entry of tricks taken (0 to hand count)
  test('should allow entry of tricks taken within valid range', async () => {
    render(
      <RoundScoringForm
        players={mockPlayers}
        handCount={5}
        onScoresSubmit={mockOnScoresSubmit}
      />
    );

    const trickInputs = screen.getAllByPlaceholderText('0');
    const firstTrickInput = trickInputs[0] as HTMLInputElement;

    // Enter valid value
    await userEvent.type(firstTrickInput, '2');
    expect(firstTrickInput.value).toBe('2');

    // Enter 0
    await userEvent.clear(firstTrickInput);
    await userEvent.type(firstTrickInput, '0');
    expect(firstTrickInput.value).toBe('0');

    // Enter max value
    await userEvent.clear(firstTrickInput);
    await userEvent.type(firstTrickInput, '5');
    expect(firstTrickInput.value).toBe('5');
  });

  // Criterion 3: Allows entry of bonus points (defaults to 0)
  test('should allow entry of bonus points with default of 0', async () => {
    render(
      <RoundScoringForm
        players={mockPlayers}
        handCount={5}
        onScoresSubmit={mockOnScoresSubmit}
      />
    );

    // Find bonus inputs by looking for inputs after tricks inputs
    const inputs = screen.getAllByRole('spinbutton');
    // Assume bonus inputs are after tricks inputs (3 tricks + 3 bonus)
    const bonusInput = inputs[3] as HTMLInputElement;

    // Default should be 0
    expect(bonusInput.value).toBe('0');

    // Change bonus
    await userEvent.clear(bonusInput);
    await userEvent.type(bonusInput, '5');
    expect(bonusInput.value).toBe('5');
  });

  // Criterion 4: Calculates scores in real-time as data is entered
  test('should calculate scores in real-time', async () => {
    render(
      <RoundScoringForm
        players={mockPlayers}
        handCount={5}
        onScoresSubmit={mockOnScoresSubmit}
      />
    );

    const trickInputs = screen.getAllByPlaceholderText('0');

    // Player 1: bid 2, tricks 2 = 10 + 2*5 = 20
    await userEvent.type(trickInputs[0], '2');

    // Check that score appears for player 1
    await waitFor(() => {
      const scoreElements = screen.getAllByRole('cell');
      // The score should be displayed in the Score column
      const hasScore = Array.from(scoreElements).some(
        (cell) => cell.textContent === '20'
      );
      expect(hasScore).toBe(true);
    });
  });

  // Criterion 5: Prevents advancing to next round until all data entered
  test('should prevent advancing until all tricks are entered', async () => {
    render(
      <RoundScoringForm
        players={mockPlayers}
        handCount={5}
        onScoresSubmit={mockOnScoresSubmit}
      />
    );

    const submitButton = screen.getByText('Submit Scores');

    // Should be disabled initially
    expect(submitButton).toBeDisabled();

    const trickInputs = screen.getAllByPlaceholderText('0');

    // Enter tricks for first player only
    await userEvent.type(trickInputs[0], '2');
    expect(submitButton).toBeDisabled();

    // Enter tricks for second player
    await userEvent.type(trickInputs[1], '3');
    expect(submitButton).toBeDisabled();

    // Enter tricks for third player
    await userEvent.type(trickInputs[2], '1');

    // Now should be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('should validate tricks taken are within range', async () => {
    render(
      <RoundScoringForm
        players={mockPlayers}
        handCount={5}
        onScoresSubmit={mockOnScoresSubmit}
      />
    );

    const trickInputs = screen.getAllByPlaceholderText('0');

    // Enter tricks for all players with valid values
    await userEvent.type(trickInputs[0], '2');
    await userEvent.type(trickInputs[1], '3');
    await userEvent.type(trickInputs[2], '1');

    const submitButton = screen.getByText('Submit Scores');
    expect(submitButton).not.toBeDisabled();
  });

  test('should submit scores when all data is valid', async () => {
    render(
      <RoundScoringForm
        players={mockPlayers}
        handCount={5}
        onScoresSubmit={mockOnScoresSubmit}
      />
    );

    const trickInputs = screen.getAllByPlaceholderText('0');

    // Enter tricks for all players
    await userEvent.type(trickInputs[0], '2');
    await userEvent.type(trickInputs[1], '3');
    await userEvent.type(trickInputs[2], '1');

    // Also enter some bonus points
    const inputs = screen.getAllByRole('spinbutton');
    const bonusInputs = inputs.slice(3);
    await userEvent.type(bonusInputs[0], '5');

    const submitButton = screen.getByText('Submit Scores');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnScoresSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          '1': { tricksTaken: 2, bonusPoints: 5 },
          '2': { tricksTaken: 3, bonusPoints: 0 },
          '3': { tricksTaken: 1, bonusPoints: 0 },
        })
      );
    });
  });

  test('should show error when tricks exceed hand count', async () => {
    render(
      <RoundScoringForm
        players={mockPlayers}
        handCount={5}
        onScoresSubmit={mockOnScoresSubmit}
      />
    );

    const trickInputs = screen.getAllByPlaceholderText('0');

    // Enter tricks for first two players validly
    await userEvent.type(trickInputs[0], '2');
    await userEvent.type(trickInputs[1], '3');

    // Try to enter invalid value for third player (exceeds hand count)
    await userEvent.type(trickInputs[2], '10');

    const submitButton = screen.getByText('Submit Scores');
    fireEvent.click(submitButton);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/fix all errors/i)).toBeInTheDocument();
    });

    expect(mockOnScoresSubmit).not.toHaveBeenCalled();
  });
});
