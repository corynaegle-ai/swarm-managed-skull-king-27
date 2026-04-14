import { renderHook, act } from '@testing-library/react';
import { useScoreManagement } from '../useScoreManagement';
import { Player, RoundScore } from '../../types';

const mockPlayers: Player[] = [
  { id: 'p1', name: 'Alice' },
  { id: 'p2', name: 'Bob' },
];

const mockRoundScores: RoundScore[] = [
  { playerId: 'p1', score: 50 },
  { playerId: 'p2', score: 40 },
];

describe('useScoreManagement Hook', () => {
  it('should initialize with empty scores', () => {
    const { result } = renderHook(() => useScoreManagement(mockPlayers));

    expect(result.current.roundScores).toEqual([]);
    expect(result.current.currentRound).toBe(1);
    expect(result.current.isGameEnd).toBe(false);
  });

  it('should add round scores and increment current round', () => {
    const { result } = renderHook(() => useScoreManagement(mockPlayers));

    act(() => {
      result.current.addRoundScores(1, mockRoundScores);
    });

    expect(result.current.roundScores[0]).toEqual(mockRoundScores);
    expect(result.current.currentRound).toBe(2);
  });

  it('should calculate total score correctly', () => {
    const { result } = renderHook(() => useScoreManagement(mockPlayers));

    act(() => {
      result.current.addRoundScores(1, mockRoundScores);
      result.current.addRoundScores(2, [
        { playerId: 'p1', score: 30 },
        { playerId: 'p2', score: 60 },
      ]);
    });

    expect(result.current.getTotalScore('p1')).toBe(80);
    expect(result.current.getTotalScore('p2')).toBe(100);
  });

  it('should mark game as ended', () => {
    const { result } = renderHook(() => useScoreManagement(mockPlayers));

    expect(result.current.isGameEnd).toBe(false);

    act(() => {
      result.current.completeGame();
    });

    expect(result.current.isGameEnd).toBe(true);
  });

  it('should reset all scores and state', () => {
    const { result } = renderHook(() => useScoreManagement(mockPlayers));

    act(() => {
      result.current.addRoundScores(1, mockRoundScores);
      result.current.completeGame();
    });

    expect(result.current.roundScores.length).toBe(1);
    expect(result.current.isGameEnd).toBe(true);

    act(() => {
      result.current.resetScores();
    });

    expect(result.current.roundScores).toEqual([]);
    expect(result.current.currentRound).toBe(1);
    expect(result.current.isGameEnd).toBe(false);
  });

  it('should handle multiple rounds of score additions', () => {
    const { result } = renderHook(() => useScoreManagement(mockPlayers));

    const round1Scores: RoundScore[] = [
      { playerId: 'p1', score: 50 },
      { playerId: 'p2', score: 40 },
    ];

    const round2Scores: RoundScore[] = [
      { playerId: 'p1', score: 35 },
      { playerId: 'p2', score: 45 },
    ];

    const round3Scores: RoundScore[] = [
      { playerId: 'p1', score: 25 },
      { playerId: 'p2', score: 55 },
    ];

    act(() => {
      result.current.addRoundScores(1, round1Scores);
      result.current.addRoundScores(2, round2Scores);
      result.current.addRoundScores(3, round3Scores);
    });

    expect(result.current.roundScores).toHaveLength(3);
    expect(result.current.currentRound).toBe(4);
    expect(result.current.getTotalScore('p1')).toBe(110);
    expect(result.current.getTotalScore('p2')).toBe(140);
  });
});
