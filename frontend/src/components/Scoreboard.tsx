import React from 'react';
import { Card, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Player {
  id: string;
  name: string;
  bid: number;
}

interface ScoreboardProps {
  players: Player[];
  scores: { [playerId: string]: number };
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, scores }) => {
  const sortedPlayers = [...players].sort(
    (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
  );

  return (
    <Card className="shadow-lg sticky-top" style={{ top: '1rem' }}>
      <Card.Header className="bg-info text-white">
        <Card.Title className="mb-0">Scoreboard</Card.Title>
      </Card.Header>
      <Card.Body className="p-0">
        <Table striped bordered hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Player</th>
              <th className="text-end">Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id}>
                <td className="text-center fw-bold">{index + 1}</td>
                <td>{player.name}</td>
                <td className="text-end fw-bold">{scores[player.id] || 0}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default Scoreboard;
