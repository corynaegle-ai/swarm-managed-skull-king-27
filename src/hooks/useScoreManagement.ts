import { useState, useCallback } from 'react';
import { Player, RoundScore } from '../types';

interface UseScoreManagementReturn {
  roundScores: RoundScore[][];
  currentRound: number;
  isGameEnd: boolean;
  addRoundScores: (round: number, scores: RoundScore[]) => void;
  completeGame: () => void;
  resetScores: () => void;
  getTotalScore: (playerId: string) => number;
}

/**
 * Hook for managing score data throughout the game lifecycle
 */
export const useScoreManagement = (players: Player[]): UseScoreManagementReturn => {
  const [roundScores, setRoundScores] = useState<RoundScore[][]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [isGameEnd, setIsGameEnd] = useState(false);

  const addRoundScores = useCallback(
    (round: number, scores: RoundScore[]) => {
      setRoundScores((prev) => {
        const updated = [...prev];
        updated[round - 1] = scores;
        return updated;
      });
      setCurrentRound(round + 1);
    },
    []
  );

  const completeGame = useCallback(() => {
    setIsGameEnd(true);
  }, []);

  const resetScores = useCallback(() => {
    setRoundScores([]);
    setCurrentRound(1);
    setIsGameEnd(false);
  }, []);

  const getTotalScore = useCallback(
    (playerId: string): number => {
      return roundScores
        .flatMap((round) => round)
        .filter((score) => score.playerId === playerId)
        .reduce((sum, score) => sum + score.score, 0);
    },
    [roundScores]
  );

  return {
    roundScores,
    currentRound,
    isGameEnd,
    addRoundScores,
    completeGame,
    resetScores,
    getTotalScore,
  };
};
