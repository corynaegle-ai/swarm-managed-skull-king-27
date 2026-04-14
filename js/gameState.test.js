/**
 * gameState.test.js - Unit tests for game state management
 */

// Test suite for GameState module
describe('GameState', function() {

  beforeEach(function() {
    // Reset game state before each test
    GameState.initializeGame();
  });

  describe('initializeGame()', function() {
    it('should reset state to round 1, setup phase', function() {
      GameState.initializeGame();
      expect(GameState.getCurrentRound()).toBe(1);
      expect(GameState.getGamePhase()).toBe('setup');
      expect(GameState.isGameComplete()).toBe(false);
    });

    it('should clear players array on initialization', function() {
      const state = GameState.getGameState();
      expect(Array.isArray(state.players)).toBe(true);
      expect(state.players.length).toBe(0);
    });
  });

  describe('getCurrentRound()', function() {
    it('should return current round number', function() {
      expect(GameState.getCurrentRound()).toBe(1);
    });
  });

  describe('Phase Management', function() {
    it('setGamePhase() should set phase to valid values', function() {
      GameState.setGamePhase('bidding');
      expect(GameState.getGamePhase()).toBe('bidding');

      GameState.setGamePhase('scoring');
      expect(GameState.getGamePhase()).toBe('scoring');

      GameState.setGamePhase('complete');
      expect(GameState.getGamePhase()).toBe('complete');
    });

    it('setGamePhase() should throw error for invalid phase', function() {
      expect(function() {
        GameState.setGamePhase('invalid');
      }).toThrow();
    });

    it('getGamePhase() should return setup phase initially', function() {
      expect(GameState.getGamePhase()).toBe('setup');
    });
  });

  describe('advanceRound()', function() {
    it('should increment round number', function() {
      for (let i = 1; i < 10; i++) {
        expect(GameState.getCurrentRound()).toBe(i);
        GameState.advanceRound();
      }
      expect(GameState.getCurrentRound()).toBe(10);
    });

    it('should mark game as complete at round 10', function() {
      for (let i = 0; i < 9; i++) {
        GameState.advanceRound();
      }
      expect(GameState.isGameComplete()).toBe(true);
      expect(GameState.getCurrentRound()).toBe(10);
    });

    it('should set phase to complete when game finishes', function() {
      for (let i = 0; i < 9; i++) {
        GameState.advanceRound();
      }
      expect(GameState.getGamePhase()).toBe('complete');
    });

    it('should not advance beyond round 10', function() {
      for (let i = 0; i < 10; i++) {
        GameState.advanceRound();
      }
      expect(GameState.getCurrentRound()).toBe(10);
      GameState.advanceRound();
      expect(GameState.getCurrentRound()).toBe(10);
    });
  });

  describe('isGameComplete()', function() {
    it('should return false initially', function() {
      expect(GameState.isGameComplete()).toBe(false);
    });

    it('should return true after 9 advances', function() {
      for (let i = 0; i < 9; i++) {
        GameState.advanceRound();
      }
      expect(GameState.isGameComplete()).toBe(true);
    });
  });

  describe('getGameState()', function() {
    it('should return complete game state object', function() {
      const state = GameState.getGameState();
      expect(state.currentRound).toBe(1);
      expect(state.phase).toBe('setup');
      expect(state.isComplete).toBe(false);
      expect(Array.isArray(state.players)).toBe(true);
    });

    it('should return a copy of state, not reference', function() {
      const state1 = GameState.getGameState();
      const state2 = GameState.getGameState();
      state1.currentRound = 999;
      expect(state2.currentRound).toBe(1);
    });
  });

  describe('Round transitions', function() {
    it('should transition through all 10 rounds correctly', function() {
      for (let round = 1; round <= 10; round++) {
        expect(GameState.getCurrentRound()).toBe(round);
        if (round < 10) {
          GameState.advanceRound();
        }
      }
    });
  });

});
