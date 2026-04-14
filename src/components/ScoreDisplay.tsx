import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Player, RoundScore } from '../types';

interface ScoreDisplayProps {
  players: Player[];
  roundScores: RoundScore[][];
  currentRound: number;
  isGameEnd: boolean;
  onViewDetails?: (playerId: string) => void;
}

const Container = styled.div`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const Title = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
`;

const CurrentStandingsSection = styled.div`
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
  }
`;

const StandingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const StandingItem = styled.div<{ isLeader: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border-left: 4px solid ${(props) => (props.isLeader ? '#FFD700' : 'transparent')};
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  ${(props) =>
    props.isLeader &&
    `
    background: rgba(255, 215, 0, 0.2);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  `}

  @media (max-width: 768px) {
    padding: 0.75rem;
    border-radius: 6px;
  }
`;

const Rank = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  margin-right: 1rem;
  min-width: 2rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-right: 0.75rem;
    min-width: 1.5rem;
  }
`;

const PlayerName = styled.div`
  flex: 1;
  font-weight: 500;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const Score = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  margin-left: 1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-left: 0.75rem;
  }
`;

const HistorySection = styled.div`
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const HistoryTable = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    border-radius: 6px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
`;

const TableHead = styled.thead`
  background: rgba(0, 0, 0, 0.1);
`;

const TableRow = styled.tr<{ isHighlight?: boolean }>`
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  ${(props) =>
    props.isHighlight &&
    `
    background: rgba(255, 215, 0, 0.1);
  `}
`;

const TableCell = styled.td<{ isHeader?: boolean }>`
  padding: 0.75rem;
  text-align: center;
  font-weight: ${(props) => (props.isHeader ? 600 : 400)};
  font-size: ${(props) => (props.isHeader ? '0.9rem' : '0.85rem')};

  @media (max-width: 768px) {
    padding: 0.5rem 0.25rem;
    font-size: ${(props) => (props.isHeader ? '0.75rem' : '0.7rem')};
  }
`;

const TableHeaderCell = styled(TableCell)`
  font-weight: 600;
  color: #333;
  background: rgba(0, 0, 0, 0.05);
`;

const RankingsSection = styled.div`
  display: ${(props: any) => (props.visible ? 'block' : 'none')};

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const RankingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const RankingItem = styled(StandingItem)`
  background: rgba(255, 255, 255, 0.15);

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const Medal = styled.span`
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 1.25rem;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-right: 0.35rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;

  @media (max-width: 768px) {
    padding: 1.5rem 0.75rem;
    font-size: 0.85rem;
  }
`;

const LeaderIndicator = styled.span`
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.8rem;
  background: #FFD700;
  color: #333;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.35rem;
  }
`;

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  players,
  roundScores,
  currentRound,
  isGameEnd,
  onViewDetails,
}) => {
  // Calculate total scores for each player
  const standings = useMemo(() => {
    return players
      .map((player) => {
        const totalScore = roundScores
          .flatMap((roundPlayerScores) => roundPlayerScores)
          .filter((score) => score.playerId === player.id)
          .reduce((sum, score) => sum + score.score, 0);

        return {
          ...player,
          totalScore,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [players, roundScores]);

  const maxScore = standings[0]?.totalScore ?? 0;
  const leader = standings[0]?.id;

  // Build round history
  const roundHistory = useMemo(() => {
    return roundScores.map((roundPlayerScores, roundIndex) => {
      const roundData: Record<string, number> = { roundIndex: roundIndex + 1 };
      roundPlayerScores.forEach((score) => {
        roundData[score.playerId] = score.score;
      });
      return roundData;
    });
  }, [roundScores]);

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <Container>
      <Title>Game Scoreboard</Title>

      {/* Current Standings */}
      <CurrentStandingsSection>
        <SectionTitle>Current Standings</SectionTitle>
        {standings.length === 0 ? (
          <EmptyState>No players in game yet</EmptyState>
        ) : (
          <StandingsList>
            {standings.map((player, index) => (
              <StandingItem
                key={player.id}
                isLeader={player.id === leader}
                onClick={() => onViewDetails?.(player.id)}
                style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
              >
                <Rank>{index + 1}</Rank>
                <PlayerName>
                  {player.name}
                  {player.id === leader && <LeaderIndicator>LEADER</LeaderIndicator>}
                </PlayerName>
                <Score>{player.totalScore}</Score>
              </StandingItem>
            ))}
          </StandingsList>
        )}
      </CurrentStandingsSection>

      {/* Round History */}
      {roundHistory.length > 0 && (
        <HistorySection>
          <SectionTitle>Round History</SectionTitle>
          <HistoryTable>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell isHeader>Round</TableHeaderCell>
                  {standings.map((player) => (
                    <TableHeaderCell key={player.id} isHeader>
                      {player.name.substring(0, 3).toUpperCase()}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              </TableHead>
              <tbody>
                {roundHistory.map((round, index) => (
                  <TableRow key={index} isHighlight={index === currentRound - 1}>
                    <TableCell>
                      <strong>R{round.roundIndex}</strong>
                    </TableCell>
                    {standings.map((player) => (
                      <TableCell key={player.id}>
                        {round[player.id] ?? '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </HistoryTable>
        </HistorySection>
      )}

      {/* Final Rankings (shown at game end) */}
      <RankingsSection visible={isGameEnd}>
        <SectionTitle>Final Rankings</SectionTitle>
        <RankingsList>
          {standings.map((player, index) => (
            <RankingItem key={player.id} isLeader={index === 0}>
              <Rank>
                {getMedalEmoji(index + 1)} #{index + 1}
              </Rank>
              <PlayerName>{player.name}</PlayerName>
              <Score>{player.totalScore} pts</Score>
            </RankingItem>
          ))}
        </RankingsList>
      </RankingsSection>
    </Container>
  );
};

export default ScoreDisplay;
