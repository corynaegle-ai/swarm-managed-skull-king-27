import React, { useState, useEffect } from 'react';
import { Player, GameState } from '../types/gameTypes';

interface ScoringInput {
  playerId: string;
  tricksTaken: number | null;
  bonusPoints: number;
}

interface RoundScoringInterfaceProps {
  gameState: GameState;
  onSubmitScores: (scores: ScoringInput[]) => void;
  onCancel: () => void;
}

const RoundScoringInterface: React.FC<RoundScoringInterfaceProps> = ({
  gameState,
  onSubmitScores,
  onCancel,
}) => {
  const [scores, setScores] = useState<Map<string, ScoringInput>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  // Initialize scores state with players from current round
  useEffect(() => {
    const initialScores = new Map<string, ScoringInput>();
    gameState.players.forEach((player) => {
      initialScores.set(player.id, {
        playerId: player.id,
        tricksTaken: null,
        bonusPoints: 0,
      });
    });
    setScores(initialScores);
    setErrors(new Map());
  }, [gameState.players]);

  /**
   * Calculate the score for a player based on their bid and tricks taken
   * Scoring logic: 10 points per correct trick, -5 per trick off
   */
  const calculatePlayerScore = (
    bid: number,
    tricksTaken: number,
    bonusPoints: number
  ): number => {
    if (bid === tricksTaken) {
      return 10 * bid + bonusPoints;
    }
    const diff = Math.abs(bid - tricksTaken);
    return -5 * diff + bonusPoints;
  };

  /**
   * Get the current bid for a player in this round
   */
  const getPlayerBid = (playerId: string): number => {
    const currentRound = gameState.rounds[gameState.currentRoundIndex];
    const bid = currentRound.bids.find((b) => b.playerId === playerId);
    return bid?.bid ?? 0;
  };

  /**
   * Get the hand count (max tricks possible) for this round
   */
  const getHandCount = (): number => {
    const currentRound = gameState.rounds[gameState.currentRoundIndex];
    return currentRound.handCount || 0;
  };

  /**
   * Handle tricks taken input change
   */
  const handleTricksTakenChange = (playerId: string, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    const handCount = getHandCount();
    const newErrors = new Map(errors);

    // Validate tricks taken
    if (numValue !== null) {
      if (numValue < 0 || numValue > handCount) {
        newErrors.set(
          playerId,
          `Tricks taken must be between 0 and ${handCount}`
        );
      } else {
        newErrors.delete(playerId);
      }
    } else {
      newErrors.delete(playerId);
    }

    const updatedScores = new Map(scores);
    const current = updatedScores.get(playerId)!;
    updatedScores.set(playerId, {
      ...current,
      tricksTaken: numValue,
    });

    setScores(updatedScores);
    setErrors(newErrors);
  };

  /**
   * Handle bonus points input change
   */
  const handleBonusPointsChange = (playerId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    const newErrors = new Map(errors);

    // Validate bonus points (must be non-negative)
    if (numValue < 0) {
      newErrors.set(playerId, 'Bonus points cannot be negative');
    } else {
      newErrors.delete(playerId);
    }

    const updatedScores = new Map(scores);
    const current = updatedScores.get(playerId)!;
    updatedScores.set(playerId, {
      ...current,
      bonusPoints: numValue,
    });

    setScores(updatedScores);
    setErrors(newErrors);
  };

  /**
   * Check if all required data has been entered
   */
  const isAllDataEntered = (): boolean => {
    for (const [, scoringInput] of scores) {
      if (scoringInput.tricksTaken === null) {
        return false;
      }
    }
    return errors.size === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    if (!isAllDataEntered()) {
      return;
    }
    onSubmitScores(Array.from(scores.values()));
  };

  const handCount = getHandCount();

  return (
    <div className="round-scoring-interface">
      <h2>Round {gameState.currentRoundIndex + 1} - Enter Scores</h2>
      <div className="scoring-table">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Bid</th>
              <th>Tricks Taken</th>
              <th>Bonus Points</th>
              <th>Round Score</th>
            </tr>
          </thead>
          <tbody>
            {gameState.players.map((player) => {
              const scoringInput = scores.get(player.id);
              const bid = getPlayerBid(player.id);
              const tricksTaken = scoringInput?.tricksTaken;
              const bonusPoints = scoringInput?.bonusPoints ?? 0;
              const roundScore =
                tricksTaken !== null
                  ? calculatePlayerScore(bid, tricksTaken, bonusPoints)
                  : null;
              const playerError = errors.get(player.id);

              return (
                <tr key={player.id} className={playerError ? 'error-row' : ''}>
                  <td>{player.name}</td>
                  <td>{bid}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={handCount}
                      value={tricksTaken ?? ''}
                      onChange={(e) =>
                        handleTricksTakenChange(player.id, e.target.value)
                      }
                      placeholder="0"
                      aria-label={`Tricks taken for ${player.name}`}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={bonusPoints}
                      onChange={(e) =>
                        handleBonusPointsChange(player.id, e.target.value)
                      }
                      placeholder="0"
                      aria-label={`Bonus points for ${player.name}`}
                    />
                  </td>
                  <td>
                    {roundScore !== null ? (
                      <span className={roundScore >= 0 ? 'positive' : 'negative'}>
                        {roundScore}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {errors.size > 0 && (
          <div className="error-messages">
            {Array.from(errors.values()).map((error, idx) => (
              <div key={idx} className="error-message">
                {error}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="button-group">
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isAllDataEntered()}
          className="submit-btn"
          aria-label="Submit scores for this round"
        >
          Submit Scores
        </button>
      </div>
    </div>
  );
};

export default RoundScoringInterface;
