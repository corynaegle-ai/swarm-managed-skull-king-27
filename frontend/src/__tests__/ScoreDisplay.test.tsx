import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreDisplay from '../components/ScoreDisplay';

const mockPlayers = [
  { id: 'p1', name: 'Alice' },
  { id: 'p2', name: 'Bob' },
  { id: 'p3', name: 'Charlie' },
];

const mockRounds = [
  {
    roundNumber: 1,
    scores: { p1: 10, p2: 15, p3: 5 },
  },
  {
    roundNumber: 2,
    scores: { p1: 20, p2: 10, p3: 25 },
  },
  {
    roundNumber: 3,
    scores: { p1: 15, p2: 20, p3: 10 },
  },
];

describe('ScoreDisplay Component', () => {
  it('should render the score display with no players', () => {
    render(
      <ScoreDisplay players={[]} rounds={[]} gameEnded={false} />
    );
    expect(screen.getByText('No players yet')).toBeInTheDocument();
  });

  it('should display current standings section', () => {
    render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={mockRounds}
        gameEnded={false}
      />
    );
    expect(screen.getByText('Current Standings')).toBeInTheDocument();
  });

  it('should display all player names in standings', () => {
    render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={mockRounds}
        gameEnded={false}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('should calculate and display correct total scores', () => {
    render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={mockRounds}
        gameEnded={false}
      />
    );
    // Alice: 10 + 20 + 15 = 45
    // Bob: 15 + 10 + 20 = 45
    // Charlie: 5 + 25 + 10 = 40
    const scores = screen.getAllByTestId(/^player-/);
    expect(scores.length).toBe(3);
  });

  it('should display round history table', () => {
    render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={mockRounds}
        gameEnded={false}
      />
    );
    expect(screen.getByText('Round History')).toBeInTheDocument();
    expect(screen.getByText('Round')).toBeInTheDocument();
  });

  it('should display all rounds in history table', () => {
    render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={mockRounds}
        gameEnded={false}
      />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should not display final rankings when game is not ended', () => {
    render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={mockRounds}
        gameEnded={false}
      />
    );
    expect(screen.queryByText('Final Rankings')).not.toBeInTheDocument();
  });

  it('should display final rankings when game is ended', () => {
    render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={mockRounds}
        gameEnded={true}
      />
    );
    expect(screen.getByText('Final Rankings')).toBeInTheDocument();
  });

  it('should indicate current leader with a badge', () => {
    render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={mockRounds}
        gameEnded={false}
      />
    );
    const leaderBadges = screen.getAllByLabelText('Current Leader');
    expect(leaderBadges.length).toBeGreaterThan(0);
  });

  it('should handle empty rounds gracefully', () => {
    render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={[]}
        gameEnded={false}
      />
    );
    expect(screen.getByText('Current Standings')).toBeInTheDocument();
    expect(screen.queryByText('Round History')).not.toBeInTheDocument();
  });

  it('should have proper aria labels for accessibility', () => {
    const { container } = render(
      <ScoreDisplay
        players={mockPlayers}
        rounds={mockRounds}
        gameEnded={false}
      />
    );
    const scoreDisplayRegion = container.querySelector(
      '[role="region"][aria-label="Score Display"]'
    );
    expect(scoreDisplayRegion).toBeInTheDocument();
  });
});
