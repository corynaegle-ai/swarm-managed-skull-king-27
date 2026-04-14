import { PlayerSetup, Player } from '../PlayerSetup';

describe('PlayerSetup', () => {
  let setup: PlayerSetup;

  beforeEach(() => {
    setup = new PlayerSetup();
  });

  describe('Adding Players', () => {
    it('should add a player with a unique name', () => {
      const player = setup.addPlayer('Alice');
      expect(player.name).toBe('Alice');
      expect(player.id).toBeDefined();
      expect(setup.getPlayerCount()).toBe(1);
    });

    it('should add multiple players with unique names', () => {
      setup.addPlayer('Alice');
      setup.addPlayer('Bob');
      setup.addPlayer('Charlie');

      expect(setup.getPlayerCount()).toBe(3);
      const players = setup.getPlayers();
      expect(players.map(p => p.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should trim whitespace from player names', () => {
      const player = setup.addPlayer('  Alice  ');
      expect(player.name).toBe('Alice');
    });

    it('should reject duplicate names (exact match)', () => {
      setup.addPlayer('Alice');
      expect(() => setup.addPlayer('Alice')).toThrow(
        'Player with name "Alice" already exists'
      );
    });

    it('should reject duplicate names (case-insensitive)', () => {
      setup.addPlayer('Alice');
      expect(() => setup.addPlayer('alice')).toThrow();
      expect(() => setup.addPlayer('ALICE')).toThrow();
      expect(() => setup.addPlayer('aLiCe')).toThrow();
    });

    it('should reject empty names', () => {
      expect(() => setup.addPlayer('')).toThrow('Player name cannot be empty');
      expect(() => setup.addPlayer('   ')).toThrow('Player name cannot be empty');
    });

    it('should enforce maximum of 8 players', () => {
      for (let i = 1; i <= 8; i++) {
        setup.addPlayer(`Player${i}`);
      }
      expect(setup.getPlayerCount()).toBe(8);
      expect(() => setup.addPlayer('Player9')).toThrow(
        'Cannot add more than 8 players'
      );
    });

    it('should allow adding 2-8 players', () => {
      for (let i = 1; i <= 8; i++) {
        setup.addPlayer(`Player${i}`);
        expect(setup.getPlayerCount()).toBe(i);
      }
    });
  });

  describe('Removing Players', () => {
    it('should remove a player by ID', () => {
      const player = setup.addPlayer('Alice');
      expect(setup.getPlayerCount()).toBe(1);

      setup.removePlayer(player.id);
      expect(setup.getPlayerCount()).toBe(0);
    });

    it('should remove a player and allow adding with same name', () => {
      const player1 = setup.addPlayer('Alice');
      setup.removePlayer(player1.id);

      const player2 = setup.addPlayer('Alice');
      expect(player2.name).toBe('Alice');
      expect(setup.getPlayerCount()).toBe(1);
    });

    it('should throw error when removing non-existent player', () => {
      expect(() => setup.removePlayer('invalid-id')).toThrow(
        'Player with ID "invalid-id" not found'
      );
    });

    it('should allow multiple removals', () => {
      const p1 = setup.addPlayer('Alice');
      const p2 = setup.addPlayer('Bob');
      const p3 = setup.addPlayer('Charlie');

      setup.removePlayer(p2.id);
      expect(setup.getPlayerCount()).toBe(2);

      setup.removePlayer(p1.id);
      expect(setup.getPlayerCount()).toBe(1);

      setup.removePlayer(p3.id);
      expect(setup.getPlayerCount()).toBe(0);
    });
  });

  describe('Game Start Validation', () => {
    it('should prevent starting game with fewer than 2 players', () => {
      expect(setup.canStartGame()).toBe(false);

      setup.addPlayer('Alice');
      expect(setup.canStartGame()).toBe(false);
    });

    it('should allow starting game with exactly 2 players', () => {
      setup.addPlayer('Alice');
      setup.addPlayer('Bob');
      expect(setup.canStartGame()).toBe(true);
    });

    it('should allow starting game with 3-8 players', () => {
      for (let i = 1; i <= 8; i++) {
        setup.addPlayer(`Player${i}`);
        if (i >= 2) {
          expect(setup.canStartGame()).toBe(true);
        }
      }
    });

    it('should prevent starting game after removing players below minimum', () => {
      const p1 = setup.addPlayer('Alice');
      const p2 = setup.addPlayer('Bob');
      expect(setup.canStartGame()).toBe(true);

      setup.removePlayer(p1.id);
      expect(setup.canStartGame()).toBe(false);
    });
  });

  describe('Player Management', () => {
    it('should return all players in order added', () => {
      setup.addPlayer('Alice');
      setup.addPlayer('Bob');
      setup.addPlayer('Charlie');

      const players = setup.getPlayers();
      expect(players.length).toBe(3);
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Bob');
      expect(players[2].name).toBe('Charlie');
    });

    it('should get player by ID', () => {
      const addedPlayer = setup.addPlayer('Alice');
      const retrievedPlayer = setup.getPlayer(addedPlayer.id);

      expect(retrievedPlayer).toEqual(addedPlayer);
    });

    it('should return undefined for non-existent player', () => {
      const player = setup.getPlayer('invalid-id');
      expect(player).toBeUndefined();
    });

    it('should check if player name exists (case-insensitive)', () => {
      setup.addPlayer('Alice');

      expect(setup.playerNameExists('Alice')).toBe(true);
      expect(setup.playerNameExists('alice')).toBe(true);
      expect(setup.playerNameExists('ALICE')).toBe(true);
      expect(setup.playerNameExists('Bob')).toBe(false);
    });
  });

  describe('Capacity Management', () => {
    it('should indicate when more players can be added', () => {
      expect(setup.canAddMorePlayers()).toBe(true);

      for (let i = 1; i <= 7; i++) {
        setup.addPlayer(`Player${i}`);
        expect(setup.canAddMorePlayers()).toBe(true);
      }

      setup.addPlayer('Player8');
      expect(setup.canAddMorePlayers()).toBe(false);
    });
  });

  describe('Reset', () => {
    it('should reset all players', () => {
      setup.addPlayer('Alice');
      setup.addPlayer('Bob');
      expect(setup.getPlayerCount()).toBe(2);

      setup.reset();
      expect(setup.getPlayerCount()).toBe(0);
      expect(setup.canStartGame()).toBe(false);
    });

    it('should allow adding players with same names after reset', () => {
      setup.addPlayer('Alice');
      setup.reset();

      const player = setup.addPlayer('Alice');
      expect(player.name).toBe('Alice');
      expect(setup.getPlayerCount()).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in names', () => {
      const player = setup.addPlayer('Alice-O\'Brien');
      expect(player.name).toBe('Alice-O\'Brien');
    });

    it('should handle unicode characters in names', () => {
      const player = setup.addPlayer('José');
      expect(player.name).toBe('José');
    });

    it('should generate unique player IDs', () => {
      const p1 = setup.addPlayer('Alice');
      const p2 = setup.addPlayer('Bob');
      const p3 = setup.addPlayer('Charlie');

      expect(p1.id).not.toBe(p2.id);
      expect(p2.id).not.toBe(p3.id);
      expect(p1.id).not.toBe(p3.id);
    });

    it('should maintain player IDs when removing and adding new players', () => {
      const p1 = setup.addPlayer('Alice');
      const p2 = setup.addPlayer('Bob');

      setup.removePlayer(p1.id);
      const p3 = setup.addPlayer('Charlie');

      expect(p2.id).not.toBe(p3.id);
      const players = setup.getPlayers();
      expect(players.map(p => p.name)).toEqual(['Bob', 'Charlie']);
    });
  });
});
