const PlayerManager = require('../src/game/PlayerManager');

describe('PlayerManager', () => {
  let manager;

  beforeEach(() => {
    manager = new PlayerManager();
  });

  describe('Criterion 1: Can add players with unique names', () => {
    test('should add a single player with valid name', () => {
      const result = manager.addPlayer('Alice');
      expect(result.success).toBe(true);
      expect(result.player.name).toBe('Alice');
      expect(manager.getPlayerCount()).toBe(1);
    });

    test('should add multiple players with different names', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      manager.addPlayer('Charlie');
      
      expect(manager.getPlayerCount()).toBe(3);
      const players = manager.getPlayers();
      expect(players.map(p => p.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('should trim whitespace from names', () => {
      const result = manager.addPlayer('  Alice  ');
      expect(result.success).toBe(true);
      expect(result.player.name).toBe('Alice');
    });

    test('should assign unique IDs to players', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      
      const players = manager.getPlayers();
      expect(players[0].id).toBe(1);
      expect(players[1].id).toBe(2);
      expect(players[0].id).not.toBe(players[1].id);
    });
  });

  describe('Criterion 2: Prevents duplicate player names', () => {
    test('should reject duplicate names', () => {
      manager.addPlayer('Alice');
      const result = manager.addPlayer('Alice');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
      expect(manager.getPlayerCount()).toBe(1);
    });

    test('should reject duplicate names with different cases', () => {
      manager.addPlayer('Alice');
      const result = manager.addPlayer('alice');
      
      expect(result.success).toBe(false);
      expect(manager.getPlayerCount()).toBe(1);
    });

    test('should reject duplicate names with mixed cases', () => {
      manager.addPlayer('ALiCe');
      const result = manager.addPlayer('aLiCe');
      
      expect(result.success).toBe(false);
      expect(manager.getPlayerCount()).toBe(1);
    });

    test('should allow similar names that differ by more than case', () => {
      manager.addPlayer('Alice');
      const result = manager.addPlayer('Alice2');
      
      expect(result.success).toBe(true);
      expect(manager.getPlayerCount()).toBe(2);
    });

    test('should reject empty/whitespace-only names', () => {
      const result = manager.addPlayer('   ');
      expect(result.success).toBe(false);
      expect(manager.getPlayerCount()).toBe(0);
    });

    test('isNameAvailable should return correct status', () => {
      manager.addPlayer('Alice');
      expect(manager.isNameAvailable('Alice')).toBe(false);
      expect(manager.isNameAvailable('Bob')).toBe(true);
      expect(manager.isNameAvailable('alice')).toBe(false);
    });
  });

  describe('Criterion 3: Enforces 2-8 player limit', () => {
    test('should allow exactly 2 players (minimum)', () => {
      manager.addPlayer('Player1');
      manager.addPlayer('Player2');
      
      expect(manager.getPlayerCount()).toBe(2);
    });

    test('should allow exactly 8 players (maximum)', () => {
      for (let i = 1; i <= 8; i++) {
        const result = manager.addPlayer(`Player${i}`);
        expect(result.success).toBe(true);
      }
      
      expect(manager.getPlayerCount()).toBe(8);
    });

    test('should allow 3-7 players', () => {
      for (let i = 1; i <= 5; i++) {
        manager.addPlayer(`Player${i}`);
      }
      expect(manager.getPlayerCount()).toBe(5);
    });

    test('should reject adding 9th player', () => {
      for (let i = 1; i <= 8; i++) {
        manager.addPlayer(`Player${i}`);
      }
      
      const result = manager.addPlayer('Player9');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Maximum');
      expect(manager.getPlayerCount()).toBe(8);
    });

    test('should enforce limit even with concurrent add attempts', () => {
      for (let i = 1; i <= 8; i++) {
        manager.addPlayer(`Player${i}`);
      }
      
      const attempt1 = manager.addPlayer('PlayerX');
      const attempt2 = manager.addPlayer('PlayerY');
      
      expect(attempt1.success).toBe(false);
      expect(attempt2.success).toBe(false);
      expect(manager.getPlayerCount()).toBe(8);
    });
  });

  describe('Criterion 4: Can remove players during setup', () => {
    test('should remove player by name', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      
      const result = manager.removePlayer('Alice');
      expect(result.success).toBe(true);
      expect(manager.getPlayerCount()).toBe(1);
      expect(manager.getPlayers()[0].name).toBe('Bob');
    });

    test('should remove player by ID', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      
      const players = manager.getPlayers();
      const aliceId = players[0].id;
      
      const result = manager.removePlayer(aliceId);
      expect(result.success).toBe(true);
      expect(manager.getPlayerCount()).toBe(1);
    });

    test('should remove player with case-insensitive name match', () => {
      manager.addPlayer('Alice');
      
      const result = manager.removePlayer('alice');
      expect(result.success).toBe(true);
      expect(manager.getPlayerCount()).toBe(0);
    });

    test('should return false when removing non-existent player', () => {
      manager.addPlayer('Alice');
      
      const result = manager.removePlayer('Bob');
      expect(result.success).toBe(false);
      expect(manager.getPlayerCount()).toBe(1);
    });

    test('should allow re-adding a removed player name', () => {
      manager.addPlayer('Alice');
      manager.removePlayer('Alice');
      
      const result = manager.addPlayer('Alice');
      expect(result.success).toBe(true);
      expect(manager.getPlayerCount()).toBe(1);
    });

    test('should allow exceeding limit after removal', () => {
      // Add 8 players
      for (let i = 1; i <= 8; i++) {
        manager.addPlayer(`Player${i}`);
      }
      
      // Remove one
      manager.removePlayer('Player1');
      expect(manager.getPlayerCount()).toBe(7);
      
      // Should now be able to add more
      const result = manager.addPlayer('Player9');
      expect(result.success).toBe(true);
      expect(manager.getPlayerCount()).toBe(8);
    });
  });

  describe('Criterion 5: Cannot start game with fewer than 2 players', () => {
    test('should prevent game start with 0 players', () => {
      const result = manager.canStartGame();
      expect(result.canStart).toBe(false);
      expect(result.message).toContain('Minimum');
      expect(result.playerCount).toBe(0);
    });

    test('should prevent game start with 1 player', () => {
      manager.addPlayer('Alice');
      
      const result = manager.canStartGame();
      expect(result.canStart).toBe(false);
      expect(result.message).toContain('Minimum');
      expect(result.playerCount).toBe(1);
    });

    test('should allow game start with exactly 2 players', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      
      const result = manager.canStartGame();
      expect(result.canStart).toBe(true);
      expect(result.playerCount).toBe(2);
    });

    test('should allow game start with 3-8 players', () => {
      for (let i = 1; i <= 6; i++) {
        manager.addPlayer(`Player${i}`);
      }
      
      const result = manager.canStartGame();
      expect(result.canStart).toBe(true);
      expect(result.playerCount).toBe(6);
    });

    test('should allow game start with 8 players', () => {
      for (let i = 1; i <= 8; i++) {
        manager.addPlayer(`Player${i}`);
      }
      
      const result = manager.canStartGame();
      expect(result.canStart).toBe(true);
      expect(result.playerCount).toBe(8);
    });
  });

  describe('Edge cases and integration', () => {
    test('should reset all players', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      manager.reset();
      
      expect(manager.getPlayerCount()).toBe(0);
      expect(manager.getPlayers()).toEqual([]);
    });

    test('should maintain player order', () => {
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      manager.addPlayer('Charlie');
      
      const players = manager.getPlayers();
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Bob');
      expect(players[2].name).toBe('Charlie');
    });

    test('should not modify players array when getting players', () => {
      manager.addPlayer('Alice');
      const players1 = manager.getPlayers();
      players1[0].name = 'ModifiedName';
      
      const players2 = manager.getPlayers();
      expect(players2[0].name).toBe('Alice');
    });

    test('complete workflow: add, check, remove, add, start', () => {
      // Add players
      manager.addPlayer('Alice');
      manager.addPlayer('Bob');
      expect(manager.getPlayerCount()).toBe(2);
      
      // Can start
      let canStart = manager.canStartGame();
      expect(canStart.canStart).toBe(true);
      
      // Add more
      manager.addPlayer('Charlie');
      expect(manager.getPlayerCount()).toBe(3);
      
      // Still can start
      canStart = manager.canStartGame();
      expect(canStart.canStart).toBe(true);
      
      // Remove one
      manager.removePlayer('Charlie');
      expect(manager.getPlayerCount()).toBe(2);
      
      // Still can start
      canStart = manager.canStartGame();
      expect(canStart.canStart).toBe(true);
    });
  });
});
