import React, { useMemo } from 'react';

export interface Player {
  id: string;
  name: string;
  roundScores: number[];
}

export interface ScoreDisplayProps {
  players: Player[];
  currentRound: number;
  gameEnded: boolean;
}

export interface RankingEntry {
  playerId: string;
  name: string;
  totalScore: number;
  rank: number;
}

/**
 * Calculates total score for a player
 */
export const calculateTotalScore = (roundScores: number[]): number => {
  return roundScores.reduce((sum, score) => sum + score, 0);
};

/**
 * Calculates rankings based on total scores
 */
export const calculateRankings = (players: Player[]): RankingEntry[] => {
  const rankings = players.map(player => ({
    playerId: player.id,
    name: player.name,
    totalScore: calculateTotalScore(player.roundScores),
    rank: 0,
  }));

  // Sort by score descending
  rankings.sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks
  rankings.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return rankings;
};

/**
 * Gets the current leader
 */
export const getCurrentLeader = (players: Player[]): string | null => {
  if (players.length === 0) return null;

  let leader = players[0];
  let maxScore = calculateTotalScore(players[0].roundScores);

  for (let i = 1; i < players.length; i++) {
    const playerScore = calculateTotalScore(players[i].roundScores);
    if (playerScore > maxScore) {
      leader = players[i];
      maxScore = playerScore;
    }
  }

  return leader.id;
};

/**
 * ScoreHistoryPanel - Shows score breakdown by round
 */
interface ScoreHistoryPanelProps {
  players: Player[];
  currentRound: number;
}

const ScoreHistoryPanel: React.FC<ScoreHistoryPanelProps> = ({
  players,
  currentRound,
}) => {
  if (players.length === 0) {
    return <div className="text-gray-500 p-4">No players in game</div>;
  }

  const maxRounds = Math.max(...players.map(p => p.roundScores.length), 0);

  if (maxRounds === 0) {
    return <div className="text-gray-500 p-4">No rounds played yet</div>;
  }

  return (
    <div className="score-history-panel">
      <h3 className="font-bold text-lg mb-4">Score History by Round</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="px-4 py-2 text-left font-semibold">Player</th>
              {Array.from({ length: maxRounds }).map((_, i) => (
                <th
                  key={`round-${i}`}
                  className="px-2 py-2 text-center font-semibold text-sm"
                >
                  R{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id} className="border-b border-gray-200">
                <td className="px-4 py-2 font-medium">{player.name}</td>
                {Array.from({ length: maxRounds }).map((_, i) => (
                  <td
                    key={`${player.id}-round-${i}`}
                    className="px-2 py-2 text-center text-sm"
                  >
                    {player.roundScores[i] !== undefined
                      ? player.roundScores[i]
                      : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * RankingsPanel - Shows final rankings
 */
interface RankingsPanelProps {
  rankings: RankingEntry[];
}

const RankingsPanel: React.FC<RankingsPanelProps> = ({ rankings }) => {
  if (rankings.length === 0) {
    return <div className="text-gray-500 p-4">No rankings available</div>;
  }

  return (
    <div className="rankings-panel">
      <h3 className="font-bold text-lg mb-4">Final Rankings</h3>
      <div className="space-y-2">
        {rankings.map((entry, index) => (
          <div
            key={entry.playerId}
            className="ranking-entry flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-gray-500 w-8">
                #{entry.rank}
              </span>
              <span className="font-medium">{entry.name}</span>
            </div>
            <span className="font-bold text-lg">{entry.totalScore}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * CurrentStandingsPanel - Shows current standings with total scores
 */
interface CurrentStandingsPanelProps {
  players: Player[];
  currentLeaderId: string | null;
}

const CurrentStandingsPanel: React.FC<CurrentStandingsPanelProps> = ({
  players,
  currentLeaderId,
}) => {
  const standings = useMemo(() => {
    return players
      .map(player => ({
        id: player.id,
        name: player.name,
        totalScore: calculateTotalScore(player.roundScores),
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [players]);

  if (standings.length === 0) {
    return <div className="text-gray-500 p-4">No players in game</div>;
  }

  return (
    <div className="current-standings-panel">
      <h3 className="font-bold text-lg mb-4">Current Standings</h3>
      <div className="space-y-2">
        {standings.map(standing => {
          const isLeader = standing.id === currentLeaderId;
          return (
            <div
              key={standing.id}
              className={`standing-item flex justify-between items-center p-3 rounded-lg border-2 transition-colors ${
                isLeader
                  ? 'bg-yellow-50 border-yellow-400 current-leader-highlight'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {isLeader && (
                  <span className="leader-badge bg-yellow-400 text-white font-bold px-2 py-1 rounded text-sm">
                    🏆
                  </span>
                )}
                <span className="font-medium">{standing.name}</span>
              </div>
              <span className="font-bold text-lg">{standing.totalScore}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * ScoreDisplay - Main component showing current standings, score history, and rankings
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  players,
  currentRound,
  gameEnded,
}) => {
  const currentLeaderId = useMemo(
    () => getCurrentLeader(players),
    [players]
  );

  const rankings = useMemo(
    () => calculateRankings(players),
    [players]
  );

  return (
    <div className="score-display w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Game Standings</h2>
        {!gameEnded && (
          <div className="text-gray-600 mb-4">Round {currentRound}</div>
        )}
      </div>

      {/* Current Standings */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CurrentStandingsPanel
          players={players}
          currentLeaderId={currentLeaderId}
        />
      </div>

      {/* Score History */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ScoreHistoryPanel players={players} currentRound={currentRound} />
      </div>

      {/* Rankings - Only show at game end */}
      {gameEnded && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <RankingsPanel rankings={rankings} />
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
