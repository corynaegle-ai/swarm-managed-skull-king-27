import React from 'react';
import { Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Player {
  id: string;
  name: string;
  bid: number;
}

interface PlayPhaseProps {
  players: Player[];
  handCount: number;
  onPhaseComplete: () => void;
}

const PlayPhase: React.FC<PlayPhaseProps> = ({
  players,
  handCount,
  onPhaseComplete,
}) => {
  return (
    <Card className="shadow-lg">
      <Card.Header className="bg-warning text-dark">
        <Card.Title className="mb-0">Play Phase - Hand {handCount}</Card.Title>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-4">
          Players are now playing their cards. Once the hand is complete, click
          the button below to proceed to scoring.
        </p>

        <div className="mb-4">
          <h5>Players</h5>
          <ul className="list-group">
            {players.map((player) => (
              <li key={player.id} className="list-group-item d-flex justify-content-between">
                <span>{player.name}</span>
                <span className="badge bg-primary">Bid: {player.bid}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="d-flex justify-content-end">
          <Button
            variant="success"
            size="lg"
            onClick={onPhaseComplete}
          >
            Hand Complete - Score Round
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PlayPhase;
