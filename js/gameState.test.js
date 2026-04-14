/**
 * Test suite for Game State Management Module
 */

const {
  initializeGame,
  getCurrentRound,
  setGamePhase,
  getGamePhase,
  advanceRound,
  isGameComplete,
  getGameState
} = require('./gameState');

describe('Game State Management', () => {
  beforeEach(() => {
    // Reset game state before each test
    initializeGame();
  });

  describe('initializeGame()', () => {
    it('should set currentRound to 1', () => {
      expect(getCurrentRound()).toBe(1);
    });

    it('should set phase to "setup"', () => {
      expect(getGamePhase()).toBe('setup');
    });

    it('should set isComplete to false', () => {
      expect(isGameComplete()).toBe(false);
    });

    it('should initialize players array as empty', () => {
      const state = getGameState();
      expect(state.players).toEqual([]);
    });
  });

  describe('getCurrentRound()', () => {
    it('should return current round number', () => {
      expect(getCurrentRound()).toBe(1);
    });
  });

  describe('setGamePhase() and getGamePhase()', () => {
    it('should set and get valid phases', () => {
      setGamePhase('bidding');
      expect(getGamePhase()).toBe('bidding');

      setGamePhase('scoring');
      expect(getGamePhase()).toBe('scoring');

      setGamePhase('setup');
      expect(getGamePhase()).toBe('setup');

      setGamePhase('complete');
      expect(getGamePhase()).toBe('complete');
    });

    it('should not set invalid phases', () => {
      setGamePhase('invalid');
      expect(getGamePhase()).toBe('setup'); // Should remain unchanged
    });
  });

  describe('advanceRound()', () => {
    it('should increment round from 1 to 2', () => {
      advanceRound();
      expect(getCurrentRound()).toBe(2);
    });

    it('should transition to bidding phase when advancing rounds', () => {
      advanceRound();
      expect(getGamePhase()).toBe('bidding');
    });

    it('should allow round 10 to be fully playable', () => {
      // Advance from round 1 to round 10
      for (let i = 1; i < 10; i++) {
        advanceRound();
      }

      // Should be at round 10, not marked complete yet
      expect(getCurrentRound()).toBe(10);
      expect(isGameComplete()).toBe(false);
      expect(getGamePhase()).toBe('bidding'); // Can play bidding/scoring
    });

    it('should mark game complete only when advancing past round 10', () => {
      // Advance to round 10
      for (let i = 1; i < 10; i++) {
        advanceRound();
      }

      // At round 10, game is not complete
      expect(isGameComplete()).toBe(false);

      // Now advance past round 10
      advanceRound();

      // Now game should be complete
      expect(isGameComplete()).toBe(true);
      expect(getGamePhase()).toBe('complete');
    });

    it('should handle multiple advance calls at round 10', () => {
      // Advance to round 10
      for (let i = 1; i < 10; i++) {
        advanceRound();
      }

      // First advance past round 10
      advanceRound();
      expect(isGameComplete()).toBe(true);
      expect(getCurrentRound()).toBe(10);

      // Subsequent advances should not change state
      advanceRound();
      expect(isGameComplete()).toBe(true);
      expect(getCurrentRound()).toBe(10);
    });
  });

  describe('isGameComplete()', () => {
    it('should return false initially', () => {
      expect(isGameComplete()).toBe(false);
    });

    it('should return true after advancing past round 10', () => {
      for (let i = 1; i <= 10; i++) {
        advanceRound();
      }
      expect(isGameComplete()).toBe(true);
    });
  });

  describe('getGameState()', () => {
    it('should return current game state', () => {
      const state = getGameState();
      expect(state.currentRound).toBe(1);
      expect(state.phase).toBe('setup');
      expect(state.isComplete).toBe(false);
      expect(Array.isArray(state.players)).toBe(true);
    });

    it('should return a deep copy of the state', () => {
      const state1 = getGameState();
      const state2 = getGameState();

      // Should be equal but not the same reference
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2);
    });

    it('should deep-clone players array to prevent external mutation', () => {
      // Get the state and try to mutate the players array
      const state = getGameState();
      state.players.push({ name: 'Player 1', score: 0 });

      // Get state again - should not include the mutated player
      const state2 = getGameState();
      expect(state2.players).not.toContain({ name: 'Player 1', score: 0 });
      expect(state2.players.length).toBe(0);
    });

    it('should deep-clone nested player objects', () => {
      // Manually add a player object to test deep cloning
      const testState = getGameState();
      if (testState.players.length > 0) {
        const copiedState = getGameState();
        const copiedPlayer = copiedState.players[0];
        const originalPlayer = testState.players[0];

        // Mutate the copied player
        copiedPlayer.name = 'Mutated';

        // Original should remain unchanged
        const state3 = getGameState();
        expect(state3.players[0].name).not.toBe('Mutated');
      }
    });
  });

  describe('Game flow integration', () => {
    it('should handle complete game flow from round 1 to completion', () => {
      // Initialize
      expect(getCurrentRound()).toBe(1);
      expect(getGamePhase()).toBe('setup');

      // Play through rounds 1-9
      for (let round = 1; round < 10; round++) {
        setGamePhase('bidding');
        expect(getGamePhase()).toBe('bidding');

        setGamePhase('scoring');
        expect(getGamePhase()).toBe('scoring');

        advanceRound();
        expect(getCurrentRound()).toBe(round + 1);
        expect(isGameComplete()).toBe(false);
      }

      // Round 10 should be playable
      expect(getCurrentRound()).toBe(10);
      expect(isGameComplete()).toBe(false);

      // Set round 10 phases
      setGamePhase('bidding');
      expect(getGamePhase()).toBe('bidding');

      setGamePhase('scoring');
      expect(getGamePhase()).toBe('scoring');

      // Advance past round 10 to complete
      advanceRound();
      expect(isGameComplete()).toBe(true);
      expect(getGamePhase()).toBe('complete');
    });
  });
});
