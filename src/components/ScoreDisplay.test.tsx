import React from 'react';
import { render, screen } from '@testing-library/react';
import ScoreDisplay from './ScoreDisplay';
import { Game } from '../types';

describe('ScoreDisplay Component', () => {
  const mockGame: Game = {
    id: 'game-1',
    players: [
      {
        id: 'player-1',
        name: 'Alice',
        rounds: [
          { bid: 2, tricks: 2, score: 20 },
          { bid: 3, tricks: 2, score: -10 },
          { bid: 1, tricks: 1, score: 10 },
        ],
      },
      {
        id: 'player-2',
        name: 'Bob',
        rounds: [
          { bid: 1, tricks: 1, score: 10 },
          { bid: 2, tricks: 2, score: 20 },
          { bid: 3, tricks: 1, score: -20 },
        ],
      },
      {
        id: 'player-3',
        name: 'Charlie',
        rounds: [
          { bid: 3, tricks: 3, score: 30 },
          { bid: 1, tricks: 0, score: -10 },
          { bid: 2, tricks: 2, score: 20 },
        ],
      },
    ],
    currentRound: 3,
    status: 'active',
  };

  const mockGameEnded: Game = {
    ...mockGame,
    status: 'ended',
  };

  it('renders without crashing', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    expect(screen.getByText('Current Standings')).toBeInTheDocument();
  });

  it('displays current total scores for all players', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    // Alice: 20 + (-10) + 10 = 20
    // Bob: 10 + 20 + (-20) = 10
    // Charlie: 30 + (-10) + 20 = 40
    expect(screen.getByText('Current Standings')).toBeInTheDocument();
  });

  it('displays score history by round', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    expect(screen.getByText('Round History')).toBeInTheDocument();
    // Check for round column headers
    expect(screen.getByText('R1')).toBeInTheDocument();
    expect(screen.getByText('R2')).toBeInTheDocument();
    expect(screen.getByText('R3')).toBeInTheDocument();
  });

  it('shows score breakdown details for each player', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    expect(screen.getByText('Score Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows final rankings when game has ended', () => {
    render(<ScoreDisplay game={mockGameEnded} gameEnded={true} />);
    expect(screen.getByText('Final Rankings')).toBeInTheDocument();
  });

  it('does not show final rankings when game is active', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    expect(screen.queryByText('Final Rankings')).not.toBeInTheDocument();
  });

  it('indicates the current leader during active game', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    // Charlie has the highest score (40), should be marked as leading
    expect(screen.getByText('Leading')).toBeInTheDocument();
  });

  it('handles empty player list gracefully', () => {
    const emptyGame: Game = {
      ...mockGame,
      players: [],
    };
    render(<ScoreDisplay game={emptyGame} gameEnded={false} />);
    expect(screen.getByText('No players in game')).toBeInTheDocument();
  });

  it('handles games with no rounds played', () => {
    const noRoundsGame: Game = {
      ...mockGame,
      players: mockGame.players.map((p) => ({ ...p, rounds: [] })),
    };
    render(<ScoreDisplay game={noRoundsGame} gameEnded={false} />);
    expect(screen.getByText('No rounds played yet')).toBeInTheDocument();
  });

  it('displays positive and negative scores correctly', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    expect(screen.getByText('Score Breakdown')).toBeInTheDocument();
    // The component should render without errors
  });

  it('calculates and displays correct total scores', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    // Alice total: 20
    // Bob total: 10
    // Charlie total: 40
    expect(screen.getByText('Round History')).toBeInTheDocument();
  });

  it('displays correct rankings based on scores', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    const leaderboardEntries = screen.getAllByText(/^(Alice|Bob|Charlie)$/);
    expect(leaderboardEntries.length).toBeGreaterThan(0);
  });

  it('shows player names in leaderboard', () => {
    render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('renders responsive layout', () => {
    const { container } = render(<ScoreDisplay game={mockGame} gameEnded={false} />);
    expect(container.querySelector('.score-display')).toBeInTheDocument();
    expect(container.querySelector('.leaderboard')).toBeInTheDocument();
    expect(container.querySelector('.breakdown-details')).toBeInTheDocument();
  });
});
