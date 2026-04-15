const { calculateRoundScore, calculateTotalScore } = require('./scoring');

describe('calculateRoundScore', () => {
  test('non-zero exact bid without bonus', () => {
    const result = calculateRoundScore(5, 5, 1);
    expect(result.baseScore).toBe(100); // 20 * 5
    expect(result.bonusScore).toBe(0); // no bonus passed
    expect(result.totalScore).toBe(100);
    expect(result.exact).toBe(true);
  });

  test('non-zero exact bid with bonus', () => {
    const result = calculateRoundScore(5, 5, 1, 30);
    expect(result.baseScore).toBe(100); // 20 * 5
    expect(result.bonusScore).toBe(30); // bonusPoints parameter
    expect(result.totalScore).toBe(130); // 100 + 30
    expect(result.exact).toBe(true);
  });

  test('non-zero missed bid', () => {
    const result = calculateRoundScore(5, 3, 1);
    expect(result.baseScore).toBe(-20); // -10 * |5-3|
    expect(result.bonusScore).toBe(0);
    expect(result.totalScore).toBe(-20);
    expect(result.exact).toBe(false);
  });

  test('zero exact bid', () => {
    const result = calculateRoundScore(0, 0, 2);
    expect(result.baseScore).toBe(20); // 10 * 2
    expect(result.bonusScore).toBe(0);
    expect(result.totalScore).toBe(20);
    expect(result.exact).toBe(true);
  });

  test('zero missed bid', () => {
    const result = calculateRoundScore(0, 1, 1);
    expect(result.baseScore).toBe(-10); // -10 * 1
    expect(result.bonusScore).toBe(0);
    expect(result.totalScore).toBe(-10);
    expect(result.exact).toBe(false);
  });

  test('zero exact bid with multiple hands', () => {
    const result = calculateRoundScore(0, 0, 3);
    expect(result.baseScore).toBe(30); // 10 * 3
    expect(result.totalScore).toBe(30);
  });

  test('zero missed bid with multiple hands', () => {
    const result = calculateRoundScore(0, 2, 3);
    expect(result.baseScore).toBe(-30); // -10 * 3
    expect(result.totalScore).toBe(-30);
  });

  test('non-zero exact bid with multiple hands', () => {
    const result = calculateRoundScore(3, 3, 2);
    expect(result.baseScore).toBe(60); // 20 * 3
    expect(result.bonusScore).toBe(0); // no bonus passed
    expect(result.totalScore).toBe(60);
  });

  test('non-zero exact bid with multiple hands and bonus', () => {
    const result = calculateRoundScore(3, 3, 2, 15);
    expect(result.baseScore).toBe(60); // 20 * 3
    expect(result.bonusScore).toBe(15); // bonusPoints parameter
    expect(result.totalScore).toBe(75); // 60 + 15
  });
});

describe('calculateTotalScore', () => {
  test('calculates total across multiple rounds', () => {
    const result = calculateTotalScore([
      { bid: 5, tricks: 5, hands: 1 },
      { bid: 3, tricks: 3, hands: 1 },
      { bid: 0, tricks: 0, hands: 1 }
    ]);
    expect(result.totalScore).toBe(170); // 100 + 60 + 10
    expect(result.roundCount).toBe(3);
  });

  test('handles mixed results', () => {
    const result = calculateTotalScore([
      { bid: 4, tricks: 4, hands: 1 },
      { bid: 2, tricks: 1, hands: 1 },
      { bid: 0, tricks: 0, hands: 2 }
    ]);
    expect(result.totalScore).toBe(90); // 80 + (-10) + 20
  });

  test('handles all missed bids', () => {
    const result = calculateTotalScore([
      { bid: 3, tricks: 1, hands: 1 },
      { bid: 2, tricks: 4, hands: 1 },
      { bid: 0, tricks: 1, hands: 1 }
    ]);
    expect(result.totalScore).toBe(-50); // -20 + (-20) + (-10)
  });
});