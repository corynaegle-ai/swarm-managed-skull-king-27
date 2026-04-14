import React, { useMemo } from 'react';
import { useScoreManagement } from '../hooks/useScoreManagement';
import '../styles/score-display.css';

interface Player {
  id: string;
  name: string;
}

interface Round {
  roundNumber: number;
  scores: { [playerId: string]: number };
}

interface ScoreDisplayProps {
  players: Player[];
  rounds: Round[];
  gameEnded: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  players,
  rounds,
  gameEnded,
}) => {
  const { getTotalScore, getLeaderId, getRankings } = useScoreManagement();

  // Calculate total scores for all players
  const totalScores = useMemo(() => {
    return players.map((player) => ({
      ...player,
      totalScore: getTotalScore(player.id, rounds),
    }));
  }, [players, rounds, getTotalScore]);

  // Get rankings
  const rankings = useMemo(
    () => getRankings(totalScores),
    [totalScores, getRankings]
  );

  // Get current leader ID
  const leaderId = useMemo(
    () => getLeaderId(totalScores),
    [totalScores, getLeaderId]
  );

  if (players.length === 0) {
    return (
      <div className="score-display" role="region" aria-label="Score Display">
        <p className="score-display__empty">No players yet</p>
      </div>
    );
  }

  return (
    <div className="score-display" role="region" aria-label="Score Display">
      {/* Current Standings */}
      <section className="score-display__section">
        <h2 className="score-display__title">Current Standings</h2>
        <div className="score-display__standings">
          {totalScores.map((player) => {
            const isLeader = player.id === leaderId;
            return (
              <div
                key={player.id}
                className={`score-display__player ${
                  isLeader ? 'score-display__player--leader' : ''
                }`}
                data-testid={`player-${player.id}`}
              >
                <div className="score-display__player-info">
                  <span className="score-display__player-name">
                    {player.name}
                  </span>
                  {isLeader && (
                    <span
                      className="score-display__leader-badge"
                      title="Current Leader"
                      aria-label="Current Leader"
                    >
                      👑
                    </span>
                  )}
                </div>
                <span className="score-display__total-score">
                  {player.totalScore}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Round History */}
      {rounds.length > 0 && (
        <section className="score-display__section">
          <h2 className="score-display__title">Round History</h2>
          <div className="score-display__round-history">
            <table className="score-display__table" role="table">
              <thead>
                <tr>
                  <th className="score-display__table-header">Round</th>
                  {players.map((player) => (
                    <th
                      key={player.id}
                      className="score-display__table-header"
                    >
                      {player.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rounds.map((round) => (
                  <tr key={round.roundNumber}>
                    <td className="score-display__table-cell score-display__table-cell--round">
                      {round.roundNumber}
                    </td>
                    {players.map((player) => (
                      <td
                        key={`${round.roundNumber}-${player.id}`}
                        className="score-display__table-cell"
                      >
                        {round.scores[player.id] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Final Rankings (shown when game ends) */}
      {gameEnded && rankings.length > 0 && (
        <section className="score-display__section score-display__section--final">
          <h2 className="score-display__title">Final Rankings</h2>
          <div className="score-display__rankings" role="list">
            {rankings.map((player, index) => (
              <div
                key={player.id}
                className="score-display__ranking-item"
                role="listitem"
              >
                <span className="score-display__ranking-position">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <span className="score-display__ranking-name">
                  {player.name}
                </span>
                <span className="score-display__ranking-score">
                  {player.totalScore} points
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ScoreDisplay;
