import { renderHook } from '@testing-library/react';
import { useScoreManagement } from '../hooks/useScoreManagement';

const mockRounds = [
  {
    roundNumber: 1,
    scores: { p1: 10, p2: 15, p3: 5 },
  },
  {
    roundNumber: 2,
    scores: { p1: 20, p2: 10, p3: 25 },
  },
  {
    roundNumber: 3,
    scores: { p1: 15, p2: 20, p3: 10 },
  },
];

const mockScores = [
  { id: 'p1', name: 'Alice', totalScore: 45 },
  { id: 'p2', name: 'Bob', totalScore: 45 },
  { id: 'p3', name: 'Charlie', totalScore: 40 },
];

describe('useScoreManagement', () => {
  it('should calculate total score correctly', () => {
    const { result } = renderHook(() => useScoreManagement());
    // Alice: 10 + 20 + 15 = 45
    const totalScore = result.current.getTotalScore('p1', mockRounds);
    expect(totalScore).toBe(45);
  });

  it('should return 0 for invalid player id', () => {
    const { result } = renderHook(() => useScoreManagement());
    const totalScore = result.current.getTotalScore('invalid', mockRounds);
    expect(totalScore).toBe(0);
  });

  it('should return 0 for empty rounds', () => {
    const { result } = renderHook(() => useScoreManagement());
    const totalScore = result.current.getTotalScore('p1', []);
    expect(totalScore).toBe(0);
  });

  it('should identify correct leader', () => {
    const { result } = renderHook(() => useScoreManagement());
    // Alice and Bob both have 45, but Alice should be leader (lower id)
    const leaderId = result.current.getLeaderId(mockScores);
    expect(leaderId).toBe('p1');
  });

  it('should return null for empty scores', () => {
    const { result } = renderHook(() => useScoreManagement());
    const leaderId = result.current.getLeaderId([]);
    expect(leaderId).toBeNull();
  });

  it('should rank players correctly by score', () => {
    const { result } = renderHook(() => useScoreManagement());
    const rankings = result.current.getRankings(mockScores);
    expect(rankings[0].totalScore).toBe(45);
    expect(rankings[2].totalScore).toBe(40);
    expect(rankings.length).toBe(3);
  });

  it('should return empty array for null scores', () => {
    const { result } = renderHook(() => useScoreManagement());
    const rankings = result.current.getRankings([]);
    expect(rankings).toEqual([]);
  });

  it('should get score for specific round', () => {
    const { result } = renderHook(() => useScoreManagement());
    const roundScore = result.current.getRoundScore('p1', 1, mockRounds);
    expect(roundScore).toBe(10);
  });

  it('should return 0 for non-existent round', () => {
    const { result } = renderHook(() => useScoreManagement());
    const roundScore = result.current.getRoundScore('p1', 99, mockRounds);
    expect(roundScore).toBe(0);
  });

  it('should calculate running total correctly', () => {
    const { result } = renderHook(() => useScoreManagement());
    // Alice round 1: 10, through round 2: 10 + 20 = 30
    const runningTotal = result.current.getRunningTotal('p1', 2, mockRounds);
    expect(runningTotal).toBe(30);
  });

  it('should handle running total for invalid round', () => {
    const { result } = renderHook(() => useScoreManagement());
    const runningTotal = result.current.getRunningTotal('p1', 0, mockRounds);
    expect(runningTotal).toBe(0);
  });

  it('should handle ties in rankings by name', () => {
    const { result } = renderHook(() => useScoreManagement());
    const scores = [
      { id: 'p2', name: 'Zebra', totalScore: 45 },
      { id: 'p1', name: 'Alice', totalScore: 45 },
    ];
    const rankings = result.current.getRankings(scores);
    // Both have same score, should be sorted by name (Alice before Zebra)
    expect(rankings[0].name).toBe('Alice');
    expect(rankings[1].name).toBe('Zebra');
  });
});
