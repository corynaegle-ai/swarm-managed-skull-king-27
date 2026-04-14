import React, { useState, useEffect } from 'react';
import { calculateRoundScore } from '../utils/scoring';
import '../styles/RoundScoringInterface.css';

/**
 * RoundScoringInterface Component
 * Allows scorekeeper to enter actual tricks taken and bonus points
 * Calculates and displays scores in real-time
 */
const RoundScoringInterface = ({ players, hand, bids, onComplete }) => {
  const [tricks, setTricks] = useState({});
  const [bonusPoints, setBonusPoints] = useState({});
  const [scores, setScores] = useState({});
  const [allDataEntered, setAllDataEntered] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize tricks and bonus points with player data
  useEffect(() => {
    if (players && players.length > 0) {
      const initialTricks = {};
      const initialBonus = {};
      players.forEach((player) => {
        initialTricks[player.id] = '';
        initialBonus[player.id] = 0;
      });
      setTricks(initialTricks);
      setBonusPoints(initialBonus);
    }
  }, [players]);

  // Calculate scores in real-time whenever tricks or bonus points change
  useEffect(() => {
    if (players && bids) {
      const newScores = {};
      const newErrors = {};
      let allEntered = true;

      players.forEach((player) => {
        const tricksValue = tricks[player.id];
        const bid = bids[player.id];

        // Validate tricks entry
        if (tricksValue === '') {
          allEntered = false;
        } else {
          const tricksNum = parseInt(tricksValue, 10);
          
          // Validate tricks are within valid range
          if (isNaN(tricksNum) || tricksNum < 0 || tricksNum > hand) {
            newErrors[player.id] = `Tricks must be between 0 and ${hand}`;
            allEntered = false;
          } else {
            // Calculate score
            const bonus = bonusPoints[player.id] || 0;
            newScores[player.id] = calculateRoundScore(
              tricksNum,
              bid,
              bonus
            );
          }
        }
      });

      setScores(newScores);
      setErrors(newErrors);
      setAllDataEntered(allEntered && Object.keys(newErrors).length === 0);
    }
  }, [tricks, bonusPoints, players, bids, hand]);

  const handleTricksChange = (playerId, value) => {
    setTricks((prev) => ({
      ...prev,
      [playerId]: value,
    }));
  };

  const handleBonusChange = (playerId, value) => {
    const bonusValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(bonusValue) && bonusValue >= 0) {
      setBonusPoints((prev) => ({
        ...prev,
        [playerId]: bonusValue,
      }));
    }
  };

  const handleSubmit = () => {
    if (!allDataEntered) return;

    const roundScores = {};
    players.forEach((player) => {
      roundScores[player.id] = scores[player.id] || 0;
    });

    onComplete({
      hand,
      tricks,
      bonusPoints,
      scores: roundScores,
    });
  };

  if (!players || players.length === 0) {
    return <div className="round-scoring-interface">No players found</div>;
  }

  return (
    <div className="round-scoring-interface">
      <h2>Round {hand} Scoring</h2>
      <div className="scoring-form">
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
            {players.map((player) => (
              <tr key={player.id} className={errors[player.id] ? 'error-row' : ''}>
                <td>{player.name}</td>
                <td>{bids[player.id] !== undefined ? bids[player.id] : '-'}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max={hand}
                    value={tricks[player.id]}
                    onChange={(e) => handleTricksChange(player.id, e.target.value)}
                    placeholder="0"
                    className={errors[player.id] ? 'input-error' : ''}
                  />
                  {errors[player.id] && (
                    <div className="error-message">{errors[player.id]}</div>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={bonusPoints[player.id]}
                    onChange={(e) => handleBonusChange(player.id, e.target.value)}
                    placeholder="0"
                  />
                </td>
                <td className="score-display">
                  {scores[player.id] !== undefined ? scores[player.id] : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-group">
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={!allDataEntered}
          title={allDataEntered ? 'Submit round scores' : 'Please fill in all tricks before submitting'}
        >
          {allDataEntered ? 'Complete Round' : 'Complete Round (Fill all fields)'}
        </button>
      </div>
    </div>
  );
};

export default RoundScoringInterface;