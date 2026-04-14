/**
 * GameFlow Component
 * Manages game flow and integrates scoring engine
 */

import React, { useState } from 'react';
import { calculateRoundScores, updatePlayerScores, formatScoreBreakdown } from './js/scoring';

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Hand {
  playerId: string;
  bid: number;
  tricks: number;
  handNumber: number;
  bonusPoints: number;
}

const GameFlow: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [hands, setHands] = useState<Hand[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [scoreBreakdown, setScoreBreakdown] = useState<string>('');

  const submitRound = (handsData: Hand[]) => {
    // Calculate round scores using the scoring engine
    const roundScoring = calculateRoundScores(handsData);
    
    // Extract round scores for each player
    const roundScores = roundScoring.hands.map(hand => hand.total);
    
    // Update player scores
    const updatedPlayers = updatePlayerScores(players, roundScores);
    setPlayers(updatedPlayers);
    
    // Generate and display score breakdown
    const playerNames = players.map(p => p.name);
    const breakdown = formatScoreBreakdown(roundScoring, playerNames);
    setScoreBreakdown(breakdown);
    
    // Move to next round
    setRoundNumber(roundNumber + 1);
  };

  return (
    <div className="game-flow">
      <h1>Skull King - Round {roundNumber}</h1>
      <div className="scores">
        {players.map(player => (
          <div key={player.id} className="player-score">
            <span>{player.name}: {player.score}</span>
          </div>
        ))}
      </div>
      <pre className="score-breakdown">{scoreBreakdown}</pre>
    </div>
  );
};

export default GameFlow;
