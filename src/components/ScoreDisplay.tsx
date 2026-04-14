import React, { useMemo } from 'react';
import { Game, Player } from '../types';
import './ScoreDisplay.css';

interface ScoreDisplayProps {
  game: Game;
  gameEnded: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ game, gameEnded }) => {
  // Calculate current total scores
  const playerScores = useMemo(() => {
    return game.players.map((player) => {
      const totalScore = player.rounds.reduce((sum, round) => sum + round.score, 0);
      return {
        ...player,
        totalScore,
      };
    });
  }, [game.players]);

  // Determine rankings based on total scores
  const rankings = useMemo(() => {
    return [...playerScores].sort((a, b) => b.totalScore - a.totalScore);
  }, [playerScores]);

  // Find current leader
  const currentLeader = rankings[0]?.id;

  // Group rounds by round number
  const roundHistory = useMemo(() => {
    if (game.players.length === 0) return [];

    const maxRound = Math.max(...game.players.map((p) => p.rounds.length));
    const rounds = [];

    for (let i = 0; i < maxRound; i++) {
      const roundData = {
        roundNumber: i + 1,
        scores: game.players.map((player) => ({
          playerId: player.id,
          playerName: player.name,
          score: player.rounds[i]?.score || 0,
          tricks: player.rounds[i]?.tricks || 0,
          bid: player.rounds[i]?.bid || 0,
        })),
      };
      rounds.push(roundData);
    }

    return rounds;
  }, [game.players]);

  return (
    <div className="score-display">
      <div className="score-container">
        {/* Current Standings */}
        <section className="standings-section">
          <h2 className="section-title">Current Standings</h2>
          <div className="leaderboard">
            {rankings.map((player, index) => (
              <div
                key={player.id}
                className={`leaderboard-entry ${
                  player.id === currentLeader && !gameEnded ? 'leader' : ''
                }`}
              >
                <div className="rank-position">{index + 1}</div>
                <div className="player-info">
                  <div className="player-name">{player.name}</div>
                  {player.id === currentLeader && !gameEnded && (
                    <div className="leader-badge">Leading</div>
                  )}
                </div>
                <div className="player-score">{player.totalScore}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Score Breakdown by Round */}
        <section className="history-section">
          <h2 className="section-title">Round History</h2>
          <div className="round-history-container">
            {roundHistory.length === 0 ? (
              <div className="empty-state">No rounds played yet</div>
            ) : (
              <div className="round-history-table">
                <div className="round-history-header">
                  <div className="column-label">Player</div>
                  {roundHistory.map((round) => (
                    <div key={round.roundNumber} className="column-label round-column">
                      R{round.roundNumber}
                    </div>
                  ))}
                  <div className="column-label">Total</div>
                </div>
                {game.players.map((player) => {
                  const playerData = playerScores.find((p) => p.id === player.id);
                  return (
                    <div key={player.id} className="round-history-row">
                      <div className="player-cell">{player.name}</div>
                      {roundHistory.map((round) => {
                        const roundScore = round.scores.find(
                          (s) => s.playerId === player.id
                        )?.score || 0;
                        return (
                          <div key={round.roundNumber} className="score-cell round-column">
                            {roundScore}
                          </div>
                        );
                      })}
                      <div className="total-cell">{playerData?.totalScore || 0}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Score Breakdown Details */}
        <section className="breakdown-section">
          <h2 className="section-title">Score Breakdown</h2>
          <div className="breakdown-details">
            {game.players.length === 0 ? (
              <div className="empty-state">No players in game</div>
            ) : (
              game.players.map((player) => {
                const playerData = playerScores.find((p) => p.id === player.id);
                return (
                  <div key={player.id} className="player-breakdown">
                    <div className="breakdown-header">
                      <div className="breakdown-name">{player.name}</div>
                      <div className="breakdown-total">{playerData?.totalScore || 0}</div>
                    </div>
                    <div className="breakdown-rounds">
                      {player.rounds.map((round, index) => (
                        <div key={index} className="breakdown-round">
                          <span className="round-label">R{index + 1}:</span>
                          <span className="round-bid">Bid {round.bid}</span>
                          <span className="round-tricks">Tricks {round.tricks}</span>
                          <span className={`round-score ${
                            round.score > 0 ? 'positive' : 'negative'
                          }`}>
                            {round.score > 0 ? '+' : ''}{round.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Final Rankings - Only show when game ended */}
        {gameEnded && (
          <section className="final-rankings-section">
            <h2 className="section-title">Final Rankings</h2>
            <div className="final-rankings">
              {rankings.map((player, index) => (
                <div
                  key={player.id}
                  className={`final-rank-entry ${
                    index === 0 ? 'winner' : index === rankings.length - 1 ? 'last-place' : ''
                  }`}
                >
                  <div className="final-position">
                    {index === 0
                      ? '🏆'
                      : index === 1
                      ? '🥈'
                      : index === 2
                      ? '🥉'
                      : `${index + 1}.`}
                  </div>
                  <div className="final-player-name">{player.name}</div>
                  <div className="final-score">{player.totalScore}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;
