import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  ScoreDisplay,
  calculateTotalScore,
  calculateRankings,
  getCurrentLeader,
  Player,
} from './ScoreDisplay';

describe('ScoreDisplay Component', () => {
  const mockPlayers: Player[] = [
    {
      id: 'player-1',
      name: 'Alice',
      roundScores: [10, 20, 15],
    },
    {
      id: 'player-2',
      name: 'Bob',
      roundScores: [15, 15, 20],
    },
    {
      id: 'player-3',
      name: 'Charlie',
      roundScores: [5, 10, 8],
    },
  ];

  describe('calculateTotalScore', () => {
    it('should calculate total score correctly', () => {
      expect(calculateTotalScore([10, 20, 15])).toBe(45);
    });

    it('should handle empty array', () => {
      expect(calculateTotalScore([])).toBe(0);
    });

    it('should handle negative scores', () => {
      expect(calculateTotalScore([10, -5, 20])).toBe(25);
    });
  });

  describe('calculateRankings', () => {
    it('should calculate rankings based on total scores', () => {
      const rankings = calculateRankings(mockPlayers);
      expect(rankings).toHaveLength(3);
      expect(rankings[0].name).toBe('Bob');
      expect(rankings[0].rank).toBe(1);
      expect(rankings[0].totalScore).toBe(50);
    });

    it('should assign correct ranks in descending order', () => {
      const rankings = calculateRankings(mockPlayers);
      expect(rankings[0].rank).toBe(1);
      expect(rankings[1].rank).toBe(2);
      expect(rankings[2].rank).toBe(3);
    });

    it('should handle empty players array', () => {
      const rankings = calculateRankings([]);
      expect(rankings).toHaveLength(0);
    });
  });

  describe('getCurrentLeader', () => {
    it('should return player with highest score', () => {
      const leaderId = getCurrentLeader(mockPlayers);
      expect(leaderId).toBe('player-2'); // Bob has 50 points
    });

    it('should return null for empty players array', () => {
      const leaderId = getCurrentLeader([]);
      expect(leaderId).toBeNull();
    });

    it('should handle single player', () => {
      const leaderId = getCurrentLeader([mockPlayers[0]]);
      expect(leaderId).toBe('player-1');
    });
  });

  describe('ScoreDisplay Component Rendering', () => {
    it('should render current standings', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      expect(screen.getByText('Game Standings')).toBeInTheDocument();
      expect(screen.getByText('Current Standings')).toBeInTheDocument();
    });

    it('should display all player names in current standings', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should display total scores correctly', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      expect(screen.getByText('50')).toBeInTheDocument(); // Bob's total
      expect(screen.getByText('45')).toBeInTheDocument(); // Alice's total
      expect(screen.getByText('23')).toBeInTheDocument(); // Charlie's total
    });

    it('should display score history', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      expect(screen.getByText('Score History by Round')).toBeInTheDocument();
    });

    it('should display current round', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={2}
          gameEnded={false}
        />
      );
      expect(screen.getByText('Round 2')).toBeInTheDocument();
    });

    it('should display rankings when game ended', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={3}
          gameEnded={true}
        />
      );
      expect(screen.getByText('Final Rankings')).toBeInTheDocument();
    });

    it('should not display rankings when game not ended', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      expect(screen.queryByText('Final Rankings')).not.toBeInTheDocument();
    });

    it('should indicate current leader', () => {
      const { container } = render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      // Check for leader badge
      const leaderBadge = container.querySelector('.leader-badge');
      expect(leaderBadge).toBeInTheDocument();
    });

    it('should highlight current leader with special styling', () => {
      const { container } = render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      // Check for current-leader-highlight class
      const highlight = container.querySelector('.current-leader-highlight');
      expect(highlight).toBeInTheDocument();
    });

    it('should handle empty players array', () => {
      render(
        <ScoreDisplay
          players={[]}
          currentRound={1}
          gameEnded={false}
        />
      );
      expect(screen.getByText('Game Standings')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render with max-width constraint', () => {
      const { container } = render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      const scoreDisplay = container.querySelector('.score-display');
      expect(scoreDisplay).toHaveClass('max-w-6xl');
    });

    it('should render with padding for mobile', () => {
      const { container } = render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      const scoreDisplay = container.querySelector('.score-display');
      expect(scoreDisplay).toHaveClass('p-4');
    });

    it('should have scrollable score history on mobile', () => {
      const { container } = render(
        <ScoreDisplay
          players={mockPlayers}
          currentRound={1}
          gameEnded={false}
        />
      );
      const overflowContainer = container.querySelector('.overflow-x-auto');
      expect(overflowContainer).toBeInTheDocument();
    });
  });
});
