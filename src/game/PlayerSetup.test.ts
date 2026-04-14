import { PlayerSetup, Player } from './PlayerSetup';

describe('PlayerSetup', () => {
  let setup: PlayerSetup;

  beforeEach(() => {
    setup = new PlayerSetup();
  });

  describe('addPlayer', () => {
    it('should add a player with a unique name', () => {
      setup.addPlayer('Alice');
      expect(setup.getPlayerCount()).toBe(1);
      expect(setup.getPlayers()[0].name).toBe('Alice');
    });

    it('should add multiple players with unique names', () => {
      setup.addPlayer('Alice');
      setup.addPlayer('Bob');
      setup.addPlayer('Charlie');
      expect(setup.getPlayerCount()).toBe(3);
    });

    it('should reject duplicate player names (exact case)', () => {
      setup.addPlayer('Alice');
      expect(() => setup.addPlayer('Alice')).toThrow(
        'Player with name "Alice" already exists'
      );
    });

    it('should reject duplicate player names (case-insensitive)', () => {
      setup.addPlayer('Alice');
      expect(() => setup.addPlayer('alice')).toThrow(
        'Player with name "alice" already exists'
      );
      expect(() => setup.addPlayer('ALICE')).toThrow(
        'Player with name "ALICE" already exists'
      );
    });

    it('should reject empty player names', () => {
      expect(() => setup.addPlayer('')).toThrow('Player name cannot be empty');
      expect(() => setup.addPlayer('   ')).toThrow('Player name cannot be empty');
    });

    it('should enforce the 8 player maximum limit', () => {
      for (let i = 1; i <= 8; i++) {
        setup.addPlayer(`Player${i}`);
      }
      expect(setup.getPlayerCount()).toBe(8);
      expect(() => setup.addPlayer('Player9')).toThrow(
        'Cannot add more than 8 players. Current count: 8'
      );
    });

    it('should trim whitespace from player names', () => {
      setup.addPlayer('  Alice  ');
      expect(setup.getPlayers()[0].name).toBe('Alice');
    });
  });

  describe('removePlayer', () => {
    beforeEach(() => {
      setup.addPlayer('Alice');
      setup.addPlayer('Bob');
      setup.addPlayer('Charlie');
    });

    it('should remove a player by name', () => {
      expect(setup.removePlayer('Bob')).toBe(true);
      expect(setup.getPlayerCount()).toBe(2);
      expect(setup.getPlayers().map((p) => p.name)).toEqual(['Alice', 'Charlie']);
    });

    it('should remove a player case-insensitively', () => {
      expect(setup.removePlayer('bob')).toBe(true);
      expect(setup.getPlayerCount()).toBe(2);
    });

    it('should return false if player does not exist', () => {
      expect(setup.removePlayer('NonExistent')).toBe(false);
      expect(setup.getPlayerCount()).toBe(3);
    });

    it('should allow removing and re-adding the same name', () => {
      setup.removePlayer('Alice');
      expect(() => setup.addPlayer('Alice')).not.toThrow();
      expect(setup.getPlayerCount()).toBe(3);
    });

    it('should allow adding more players after removing below max', () => {
      for (let i = 4; i <= 8; i++) {
        setup.addPlayer(`Player${i}`);
      }
      expect(setup.getPlayerCount()).toBe(8);
      
      setup.removePlayer('Alice');
      expect(() => setup.addPlayer('NewPlayer')).not.toThrow();
      expect(setup.getPlayerCount()).toBe(8);
    });
  });

  describe('canStartGame', () => {
    it('should return false with 0 players', () => {
      expect(setup.canStartGame()).toBe(false);
    });

    it('should return false with 1 player', () => {
      setup.addPlayer('Alice');
      expect(setup.canStartGame()).toBe(false);
    });

    it('should return true with 2 players (minimum)', () => {
      setup.addPlayer('Alice');
      setup.addPlayer('Bob');
      expect(setup.canStartGame()).toBe(true);
    });

    it('should return true with 8 players (maximum)', () => {
      for (let i = 1; i <= 8; i++) {
        setup.addPlayer(`Player${i}`);
      }
      expect(setup.canStartGame()).toBe(true);
    });

    it('should return true with any valid player count (2-8)', () => {
      for (let count = 2; count <= 8; count++) {
        const newSetup = new PlayerSetup();
        for (let i = 0; i < count; i++) {
          newSetup.addPlayer(`Player${i}`);
        }
        expect(newSetup.canStartGame()).toBe(true);
      }
    });
  });

  describe('canAddMorePlayers', () => {
    it('should return true when below max', () => {
      setup.addPlayer('Alice');
      setup.addPlayer('Bob');
      expect(setup.canAddMorePlayers()).toBe(true);
    });

    it('should return false when at max', () => {
      for (let i = 1; i <= 8; i++) {
        setup.addPlayer(`Player${i}`);
      }
      expect(setup.canAddMorePlayers()).toBe(false);
    });

    it('should return true after removing a player', () => {
      for (let i = 1; i <= 8; i++) {
        setup.addPlayer(`Player${i}`);
      }
      setup.removePlayer('Player1');
      expect(setup.canAddMorePlayers()).toBe(true);
    });
  });

  describe('getPlayers', () => {
    it('should return an empty array initially', () => {
      expect(setup.getPlayers()).toEqual([]);
    });

    it('should return a copy of the players array', () => {
      setup.addPlayer('Alice');
      const players = setup.getPlayers();
      expect(players.length).toBe(1);
      expect(players[0].name).toBe('Alice');
      // Verify it's a copy, not the original
      expect(players).not.toBe(setup.getPlayers());
    });
  });

  describe('getPlayerCount', () => {
    it('should return 0 initially', () => {
      expect(setup.getPlayerCount()).toBe(0);
    });

    it('should return correct count after adding players', () => {
      setup.addPlayer('Alice');
      expect(setup.getPlayerCount()).toBe(1);
      setup.addPlayer('Bob');
      expect(setup.getPlayerCount()).toBe(2);
    });

    it('should return correct count after removing players', () => {
      setup.addPlayer('Alice');
      setup.addPlayer('Bob');
      setup.removePlayer('Alice');
      expect(setup.getPlayerCount()).toBe(1);
    });
  });

  describe('Player class', () => {
    it('should create a player with a name', () => {
      const player = new Player('Alice');
      expect(player.name).toBe('Alice');
    });

    it('should reject empty player names', () => {
      expect(() => new Player('')).toThrow('Player name cannot be empty');
      expect(() => new Player('   ')).toThrow('Player name cannot be empty');
    });
  });
});
