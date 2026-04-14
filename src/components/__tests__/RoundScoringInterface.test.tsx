import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoundScoringInterface from '../RoundScoringInterface';
import { GameState } from '../../types/gameTypes';

describe('RoundScoringInterface', () => {
  const mockGameState: GameState = {
    id: 'game-1',
    players: [
      { id: 'p1', name: 'Player 1', totalScore: 0 },
      { id: 'p2', name: 'Player 2', totalScore: 0 },
      { id: 'p3', name: 'Player 3', totalScore: 0 },
    ],
    rounds: [
      {
        roundNumber: 1,
        handCount: 5,
        bids: [
          { playerId: 'p1', bid: 2 },
          { playerId: 'p2', bid: 3 },
          { playerId: 'p3', bid: 1 },
        ],
        results: [],
        completed: false,
      },
    ],
    currentRoundIndex: 0,
    gameCompleted: false,
  };

  const mockOnSubmitScores = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Acceptance Criterion 1: Shows each player's bid clearly during scoring
  describe('AC1: Shows each player\'s bid clearly during scoring', () => {
    it('should display each player\'s name and bid', () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      // Check that all player names are displayed
      expect(screen.getByText('Player 1')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
      expect(screen.getByText('Player 3')).toBeInTheDocument();

      // Check that all bids are displayed
      const bidCells = screen.getAllByText(/^[0-9]$/);
      expect(bidCells.length).toBeGreaterThanOrEqual(3);
    });

    it('should display bids in the table', () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      // Check for header "Bid"
      expect(screen.getByText('Bid')).toBeInTheDocument();
    });
  });

  // Acceptance Criterion 2: Allows entry of tricks taken (0 to hand count)
  describe('AC2: Allows entry of tricks taken (0 to hand count)', () => {
    it('should have input fields for tricks taken', () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      expect(trickInputs).toHaveLength(3);
    });

    it('should accept valid tricks taken values (0 to hand count)', async () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      const firstInput = trickInputs[0] as HTMLInputElement;

      await userEvent.clear(firstInput);
      await userEvent.type(firstInput, '2');
      expect(firstInput.value).toBe('2');
    });

    it('should enforce min/max constraints on tricks taken', () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      const firstInput = trickInputs[0] as HTMLInputElement;

      expect(firstInput).toHaveAttribute('min', '0');
      expect(firstInput).toHaveAttribute('max', '5');
    });

    it('should reject tricks taken outside valid range', async () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      const firstInput = trickInputs[0] as HTMLInputElement;

      await userEvent.clear(firstInput);
      await userEvent.type(firstInput, '10');
      fireEvent.blur(firstInput);

      await waitFor(() => {
        expect(
          screen.getByText(/Tricks taken must be between 0 and 5/)
        ).toBeInTheDocument();
      });
    });
  });

  // Acceptance Criterion 3: Allows entry of bonus points (defaults to 0)
  describe('AC3: Allows entry of bonus points (defaults to 0)', () => {
    it('should have input fields for bonus points', () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const bonusInputs = screen.getAllByLabelText(/Bonus points for/);
      expect(bonusInputs).toHaveLength(3);
    });

    it('should default bonus points to 0', () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const bonusInputs = screen.getAllByLabelText(
        /Bonus points for/
      ) as HTMLInputElement[];
      bonusInputs.forEach((input) => {
        expect(input.value).toBe('0');
      });
    });

    it('should allow entry of bonus points', async () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const bonusInputs = screen.getAllByLabelText(/Bonus points for/);
      const firstInput = bonusInputs[0] as HTMLInputElement;

      await userEvent.clear(firstInput);
      await userEvent.type(firstInput, '5');
      expect(firstInput.value).toBe('5');
    });
  });

  // Acceptance Criterion 4: Calculates scores in real-time as data is entered
  describe('AC4: Calculates scores in real-time as data is entered', () => {
    it('should display round score column', () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Round Score')).toBeInTheDocument();
    });

    it('should calculate score correctly when bid equals tricks taken', async () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      // Player 1 bid is 2, so if they take 2 tricks, score = 10 * 2 = 20
      await userEvent.clear(trickInputs[0]);
      await userEvent.type(trickInputs[0], '2');

      const bonusInputs = screen.getAllByLabelText(/Bonus points for/);
      await userEvent.clear(bonusInputs[0]);
      await userEvent.type(bonusInputs[0], '0');

      // The score should be displayed and equal to 20
      await waitFor(() => {
        expect(screen.getByText('20')).toBeInTheDocument();
      });
    });

    it('should calculate score correctly when bid differs from tricks taken', async () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      // Player 1 bid is 2, but they take 0 tricks, so score = -5 * 2 = -10
      await userEvent.clear(trickInputs[0]);
      await userEvent.type(trickInputs[0], '0');

      const bonusInputs = screen.getAllByLabelText(/Bonus points for/);
      await userEvent.clear(bonusInputs[0]);
      await userEvent.type(bonusInputs[0], '0');

      await waitFor(() => {
        expect(screen.getByText('-10')).toBeInTheDocument();
      });
    });

    it('should include bonus points in score calculation', async () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      const bonusInputs = screen.getAllByLabelText(/Bonus points for/);

      // Player 1 bid is 2, takes 2 tricks (20 points) + 10 bonus = 30
      await userEvent.clear(trickInputs[0]);
      await userEvent.type(trickInputs[0], '2');
      await userEvent.clear(bonusInputs[0]);
      await userEvent.type(bonusInputs[0], '10');

      await waitFor(() => {
        expect(screen.getByText('30')).toBeInTheDocument();
      });
    });
  });

  // Acceptance Criterion 5: Prevents advancing to next round until all data entered
  describe('AC5: Prevents advancing to next round until all data entered', () => {
    it('should have a submit button that is initially disabled', () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', {
        name: /Submit Scores/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button only when all tricks taken are filled', async () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      const bonusInputs = screen.getAllByLabelText(/Bonus points for/);
      const submitButton = screen.getByRole('button', {
        name: /Submit Scores/i,
      });

      expect(submitButton).toBeDisabled();

      // Fill all tricks taken
      for (let i = 0; i < trickInputs.length; i++) {
        await userEvent.clear(trickInputs[i]);
        await userEvent.type(trickInputs[i], '0');
      }

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should disable submit button if any tricks taken becomes invalid', async () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      const submitButton = screen.getByRole('button', {
        name: /Submit Scores/i,
      });

      // Fill all tricks taken with valid values
      for (let i = 0; i < trickInputs.length; i++) {
        await userEvent.clear(trickInputs[i]);
        await userEvent.type(trickInputs[i], '0');
      }

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      // Now enter an invalid value
      await userEvent.clear(trickInputs[0]);
      await userEvent.type(trickInputs[0], '10');

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should call onSubmitScores when submit button is clicked with valid data', async () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const trickInputs = screen.getAllByLabelText(/Tricks taken for/);
      const submitButton = screen.getByRole('button', {
        name: /Submit Scores/i,
      });

      // Fill all tricks taken
      await userEvent.clear(trickInputs[0]);
      await userEvent.type(trickInputs[0], '2');
      await userEvent.clear(trickInputs[1]);
      await userEvent.type(trickInputs[1], '3');
      await userEvent.clear(trickInputs[2]);
      await userEvent.type(trickInputs[2], '1');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmitScores).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              playerId: 'p1',
              tricksTaken: 2,
              bonusPoints: 0,
            }),
            expect.objectContaining({
              playerId: 'p2',
              tricksTaken: 3,
              bonusPoints: 0,
            }),
            expect.objectContaining({
              playerId: 'p3',
              tricksTaken: 1,
              bonusPoints: 0,
            }),
          ])
        );
      });
    });
  });

  describe('Cancel functionality', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(
        <RoundScoringInterface
          gameState={mockGameState}
          onSubmitScores={mockOnSubmitScores}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});
