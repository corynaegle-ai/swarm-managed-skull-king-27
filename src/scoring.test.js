/**
 * Test suite for Skull King Scoring Engine
 * 
 * Covers all acceptance criteria:
 * 1. Non-zero bid scoring (20×correct, -10×difference)
 * 2. Zero bid scoring (±10×hands)
 * 3. Bonus application only for exact bids
 * 4. Total score calculation
 * 5. Score breakdown transparency
 */

const {
  calculateRoundScore,
  calculateTotalScore,
  validateRoundScoring,
  validateRoundInputs
} = require('./scoring');

describe('Skull King Scoring Engine', () => {
  
  describe('Non-Zero Bid Scoring', () => {
    
    test('Exact bid with 1 trick and 1 hand: 20 points base + 10 bonus = 30', () => {
      const result = calculateRoundScore(1, 1, 1);
      expect(result.baseScore).toBe(20);
      expect(result.bonus).toBe(10);
      expect(result.totalScore).toBe(30);
      expect(result.breakdown.rule).toBe('Non-zero bid - exact');
    });
    
    test('Exact bid with 5 tricks and 1 hand: 100 points base + 10 bonus = 110', () => {
      const result = calculateRoundScore(5, 5, 1);
      expect(result.baseScore).toBe(100);
      expect(result.bonus).toBe(10);
      expect(result.totalScore).toBe(110);
    });
    
    test('Exact bid with 3 tricks and 2 hands: 60 points base + 20 bonus = 80', () => {
      const result = calculateRoundScore(3, 3, 2);
      expect(result.baseScore).toBe(60);
      expect(result.bonus).toBe(20);
      expect(result.totalScore).toBe(80);
    });
    
    test('Missed bid - bid 5 but got 3 tricks: -10 × 2 difference = -20', () => {
      const result = calculateRoundScore(5, 3, 1);
      expect(result.baseScore).toBe(-20);
      expect(result.bonus).toBe(0);
      expect(result.totalScore).toBe(-20);
      expect(result.breakdown.rule).toBe('Non-zero bid - missed');
    });
    
    test('Missed bid - bid 2 but got 5 tricks: -10 × 3 difference = -30', () => {
      const result = calculateRoundScore(2, 5, 1);
      expect(result.baseScore).toBe(-30);
      expect(result.bonus).toBe(0);
      expect(result.totalScore).toBe(-30);
    });
    
    test('Missed bid - bid 4 but got 0 tricks: -10 × 4 difference = -40', () => {
      const result = calculateRoundScore(4, 0, 1);
      expect(result.baseScore).toBe(-40);
      expect(result.bonus).toBe(0);
      expect(result.totalScore).toBe(-40);
    });
    
    test('Exact bid with high hand count: 4 tricks bid/taken, 5 hands = 80 + 50 = 130', () => {
      const result = calculateRoundScore(4, 4, 5);
      expect(result.baseScore).toBe(80);
      expect(result.bonus).toBe(50);
      expect(result.totalScore).toBe(130);
    });
  });
  
  describe('Zero Bid Scoring', () => {
    
    test('Zero bid exact (0 tricks) with 1 hand: +10 × 1 = 10', () => {
      const result = calculateRoundScore(0, 0, 1);
      expect(result.baseScore).toBe(10);
      expect(result.bonus).toBe(0);
      expect(result.totalScore).toBe(10);
      expect(result.breakdown.rule).toBe('Zero bid - exact');
    });
    
    test('Zero bid exact (0 tricks) with 3 hands: +10 × 3 = 30', () => {
      const result = calculateRoundScore(0, 0, 3);
      expect(result.baseScore).toBe(30);
      expect(result.bonus).toBe(0);
      expect(result.totalScore).toBe(30);
    });
    
    test('Zero bid exact (0 tricks) with 5 hands: +10 × 5 = 50', () => {
      const result = calculateRoundScore(0, 0, 5);
      expect(result.baseScore).toBe(50);
      expect(result.bonus).toBe(0);
      expect(result.totalScore).toBe(50);
    });
    
    test('Zero bid missed (1 trick taken) with 1 hand: -10 × 1 = -10', () => {
      const result = calculateRoundScore(0, 1, 1);
      expect(result.baseScore).toBe(-10);
      expect(result.bonus).toBe(0);
      expect(result.totalScore).toBe(-10);
      expect(result.breakdown.rule).toBe('Zero bid - missed');
    });
    
    test('Zero bid missed (3 tricks taken) with 2 hands: -10 × 2 = -20', () => {
      const result = calculateRoundScore(0, 3, 2);
      expect(result.baseScore).toBe(-20);
      expect(result.bonus).toBe(0);
      expect(result.totalScore).toBe(-20);
    });
    
    test('Zero bid missed (2 tricks taken) with 4 hands: -10 × 4 = -40', () => {
      const result = calculateRoundScore(0, 2, 4);
      expect(result.baseScore).toBe(-40);
      expect(result.bonus).toBe(0);
      expect(result.totalScore).toBe(-40);
    });
    
    test('Zero bids never receive bonus points even if bid is exact', () => {
      const result = calculateRoundScore(0, 0, 3);
      expect(result.bonus).toBe(0);
      expect(result.breakdown.bonus).toBe('No bonus for zero bids');
    });
  });
  
  describe('Bonus Point Rules', () => {
    
    test('Bonus applied ONLY for exact non-zero bids', () => {
      // Exact bid gets bonus
      const exact = calculateRoundScore(3, 3, 2);
      expect(exact.bonus).toBe(20);
      
      // Missed bid does not get bonus
      const missed = calculateRoundScore(3, 2, 2);
      expect(missed.bonus).toBe(0);
      
      // Zero bid does not get bonus even if exact
      const zero = calculateRoundScore(0, 0, 2);
      expect(zero.bonus).toBe(0);
    });
    
    test('Bonus is 10 × hands for exact bids', () => {
      const result1 = calculateRoundScore(2, 2, 1);
      expect(result1.bonus).toBe(10);
      
      const result2 = calculateRoundScore(2, 2, 3);
      expect(result2.bonus).toBe(30);
      
      const result3 = calculateRoundScore(2, 2, 5);
      expect(result3.bonus).toBe(50);
    });
    
    test('Bonus is 0 for any missed non-zero bid', () => {
      const result1 = calculateRoundScore(5, 3, 2);
      expect(result1.bonus).toBe(0);
      
      const result2 = calculateRoundScore(2, 5, 2);
      expect(result2.bonus).toBe(0);
      
      const result3 = calculateRoundScore(1, 0, 2);
      expect(result3.bonus).toBe(0);
    });
  });
  
  describe('Total Score Calculation', () => {
    
    test('Single round total', () => {
      const result = calculateTotalScore([
        { bid: 5, tricks: 5, hands: 1 }
      ]);
      expect(result.totalScore).toBe(110); // 20×5 + 10×1
      expect(result.rounds.length).toBe(1);
    });
    
    test('Multiple rounds accumulate correctly', () => {
      const result = calculateTotalScore([
        { bid: 5, tricks: 5, hands: 1 },  // 100 + 10 = 110
        { bid: 3, tricks: 3, hands: 1 },  // 60 + 10 = 70
        { bid: 0, tricks: 0, hands: 1 }   // 10
      ]);
      expect(result.totalScore).toBe(190); // 110 + 70 + 10
      expect(result.rounds.length).toBe(3);
    });
    
    test('Mixed exact and missed bids', () => {
      const result = calculateTotalScore([
        { bid: 3, tricks: 3, hands: 1 },   // 60 + 10 = 70
        { bid: 2, tricks: 5, hands: 1 },   // -30
        { bid: 0, tricks: 1, hands: 1 }    // -10
      ]);
      expect(result.totalScore).toBe(30); // 70 - 30 - 10
    });
    
    test('Complex scenario with varied hand counts', () => {
      const result = calculateTotalScore([
        { bid: 2, tricks: 2, hands: 1 },   // 40 + 10 = 50
        { bid: 4, tricks: 3, hands: 2 },   // -10
        { bid: 0, tricks: 0, hands: 3 },   // 30
        { bid: 1, tricks: 0, hands: 2 }    // -10
      ]);
      expect(result.totalScore).toBe(60); // 50 - 10 + 30 - 10
    });
  });
  
  describe('Score Breakdown Transparency', () => {
    
    test('Exact non-zero bid includes breakdown details', () => {
      const result = calculateRoundScore(3, 3, 2);
      expect(result.breakdown).toHaveProperty('bid', 3);
      expect(result.breakdown).toHaveProperty('tricks', 3);
      expect(result.breakdown).toHaveProperty('hands', 2);
      expect(result.breakdown).toHaveProperty('rule');
      expect(result.breakdown).toHaveProperty('formula');
      expect(result.breakdown).toHaveProperty('bonus');
      expect(result.breakdown).toHaveProperty('calculation');
      expect(result.breakdown.calculation).toBe('60 + 20 = 80');
    });
    
    test('Missed bid breakdown is transparent', () => {
      const result = calculateRoundScore(5, 2, 1);
      expect(result.breakdown.rule).toBe('Non-zero bid - missed');
      expect(result.breakdown.formula).toBe('-10 × 3');
      expect(result.breakdown.calculation).toBe('-30 + 0 = -30');
    });
    
    test('Zero bid exact breakdown', () => {
      const result = calculateRoundScore(0, 0, 3);
      expect(result.breakdown.rule).toBe('Zero bid - exact');
      expect(result.breakdown.formula).toBe('+10 × 3');
      expect(result.breakdown.bonus).toBe('No bonus for zero bids');
    });
    
    test('Zero bid missed breakdown', () => {
      const result = calculateRoundScore(0, 2, 2);
      expect(result.breakdown.rule).toBe('Zero bid - missed');
      expect(result.breakdown.formula).toBe('-10 × 2');
      expect(result.breakdown.calculation).toBe('-20 + 0 = -20');
    });
    
    test('Total score breakdown includes all rounds', () => {
      const result = calculateTotalScore([
        { bid: 2, tricks: 2, hands: 1 },
        { bid: 0, tricks: 1, hands: 1 }
      ]);
      expect(result.rounds).toHaveLength(2);
      expect(result.rounds[0]).toHaveProperty('roundNumber', 1);
      expect(result.rounds[1]).toHaveProperty('roundNumber', 2);
      expect(result.rounds[0]).toHaveProperty('roundTotal', 50);
      expect(result.rounds[1]).toHaveProperty('roundTotal', -10);
    });
  });
  
  describe('Input Validation', () => {
    
    test('Rejects negative bid', () => {
      expect(() => calculateRoundScore(-1, 0, 1)).toThrow('Invalid bid');
    });
    
    test('Rejects non-integer bid', () => {
      expect(() => calculateRoundScore(1.5, 1, 1)).toThrow('Invalid bid');
    });
    
    test('Rejects negative tricks', () => {
      expect(() => calculateRoundScore(2, -1, 1)).toThrow('Invalid tricks');
    });
    
    test('Rejects non-integer tricks', () => {
      expect(() => calculateRoundScore(2, 1.5, 1)).toThrow('Invalid tricks');
    });
    
    test('Rejects zero or negative hands', () => {
      expect(() => calculateRoundScore(2, 2, 0)).toThrow('Invalid hands');
      expect(() => calculateRoundScore(2, 2, -1)).toThrow('Invalid hands');
    });
    
    test('Rejects non-integer hands', () => {
      expect(() => calculateRoundScore(2, 2, 1.5)).toThrow('Invalid hands');
    });
    
    test('Accepts valid zero bid', () => {
      expect(() => calculateRoundScore(0, 0, 1)).not.toThrow();
    });
  });
  
  describe('Edge Cases', () => {
    
    test('Bid equals tricks exactly at boundary', () => {
      const result = calculateRoundScore(6, 6, 1);
      expect(result.totalScore).toBe(130); // 120 + 10
    });
    
    test('Zero bid with many tricks taken', () => {
      const result = calculateRoundScore(0, 10, 1);
      expect(result.totalScore).toBe(-10); // -10 × 1
    });
    
    test('High hand count multiplier', () => {
      const result = calculateRoundScore(2, 2, 10);
      expect(result.bonus).toBe(100);
      expect(result.totalScore).toBe(140); // 40 + 100
    });
    
    test('calculateTotalScore with empty array', () => {
      const result = calculateTotalScore([]);
      expect(result.totalScore).toBe(0);
      expect(result.rounds.length).toBe(0);
    });
  });
  
  describe('Validation Function', () => {
    
    test('validateRoundScoring returns true for correct score', () => {
      const isValid = validateRoundScoring(5, 5, 1, 110);
      expect(isValid).toBe(true);
    });
    
    test('validateRoundScoring returns false for incorrect score', () => {
      const isValid = validateRoundScoring(5, 5, 1, 100);
      expect(isValid).toBe(false);
    });
    
    test('validateRoundScoring works for missed bids', () => {
      const isValid = validateRoundScoring(5, 3, 1, -20);
      expect(isValid).toBe(true);
    });
    
    test('validateRoundScoring works for zero bids', () => {
      const isValid = validateRoundScoring(0, 0, 2, 20);
      expect(isValid).toBe(true);
    });
  });
});
