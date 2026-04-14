import React, { useState, useMemo } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Player {
  id: string;
  name: string;
  bid: number;
}

interface ScoringData {
  [playerId: string]: {
    tricksTaken: number | null;
    bonusPoints: number;
  };
}

interface RoundScoringFormProps {
  players: Player[];
  handCount: number;
  onScoresSubmit: (scoringData: ScoringData) => void;
  onCancel?: () => void;
}

const calculateScore = (
  bid: number,
  tricksTaken: number,
  bonusPoints: number
): number => {
  if (bid === 0) {
    // Bid zero: 10 points if tricks taken is 0, otherwise lose 10 points
    return tricksTaken === 0 ? 10 : -10;
  }

  if (bid === tricksTaken) {
    // Met bid: 10 + (bid * 5)
    return 10 + bid * 5 + bonusPoints;
  }

  // Failed bid: -5 * |bid - tricks|
  return -5 * Math.abs(bid - tricksTaken);
};

const RoundScoringForm: React.FC<RoundScoringFormProps> = ({
  players,
  handCount,
  onScoresSubmit,
  onCancel,
}) => {
  const [scoringData, setScoringData] = useState<ScoringData>(
    players.reduce(
      (acc, player) => ({
        ...acc,
        [player.id]: { tricksTaken: null, bonusPoints: 0 },
      }),
      {}
    )
  );

  const [errors, setErrors] = useState<{ [playerId: string]: string }>({});

  const handleTricksTakenChange = (playerId: string, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    setScoringData({
      ...scoringData,
      [playerId]: {
        ...scoringData[playerId],
        tricksTaken: numValue,
      },
    });
    // Clear error for this field if it becomes valid
    if (
      numValue !== null &&
      numValue >= 0 &&
      numValue <= handCount
    ) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${playerId}-tricks`];
        return newErrors;
      });
    }
  };

  const handleBonusPointsChange = (playerId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setScoringData({
      ...scoringData,
      [playerId]: {
        ...scoringData[playerId],
        bonusPoints: numValue,
      },
    });
  };

  const validateAndSubmit = () => {
    const newErrors: { [playerId: string]: string } = {};

    // Validate that all players have tricks taken entered
    players.forEach((player) => {
      const data = scoringData[player.id];
      if (data.tricksTaken === null) {
        newErrors[`${player.id}-tricks`] = 'Tricks taken is required';
      } else if (data.tricksTaken < 0 || data.tricksTaken > handCount) {
        newErrors[`${player.id}-tricks`] = `Tricks taken must be between 0 and ${handCount}`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // All validation passed, submit
    onScoresSubmit(scoringData);
  };

  const isAllDataEntered = useMemo(() => {
    return players.every((player) => {
      const data = scoringData[player.id];
      return (
        data.tricksTaken !== null &&
        data.tricksTaken >= 0 &&
        data.tricksTaken <= handCount
      );
    });
  }, [scoringData, players, handCount]);

  return (
    <Card className="shadow-lg">
      <Card.Header className="bg-primary text-white">
        <Card.Title className="mb-0">Score Round - Hand {handCount}</Card.Title>
      </Card.Header>
      <Card.Body>
        {Object.keys(errors).length > 0 && (
          <Alert variant="danger" className="mb-3">
            Please fix all errors before continuing
          </Alert>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Player</th>
                <th>Bid</th>
                <th>Tricks Taken</th>
                <th>Bonus Points</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const data = scoringData[player.id];
                const hasError = !!errors[`${player.id}-tricks`];
                const score =
                  data.tricksTaken !== null
                    ? calculateScore(
                        player.bid,
                        data.tricksTaken,
                        data.bonusPoints
                      )
                    : null;

                return (
                  <tr key={player.id} className={hasError ? 'table-danger' : ''}>
                    <td className="fw-bold">{player.name}</td>
                    <td className="text-center">
                      <strong>{player.bid}</strong>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        max={handCount}
                        value={
                          data.tricksTaken === null ? '' : data.tricksTaken
                        }
                        onChange={(e) =>
                          handleTricksTakenChange(player.id, e.target.value)
                        }
                        isInvalid={hasError}
                        className="text-center"
                        placeholder="0"
                      />
                      {hasError && (
                        <Form.Control.Feedback type="invalid" className="d-block">
                          {errors[`${player.id}-tricks`]}
                        </Form.Control.Feedback>
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        min="0"
                        value={data.bonusPoints}
                        onChange={(e) =>
                          handleBonusPointsChange(player.id, e.target.value)
                        }
                        className="text-center"
                        placeholder="0"
                      />
                    </td>
                    <td className="text-center fw-bold">
                      {score !== null ? (
                        <span
                          className={
                            score >= 0 ? 'text-success' : 'text-danger'
                          }
                        >
                          {score}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 d-flex gap-2 justify-content-end">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onClick={validateAndSubmit}
            disabled={!isAllDataEntered}
            size="lg"
          >
            Submit Scores
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RoundScoringForm;
