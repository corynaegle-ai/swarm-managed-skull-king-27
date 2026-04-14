import { addPlayer, removePlayer, updatePlayerScore, getPlayer, getAllPlayers, calculateFinalScores, clearAllPlayers, resetPlayerIdCounter } from './playerManager.js';
import { setCurrentRound } from './gameState.js';

describe('playerManager', () => {
  beforeEach(() => {
    clearAllPlayers();
    resetPlayerIdCounter();
    setCurrentRound(0);
  });

  describe('addPlayer', () => {
    it('should create a player with unique id and empty scores array', () => {
      const player1 = addPlayer('Alice');
      const player2 = addPlayer('Bob');

      expect(player1.id).toBe(0);
      expect(player1.name).toBe('Alice');
      expect(player1.scores).toEqual([]);
      expect(player1.totalScore).toBe(0);

      expect(player2.id).toBe(1);
      expect(player2.name).toBe('Bob');
      expect(player2.scores).toEqual([]);
      expect(player2.totalScore).toBe(0);
    });

    it('should throw error for invalid name', () => {
      expect(() => addPlayer('')).toThrow();
      expect(() => addPlayer(null)).toThrow();
      expect(() => addPlayer(undefined)).toThrow();
      expect(() => addPlayer(123)).toThrow();
    });

    it('should trim whitespace from player names', () => {
      const player = addPlayer('  Charlie  ');
      expect(player.name).toBe('Charlie');
    });
  });

  describe('updatePlayerScore', () => {
    it('should add score for current round', () => {
      const player = addPlayer('Alice');
      setCurrentRound(0);
      updatePlayerScore(player.id, 10);

      expect(player.scores[0]).toBe(10);
      expect(player.totalScore).toBe(10);
    });

    it('should handle multiple rounds', () => {
      const player = addPlayer('Alice');
      
      setCurrentRound(0);
      updatePlayerScore(player.id, 10);
      expect(player.totalScore).toBe(10);

      setCurrentRound(1);
      updatePlayerScore(player.id, 20);
      expect(player.totalScore).toBe(30);

      setCurrentRound(2);
      updatePlayerScore(player.id, 15);
      expect(player.totalScore).toBe(45);
    });

    it('should handle skipped rounds (sparse arrays)', () => {
      const player = addPlayer('Alice');
      
      setCurrentRound(0);
      updatePlayerScore(player.id, 10);
      
      // Skip round 1, set round 2
      setCurrentRound(2);
      updatePlayerScore(player.id, 20);
      
      // Total should only sum defined scores: 10 + 20 = 30 (not NaN)
      expect(player.totalScore).toBe(30);
      expect(player.scores[0]).toBe(10);
      expect(player.scores[1]).toBe(undefined);
      expect(player.scores[2]).toBe(20);
    });

    it('should throw error for non-existent player', () => {
      expect(() => updatePlayerScore(999, 10)).toThrow();
    });

    it('should throw error for invalid score', () => {
      const player = addPlayer('Alice');
      expect(() => updatePlayerScore(player.id, -5)).toThrow();
      expect(() => updatePlayerScore(player.id, 'invalid')).toThrow();
    });
  });

  describe('removePlayer', () => {
    it('should remove player by id', () => {
      const player1 = addPlayer('Alice');
      const player2 = addPlayer('Bob');

      expect(getAllPlayers().length).toBe(2);
      const removed = removePlayer(player1.id);
      expect(removed).toBe(true);
      expect(getAllPlayers().length).toBe(1);
      expect(getAllPlayers()[0].name).toBe('Bob');
    });

    it('should return false if player does not exist', () => {
      const removed = removePlayer(999);
      expect(removed).toBe(false);
    });

    it('should throw error for invalid id', () => {
      expect(() => removePlayer('invalid')).toThrow();
      expect(() => removePlayer(-1)).toThrow();
      expect(() => removePlayer(1.5)).toThrow();
    });
  });

  describe('getPlayer', () => {
    it('should return player by id', () => {
      const player = addPlayer('Alice');
      const retrieved = getPlayer(player.id);
      expect(retrieved).toBe(player);
    });

    it('should return null for non-existent player', () => {
      const retrieved = getPlayer(999);
      expect(retrieved).toBeNull();
    });

    it('should throw error for invalid id', () => {
      expect(() => getPlayer('invalid')).toThrow();
      expect(() => getPlayer(-1)).toThrow();
      expect(() => getPlayer(1.5)).toThrow();
    });
  });

  describe('getAllPlayers', () => {
    it('should return all players', () => {
      const player1 = addPlayer('Alice');
      const player2 = addPlayer('Bob');
      const player3 = addPlayer('Charlie');

      const allPlayers = getAllPlayers();
      expect(allPlayers.length).toBe(3);
      expect(allPlayers[0].name).toBe('Alice');
      expect(allPlayers[1].name).toBe('Bob');
      expect(allPlayers[2].name).toBe('Charlie');
    });

    it('should return empty array when no players', () => {
      const allPlayers = getAllPlayers();
      expect(allPlayers).toEqual([]);
    });

    it('should return a copy, not the original array', () => {
      addPlayer('Alice');
      const allPlayers = getAllPlayers();
      allPlayers.push({ id: 999, name: 'Hacker' });
      expect(getAllPlayers().length).toBe(1);
    });
  });

  describe('calculateFinalScores', () => {
    it('should return players sorted by total score (descending)', () => {
      const alice = addPlayer('Alice');
      const bob = addPlayer('Bob');
      const charlie = addPlayer('Charlie');

      setCurrentRound(0);
      updatePlayerScore(alice.id, 30);
      updatePlayerScore(bob.id, 50);
      updatePlayerScore(charlie.id, 20);

      const sorted = calculateFinalScores();
      expect(sorted[0].name).toBe('Bob');
      expect(sorted[0].totalScore).toBe(50);
      expect(sorted[1].name).toBe('Alice');
      expect(sorted[1].totalScore).toBe(30);
      expect(sorted[2].name).toBe('Charlie');
      expect(sorted[2].totalScore).toBe(20);
    });

    it('should handle scores across multiple rounds', () => {
      const alice = addPlayer('Alice');
      const bob = addPlayer('Bob');

      setCurrentRound(0);
      updatePlayerScore(alice.id, 10);
      updatePlayerScore(bob.id, 5);

      setCurrentRound(1);
      updatePlayerScore(alice.id, 15);
      updatePlayerScore(bob.id, 25);

      const sorted = calculateFinalScores();
      expect(sorted[0].name).toBe('Bob');
      expect(sorted[0].totalScore).toBe(30);
      expect(sorted[1].name).toBe('Alice');
      expect(sorted[1].totalScore).toBe(25);
    });

    it('should return a copy sorted by totalScore descending', () => {
      const player1 = addPlayer('Player1');
      const player2 = addPlayer('Player2');
      const player3 = addPlayer('Player3');

      setCurrentRound(0);
      updatePlayerScore(player1.id, 100);
      updatePlayerScore(player2.id, 50);
      updatePlayerScore(player3.id, 75);

      const sorted = calculateFinalScores();
      expect(sorted.length).toBe(3);
      expect(sorted[0].totalScore).toBe(100);
      expect(sorted[1].totalScore).toBe(75);
      expect(sorted[2].totalScore).toBe(50);
    });
  });

  describe('clearAllPlayers', () => {
    it('should clear all players and reset id counter', () => {
      addPlayer('Alice');
      addPlayer('Bob');
      expect(getAllPlayers().length).toBe(2);

      clearAllPlayers();
      expect(getAllPlayers().length).toBe(0);

      const newPlayer = addPlayer('Charlie');
      expect(newPlayer.id).toBe(0);
    });
  });

  describe('resetPlayerIdCounter', () => {
    it('should reset the player id counter for next player', () => {
      const player1 = addPlayer('Alice');
      expect(player1.id).toBe(0);

      resetPlayerIdCounter();
      const player2 = addPlayer('Bob');
      expect(player2.id).toBe(0);
    });
  });
});
