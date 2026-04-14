import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RoundScoringView } from './RoundScoringView';
import { Round, Player } from '@/types/game';
import { setToastCallback } from '@/components/ui/use-toast';

const mockPlayers: Player[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
];

const mockRound: Round = {
  roundNumber: 1,
  bids: [
    { playerId: '1', amount: 2 },
    { playerId: '2', amount: 1 },
    { playerId: '3', amount: 0 },
  ],
};

describe('RoundScoringView', () => {
  let toastMessages: any[] = [];

  beforeEach(() => {
    toastMessages = [];
    setToastCallback((toast) => {
      toastMessages.push(toast);
    });
  });

  test('renders round scoring interface with player bids', () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    // Check title
    expect(screen.getByText('Round 1 Scoring')).toBeInTheDocument();

    // Check player names and bids are displayed
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();

    // Check bids are visible
    expect(screen.getByText('Bid: 2')).toBeInTheDocument();
    expect(screen.getByText('Bid: 1')).toBeInTheDocument();
    expect(screen.getByText('Bid: 0')).toBeInTheDocument();
  });

  test('allows entry of tricks taken', () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    const tricksInputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(tricksInputs[0], { target: { value: '2' } });

    expect(tricksInputs[0]).toHaveValue(2);
  });

  test('validates tricks taken within hand count', async () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    const tricksInputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(tricksInputs[0], { target: { value: '20' } });

    await waitFor(() => {
      expect(toastMessages.some((t) => t.title === 'Invalid tricks count')).toBe(true);
    });
  });

  test('allows entry of bonus points with default of 0', () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    // Bonus points inputs should have placeholder text
    const bonusInputs = screen.getAllByDisplayValue('0');
    expect(bonusInputs.length).toBeGreaterThanOrEqual(3); // At least one per player
  });

  test('calculates scores in real-time', async () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    const tricksInputs = screen.getAllByPlaceholderText('0');
    // Alice bid 2, enter 2 tricks -> score = 10 + 2 = 12
    fireEvent.change(tricksInputs[0], { target: { value: '2' } });

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  test('prevents advancing until all data entered', () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    const nextButton = screen.getByText('Next Round');
    expect(nextButton).toBeDisabled();

    // Fill in tricks for all players
    const tricksInputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(tricksInputs[0], { target: { value: '2' } });
    fireEvent.change(tricksInputs[1], { target: { value: '1' } });
    fireEvent.change(tricksInputs[2], { target: { value: '0' } });

    // Button should be enabled after all fields filled
    expect(nextButton).not.toBeDisabled();
  });

  test('shows validation error when trying to advance with incomplete data', async () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    const nextButton = screen.getByText('Next Round');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(toastMessages.some((t) => t.title === 'Incomplete scoring')).toBe(true);
    });
  });

  test('calls onNextRound with complete scoring data', async () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    const tricksInputs = screen.getAllByPlaceholderText('0');
    fireEvent.change(tricksInputs[0], { target: { value: '2' } });
    fireEvent.change(tricksInputs[1], { target: { value: '1' } });
    fireEvent.change(tricksInputs[2], { target: { value: '0' } });

    const nextButton = screen.getByText('Next Round');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(onNextRound).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ playerId: '1', tricksTaken: 2 }),
          expect.objectContaining({ playerId: '2', tricksTaken: 1 }),
          expect.objectContaining({ playerId: '3', tricksTaken: 0 }),
        ])
      );
    });
  });

  test('calls onCancel when cancel button is clicked', () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  test('calculates negative score when tricks do not match bid', async () => {
    const onNextRound = jest.fn();
    const onCancel = jest.fn();

    render(
      <RoundScoringView
        round={mockRound}
        players={mockPlayers}
        handCount={13}
        onNextRound={onNextRound}
        onCancel={onCancel}
      />
    );

    const tricksInputs = screen.getAllByPlaceholderText('0');
    // Alice bid 2, but enter 1 trick -> score = -2
    fireEvent.change(tricksInputs[0], { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByText('-2')).toBeInTheDocument();
    });
  });
});
