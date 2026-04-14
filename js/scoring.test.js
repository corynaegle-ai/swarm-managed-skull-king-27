/**
 * Unit tests for scoring.js
 * Tests all scoring scenarios including edge cases
 */

// Import the scoring functions
const { calculateRoundScore, calculateTotalScore } = require('./scoring');

describe('calculateRoundScore', () => {
  
  describe('Non-zero bid scoring', () => {
    test('should award 20 points per trick when bid is exact', () => {
      expect(calculateRoundScore(3, 3, 1)).toBe(60);
      expect(calculateRoundScore(5, 5, 2)).toBe(100);
      expect(calculateRoundScore(1, 1, 3)).toBe(20);
    });
    
    test('should deduct 10 points per difference when bid is not exact', () => {
      expect(calculateRoundScore(3, 2, 1)).toBe(-10);
      expect(calculateRoundScore(5, 3, 2)).toBe(-20);
      expect(calculateRoundScore(4, 1, 3)).toBe(-30);
    });
    
    test('should handle bid higher than tricks won', () => {
      expect(calculateRoundScore(5, 2, 1)).toBe(-30);
    });
    
    test('should handle tricks won higher than bid', () => {
      expect(calculateRoundScore(2, 5, 1)).toBe(-30);
    });
  });
  
  describe('Zero bid scoring', () => {
    test('should award 10×handNumber when zero bid is exact (no tricks)', () => {
      expect(calculateRoundScore(0, 0, 1)).toBe(10);
      expect(calculateRoundScore(0, 0, 5)).toBe(50);
      expect(calculateRoundScore(0, 0, 13)).toBe(130);
    });
    
    test('should deduct 10×handNumber when zero bid is not exact (any tricks taken)', () => {
      expect(calculateRoundScore(0, 1, 1)).toBe(-10);
      expect(calculateRoundScore(0, 2, 5)).toBe(-50);
      expect(calculateRoundScore(0, 3, 13)).toBe(-130);
    });
  });
  
  describe('Input validation', () => {
    test('should throw error for invalid bid', () => {
      expect(() => calculateRoundScore(-1, 2, 1)).toThrow();
      expect(() => calculateRoundScore(3.5, 2, 1)).toThrow();
      expect(() => calculateRoundScore('3', 2, 1)).toThrow();
    });
    
    test('should throw error for invalid tricksWon', () => {
      expect(() => calculateRoundScore(3, -1, 1)).toThrow();
      expect(() => calculateRoundScore(3, 2.5, 1)).toThrow();
      expect(() => calculateRoundScore(3, '2', 1)).toThrow();
    });
    
    test('should throw error for invalid handNumber', () => {
      expect(() => calculateRoundScore(3, 2, 0)).toThrow();
      expect(() => calculateRoundScore(3, 2, -1)).toThrow();
      expect(() => calculateRoundScore(3, 2, 2.5)).toThrow();
      expect(() => calculateRoundScore(3, 2, '2')).toThrow();
    });
  });
});

describe('calculateTotalScore', () => {
  
  test('should sum all round scores correctly', () => {
    const scores = [60, -10, 50, 100];
    expect(calculateTotalScore(scores)).toBe(200);
  });
  
  test('should handle empty array', () => {
    expect(calculateTotalScore([])).toBe(0);
  });
  
  test('should handle single score', () => {
    expect(calculateTotalScore([75])).toBe(75);
  });
  
  test('should handle negative scores', () => {
    const scores = [60, -10, -20, 100];
    expect(calculateTotalScore(scores)).toBe(130);
  });
  
  test('should handle all negative scores', () => {
    const scores = [-10, -20, -30];
    expect(calculateTotalScore(scores)).toBe(-60);
  });
  
  test('should throw error for non-array input', () => {
    expect(() => calculateTotalScore('not an array')).toThrow();
    expect(() => calculateTotalScore(123)).toThrow();
    expect(() => calculateTotalScore(null)).toThrow();
  });
  
  test('should throw error for array with non-number elements', () => {
    expect(() => calculateTotalScore([60, 'invalid', 50])).toThrow();
    expect(() => calculateTotalScore([60, null, 50])).toThrow();
  });
});
