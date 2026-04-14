// Test suite for gameState module
const gameState = require('./gameState');

describe('gameState module', () => {
  beforeEach(() => {
    gameState.initializeGame();
  });

  describe('initializeGame()', () => {
    test('initializes game to round 1, setup phase', () => {
      gameState.initializeGame();
      expect(gameState.getCurrentRound()).toBe(1);
      expect(gameState.getGamePhase()).toBe('setup');
      expect(gameState.isGameComplete()).toBe(false);
    });

    test('initializes with empty players array by default', () => {
      gameState.initializeGame();
      const state = gameState.getGameState();
      expect(state.players).toEqual([]);
    });

    test('initializes with provided players array and deep clones it', () => {
      const players = [
        { id: 1, name: 'Alice', score: 0 },
        { id: 2, name: 'Bob', score: 0 }
      ];
      gameState.initializeGame(players);
      const state = gameState.getGameState();
      expect(state.players).toHaveLength(2);
      expect(state.players[0]).toEqual(players[0]);
      // Verify deep clone: mutating returned players shouldn't affect internal state
      state.players[0].score = 100;
      const state2 = gameState.getGameState();
      expect(state2.players[0].score).toBe(0);
    });
  });

  describe('getCurrentRound()', () => {
    test('returns 1 after initialization', () => {
      gameState.initializeGame();
      expect(gameState.getCurrentRound()).toBe(1);
    });

    test('returns correct round after advancing', () => {
      gameState.initializeGame();
      gameState.advanceRound();
      expect(gameState.getCurrentRound()).toBe(2);
    });
  });

  describe('setGamePhase() and getGamePhase()', () => {
    test('sets and gets phase correctly', () => {
      gameState.setGamePhase('bidding');
      expect(gameState.getGamePhase()).toBe('bidding');
      gameState.setGamePhase('scoring');
      expect(gameState.getGamePhase()).toBe('scoring');
    });

    test('throws error for invalid phase', () => {
      expect(() => gameState.setGamePhase('invalid')).toThrow();
    });

    test('accepts valid phases: setup, bidding, scoring, complete', () => {
      const validPhases = ['setup', 'bidding', 'scoring', 'complete'];
      validPhases.forEach(phase => {
        expect(() => gameState.setGamePhase(phase)).not.toThrow();
        expect(gameState.getGamePhase()).toBe(phase);
      });
    });
  });

  describe('advanceRound()', () => {
    test('increments round from 1 to 2', () => {
      gameState.initializeGame();
      gameState.advanceRound();
      expect(gameState.getCurrentRound()).toBe(2);
    });

    test('sets phase to bidding when advancing normal rounds', () => {
      gameState.initializeGame();
      gameState.advanceRound();
      expect(gameState.getGamePhase()).toBe('bidding');
    });

    test('advances through all 10 rounds', () => {
      gameState.initializeGame();
      for (let i = 1; i < 10; i++) {
        expect(gameState.getCurrentRound()).toBe(i);
        gameState.advanceRound();
      }
      expect(gameState.getCurrentRound()).toBe(10);
    });

    test('marks game complete when advancing from round 10', () => {
      gameState.initializeGame();
      // Advance to round 10
      for (let i = 0; i < 9; i++) {
        gameState.advanceRound();
      }
      expect(gameState.getCurrentRound()).toBe(10);
      expect(gameState.isGameComplete()).toBe(false);
      // Advance past round 10
      gameState.advanceRound();
      expect(gameState.getCurrentRound()).toBe(10); // Should stay at 10
      expect(gameState.isGameComplete()).toBe(true);
      expect(gameState.getGamePhase()).toBe('complete');
    });

    test('does not advance past round 10', () => {
      gameState.initializeGame();
      // Advance to round 10 and complete
      for (let i = 0; i < 10; i++) {
        gameState.advanceRound();
      }
      expect(gameState.getCurrentRound()).toBe(10);
      gameState.advanceRound(); // Try to advance again
      expect(gameState.getCurrentRound()).toBe(10); // Should still be 10
    });
  });

  describe('isGameComplete()', () => {
    test('returns false at initialization', () => {
      gameState.initializeGame();
      expect(gameState.isGameComplete()).toBe(false);
    });

    test('returns true after 10 rounds are completed', () => {
      gameState.initializeGame();
      for (let i = 0; i < 10; i++) {
        gameState.advanceRound();
      }
      expect(gameState.isGameComplete()).toBe(true);
    });
  });

  describe('getGameState()', () => {
    test('returns complete game state object', () => {
      gameState.initializeGame();
      const state = gameState.getGameState();
      expect(state).toHaveProperty('currentRound');
      expect(state).toHaveProperty('phase');
      expect(state).toHaveProperty('players');
      expect(state).toHaveProperty('isComplete');
    });

    test('returns a deep copy that does not affect internal state', () => {
      const players = [
        { id: 1, name: 'Alice', score: 0 }
      ];
      gameState.initializeGame(players);
      const state1 = gameState.getGameState();
      state1.currentRound = 99;
      state1.phase = 'invalid';
      state1.isComplete = true;
      state1.players[0].score = 1000;

      const state2 = gameState.getGameState();
      expect(state2.currentRound).toBe(1);
      expect(state2.phase).toBe('setup');
      expect(state2.isComplete).toBe(false);
      expect(state2.players[0].score).toBe(0);
    });

    test('reflects state changes after operations', () => {
      gameState.initializeGame();
      gameState.advanceRound();
      gameState.setGamePhase('scoring');
      const state = gameState.getGameState();
      expect(state.currentRound).toBe(2);
      expect(state.phase).toBe('scoring');
    });
  });

  describe('Integration tests', () => {
    test('full game flow from setup to complete', () => {
      const players = [
        { id: 1, name: 'Alice', score: 0 },
        { id: 2, name: 'Bob', score: 0 }
      ];
      gameState.initializeGame(players);
      expect(gameState.getGamePhase()).toBe('setup');

      // Advance through all 10 rounds
      for (let round = 1; round <= 10; round++) {
        const state = gameState.getGameState();
        expect(state.currentRound).toBe(round);
        if (round < 10) {
          expect(gameState.isGameComplete()).toBe(false);
        }
        gameState.advanceRound();
      }

      // After 10 rounds, game should be complete
      expect(gameState.getCurrentRound()).toBe(10);
      expect(gameState.isGameComplete()).toBe(true);
      expect(gameState.getGamePhase()).toBe('complete');
    });

    test('state remains consistent across multiple getGameState calls', () => {
      gameState.initializeGame();
      gameState.advanceRound();
      const state1 = gameState.getGameState();
      const state2 = gameState.getGameState();
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different objects
    });
  });
});
