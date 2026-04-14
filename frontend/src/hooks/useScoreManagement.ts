import { useCallback } from 'react';

interface PlayerScore {
  id: string;
  name: string;
  totalScore: number;
}

interface Round {
  roundNumber: number;
  scores: { [playerId: string]: number };
}

export const useScoreManagement = () => {
  /**
   * Calculate total score for a player across all rounds
   */
  const getTotalScore = useCallback(
    (playerId: string, rounds: Round[]): number => {
      if (!playerId || !rounds || rounds.length === 0) {
        return 0;
      }

      try {
        return rounds.reduce((total, round) => {
          const roundScore = round.scores?.[playerId] ?? 0;
          return total + (typeof roundScore === 'number' ? roundScore : 0);
        }, 0);
      } catch (error) {
        console.error('Error calculating total score:', error);
        return 0;
      }
    },
    []
  );

  /**
   * Get the ID of the current leader
   */
  const getLeaderId = useCallback(
    (totalScores: PlayerScore[]): string | null => {
      if (!totalScores || totalScores.length === 0) {
        return null;
      }

      try {
        let maxScore = -Infinity;
        let leaderId: string | null = null;

        for (const player of totalScores) {
          if (
            player.totalScore > maxScore ||
            (player.totalScore === maxScore &&
              (leaderId === null || player.id < leaderId))
          ) {
            maxScore = player.totalScore;
            leaderId = player.id;
          }
        }

        return leaderId;
      } catch (error) {
        console.error('Error determining leader:', error);
        return null;
      }
    },
    []
  );

  /**
   * Get ranked list of players sorted by total score (descending)
   */
  const getRankings = useCallback(
    (totalScores: PlayerScore[]): PlayerScore[] => {
      if (!totalScores || totalScores.length === 0) {
        return [];
      }

      try {
        return [...totalScores].sort((a, b) => {
          // Sort by score descending, then by name for ties
          if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore;
          }
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        console.error('Error calculating rankings:', error);
        return [];
      }
    },
    []
  );

  /**
   * Get score for a specific player in a specific round
   */
  const getRoundScore = useCallback(
    (playerId: string, roundNumber: number, rounds: Round[]): number => {
      if (!playerId || roundNumber < 1 || !rounds) {
        return 0;
      }

      try {
        const round = rounds.find((r) => r.roundNumber === roundNumber);
        return round?.scores?.[playerId] ?? 0;
      } catch (error) {
        console.error('Error getting round score:', error);
        return 0;
      }
    },
    []
  );

  /**
   * Get running total score up to and including a specific round
   */
  const getRunningTotal = useCallback(
    (playerId: string, upToRound: number, rounds: Round[]): number => {
      if (!playerId || upToRound < 1 || !rounds || rounds.length === 0) {
        return 0;
      }

      try {
        return rounds
          .filter((r) => r.roundNumber <= upToRound)
          .reduce((total, round) => {
            const roundScore = round.scores?.[playerId] ?? 0;
            return total + (typeof roundScore === 'number' ? roundScore : 0);
          }, 0);
      } catch (error) {
        console.error('Error calculating running total:', error);
        return 0;
      }
    },
    []
  );

  return {
    getTotalScore,
    getLeaderId,
    getRankings,
    getRoundScore,
    getRunningTotal,
  };
};
