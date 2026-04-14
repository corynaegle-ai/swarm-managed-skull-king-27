import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScoreDisplay from '../ScoreDisplay';

describe('ScoreDisplay Component', () => {
  const mockPlayers = [
    { id: '1', name: 'Alice', totalScore: 150 },
    { id: '2', name: 'Bob', totalScore: 120 },
    { id: '3', name: 'Charlie', totalScore: 140 },
  ];

  const mockRoundScores = [
    { playerId: '1', roundNumber: 1, score: 50 },
    { playerId: '1', roundNumber: 2, score: 45 },
    { playerId: '1', roundNumber: 3, score: 55 },
    { playerId: '2', roundNumber: 1, score: 40 },
    { playerId: '2', roundNumber: 2, score: 35 },
    { playerId: '2', roundNumber: 3, score: 45 },
    { playerId: '3', roundNumber: 1, score: 48 },
    { playerId: '3', roundNumber: 2, score: 42 },
    { playerId: '3', roundNumber: 3, score: 50 },
  ];

  describe('Acceptance Criterion 1: Shows current total scores for all players', () => {
    it('should display all player names and their total scores', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      // Check all players are displayed
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();

      // Check total scores are displayed
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('140')).toBeInTheDocument();
    });

    it('should handle empty player list gracefully', () => {
      const { container } = render(
        <ScoreDisplay players={[]} roundScores={[]} />
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Game Standings')).toBeInTheDocument();
    });

    it('should display scores in sorted order (highest first)', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      const rankBadges = screen.getAllByText(/^\d+$/);
      expect(rankBadges[0]).toHaveTextContent('1');
      expect(rankBadges[1]).toHaveTextContent('2');
      expect(rankBadges[2]).toHaveTextContent('3');
    });
  });

  describe('Acceptance Criterion 2: Displays score history by round', () => {
    it('should show expandable round history when player row is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      const aliceRow = screen.getByText('Alice').closest('.standings-row');
      expect(aliceRow).toBeInTheDocument();

      // Initially, round history should not be visible
      expect(screen.queryByText('Round')).not.toBeInTheDocument();

      // Click to expand
      await user.click(aliceRow!);

      // Now round history should be visible
      expect(screen.getByText('Round')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display round-by-round scores with cumulative totals', async () => {
      const user = userEvent.setup();
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      const aliceRow = screen.getByText('Alice').closest('.standings-row');
      await user.click(aliceRow!);

      // Check for round scores
      const expandedSection = screen.getByText('Round').closest(
        '.round-history-expanded'
      );
      expect(expandedSection).toBeInTheDocument();
    });

    it('should show score breakdown table on desktop view', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      // Check for breakdown section
      expect(screen.getByText('Score Breakdown by Round')).toBeInTheDocument();
    });
  });

  describe('Acceptance Criterion 3: Shows final rankings at game end', () => {
    it('should display final rankings when game is ended', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          isGameEnded={true}
        />
      );

      expect(screen.getByText('Final Rankings')).toBeInTheDocument();
      expect(screen.getByText(/wins with/)).toBeInTheDocument();
    });

    it('should show game status message with winner name and score', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          isGameEnded={true}
        />
      );

      expect(screen.getByText(/Alice wins with 150 points/)).toBeInTheDocument();
    });

    it('should display tied winner message when there is a tie', () => {
      const tiedPlayers = [
        { id: '1', name: 'Alice', totalScore: 150 },
        { id: '2', name: 'Bob', totalScore: 150 },
      ];

      render(
        <ScoreDisplay
          players={tiedPlayers}
          roundScores={[]}
          isGameEnded={true}
        />
      );

      expect(screen.getByText(/are tied for the win/)).toBeInTheDocument();
    });
  });

  describe('Acceptance Criterion 4: Clearly indicates current leader', () => {
    it('should highlight the leader with visual indicator', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      const leaderBadge = screen.getByText('(Leader)');
      expect(leaderBadge).toBeInTheDocument();
      expect(leaderBadge).toHaveClass('leader-badge');
    });

    it('should show (Tied) indicator when leader is tied with another player', () => {
      const tiedPlayers = [
        { id: '1', name: 'Alice', totalScore: 150 },
        { id: '2', name: 'Bob', totalScore: 150 },
        { id: '3', name: 'Charlie', totalScore: 140 },
      ];

      render(
        <ScoreDisplay
          players={tiedPlayers}
          roundScores={[]}
          currentRound={3}
        />
      );

      expect(screen.getByText('(Tied)')).toBeInTheDocument();
    });

    it('should style leader row differently from other rows', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      const leaderRow = screen.getByText('Alice').closest('.standings-row');
      expect(leaderRow).toHaveClass('is-leader');
    });
  });

  describe('Acceptance Criterion 5: Responsive design works on mobile devices', () => {
    it('should render component structure on mobile viewport', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      const { container } = render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      expect(container.querySelector('.score-display-container')).toBeInTheDocument();
      expect(screen.getByText('Game Standings')).toBeInTheDocument();
    });

    it('should maintain accessibility on mobile', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      // Check that all critical information is still accessible
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should be clickable on touch devices', async () => {
      const user = userEvent.setup();
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={3}
        />
      );

      const aliceRow = screen.getByText('Alice').closest('.standings-row');
      await user.click(aliceRow!);

      // Should be able to expand on mobile
      expect(screen.getByText('Round')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Additional Tests', () => {
    it('should handle players with zero score', () => {
      const playersWithZero = [
        { id: '1', name: 'Alice', totalScore: 100 },
        { id: '2', name: 'Bob', totalScore: 0 },
      ];

      render(
        <ScoreDisplay
          players={playersWithZero}
          roundScores={[]}
          currentRound={1}
        />
      );

      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative scores', () => {
      const scoresWithNegative = [
        { playerId: '1', roundNumber: 1, score: -10 },
        { playerId: '1', roundNumber: 2, score: 50 },
      ];
      const playersNegative = [
        { id: '1', name: 'Alice', totalScore: 40 },
      ];

      render(
        <ScoreDisplay
          players={playersNegative}
          roundScores={scoresWithNegative}
          currentRound={2}
        />
      );

      expect(screen.getByText('40')).toBeInTheDocument();
    });

    it('should display current round number when game is ongoing', () => {
      render(
        <ScoreDisplay
          players={mockPlayers}
          roundScores={mockRoundScores}
          currentRound={2}
          isGameEnded={false}
        />
      );

      expect(screen.getByText('Round 2')).toBeInTheDocument();
    });
  });
});
