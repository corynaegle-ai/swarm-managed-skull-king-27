import { 
  addPlayer, 
  removePlayer, 
  updatePlayerScore, 
  getPlayer, 
  getAllPlayers, 
  calculateFinalScores,
  clearAllPlayers,
  resetPlayerIdCounter
} from './playerManager.js';

// Mock gameState
jest.mock('./gameState.js', () => ({
  getCurrentRound: jest.fn(() => 1)
}));

import { getCurrentRound } from './gameState.js';

describe('playerManager', () => {
  beforeEach(() => {
    clearAllPlayers();
    resetPlayerIdCounter();
    getCurrentRound.mockReturnValue(1);
  });

  // ============= addPlayer Tests =============
  describe('addPlayer', () => {
    it('should create a player with unique id and empty scores array', () => {
      const player = addPlayer('Alice');
      expect(player.id).toBe(1);
      expect(player.name).toBe('Alice');
      expect(player.scores).toEqual([]);
      expect(player.totalScore).toBe(0);
    });

    it('should assign incrementing IDs to multiple players', () => {
      const player1 = addPlayer('Alice');
      const player2 = addPlayer('Bob');
      const player3 = addPlayer('Charlie');

      expect(player1.id).toBe(1);
      expect(player2.id).toBe(2);
      expect(player3.id).toBe(3);
    });

    it('should throw error for empty string', () => {
      expect(() => addPlayer('')).toThrow();
    });

    it('should throw error for whitespace-only string', () => {
      expect(() => addPlayer('   ')).toThrow();
    });

    it('should throw error for non-string input', () => {
      expect(() => addPlayer(123)).toThrow();
      expect(() => addPlayer(null)).toThrow();
      expect(() => addPlayer(undefined)).toThrow();
    });

    it('should throw error for duplicate player names (case-insensitive)', () => {
      addPlayer('Alice');
      expect(() => addPlayer('Alice')).toThrow();
      expect(() => addPlayer('ALICE')).toThrow();
      expect(() => addPlayer('alice')).toThrow();
    });

    it('should trim whitespace from player names', () => {
      const player = addPlayer('  Alice  ');
      expect(player.name).toBe('Alice');
    });
  });

  // ============= removePlayer Tests =============
  describe('removePlayer', () => {
    it('should remove a player by ID', () => {
      const player = addPlayer('Alice');
      expect(getAllPlayers().length).toBe(1);

      const removed = removePlayer(player.id);
      expect(removed).toBe(true);
      expect(getAllPlayers().length).toBe(0);
    });

    it('should return false if player does not exist', () => {
      addPlayer('Alice');
      const removed = removePlayer(999);
      expect(removed).toBe(false);
    });

    it('should throw error for invalid player ID', () => {
      expect(() => removePlayer('invalid')).toThrow();
      expect(() => removePlayer(0)).toThrow();
      expect(() => removePlayer(-1)).toThrow();
      expect(() => removePlayer(null)).toThrow();
    });
  });

  // ============= updatePlayerScore Tests =============
  describe('updatePlayerScore', () => {
    it('should add score for current round', () => {
      const player = addPlayer('Alice');
      const updated = updatePlayerScore(player.id, 10);

      expect(updated.scores).toEqual([10]);
      expect(updated.totalScore).toBe(10);
    });

    it('should recalculate totalScore correctly', () => {
      const player = addPlayer('Bob');
      updatePlayerScore(player.id, 5);
      getCurrentRound.mockReturnValue(2);
      updatePlayerScore(player.id, 15);
      getCurrentRound.mockReturnValue(3);
      updatePlayerScore(player.id, 20);

      const updated = getPlayer(player.id);
      expect(updated.scores).toEqual([5, 15, 20]);
      expect(updated.totalScore).toBe(40);
    });

    it('should throw error for invalid player ID', () => {
      expect(() => updatePlayerScore(999, 10)).toThrow();
    });

    it('should throw error for invalid score', () => {
      const player = addPlayer('Alice');
      expect(() => updatePlayerScore(player.id, 'invalid')).toThrow();
      expect(() => updatePlayerScore(player.id, Infinity)).toThrow();
      expect(() => updatePlayerScore(player.id, NaN)).toThrow();
    });

    it('should accept zero and negative scores', () => {
      const player = addPlayer('Alice');
      updatePlayerScore(player.id, 0);
      const updated1 = getPlayer(player.id);
      expect(updated1.totalScore).toBe(0);

      getCurrentRound.mockReturnValue(2);
      updatePlayerScore(player.id, -5);
      const updated2 = getPlayer(player.id);
      expect(updated2.totalScore).toBe(-5);
    });
  });

  // ============= getPlayer Tests =============
  describe('getPlayer', () => {
    it('should retrieve a player by ID', () => {
      const created = addPlayer('Alice');
      const retrieved = getPlayer(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Alice');
    });

    it('should return null for non-existent player', () => {
      const result = getPlayer(999);
      expect(result).toBeNull();
    });

    it('should throw error for invalid ID', () => {
      expect(() => getPlayer('invalid')).toThrow();
      expect(() => getPlayer(0)).toThrow();
      expect(() => getPlayer(-1)).toThrow();
    });

    it('should return a copy (not the original)', () => {
      const created = addPlayer('Alice');
      const retrieved = getPlayer(created.id);
      retrieved.name = 'Bob';

      const original = getPlayer(created.id);
      expect(original.name).toBe('Alice');
    });
  });

  // ============= getAllPlayers Tests =============
  describe('getAllPlayers', () => {
    it('should return empty array when no players exist', () => {
      const players = getAllPlayers();
      expect(players).toEqual([]);
    });

    it('should return all players', () => {
      addPlayer('Alice');
      addPlayer('Bob');
      addPlayer('Charlie');

      const allPlayers = getAllPlayers();
      expect(allPlayers).toHaveLength(3);
      expect(allPlayers.map(p => p.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should return a copy of players (not originals)', () => {
      addPlayer('Alice');
      const allPlayers = getAllPlayers();
      allPlayers[0].name = 'Bob';

      const original = getAllPlayers();
      expect(original[0].name).toBe('Alice');
    });
  });

  // ============= calculateFinalScores Tests =============
  describe('calculateFinalScores', () => {
    it('should return players sorted by total score (descending)', () => {
      const alice = addPlayer('Alice');
      const bob = addPlayer('Bob');
      const charlie = addPlayer('Charlie');

      updatePlayerScore(alice.id, 50);
      updatePlayerScore(bob.id, 100);
      updatePlayerScore(charlie.id, 25);

      const sorted = calculateFinalScores();
      expect(sorted[0].name).toBe('Bob');
      expect(sorted[0].totalScore).toBe(100);
      expect(sorted[1].name).toBe('Alice');
      expect(sorted[1].totalScore).toBe(50);
      expect(sorted[2].name).toBe('Charlie');
      expect(sorted[2].totalScore).toBe(25);
    });

    it('should handle ties correctly', () => {
      const alice = addPlayer('Alice');
      const bob = addPlayer('Bob');

      updatePlayerScore(alice.id, 50);
      updatePlayerScore(bob.id, 50);

      const sorted = calculateFinalScores();
      expect(sorted).toHaveLength(2);
      expect(sorted[0].totalScore).toBe(50);
      expect(sorted[1].totalScore).toBe(50);
    });

    it('should work with negative scores', () => {
      const alice = addPlayer('Alice');
      const bob = addPlayer('Bob');

      updatePlayerScore(alice.id, -10);
      updatePlayerScore(bob.id, 5);

      const sorted = calculateFinalScores();
      expect(sorted[0].name).toBe('Bob');
      expect(sorted[1].name).toBe('Alice');
    });

    it('should return a copy of players (not originals)', () => {
      const alice = addPlayer('Alice');
      updatePlayerScore(alice.id, 50);

      const sorted = calculateFinalScores();
      sorted[0].name = 'Bob';

      const original = getPlayer(alice.id);
      expect(original.name).toBe('Alice');
    });

    it('should work with multi-round scores', () => {
      const alice = addPlayer('Alice');
      const bob = addPlayer('Bob');
      const charlie = addPlayer('Charlie');

      // Round 1
      updatePlayerScore(alice.id, 10);
      updatePlayerScore(bob.id, 15);
      updatePlayerScore(charlie.id, 5);

      // Round 2
      getCurrentRound.mockReturnValue(2);
      updatePlayerScore(alice.id, 20);
      updatePlayerScore(bob.id, 10);
      updatePlayerScore(charlie.id, 25);

      const sorted = calculateFinalScores();
      expect(sorted[0].name).toBe('Charlie');
      expect(sorted[0].totalScore).toBe(30);
      expect(sorted[1].name).toBe('Alice');
      expect(sorted[1].totalScore).toBe(30);
      expect(sorted[2].name).toBe('Bob');
      expect(sorted[2].totalScore).toBe(25);
    });
  });

  // ============= Integration Tests =============
  describe('Integration scenarios', () => {
    it('should persist scores across rounds', () => {
      const player = addPlayer('Alice');
      
      // Round 1
      updatePlayerScore(player.id, 10);
      expect(getPlayer(player.id).totalScore).toBe(10);
      
      // Round 2
      getCurrentRound.mockReturnValue(2);
      updatePlayerScore(player.id, 20);
      expect(getPlayer(player.id).totalScore).toBe(30);
      
      // Round 3
      getCurrentRound.mockReturnValue(3);
      updatePlayerScore(player.id, 15);
      expect(getPlayer(player.id).totalScore).toBe(45);
      
      const final = calculateFinalScores();
      expect(final[0].scores).toEqual([10, 20, 15]);
      expect(final[0].totalScore).toBe(45);
    });

    it('should handle multiple players with multiple rounds', () => {
      const alice = addPlayer('Alice');
      const bob = addPlayer('Bob');
      const charlie = addPlayer('Charlie');

      // Round 1
      updatePlayerScore(alice.id, 10);
      updatePlayerScore(bob.id, 20);
      updatePlayerScore(charlie.id, 15);

      // Round 2
      getCurrentRound.mockReturnValue(2);
      updatePlayerScore(alice.id, 30);
      updatePlayerScore(bob.id, 10);
      updatePlayerScore(charlie.id, 25);

      // Round 3
      getCurrentRound.mockReturnValue(3);
      updatePlayerScore(alice.id, 20);
      updatePlayerScore(bob.id, 25);
      updatePlayerScore(charlie.id, 5);

      const final = calculateFinalScores();
      expect(final[0].name).toBe('Alice');
      expect(final[0].totalScore).toBe(60);
      expect(final[1].name).toBe('Bob');
      expect(final[1].totalScore).toBe(55);
      expect(final[2].name).toBe('Charlie');
      expect(final[2].totalScore).toBe(45);
    });
  });
});
