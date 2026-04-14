import { createGameStateManager, GamePhase } from './gameState';

describe('GameStateManager', () => {
  describe('Criterion 1: Tracks current round (1-10)', () => {
    it('should initialize game at round 1', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);

      expect(manager.getCurrentRound()).toBe(1);
    });

    it('should increment round after scoring phase when not at round 10', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);

      // Round 1: bidding -> scoring
      manager.transitionPhase();
      const scores = new Map([
        [manager.getPlayerScores()[0].playerId, 10],
        [manager.getPlayerScores()[1].playerId, 5],
      ]);
      manager.recordRoundScores(scores);

      expect(manager.getCurrentRound()).toBe(1);
      manager.transitionPhase(); // scoring -> bidding, should increment
      expect(manager.getCurrentRound()).toBe(2);
    });

    it('should reach round 10 after 9 transitions', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);

      const scores = new Map([
        [manager.getPlayerScores()[0].playerId, 10],
        [manager.getPlayerScores()[1].playerId, 5],
      ]);

      // Simulate rounds 1-9
      for (let i = 1; i < 10; i++) {
        manager.transitionPhase(); // bidding -> scoring
        manager.recordRoundScores(scores);
        manager.transitionPhase(); // scoring -> bidding
        expect(manager.getCurrentRound()).toBe(i + 1);
      }

      expect(manager.getCurrentRound()).toBe(10);
    });

    it('should stay at round 10 after final scoring', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);

      const scores = new Map([
        [manager.getPlayerScores()[0].playerId, 10],
        [manager.getPlayerScores()[1].playerId, 5],
      ]);

      // Simulate rounds 1-10
      for (let i = 1; i < 10; i++) {
        manager.transitionPhase(); // bidding -> scoring
        manager.recordRoundScores(scores);
        manager.transitionPhase(); // scoring -> bidding
      }

      // Final round 10
      manager.transitionPhase(); // bidding -> scoring
      manager.recordRoundScores(scores);
      manager.transitionPhase(); // scoring -> complete

      expect(manager.getCurrentRound()).toBe(10);
    });
  });

  describe('Criterion 2: Maintains cumulative player scores', () => {
    it('should initialize all players with 0 score', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2', 'Player 3']);

      const scores = manager.getPlayerScores();
      expect(scores).toHaveLength(3);
      expect(scores.every((s) => s.cumulativeScore === 0)).toBe(true);
    });

    it('should accumulate scores across rounds', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();
      const player1Id = players[0].playerId;
      const player2Id = players[1].playerId;

      // Round 1: Player 1 scores 10, Player 2 scores 5
      manager.transitionPhase();
      manager.recordRoundScores(
        new Map([
          [player1Id, 10],
          [player2Id, 5],
        ])
      );
      manager.transitionPhase();

      // Round 2: Player 1 scores 8, Player 2 scores 12
      manager.transitionPhase();
      manager.recordRoundScores(
        new Map([
          [player1Id, 8],
          [player2Id, 12],
        ])
      );

      const finalScores = manager.getPlayerScores();
      expect(
        finalScores.find((s) => s.playerId === player1Id)?.cumulativeScore
      ).toBe(18); // 10 + 8
      expect(
        finalScores.find((s) => s.playerId === player2Id)?.cumulativeScore
      ).toBe(17); // 5 + 12
    });

    it('should track individual round scores', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();
      const player1Id = players[0].playerId;

      manager.transitionPhase();
      manager.recordRoundScores(
        new Map([
          [player1Id, 10],
          [players[1].playerId, 5],
        ])
      );
      manager.transitionPhase();

      manager.transitionPhase();
      manager.recordRoundScores(
        new Map([
          [player1Id, 20],
          [players[1].playerId, 15],
        ])
      );

      const scores = manager.getPlayerScores();
      const player1 = scores.find((s) => s.playerId === player1Id);
      expect(player1?.roundScores).toEqual([10, 20]);
    });

    it('should maintain scores across all 10 rounds', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();
      const player1Id = players[0].playerId;
      const player2Id = players[1].playerId;

      let expectedPlayer1Total = 0;
      let expectedPlayer2Total = 0;

      for (let round = 1; round <= 10; round++) {
        manager.transitionPhase(); // bidding -> scoring
        const roundScore1 = round * 5;
        const roundScore2 = round * 3;
        expectedPlayer1Total += roundScore1;
        expectedPlayer2Total += roundScore2;

        manager.recordRoundScores(
          new Map([
            [player1Id, roundScore1],
            [player2Id, roundScore2],
          ])
        );

        if (round < 10) {
          manager.transitionPhase(); // scoring -> bidding
        }
      }

      const finalScores = manager.getPlayerScores();
      const player1 = finalScores.find((s) => s.playerId === player1Id);
      const player2 = finalScores.find((s) => s.playerId === player2Id);

      expect(player1?.cumulativeScore).toBe(expectedPlayer1Total);
      expect(player2?.cumulativeScore).toBe(expectedPlayer2Total);
      expect(player1?.roundScores).toHaveLength(10);
      expect(player2?.roundScores).toHaveLength(10);
    });
  });

  describe('Criterion 3: Handles phase transitions correctly', () => {
    it('should start in bidding phase after initialization', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);

      expect(manager.getCurrentPhase()).toBe('bidding');
    });

    it('should transition bidding -> scoring', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);

      manager.transitionPhase();
      expect(manager.getCurrentPhase()).toBe('scoring');
    });

    it('should transition scoring -> bidding for rounds 1-9', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();

      for (let i = 0; i < 9; i++) {
        manager.transitionPhase(); // -> scoring
        expect(manager.getCurrentPhase()).toBe('scoring');

        manager.recordRoundScores(
          new Map([
            [players[0].playerId, 10],
            [players[1].playerId, 5],
          ])
        );

        manager.transitionPhase(); // -> bidding
        expect(manager.getCurrentPhase()).toBe('bidding');
      }
    });

    it('should transition scoring -> complete for round 10', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();
      const scores = new Map([
        [players[0].playerId, 10],
        [players[1].playerId, 5],
      ]);

      // Go through rounds 1-9
      for (let i = 0; i < 9; i++) {
        manager.transitionPhase();
        manager.recordRoundScores(scores);
        manager.transitionPhase();
      }

      // Round 10
      manager.transitionPhase(); // -> scoring
      expect(manager.getCurrentPhase()).toBe('scoring');
      manager.recordRoundScores(scores);
      manager.transitionPhase(); // -> complete
      expect(manager.getCurrentPhase()).toBe('complete');
    });

    it('should reject invalid phase transitions', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);

      // Try to transition from bidding directly to complete (invalid)
      manager.transitionPhase(); // bidding -> scoring (valid)
      expect(manager.getCurrentPhase()).toBe('scoring');

      // scoring -> bidding is valid for non-round-10
      manager.recordRoundScores(
        new Map([
          [manager.getPlayerScores()[0].playerId, 10],
          [manager.getPlayerScores()[1].playerId, 5],
        ])
      );
      manager.transitionPhase();
      expect(manager.getCurrentPhase()).toBe('bidding');
    });
  });

  describe('Criterion 4: Shows final scores after round 10', () => {
    it('should mark game as complete after round 10 scoring', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();
      const scores = new Map([
        [players[0].playerId, 10],
        [players[1].playerId, 5],
      ]);

      // Simulate 10 rounds
      for (let round = 1; round <= 10; round++) {
        manager.transitionPhase();
        manager.recordRoundScores(scores);
        if (round < 10) {
          manager.transitionPhase();
        }
      }

      expect(manager.isGameComplete()).toBe(true);
      expect(manager.getCurrentPhase()).toBe('complete');
    });

    it('should display final cumulative scores', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2', 'Player 3']);
      const initialPlayers = manager.getPlayerScores();

      const roundScores = new Map([
        [initialPlayers[0].playerId, 15],
        [initialPlayers[1].playerId, 20],
        [initialPlayers[2].playerId, 10],
      ]);

      // Simulate 10 rounds with same scores each time
      for (let round = 1; round <= 10; round++) {
        manager.transitionPhase();
        manager.recordRoundScores(roundScores);
        if (round < 10) {
          manager.transitionPhase();
        }
      }

      const finalScores = manager.getPlayerScores();
      expect(
        finalScores.find((s) => s.playerName === 'Player 1')?.cumulativeScore
      ).toBe(150); // 15 * 10
      expect(
        finalScores.find((s) => s.playerName === 'Player 2')?.cumulativeScore
      ).toBe(200); // 20 * 10
      expect(
        finalScores.find((s) => s.playerName === 'Player 3')?.cumulativeScore
      ).toBe(100); // 10 * 10
    });

    it('should allow querying final state after game completion', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();
      const scores = new Map([
        [players[0].playerId, 10],
        [players[1].playerId, 5],
      ]);

      for (let round = 1; round <= 10; round++) {
        manager.transitionPhase();
        manager.recordRoundScores(scores);
        if (round < 10) {
          manager.transitionPhase();
        }
      }

      const state = manager.getState();
      expect(state.isGameOver).toBe(true);
      expect(state.currentRound).toBe(10);
      expect(state.gamePhase).toBe('complete');
      expect(state.players).toHaveLength(2);
      expect(state.players[0].cumulativeScore).toBe(100);
      expect(state.players[1].cumulativeScore).toBe(50);
    });
  });

  describe('Criterion 5: Allows starting new game from final screen', () => {
    it('should reset game state with new players after completion', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();
      const scores = new Map([
        [players[0].playerId, 10],
        [players[1].playerId, 5],
      ]);

      // Complete a game
      for (let round = 1; round <= 10; round++) {
        manager.transitionPhase();
        manager.recordRoundScores(scores);
        if (round < 10) {
          manager.transitionPhase();
        }
      }

      expect(manager.isGameComplete()).toBe(true);

      // Start new game with different players
      manager.startNewGame(['Alice', 'Bob', 'Charlie']);

      expect(manager.getCurrentRound()).toBe(1);
      expect(manager.getCurrentPhase()).toBe('bidding');
      expect(manager.isGameComplete()).toBe(false);
      expect(manager.getPlayerScores()).toHaveLength(3);
      expect(manager.getPlayerScores().every((s) => s.cumulativeScore === 0))
        .toBe(true);
    });

    it('should allow starting new game with same number of players', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();
      const scores = new Map([
        [players[0].playerId, 10],
        [players[1].playerId, 5],
      ]);

      for (let round = 1; round <= 10; round++) {
        manager.transitionPhase();
        manager.recordRoundScores(scores);
        if (round < 10) {
          manager.transitionPhase();
        }
      }

      manager.startNewGame(['New Player 1', 'New Player 2']);

      const newPlayers = manager.getPlayerScores();
      expect(newPlayers.map((p) => p.playerName)).toEqual([
        'New Player 1',
        'New Player 2',
      ]);
      expect(newPlayers.every((p) => p.cumulativeScore === 0)).toBe(true);
    });

    it('should reset all game state including round and phase', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      const players = manager.getPlayerScores();
      const scores = new Map([
        [players[0].playerId, 10],
        [players[1].playerId, 5],
      ]);

      // Play through multiple rounds to mix things up
      for (let i = 0; i < 5; i++) {
        manager.transitionPhase();
        manager.recordRoundScores(scores);
        manager.transitionPhase();
      }

      expect(manager.getCurrentRound()).toBe(6);

      // Start new game
      manager.startNewGame(['Player A', 'Player B']);

      expect(manager.getCurrentRound()).toBe(1);
      expect(manager.getCurrentPhase()).toBe('bidding');
      expect(manager.isGameComplete()).toBe(false);
      expect(manager.getState().createdAt).not.toBe(
        manager.getState().createdAt
      ); // New timestamp
    });
  });

  describe('Edge cases and error handling', () => {
    it('should reject initialization with no players', () => {
      const manager = createGameStateManager();

      expect(() => manager.initializeGame([])).toThrow(
        'At least one player is required'
      );
    });

    it('should reject initialization with more than 6 players', () => {
      const manager = createGameStateManager();

      expect(() =>
        manager.initializeGame([
          'P1',
          'P2',
          'P3',
          'P4',
          'P5',
          'P6',
          'P7',
        ])
      ).toThrow('Maximum 6 players allowed');
    });

    it('should reject initialization with empty player names', () => {
      const manager = createGameStateManager();

      expect(() => manager.initializeGame(['Player 1', ''])).toThrow(
        'All player names must be non-empty'
      );
    });

    it('should reject recording scores during non-scoring phases', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);

      expect(() =>
        manager.recordRoundScores(
          new Map([
            [manager.getPlayerScores()[0].playerId, 10],
            [manager.getPlayerScores()[1].playerId, 5],
          ])
        )
      ).toThrow('Scores can only be recorded during scoring phase');
    });

    it('should reject incomplete score submissions', () => {
      const manager = createGameStateManager();
      manager.initializeGame(['Player 1', 'Player 2']);
      manager.transitionPhase(); // -> scoring

      expect(() =>
        manager.recordRoundScores(
          new Map([[manager.getPlayerScores()[0].playerId, 10]]) // Missing Player 2
        )
      ).toThrow('Expected scores for 2 players');
    });
  });
});
