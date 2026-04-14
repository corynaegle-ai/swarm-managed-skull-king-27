import { GameState } from '../GameState';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('Player Setup Phase', () => {
    test('should start in setup phase', () => {
      expect(gameState.getPhase()).toBe('setup');
    });

    test('should add players during setup', () => {
      const player = gameState.addPlayer('Alice');
      expect(player.name).toBe('Alice');
      expect(gameState.getPlayerCount()).toBe(1);
    });

    test('should remove players during setup', () => {
      const player = gameState.addPlayer('Alice');
      gameState.removePlayer(player.id);
      expect(gameState.getPlayerCount()).toBe(0);
    });
  });

  describe('Unique Names Criterion', () => {
    test('should enforce unique player names', () => {
      gameState.addPlayer('Alice');
      expect(() => gameState.addPlayer('Alice')).toThrow('already taken');
    });

    test('should handle case-insensitive uniqueness', () => {
      gameState.addPlayer('Alice');
      expect(() => gameState.addPlayer('alice')).toThrow('already taken');
      expect(() => gameState.addPlayer('ALICE')).toThrow('already taken');
    });
  });

  describe('Duplicate Prevention Criterion', () => {
    test('should prevent duplicate names', () => {
      gameState.addPlayer('Bob');
      expect(() => gameState.addPlayer('Bob')).toThrow(
        'Player name "Bob" is already taken'
      );
    });
  });

  describe('Player Count Limit Criterion', () => {
    test('should enforce minimum 2 players', () => {
      gameState.addPlayer('Alice');
      expect(gameState.canStartGame()).toBe(false);
      gameState.addPlayer('Bob');
      expect(gameState.canStartGame()).toBe(true);
    });

    test('should enforce maximum 8 players', () => {
      const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry'];
      names.forEach(name => gameState.addPlayer(name));
      expect(gameState.getPlayerCount()).toBe(8);
      expect(() => gameState.addPlayer('Ivy')).toThrow('Maximum of 8 players');
    });
  });

  describe('Game Start Validation Criterion', () => {
    test('should prevent game start with fewer than 2 players', () => {
      expect(() => gameState.startGame()).toThrow(
        'Cannot start game with fewer than 2 players'
      );
      gameState.addPlayer('Alice');
      expect(() => gameState.startGame()).toThrow(
        'Cannot start game with fewer than 2 players'
      );
    });

    test('should allow game start with 2 or more players', () => {
      gameState.addPlayer('Alice');
      gameState.addPlayer('Bob');
      gameState.startGame();
      expect(gameState.getPhase()).toBe('playing');
    });

    test('should transition to playing phase after startGame', () => {
      expect(gameState.getPhase()).toBe('setup');
      gameState.addPlayer('Alice');
      gameState.addPlayer('Bob');
      gameState.startGame();
      expect(gameState.getPhase()).toBe('playing');
    });
  });

  describe('Phase Enforcement', () => {
    test('should prevent adding players in playing phase', () => {
      gameState.addPlayer('Alice');
      gameState.addPlayer('Bob');
      gameState.startGame();
      expect(() => gameState.addPlayer('Charlie')).toThrow(
        'Cannot add players outside of setup phase'
      );
    });

    test('should prevent removing players in playing phase', () => {
      const p1 = gameState.addPlayer('Alice');
      gameState.addPlayer('Bob');
      gameState.startGame();
      expect(() => gameState.removePlayer(p1.id)).toThrow(
        'Cannot remove players outside of setup phase'
      );
    });
  });

  describe('Game State Snapshot', () => {
    test('should provide complete game state', () => {
      gameState.addPlayer('Alice');
      gameState.addPlayer('Bob');
      const state = gameState.getState();
      expect(state.phase).toBe('setup');
      expect(state.playerCount).toBe(2);
      expect(state.players.length).toBe(2);
      expect(state.canStartGame).toBe(true);
    });
  });

  describe('Reset', () => {
    test('should reset game to initial state', () => {
      gameState.addPlayer('Alice');
      gameState.addPlayer('Bob');
      gameState.startGame();
      gameState.reset();
      expect(gameState.getPhase()).toBe('setup');
      expect(gameState.getPlayerCount()).toBe(0);
      expect(gameState.canStartGame()).toBe(false);
    });
  });
});
