import React, { useState } from 'react';
import './ScoreDisplay.css';

interface Player {
  id: string;
  name: string;
  totalScore: number;
}

interface RoundScore {
  playerId: string;
  roundNumber: number;
  score: number;
}

interface ScoreDisplayProps {
  players: Player[];
  roundScores: RoundScore[];
  currentRound?: number;
  isGameEnded?: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  players,
  roundScores,
  currentRound = 0,
  isGameEnded = false,
}) => {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  // Sort players by total score (descending)
  const sortedPlayers = [...players].sort(
    (a, b) => b.totalScore - a.totalScore
  );

  // Find leader
  const leader = sortedPlayers.length > 0 ? sortedPlayers[0] : null;
  const leaderScore = leader?.totalScore ?? 0;
  const isLeaderTied =
    leader &&
    sortedPlayers.filter((p) => p.totalScore === leaderScore).length > 1;

  // Get round history for a specific player
  const getPlayerRoundScores = (playerId: string): RoundScore[] => {
    return roundScores
      .filter((rs) => rs.playerId === playerId)
      .sort((a, b) => a.roundNumber - b.roundNumber);
  };

  // Get cumulative score up to a specific round
  const getCumulativeScore = (
    playerId: string,
    upToRound: number
  ): number => {
    return roundScores
      .filter((rs) => rs.playerId === playerId && rs.roundNumber <= upToRound)
      .reduce((sum, rs) => sum + rs.score, 0);
  };

  const togglePlayerExpansion = (playerId: string) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  return (
    <div className="score-display-container">
      <div className="score-display-header">
        <h1>Game Standings</h1>
        {!isGameEnded && currentRound > 0 && (
          <p className="current-round">Round {currentRound}</p>
        )}
        {isGameEnded && <p className="game-ended">Final Rankings</p>}
      </div>

      <div className="score-display-content">
        {/* Current Standings Table */}
        <div className="standings-section">
          <h2>Current Standings</h2>
          <div className="standings-table">
            <div className="standings-header">
              <div className="rank-col">Rank</div>
              <div className="name-col">Player</div>
              <div className="score-col">Total Score</div>
              <div className="expand-col"></div>
            </div>
            {sortedPlayers.map((player, index) => {
              const isLeaderPlayer = player.id === leader?.id;
              const playerRoundScores = getPlayerRoundScores(player.id);
              const isExpanded = expandedPlayer === player.id;

              return (
                <div key={player.id} className="standings-group">
                  <div
                    className={`standings-row ${
                      isLeaderPlayer ? 'is-leader' : ''
                    } ${playerRoundScores.length > 0 ? 'expandable' : ''}`}
                    onClick={() =>
                      playerRoundScores.length > 0 &&
                      togglePlayerExpansion(player.id)
                    }
                  >
                    <div className="rank-col">
                      <span className="rank-badge">{index + 1}</span>
                      {isLeaderPlayer && (
                        <span className="leader-badge">
                          {isLeaderTied ? '(Tied)' : '(Leader)'}
                        </span>
                      )}
                    </div>
                    <div className="name-col">{player.name}</div>
                    <div className="score-col">
                      <span className="score-value">{player.totalScore}</span>
                    </div>
                    <div className="expand-col">
                      {playerRoundScores.length > 0 && (
                        <span className={`expand-icon ${isExpanded ? 'open' : ''}`}>
                          ▼
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Round History (Expandable) */}
                  {isExpanded && playerRoundScores.length > 0 && (
                    <div className="round-history-expanded">
                      <div className="round-history-header">
                        <span className="round-col">Round</span>
                        <span className="round-score-col">Score</span>
                        <span className="cumulative-col">Cumulative</span>
                      </div>
                      {playerRoundScores.map((roundScore) => (
                        <div key={roundScore.roundNumber} className="round-history-row">
                          <span className="round-col">
                            {roundScore.roundNumber}
                          </span>
                          <span className="round-score-col">
                            {roundScore.score >= 0 ? '+' : ''}
                            {roundScore.score}
                          </span>
                          <span className="cumulative-col">
                            {getCumulativeScore(player.id, roundScore.roundNumber)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Score Breakdown by Round (Desktop view) */}
        {roundScores.length > 0 && (
          <div className="breakdown-section">
            <h2>Score Breakdown by Round</h2>
            <div className="breakdown-table">
              <div className="breakdown-header">
                <div className="player-col">Player</div>
                {Array.from(
                  { length: Math.max(...roundScores.map((rs) => rs.roundNumber)) },
                  (_, i) => i + 1
                ).map((roundNum) => (
                  <div key={`round-${roundNum}`} className="round-col">
                    R{roundNum}
                  </div>
                ))}
                <div className="total-col">Total</div>
              </div>
              {sortedPlayers.map((player) => {
                const maxRound = Math.max(
                  ...roundScores.map((rs) => rs.roundNumber),
                  0
                );
                return (
                  <div key={player.id} className="breakdown-row">
                    <div className="player-col">{player.name}</div>
                    {Array.from({ length: maxRound }, (_, i) => i + 1).map(
                      (roundNum) => {
                        const score = roundScores.find(
                          (rs) =>
                            rs.playerId === player.id &&
                            rs.roundNumber === roundNum
                        )?.score ?? null;
                        return (
                          <div key={`${player.id}-${roundNum}`} className="round-col">
                            {score !== null ? score : '-'}
                          </div>
                        );
                      }
                    )}
                    <div className="total-col">{player.totalScore}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Game Status */}
      {isGameEnded && (
        <div className="game-status">
          <p>
            🏆{' '}
            {isLeaderTied
              ? `Players ${sortedPlayers
                  .slice(0, 2)
                  .map((p) => p.name)
                  .join(' and ')} are tied for the win!`
              : `${leader?.name} wins with ${leader?.totalScore} points!`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
