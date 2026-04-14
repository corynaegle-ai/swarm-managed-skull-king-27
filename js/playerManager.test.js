import * as playerManager from './playerManager.js';

/**
 * Test suite for playerManager.js
 */

describe('PlayerManager', () => {
  beforeEach(() => {
    playerManager.resetPlayers();
  });

  describe('addPlayer()', () => {
    test('should create a player with unique id and empty scores array', () => {
      const player = playerManager.addPlayer('Alice');

      expect(player).toBeDefined();
      expect(player.id).toBeDefined();
      expect(typeof player.id).toBe('number');
      expect(player.name).toBe('Alice');
      expect(Array.isArray(player.scores)).toBe(true);
      expect(player.scores.length).toBe(0);
      expect(player.totalScore).toBe(0);
    });

    test('should generate unique IDs for different players', () => {
      const player1 = playerManager.addPlayer('Alice');
      const player2 = playerManager.addPlayer('Bob');
      const player3 = playerManager.addPlayer('Charlie');

      const ids = [player1.id, player2.id, player3.id];
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
      expect(player1.id).not.toBe(player2.id);
      expect(player2.id).not.toBe(player3.id);
    });

    test('should throw error for empty name', () => {
      expect(() => playerManager.addPlayer('')).toThrow();
      expect(() => playerManager.addPlayer('   ')).toThrow();
    });

    test('should throw error for invalid name', () => {
      expect(() => playerManager.addPlayer(null)).toThrow();
      expect(() => playerManager.addPlayer(undefined)).toThrow();
      expect(() => playerManager.addPlayer(123)).toThrow();
    });

    test('should trim whitespace from player names', () => {
      const player = playerManager.addPlayer('  Alice  ');
      expect(player.name).toBe('Alice');
    });
  });

  describe('removePlayer()', () => {
    test('should remove a player by id', () => {
      const player1 = playerManager.addPlayer('Alice');
      const player2 = playerManager.addPlayer('Bob');

      expect(playerManager.getPlayerCount()).toBe(2);

      const removed = playerManager.removePlayer(player1.id);

      expect(removed).toBe(true);
      expect(playerManager.getPlayerCount()).toBe(1);
      expect(playerManager.getPlayer(player1.id)).toBeNull();
      expect(playerManager.getPlayer(player2.id)).toBeDefined();
    });

    test('should return false if player does not exist', () => {
      playerManager.addPlayer('Alice');
      const removed = playerManager.removePlayer(999);
      expect(removed).toBe(false);
    });
  });

  describe('updatePlayerScore()', () => {
    test('should add score for current round', () => {
      const player = playerManager.addPlayer('Alice');

      playerManager.updatePlayerScore(player.id, 50);

      const updatedPlayer = playerManager.getPlayer(player.id);
      expect(updatedPlayer.scores.length).toBe(1);
      expect(updatedPlayer.scores[0]).toBe(50);
      expect(updatedPlayer.totalScore).toBe(50);
    });

    test('should accumulate scores across multiple rounds', () => {
      const player = playerManager.addPlayer('Alice');

      playerManager.updatePlayerScore(player.id, 50);
      playerManager.updatePlayerScore(player.id, 30);
      playerManager.updatePlayerScore(player.id, 20);

      const updatedPlayer = playerManager.getPlayer(player.id);
      expect(updatedPlayer.scores.length).toBe(3);
      expect(updatedPlayer.scores).toEqual([50, 30, 20]);
      expect(updatedPlayer.totalScore).toBe(100);
    });

    test('should throw error if player not found', () => {
      expect(() => playerManager.updatePlayerScore(999, 50)).toThrow();
    });

    test('should throw error for invalid score', () => {
      const player = playerManager.addPlayer('Alice');
      expect(() => playerManager.updatePlayerScore(player.id, -10)).toThrow();
      expect(() => playerManager.updatePlayerScore(player.id, 'invalid')).toThrow();
      expect(() => playerManager.updatePlayerScore(player.id, null)).toThrow();
    });
  });

  describe('getPlayer()', () => {
    test('should return player by id', () => {
      const player = playerManager.addPlayer('Alice');
      const retrieved = playerManager.getPlayer(player.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(player.id);
      expect(retrieved.name).toBe('Alice');
    });

    test('should return null for non-existent player', () => {
      playerManager.addPlayer('Alice');
      const retrieved = playerManager.getPlayer(999);
      expect(retrieved).toBeNull();
    });
  });

  describe('getAllPlayers()', () => {
    test('should return array of all players', () => {
      const player1 = playerManager.addPlayer('Alice');
      const player2 = playerManager.addPlayer('Bob');
      const player3 = playerManager.addPlayer('Charlie');

      const all = playerManager.getAllPlayers();

      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(3);
      expect(all.some(p => p.id === player1.id)).toBe(true);
      expect(all.some(p => p.id === player2.id)).toBe(true);
      expect(all.some(p => p.id === player3.id)).toBe(true);
    });

    test('should return empty array when no players exist', () => {
      const all = playerManager.getAllPlayers();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(0);
    });

    test('should return a copy of the players array', () => {
      playerManager.addPlayer('Alice');
      const all = playerManager.getAllPlayers();
      all.push({ id: 999, name: 'Fake' });

      const all2 = playerManager.getAllPlayers();
      expect(all2.length).toBe(1);
    });
  });

  describe('calculateFinalScores()', () => {
    test('should return players sorted by total score (highest first)', () => {
      const player1 = playerManager.addPlayer('Alice');
      const player2 = playerManager.addPlayer('Bob');
      const player3 = playerManager.addPlayer('Charlie');

      playerManager.updatePlayerScore(player1.id, 100);
      playerManager.updatePlayerScore(player2.id, 150);
      playerManager.updatePlayerScore(player3.id, 75);

      const sorted = playerManager.calculateFinalScores();

      expect(sorted[0].id).toBe(player2.id);
      expect(sorted[0].totalScore).toBe(150);
      expect(sorted[1].id).toBe(player1.id);
      expect(sorted[1].totalScore).toBe(100);
      expect(sorted[2].id).toBe(player3.id);
      expect(sorted[2].totalScore).toBe(75);
    });

    test('should handle players with equal scores', () => {
      const player1 = playerManager.addPlayer('Alice');
      const player2 = playerManager.addPlayer('Bob');

      playerManager.updatePlayerScore(player1.id, 100);
      playerManager.updatePlayerScore(player2.id, 100);

      const sorted = playerManager.calculateFinalScores();

      expect(sorted.length).toBe(2);
      expect(sorted[0].totalScore).toBe(100);
      expect(sorted[1].totalScore).toBe(100);
    });

    test('should persist player scores after calculation', () => {
      const player = playerManager.addPlayer('Alice');
      playerManager.updatePlayerScore(player.id, 50);

      playerManager.calculateFinalScores();

      const retrieved = playerManager.getPlayer(player.id);
      expect(retrieved.scores).toEqual([50]);
      expect(retrieved.totalScore).toBe(50);
    });

    test('should return a copy and not allow external mutation', () => {
      const player = playerManager.addPlayer('Alice');
      playerManager.updatePlayerScore(player.id, 50);

      const sorted = playerManager.calculateFinalScores();
      sorted[0].totalScore = 999;
      sorted[0].scores.push(999);

      const retrieved = playerManager.getPlayer(player.id);
      expect(retrieved.totalScore).toBe(50);
      expect(retrieved.scores).toEqual([50]);
    });
  });

  describe('score persistence across rounds', () => {
    test('should maintain scores across multiple round updates', () => {
      const player1 = playerManager.addPlayer('Alice');
      const player2 = playerManager.addPlayer('Bob');

      // Round 1
      playerManager.updatePlayerScore(player1.id, 50);
      playerManager.updatePlayerScore(player2.id, 40);

      // Round 2
      playerManager.updatePlayerScore(player1.id, 30);
      playerManager.updatePlayerScore(player2.id, 60);

      // Round 3
      playerManager.updatePlayerScore(player1.id, 20);
      playerManager.updatePlayerScore(player2.id, 10);

      const p1 = playerManager.getPlayer(player1.id);
      const p2 = playerManager.getPlayer(player2.id);

      expect(p1.scores).toEqual([50, 30, 20]);
      expect(p1.totalScore).toBe(100);
      expect(p2.scores).toEqual([40, 60, 10]);
      expect(p2.totalScore).toBe(110);
    });

    test('should correctly calculate final scores after multiple rounds', () => {
      const player1 = playerManager.addPlayer('Alice');
      const player2 = playerManager.addPlayer('Bob');
      const player3 = playerManager.addPlayer('Charlie');

      // Round 1
      playerManager.updatePlayerScore(player1.id, 50);
      playerManager.updatePlayerScore(player2.id, 40);
      playerManager.updatePlayerScore(player3.id, 60);

      // Round 2
      playerManager.updatePlayerScore(player1.id, 30);
      playerManager.updatePlayerScore(player2.id, 70);
      playerManager.updatePlayerScore(player3.id, 20);

      const final = playerManager.calculateFinalScores();

      expect(final[0].name).toBe('Bob');
      expect(final[0].totalScore).toBe(110);
      expect(final[1].name).toBe('Alice');
      expect(final[1].totalScore).toBe(80);
      expect(final[2].name).toBe('Charlie');
      expect(final[2].totalScore).toBe(80);
    });
  });
});
