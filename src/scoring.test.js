/**
 * Tests for Skull King Scoring Engine
 * Validates all acceptance criteria
 */

const { calculateScore, calculateTotalScore } = require('./scoring');

// Test Acceptance Criterion 1: Non-zero bid scoring
describe('Acceptance Criterion 1: Non-zero bid scores', () => {
  test('Exact bid: 20 × tricks (no difference)', () => {
    const result = calculateScore(4, 4, 1);
    expect(result.baseScore).toBe(80); // 20 × 4
    expect(result.bonusPoints).toBe(10); // 10 × 1 hand
    expect(result.total).toBe(90);
  });

  test('Exact bid with multiple hands', () => {
    const result = calculateScore(5, 5, 1);
    expect(result.baseScore).toBe(100); // 20 × 5
    expect(result.bonusPoints).toBe(10); // 10 × 1 hand
    expect(result.total).toBe(110);
  });

  test('Missed bid (under): -10 × difference', () => {
    const result = calculateScore(5, 3, 1);
    const difference = 5 - 3; // 2 tricks short
    expect(result.baseScore).toBe(-20); // -10 × 2
    expect(result.bonusPoints).toBe(0); // No bonus if not exact
    expect(result.total).toBe(-20);
  });

  test('Missed bid (over): -10 × difference', () => {
    const result = calculateScore(3, 5, 1);
    const difference = 5 - 3; // 2 tricks over
    expect(result.baseScore).toBe(-20); // -10 × 2
    expect(result.bonusPoints).toBe(0); // No bonus if not exact
    expect(result.total).toBe(-20);
  });
});

// Test Acceptance Criterion 2: Zero bid scoring
describe('Acceptance Criterion 2: Zero bid scores', () => {
  test('Exact zero bid (0 tricks taken): +10 × hands', () => {
    const result = calculateScore(0, 0, 1);
    expect(result.baseScore).toBe(10); // 10 × 1 hand
    expect(result.bonusPoints).toBe(0);
    expect(result.total).toBe(10);
  });

  test('Exact zero bid with multiple hands: +10 × hands', () => {
    const result = calculateScore(0, 0, 3);
    expect(result.baseScore).toBe(30); // 10 × 3 hands
    expect(result.bonusPoints).toBe(0);
    expect(result.total).toBe(30);
  });

  test('Failed zero bid (took 1 trick): -10 × hands', () => {
    const result = calculateScore(0, 1, 1);
    expect(result.baseScore).toBe(-10); // -10 × 1 hand
    expect(result.bonusPoints).toBe(0);
    expect(result.total).toBe(-10);
  });

  test('Failed zero bid (took tricks): -10 × hands', () => {
    const result = calculateScore(0, 2, 2);
    expect(result.baseScore).toBe(-20); // -10 × 2 hands
    expect(result.bonusPoints).toBe(0);
    expect(result.total).toBe(-20);
  });
});

// Test Acceptance Criterion 3: Bonus points only on exact bids
describe('Acceptance Criterion 3: Bonus points only on exact bids', () => {
  test('Exact non-zero bid receives bonus', () => {
    const result = calculateScore(4, 4, 2);
    expect(result.bonusPoints).toBe(20); // 10 × 2 hands
    expect(result.total).toBe(result.baseScore + result.bonusPoints);
  });

  test('Missed bid (under) receives no bonus', () => {
    const result = calculateScore(4, 2, 2);
    expect(result.bonusPoints).toBe(0);
  });

  test('Missed bid (over) receives no bonus', () => {
    const result = calculateScore(4, 6, 2);
    expect(result.bonusPoints).toBe(0);
  });

  test('Zero bid receives no bonus', () => {
    const result = calculateScore(0, 0, 2);
    expect(result.bonusPoints).toBe(0);
  });

  test('Failed zero bid receives no bonus', () => {
    const result = calculateScore(0, 1, 2);
    expect(result.bonusPoints).toBe(0);
  });
});

// Test Acceptance Criterion 4: Total scores updated correctly
describe('Acceptance Criterion 4: Total scores updated correctly', () => {
  test('Single round total matches calculated score', () => {
    const result = calculateScore(4, 4, 1);
    expect(result.total).toBe(result.baseScore + result.bonusPoints);
    expect(result.total).toBe(90);
  });

  test('Multiple rounds accumulate correctly', () => {
    const result = calculateTotalScore([
      { bid: 4, tricks: 4, hands: 1 }, // 80 + 10 = 90
      { bid: 5, tricks: 5, hands: 1 }, // 100 + 10 = 110
      { bid: 0, tricks: 0, hands: 1 }, // 10
    ]);
    expect(result.totalScore).toBe(210); // 90 + 110 + 10
  });

  test('Mixed exact and missed bids accumulate correctly', () => {
    const result = calculateTotalScore([
      { bid: 4, tricks: 4, hands: 1 }, // 80 + 10 = 90
      { bid: 5, tricks: 3, hands: 1 }, // -20 (missed by 2)
      { bid: 2, tricks: 2, hands: 1 }, // 40 + 10 = 50
    ]);
    expect(result.totalScore).toBe(120); // 90 - 20 + 50
  });

  test('Negative scores handled correctly', () => {
    const result = calculateTotalScore([
      { bid: 5, tricks: 2, hands: 1 }, // -30 (missed by 3)
      { bid: 0, tricks: 1, hands: 1 }, // -10 (failed zero bid)
    ]);
    expect(result.totalScore).toBe(-40);
  });
});

// Test Acceptance Criterion 5: Score breakdown for transparency
describe('Acceptance Criterion 5: Score breakdown for transparency', () => {
  test('Score breakdown includes all components for exact non-zero bid', () => {
    const result = calculateScore(4, 4, 1);
    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.description).toBeDefined();
    expect(result.breakdown.base).toBe(80);
    expect(result.breakdown.bonus).toBe(10);
    expect(result.breakdown.total).toBe(90);
  });

  test('Score breakdown includes all components for missed bid', () => {
    const result = calculateScore(5, 3, 1);
    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.description).toBeDefined();
    expect(result.breakdown.base).toBe(-20);
    expect(result.breakdown.bonus).toBe(0);
    expect(result.breakdown.total).toBe(-20);
  });

  test('Score breakdown includes all components for exact zero bid', () => {
    const result = calculateScore(0, 0, 1);
    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.description).toBeDefined();
    expect(result.breakdown.base).toBe(10);
    expect(result.breakdown.bonus).toBe(0);
    expect(result.breakdown.total).toBe(10);
  });

  test('Total score breakdown provided for multiple rounds', () => {
    const result = calculateTotalScore([
      { bid: 4, tricks: 4, hands: 1 },
      { bid: 5, tricks: 3, hands: 1 },
    ]);
    expect(result.summary).toBeDefined();
    expect(result.summary.totalScore).toBe(70);
    expect(result.summary.totalRounds).toBe(2);
    expect(result.summary.roundBreakdown).toBeDefined();
    expect(result.summary.roundBreakdown.length).toBe(2);
    expect(result.summary.roundBreakdown[0].score).toBe(90);
    expect(result.summary.roundBreakdown[1].score).toBe(-20);
  });
});

// Error handling tests
describe('Error handling', () => {
  test('Throws error for invalid bid', () => {
    expect(() => calculateScore(-1, 4, 1)).toThrow('Invalid bid');
    expect(() => calculateScore(3.5, 4, 1)).toThrow('Invalid bid');
  });

  test('Throws error for invalid tricks', () => {
    expect(() => calculateScore(4, -1, 1)).toThrow('Invalid tricks');
    expect(() => calculateScore(4, 3.5, 1)).toThrow('Invalid tricks');
  });

  test('Throws error for invalid hands', () => {
    expect(() => calculateScore(4, 4, 0)).toThrow('Invalid hands');
    expect(() => calculateScore(4, 4, -1)).toThrow('Invalid hands');
    expect(() => calculateScore(4, 4, 1.5)).toThrow('Invalid hands');
  });

  test('Throws error if rounds is not an array', () => {
    expect(() => calculateTotalScore(null)).toThrow('Rounds must be an array');
    expect(() => calculateTotalScore('not an array')).toThrow('Rounds must be an array');
  });
});
