import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Player {
  id: string;
  name: string;
  bid: number;
}

interface BiddingPhaseProps {
  players: Player[];
  onBidsSubmitted: (playerBids: { [playerId: string]: number }) => void;
}

const BiddingPhase: React.FC<BiddingPhaseProps> = ({
  players,
  onBidsSubmitted,
}) => {
  const [bids, setBids] = useState<{ [playerId: string]: number | string }>(
    players.reduce((acc, p) => ({ ...acc, [p.id]: '' }), {})
  );
  const [errors, setErrors] = useState<{ [playerId: string]: string }>({});

  const handleBidChange = (playerId: string, value: string) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value, 10));
    setBids({ ...bids, [playerId]: numValue });
    // Clear error for this field
    if (value !== '') {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[playerId];
        return newErrors;
      });
    }
  };

  const handleSubmitBids = () => {
    const newErrors: { [playerId: string]: string } = {};

    players.forEach((player) => {
      const bid = bids[player.id];
      if (bid === '') {
        newErrors[player.id] = 'Bid is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const playerBids = players.reduce(
      (acc, p) => ({
        ...acc,
        [p.id]: parseInt(bids[p.id] as string, 10),
      }),
      {}
    );

    onBidsSubmitted(playerBids);
  };

  const allBidsEntered = players.every((p) => bids[p.id] !== '');

  return (
    <Card className="shadow-lg">
      <Card.Header className="bg-primary text-white">
        <Card.Title className="mb-0">Bidding Phase</Card.Title>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-4">
          Each player places their bid for the number of tricks they will take.
        </p>

        {Object.keys(errors).length > 0 && (
          <Alert variant="danger" className="mb-3">
            Please enter bids for all players
          </Alert>
        )}

        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="mb-3">
              <Form.Group>
                <Form.Label className="fw-bold">{player.name}</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={bids[player.id]}
                  onChange={(e) => handleBidChange(player.id, e.target.value)}
                  isInvalid={!!errors[player.id]}
                  placeholder="Enter bid"
                  className="form-control-lg"
                />
                {errors[player.id] && (
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {errors[player.id]}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </div>
          ))}
        </div>

        <div className="mt-4 d-flex justify-content-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmitBids}
            disabled={!allBidsEntered}
          >
            Submit Bids
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BiddingPhase;
