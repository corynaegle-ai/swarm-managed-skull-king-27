import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import BiddingPhase from './BiddingPhase';
import PlayPhase from './PlayPhase';
import RoundScoringForm from './RoundScoringForm';
import Scoreboard from './Scoreboard';

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

interface PlayerScore {
  playerId: string;
  playerName: string;
  roundScore: number;
  totalScore: number;
}

type GamePhase = 'bidding' | 'playing' | 'scoring' | 'roundComplete' | 'gameComplete';

const calculateRoundScore = (
  bid: number,
  tricksTaken: number,
  bonusPoints: number
): number => {
  if (bid === 0) {
    return tricksTaken === 0 ? 10 : -10;
  }

  if (bid === tricksTaken) {
    return 10 + bid * 5 + bonusPoints;
  }

  return -5 * Math.abs(bid - tricksTaken);
};

const GameFlow: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Player 1', bid: 0 },
    { id: '2', name: 'Player 2', bid: 0 },
    { id: '3', name: 'Player 3', bid: 0 },
  ]);

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [totalRounds, setTotalRounds] = useState<number>(10);
  const [handCount, setHandCount] = useState<number>(1);
  const [gamePhase, setGamePhase] = useState<GamePhase>('bidding');
  const [scores, setScores] = useState<{ [playerId: string]: number }>(
    players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
  );
  const [roundHistory, setRoundHistory] = useState<PlayerScore[][]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize hand count based on round
  useEffect(() => {
    const maxHands = 13;
    if (currentRound <= maxHands) {
      setHandCount(currentRound);
    } else {
      setHandCount(maxHands - (currentRound - maxHands - 1));
    }
  }, [currentRound]);

  const handleBidsSubmitted = (playerBids: { [playerId: string]: number }) => {
    try {
      setPlayers(
        players.map((p) => ({
          ...p,
          bid: playerBids[p.id] || 0,
        }))
      );
      setGamePhase('playing');
      setError('');
    } catch (err) {
      setError(`Error processing bids: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handlePlayPhaseComplete = () => {
    setGamePhase('scoring');
  };

  const handleScoresSubmitted = (scoringData: ScoringData) => {
    try {
      setLoading(true);

      // Calculate scores for this round
      const newScores = { ...scores };
      const roundScores: PlayerScore[] = [];

      players.forEach((player) => {
        const data = scoringData[player.id];
        if (data.tricksTaken === null) {
          throw new Error(`Missing tricks data for ${player.name}`);
        }

        const roundScore = calculateRoundScore(
          player.bid,
          data.tricksTaken,
          data.bonusPoints
        );

        newScores[player.id] = (newScores[player.id] || 0) + roundScore;

        roundScores.push({
          playerId: player.id,
          playerName: player.name,
          roundScore,
          totalScore: newScores[player.id],
        });
      });

      setScores(newScores);
      setRoundHistory([...roundHistory, roundScores]);

      // Check if game is complete
      if (currentRound >= totalRounds) {
        setGamePhase('gameComplete');
      } else {
        setGamePhase('roundComplete');
      }

      setError('');
    } catch (err) {
      setError(`Error processing scores: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNextRound = () => {
    if (currentRound < totalRounds) {
      setCurrentRound(currentRound + 1);
      setPlayers(
        players.map((p) => ({
          ...p,
          bid: 0,
        }))
      );
      setGamePhase('bidding');
      setError('');
    }
  };

  const handleRestartGame = () => {
    setCurrentRound(1);
    setPlayers(
      players.map((p) => ({
        ...p,
        bid: 0,
      }))
    );
    setScores(players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}));
    setRoundHistory([]);
    setGamePhase('bidding');
    setError('');
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Skull King Game</h1>
          <p className="text-center text-muted">
            Round {currentRound} of {totalRounds} | Hand Size: {handCount}
          </p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {loading && (
        <Row className="mb-3">
          <Col className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Processing scores...</p>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={8}>
          {gamePhase === 'bidding' && (
            <BiddingPhase
              players={players}
              onBidsSubmitted={handleBidsSubmitted}
            />
          )}

          {gamePhase === 'playing' && (
            <PlayPhase
              players={players}
              handCount={handCount}
              onPhaseComplete={handlePlayPhaseComplete}
            />
          )}

          {gamePhase === 'scoring' && (
            <RoundScoringForm
              players={players}
              handCount={handCount}
              onScoresSubmit={handleScoresSubmitted}
            />
          )}

          {gamePhase === 'roundComplete' && (
            <Card className="shadow-lg">
              <Card.Header className="bg-success text-white">
                <Card.Title className="mb-0">Round {currentRound} Complete</Card.Title>
              </Card.Header>
              <Card.Body>
                <p className="mb-3">Scores have been recorded.</p>
                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartNextRound}
                  >
                    Next Round
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {gamePhase === 'gameComplete' && (
            <Card className="shadow-lg">
              <Card.Header className="bg-success text-white">
                <Card.Title className="mb-0">Game Complete!</Card.Title>
              </Card.Header>
              <Card.Body>
                <p className="mb-3">All rounds have been completed.</p>
                <div className="d-flex gap-2 justify-content-end">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleRestartGame}
                  >
                    New Game
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Scoreboard players={players} scores={scores} />
        </Col>
      </Row>
    </Container>
  );
};

export default GameFlow;
