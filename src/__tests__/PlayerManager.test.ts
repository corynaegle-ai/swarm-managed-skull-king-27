import { PlayerManager, Player } from '../PlayerManager';

describe('PlayerManager', () => {
  let playerManager: PlayerManager;

  beforeEach(() => {
    playerManager = new PlayerManager();
  });

  describe('Adding Players', () => {
    test('should add a player with valid name', () => {
      const player = playerManager.addPlayer('Alice');
      expect(player.name).toBe('Alice');
      expect(player.id).toBeDefined();
      expect(playerManager.getPlayerCount()).toBe(1);
    });

    test('should trim whitespace from player names', () => {
      const player = playerManager.addPlayer('  Bob  ');
      expect(player.name).toBe('Bob');
    });

    test('should add multiple players with unique names', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.addPlayer('Charlie');
      expect(playerManager.getPlayerCount()).toBe(3);
    });

    test('should preserve player order by creation time', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.addPlayer('Charlie');
      const players = playerManager.getPlayers();
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Bob');
      expect(players[2].name).toBe('Charlie');
    });
  });

  describe('Duplicate Prevention', () => {
    test('should prevent adding player with duplicate name (exact case)', () => {
      playerManager.addPlayer('Alice');
      expect(() => playerManager.addPlayer('Alice')).toThrow(
        'Player name "Alice" is already taken. Player names must be unique.'
      );
    });

    test('should prevent adding player with duplicate name (different case)', () => {
      playerManager.addPlayer('Alice');
      expect(() => playerManager.addPlayer('alice')).toThrow(
        'already taken'
      );
      expect(() => playerManager.addPlayer('ALICE')).toThrow(
        'already taken'
      );
    });

    test('should prevent adding empty player name', () => {
      expect(() => playerManager.addPlayer('')).toThrow(
        'Player name must be a non-empty string'
      );
      expect(() => playerManager.addPlayer('   ')).toThrow(
        'cannot be empty'
      );
    });

    test('should reject non-string player names', () => {
      expect(() => playerManager.addPlayer(null as any)).toThrow(
        'must be a non-empty string'
      );
    });
  });

  describe('Player Count Limits', () => {
    test('should allow minimum of 2 players', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      expect(playerManager.getPlayerCount()).toBe(2);
    });

    test('should allow maximum of 8 players', () => {
      const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry'];
      names.forEach(name => playerManager.addPlayer(name));
      expect(playerManager.getPlayerCount()).toBe(8);
    });

    test('should prevent adding more than 8 players', () => {
      const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry'];
      names.forEach(name => playerManager.addPlayer(name));
      expect(() => playerManager.addPlayer('Ivy')).toThrow(
        'Maximum of 8 players reached'
      );
    });

    test('should enforce player name length limit', () => {
      const longName = 'a'.repeat(51);
      expect(() => playerManager.addPlayer(longName)).toThrow(
        'must be 50 characters or less'
      );
    });
  });

  describe('Removing Players', () => {
    test('should remove a player by ID', () => {
      const player1 = playerManager.addPlayer('Alice');
      const player2 = playerManager.addPlayer('Bob');
      playerManager.removePlayer(player1.id);
      expect(playerManager.getPlayerCount()).toBe(1);
      expect(playerManager.getPlayers()[0].name).toBe('Bob');
    });

    test('should allow re-adding a removed player name', () => {
      const player1 = playerManager.addPlayer('Alice');
      playerManager.removePlayer(player1.id);
      const player2 = playerManager.addPlayer('Alice');
      expect(player2.name).toBe('Alice');
      expect(playerManager.getPlayerCount()).toBe(1);
    });

    test('should throw error when removing non-existent player', () => {
      expect(() => playerManager.removePlayer('invalid_id')).toThrow(
        'not found'
      );
    });

    test('should support removing all players', () => {
      const p1 = playerManager.addPlayer('Alice');
      const p2 = playerManager.addPlayer('Bob');
      const p3 = playerManager.addPlayer('Charlie');
      playerManager.removePlayer(p1.id);
      playerManager.removePlayer(p2.id);
      playerManager.removePlayer(p3.id);
      expect(playerManager.getPlayerCount()).toBe(0);
    });
  });

  describe('Game Start Validation', () => {
    test('should prevent game start with 0 players', () => {
      expect(playerManager.canStartGame()).toBe(false);
    });

    test('should prevent game start with 1 player', () => {
      playerManager.addPlayer('Alice');
      expect(playerManager.canStartGame()).toBe(false);
    });

    test('should allow game start with 2 players', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      expect(playerManager.canStartGame()).toBe(true);
    });

    test('should allow game start with 8 players', () => {
      const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry'];
      names.forEach(name => playerManager.addPlayer(name));
      expect(playerManager.canStartGame()).toBe(true);
    });
  });

  describe('Reset', () => {
    test('should clear all players on reset', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.reset();
      expect(playerManager.getPlayerCount()).toBe(0);
      expect(playerManager.getPlayers()).toEqual([]);
    });

    test('should allow re-adding players after reset', () => {
      playerManager.addPlayer('Alice');
      playerManager.reset();
      const player = playerManager.addPlayer('Alice');
      expect(player.name).toBe('Alice');
      expect(playerManager.getPlayerCount()).toBe(1);
    });
  });
});
