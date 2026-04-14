/**
 * Player Manager Tests
 * Comprehensive test suite for player management functionality
 */

import { 
  addPlayer, 
  removePlayer, 
  updatePlayerScore, 
  getPlayer, 
  getAllPlayers, 
  calculateFinalScores,
  resetPlayers,
  getPlayerTotalScore
} from './playerManager.js';

// Mock gameState for testing
jest.mock('./gameState.js', () => ({
  getCurrentRound: jest.fn(() => 0),
  getTotalRounds: jest.fn(() => 5)
}));

describe('Player Manager', () => {
  
  beforeEach(() => {
    resetPlayers();
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('addPlayer()', () => {
    test('should create a player with unique id and empty scores array', () => {
      const player = addPlayer('Alice');
      
      expect(player).toHaveProperty('id');
      expect(player).toHaveProperty('name', 'Alice');
      expect(player).toHaveProperty('scores');
      expect(Array.isArray(player.scores)).toBe(true);
      expect(player.scores.length).toBe(0);
      expect(player.totalScore).toBe(0);
    });

    test('should create multiple players with unique ids', () => {
      const player1 = addPlayer('Alice');
      const player2 = addPlayer('Bob');
      
      expect(player1.id).not.toBe(player2.id);
      expect(player1.id).toBeDefined();
      expect(player2.id).toBeDefined();
    });

    test('should throw error for empty name', () => {
      expect(() => addPlayer('')).toThrow();
      expect(() => addPlayer('   ')).toThrow();
    });

    test('should throw error for non-string name', () => {
      expect(() => addPlayer(null)).toThrow();
      expect(() => addPlayer(undefined)).toThrow();
      expect(() => addPlayer(123)).toThrow();
    });

    test('should trim whitespace from player names', () => {
      const player = addPlayer('  Alice  ');
      expect(player.name).toBe('Alice');
    });
  });

  describe('removePlayer()', () => {
    test('should remove an existing player', () => {
      const player = addPlayer('Alice');
      const removed = removePlayer(player.id);
      
      expect(removed).toBe(true);
      expect(getPlayer(player.id)).toBeNull();
    });

    test('should return false when removing non-existent player', () => {
      const removed = removePlayer(999);
      expect(removed).toBe(false);
    });

    test('should not affect other players', () => {
      const player1 = addPlayer('Alice');
      const player2 = addPlayer('Bob');
      
      removePlayer(player1.id);
      
      expect(getPlayer(player1.id)).toBeNull();
      expect(getPlayer(player2.id)).not.toBeNull();
    });
  });

  describe('updatePlayerScore()', () => {
    test('should add score for current round', () => {
      const player = addPlayer('Alice');
      updatePlayerScore(player.id, 50);
      
      const updated = getPlayer(player.id);
      expect(updated.scores[0]).toBe(50);
      expect(updated.totalScore).toBe(50);
    });

    test('should update total score correctly', () => {
      const player = addPlayer('Alice');
      updatePlayerScore(player.id, 30);
      
      const updated = getPlayer(player.id);
      expect(updated.totalScore).toBe(30);
    });

    test('should throw error for invalid player id', () => {
      expect(() => updatePlayerScore(999, 50)).toThrow();
    });

    test('should throw error for non-numeric score', () => {
      const player = addPlayer('Alice');
      expect(() => updatePlayerScore(player.id, 'invalid')).toThrow();
      expect(() => updatePlayerScore(player.id, null)).toThrow();
    });

    test('should handle negative scores', () => {
      const player = addPlayer('Alice');
      updatePlayerScore(player.id, -10);
      
      const updated = getPlayer(player.id);
      expect(updated.scores[0]).toBe(-10);
      expect(updated.totalScore).toBe(-10);
    });

    test('should handle zero scores', () => {
      const player = addPlayer('Alice');
      updatePlayerScore(player.id, 0);
      
      const updated = getPlayer(player.id);
      expect(updated.scores[0]).toBe(0);
    });
  });

  describe('getPlayer()', () => {
    test('should return player by id', () => {
      const created = addPlayer('Alice');
      const retrieved = getPlayer(created.id);
      
      expect(retrieved).not.toBeNull();
      expect(retrieved.name).toBe('Alice');
    });

    test('should return null for non-existent player', () => {
      const player = getPlayer(999);
      expect(player).toBeNull();
    });

    test('should return a defensive copy', () => {
      const created = addPlayer('Alice');
      const retrieved = getPlayer(created.id);
      
      // Modify the returned copy
      retrieved.scores.push(999);
      
      // Original should be unaffected
      const retrieved2 = getPlayer(created.id);
      expect(retrieved2.scores.length).toBe(0);
    });
  });

  describe('getAllPlayers()', () => {
    test('should return empty array when no players', () => {
      const players = getAllPlayers();
      expect(Array.isArray(players)).toBe(true);
      expect(players.length).toBe(0);
    });

    test('should return all players', () => {
      addPlayer('Alice');
      addPlayer('Bob');
      addPlayer('Charlie');
      
      const players = getAllPlayers();
      expect(players.length).toBe(3);
    });

    test('should return defensive copies', () => {
      const created = addPlayer('Alice');
      const allPlayers = getAllPlayers();
      
      // Modify the returned array
      allPlayers[0].scores.push(999);
      allPlayers[0].name = 'Hacked';
      
      // Original should be unaffected
      const retrieved = getPlayer(created.id);
      expect(retrieved.scores.length).toBe(0);
      expect(retrieved.name).toBe('Alice');
    });
  });

  describe('calculateFinalScores()', () => {
    test('should return players sorted by total score descending', () => {
      const player1 = addPlayer('Alice');
      const player2 = addPlayer('Bob');
      const player3 = addPlayer('Charlie');
      
      updatePlayerScore(player1.id, 100);
      updatePlayerScore(player2.id, 50);
      updatePlayerScore(player3.id, 75);
      
      const sorted = calculateFinalScores();
      
      expect(sorted[0].name).toBe('Alice');
      expect(sorted[0].totalScore).toBe(100);
      expect(sorted[1].name).toBe('Charlie');
      expect(sorted[1].totalScore).toBe(75);
      expect(sorted[2].name).toBe('Bob');
      expect(sorted[2].totalScore).toBe(50);
    });

    test('should handle players with same score', () => {
      const player1 = addPlayer('Alice');
      const player2 = addPlayer('Bob');
      
      updatePlayerScore(player1.id, 50);
      updatePlayerScore(player2.id, 50);
      
      const sorted = calculateFinalScores();
      
      expect(sorted.length).toBe(2);
      expect(sorted[0].totalScore).toBe(50);
      expect(sorted[1].totalScore).toBe(50);
    });

    test('should handle negative scores', () => {
      const player1 = addPlayer('Alice');
      const player2 = addPlayer('Bob');
      
      updatePlayerScore(player1.id, -50);
      updatePlayerScore(player2.id, 30);
      
      const sorted = calculateFinalScores();
      
      expect(sorted[0].name).toBe('Bob');
      expect(sorted[0].totalScore).toBe(30);
      expect(sorted[1].name).toBe('Alice');
      expect(sorted[1].totalScore).toBe(-50);
    });

    test('should return defensive copies', () => {
      const created = addPlayer('Alice');
      updatePlayerScore(created.id, 100);
      
      const sorted = calculateFinalScores();
      sorted[0].totalScore = 9999;
      
      // Original should be unaffected
      const retrieved = getPlayer(created.id);
      expect(retrieved.totalScore).toBe(100);
    });
  });

  describe('Score persistence across rounds', () => {
    test('should maintain scores array across multiple rounds', () => {
      const player = addPlayer('Alice');
      
      // Simulate updating scores in different rounds
      // (In real scenario, getCurrentRound would return different values)
      updatePlayerScore(player.id, 30);
      const afterRound1 = getPlayer(player.id);
      expect(afterRound1.totalScore).toBe(30);
      expect(afterRound1.scores.length).toBe(1);
    });
  });

  describe('getPlayerTotalScore()', () => {
    test('should return total score for a player', () => {
      const player = addPlayer('Alice');
      updatePlayerScore(player.id, 75);
      
      const score = getPlayerTotalScore(player.id);
      expect(score).toBe(75);
    });

    test('should return null for non-existent player', () => {
      const score = getPlayerTotalScore(999);
      expect(score).toBeNull();
    });
  });
});
