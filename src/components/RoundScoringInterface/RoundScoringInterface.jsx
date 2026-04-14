import React, { useState, useEffect } from 'react';
import './RoundScoringInterface.css';
import { calculateRoundScore } from '../../utils/scoringCalculator';

const RoundScoringInterface = ({
  players,
  bids,
  handCount,
  currentRound,
  onSubmitScores,
  onCancel,
}) => {
  // Initialize state with empty scores for each player
  const [scoreData, setScoreData] = useState(() => {
    return players.reduce((acc, player) => {
      acc[player.id] = {
        playerId: player.id,
        playerName: player.name,
        bid: bids[player.id] || 0,
        tricksTaken: '',
        bonusPoints: 0,
        calculatedScore: 0,
      };
      return acc;
    }, {});
  });

  const [errors, setErrors] = useState({});

  // Calculate scores in real-time as data changes
  useEffect(() => {
    const newScoreData = { ...scoreData };
    const newErrors = {};

    Object.keys(newScoreData).forEach((playerId) => {
      const data = newScoreData[playerId];
      
      // Validate tricks taken
      if (data.tricksTaken === '') {
        newErrors[`${playerId}_tricks`] = 'Tricks taken is required';
      } else if (isNaN(data.tricksTaken) || data.tricksTaken < 0 || data.tricksTaken > handCount) {
        newErrors[`${playerId}_tricks`] = `Tricks must be between 0 and ${handCount}`;
      } else {
        delete newErrors[`${playerId}_tricks`];
      }

      // Validate bonus points
      if (isNaN(data.bonusPoints) || data.bonusPoints < 0) {
        newErrors[`${playerId}_bonus`] = 'Bonus points must be 0 or greater';
      } else {
        delete newErrors[`${playerId}_bonus`];
      }

      // Calculate score if all data is valid
      if (data.tricksTaken !== '' && !newErrors[`${playerId}_tricks`] && !newErrors[`${playerId}_bonus`]) {
        data.calculatedScore = calculateRoundScore({
          bid: data.bid,
          tricksTaken: parseInt(data.tricksTaken, 10),
          bonusPoints: parseInt(data.bonusPoints, 10),
        });
      }
    });

    setScoreData(newScoreData);
    setErrors(newErrors);
  }, [scoreData.tricksTaken, scoreData.bonusPoints]); // Only recalculate on tricks/bonus changes

  const handleTricksTakenChange = (playerId, value) => {
    setScoreData((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        tricksTaken: value,
      },
    }));
  };

  const handleBonusPointsChange = (playerId, value) => {
    setScoreData((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        bonusPoints: isNaN(value) ? 0 : parseInt(value, 10),
      },
    }));
  };

  const isAllDataEntered = () => {
    return Object.keys(scoreData).every((playerId) => {
      const data = scoreData[playerId];
      return data.tricksTaken !== '' && !errors[`${playerId}_tricks`] && !errors[`${playerId}_bonus`];
    });
  };

  const handleSubmit = () => {
    if (!isAllDataEntered()) {
      setErrors((prev) => ({
        ...prev,
        submit: 'All player data must be entered before submitting',
      }));
      return;
    }

    const scores = Object.values(scoreData).map((data) => ({
      playerId: data.playerId,
      bid: data.bid,
      tricksTaken: parseInt(data.tricksTaken, 10),
      bonusPoints: parseInt(data.bonusPoints, 10),
      score: data.calculatedScore,
    }));

    onSubmitScores(scores);
  };

  return (
    <div className="round-scoring-interface">
      <div className="scoring-header">
        <h2>Round {currentRound} Scoring</h2>
        <p>Hand size: {handCount} cards</p>
      </div>

      <div className="scoring-table-container">
        <table className="scoring-table">
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
            {players.map((player) => {
              const data = scoreData[player.id];
              const hasErrors = errors[`${player.id}_tricks`] || errors[`${player.id}_bonus`];
              return (
                <tr key={player.id} className={hasErrors ? 'row-error' : ''}>
                  <td className="player-name">{data.playerName}</td>
                  <td className="bid-cell">{data.bid}</td>
                  <td className="tricks-cell">
                    <input
                      type="number"
                      min="0"
                      max={handCount}
                      value={data.tricksTaken}
                      onChange={(e) => handleTricksTakenChange(player.id, e.target.value)}
                      placeholder="0"
                      className={errors[`${player.id}_tricks`] ? 'input-error' : ''}
                      aria-label={`Tricks taken for ${data.playerName}`}
                    />
                    {errors[`${player.id}_tricks`] && (
                      <span className="error-message">{errors[`${player.id}_tricks`]}</span>
                    )}
                  </td>
                  <td className="bonus-cell">
                    <input
                      type="number"
                      min="0"
                      value={data.bonusPoints}
                      onChange={(e) => handleBonusPointsChange(player.id, e.target.value)}
                      placeholder="0"
                      className={errors[`${player.id}_bonus`] ? 'input-error' : ''}
                      aria-label={`Bonus points for ${data.playerName}`}
                    />
                    {errors[`${player.id}_bonus`] && (
                      <span className="error-message">{errors[`${player.id}_bonus`]}</span>
                    )}
                  </td>
                  <td className="score-cell">
                    <span className={`score-value ${data.calculatedScore >= 0 ? 'positive' : 'negative'}`}>
                      {data.calculatedScore}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {errors.submit && (
        <div className="submit-error">
          {errors.submit}
        </div>
      )}

      <div className="button-group">
        <button
          className="btn btn-submit"
          onClick={handleSubmit}
          disabled={!isAllDataEntered()}
          aria-label="Submit scores for this round"
        >
          Submit Scores
        </button>
        <button
          className="btn btn-cancel"
          onClick={onCancel}
          aria-label="Cancel scoring"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RoundScoringInterface;
