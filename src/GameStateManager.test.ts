import { GameStateManager } from './GameStateManager';

describe('GameStateManager', () => {
  let gameManager: GameStateManager;
  const playerNames = ['Alice', 'Bob', 'Charlie'];

  beforeEach(() => {
    gameManager = new GameStateManager('game-123', playerNames);
  });

  describe('Acceptance Criteria 1: Tracks current round (1-10)', () => {
    test('should initialize game at round 1', () => {
      expect(gameManager.getCurrentRound()).toBe(1);
    });

    test('should track round progression from 1 to 10', () => {
      expect(gameManager.getCurrentRound()).toBe(1);

      for (let round = 1; round < 10; round++) {
        // Complete round
        gameManager.startBidding();
        gameManager.startScoring();

        const players = gameManager.getPlayerScores();
        players.forEach((player) => {
          gameManager.recordRoundScore(player.playerId, 10);
        });

        gameManager.advanceRound();
        expect(gameManager.getCurrentRound()).toBe(round + 1);
      }

      // Verify we're at round 10
      expect(gameManager.getCurrentRound()).toBe(10);
    });

    test('should maintain round at 10 when game is complete', () => {
      // Complete 10 rounds
      for (let round = 1; round <= 10; round++) {
        gameManager.startBidding();
        gameManager.startScoring();

        const players = gameManager.getPlayerScores();
        players.forEach((player) => {
          gameManager.recordRoundScore(player.playerId, 10);
        });

        gameManager.advanceRound();
      }

      expect(gameManager.getCurrentRound()).toBe(10);
      expect(gameManager.isGameComplete()).toBe(true);
    });
  });

  describe('Acceptance Criteria 2: Maintains cumulative player scores', () => {
    test('should initialize all players with 0 cumulative score', () => {
      const players = gameManager.getPlayerScores();
      players.forEach((player) => {
        expect(player.cumulativeScore).toBe(0);
        expect(player.roundScores).toEqual([]);
      });
    });

    test('should record individual round scores', () => {
      gameManager.startBidding();
      gameManager.startScoring();

      const players = gameManager.getPlayerScores();
      gameManager.recordRoundScore(players[0].playerId, 15);
      gameManager.recordRoundScore(players[1].playerId, 20);
      gameManager.recordRoundScore(players[2].playerId, 10);

      const updatedPlayers = gameManager.getPlayerScores();
      expect(updatedPlayers[0].cumulativeScore).toBe(15);
      expect(updatedPlayers[1].cumulativeScore).toBe(20);
      expect(updatedPlayers[2].cumulativeScore).toBe(10);
    });

    test('should accumulate scores across multiple rounds', () => {
      const players = gameManager.getPlayerScores();
      const playerId = players[0].playerId;

      // Round 1
      gameManager.startBidding();
      gameManager.startScoring();
      gameManager.recordRoundScore(playerId, 15);
      players.forEach((p) => {
        if (p.playerId !== playerId) {
          gameManager.recordRoundScore(p.playerId, 10);
        }
      });
      gameManager.advanceRound();

      // Round 2
      gameManager.startBidding();
      gameManager.startScoring();
      gameManager.recordRoundScore(playerId, 25);
      players.forEach((p) => {
        if (p.playerId !== playerId) {
          gameManager.recordRoundScore(p.playerId, 10);
        }
      });

      const updatedPlayers = gameManager.getPlayerScores();
      const playerData = updatedPlayers.find((p) => p.playerId === playerId);
      expect(playerData?.cumulativeScore).toBe(40);
      expect(playerData?.roundScores).toEqual([15, 25]);
    });

    test('should handle negative scores', () => {
      gameManager.startBidding();
      gameManager.startScoring();

      const players = gameManager.getPlayerScores();
      gameManager.recordRoundScore(players[0].playerId, -5);
      gameManager.recordRoundScore(players[1].playerId, 20);
      gameManager.recordRoundScore(players[2].playerId, 10);

      const updatedPlayers = gameManager.getPlayerScores();
      expect(updatedPlayers[0].cumulativeScore).toBe(-5);
    });
  });

  describe('Acceptance Criteria 3: Handles phase transitions correctly', () => {
    test('should start in setup phase', () => {
      expect(gameManager.getCurrentPhase()).toBe('setup');
    });

    test('should transition setup → bidding → scoring', () => {
      expect(gameManager.getCurrentPhase()).toBe('setup');

      gameManager.startBidding();
      expect(gameManager.getCurrentPhase()).toBe('bidding');

      gameManager.startScoring();
      expect(gameManager.getCurrentPhase()).toBe('scoring');
    });

    test('should transition back to setup after advancing round', () => {
      gameManager.startBidding();
      gameManager.startScoring();

      const players = gameManager.getPlayerScores();
      players.forEach((player) => {
        gameManager.recordRoundScore(player.playerId, 10);
      });

      gameManager.advanceRound();
      expect(gameManager.getCurrentPhase()).toBe('setup');
    });

    test('should not allow invalid phase transitions', () => {
      expect(() => gameManager.startScoring()).toThrow();
      expect(() => gameManager.startBidding()).not.toThrow();
      expect(() => gameManager.startBidding()).toThrow();
    });

    test('should not allow scoring if not in scoring phase', () => {
      const players = gameManager.getPlayerScores();
      expect(() => gameManager.recordRoundScore(players[0].playerId, 10)).toThrow();

      gameManager.startBidding();
      expect(() => gameManager.recordRoundScore(players[0].playerId, 10)).toThrow();
    });

    test('should not allow round advancement if scores not recorded', () => {
      gameManager.startBidding();
      gameManager.startScoring();

      const players = gameManager.getPlayerScores();
      gameManager.recordRoundScore(players[0].playerId, 10);
      // Not all scores recorded
      expect(() => gameManager.advanceRound()).toThrow();
    });
  });

  describe('Acceptance Criteria 4: Shows final scores after round 10', () => {
    test('should complete game after 10 rounds', () => {
      for (let round = 1; round <= 10; round++) {
        gameManager.startBidding();
        gameManager.startScoring();

        const players = gameManager.getPlayerScores();
        players.forEach((player) => {
          gameManager.recordRoundScore(player.playerId, Math.floor(Math.random() * 30));
        });

        gameManager.advanceRound();
      }

      expect(gameManager.isGameComplete()).toBe(true);
      expect(gameManager.getCurrentPhase()).toBe('complete');
    });

    test('should provide final scores sorted by cumulative score', () => {
      // Set up scores such that we know the final ranking
      for (let round = 1; round <= 10; round++) {
        gameManager.startBidding();
        gameManager.startScoring();

        const players = gameManager.getPlayerScores();
        // Alice: 50 per round, Bob: 30 per round, Charlie: 20 per round
        gameManager.recordRoundScore(players[0].playerId, 50);
        gameManager.recordRoundScore(players[1].playerId, 30);
        gameManager.recordRoundScore(players[2].playerId, 20);

        gameManager.advanceRound();
      }

      const finalScores = gameManager.getFinalScores();
      expect(finalScores[0].cumulativeScore).toBe(500); // Alice
      expect(finalScores[1].cumulativeScore).toBe(300); // Bob
      expect(finalScores[2].cumulativeScore).toBe(200); // Charlie
    });

    test('should throw error when trying to get final scores before game is complete', () => {
      expect(() => gameManager.getFinalScores()).toThrow();

      gameManager.startBidding();
      gameManager.startScoring();
      expect(() => gameManager.getFinalScores()).toThrow();
    });

    test('should include all round scores in final state', () => {
      const roundScores = [10, 20, 15, 25, 30, 5, 10, 20, 15, 25];

      for (let round = 1; round <= 10; round++) {
        gameManager.startBidding();
        gameManager.startScoring();

        const players = gameManager.getPlayerScores();
        gameManager.recordRoundScore(players[0].playerId, roundScores[round - 1]);
        players.forEach((p) => {
          if (p.playerId !== players[0].playerId) {
            gameManager.recordRoundScore(p.playerId, 10);
          }
        });

        gameManager.advanceRound();
      }

      const finalScores = gameManager.getFinalScores();
      const playerData = finalScores[0];
      expect(playerData.roundScores).toEqual(roundScores);
    });
  });

  describe('Acceptance Criteria 5: Allows starting new game from final screen', () => {
    test('should allow starting new game when game is complete', () => {
      // Complete the game
      for (let round = 1; round <= 10; round++) {
        gameManager.startBidding();
        gameManager.startScoring();

        const players = gameManager.getPlayerScores();
        players.forEach((player) => {
          gameManager.recordRoundScore(player.playerId, 10);
        });

        gameManager.advanceRound();
      }

      expect(gameManager.isGameComplete()).toBe(true);

      // Start new game
      const newGame = gameManager.startNewGame();
      expect(newGame.getCurrentRound()).toBe(1);
      expect(newGame.getCurrentPhase()).toBe('setup');
      expect(newGame.getPlayerScores().length).toBe(3);
    });

    test('new game should have same players as previous game', () => {
      // Complete the game
      for (let round = 1; round <= 10; round++) {
        gameManager.startBidding();
        gameManager.startScoring();

        const players = gameManager.getPlayerScores();
        players.forEach((player) => {
          gameManager.recordRoundScore(player.playerId, 10);
        });

        gameManager.advanceRound();
      }

      const originalPlayers = gameManager.getPlayerScores().map((p) => p.playerName);
      const newGame = gameManager.startNewGame();
      const newGamePlayers = newGame.getPlayerScores().map((p) => p.playerName);

      expect(newGamePlayers).toEqual(originalPlayers);
    });

    test('new game should start with fresh scores', () => {
      // Complete the game with scores
      for (let round = 1; round <= 10; round++) {
        gameManager.startBidding();
        gameManager.startScoring();

        const players = gameManager.getPlayerScores();
        gameManager.recordRoundScore(players[0].playerId, 50);
        gameManager.recordRoundScore(players[1].playerId, 30);
        gameManager.recordRoundScore(players[2].playerId, 20);

        gameManager.advanceRound();
      }

      const newGame = gameManager.startNewGame();
      const newGamePlayers = newGame.getPlayerScores();

      newGamePlayers.forEach((player) => {
        expect(player.cumulativeScore).toBe(0);
        expect(player.roundScores).toEqual([]);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle single player game', () => {
      const singlePlayerGame = new GameStateManager('game-single', ['Solo Player']);
      expect(singlePlayerGame.getPlayerScores().length).toBe(1);

      singlePlayerGame.startBidding();
      singlePlayerGame.startScoring();

      const players = singlePlayerGame.getPlayerScores();
      singlePlayerGame.recordRoundScore(players[0].playerId, 25);

      expect(singlePlayerGame.areAllScoresRecorded()).toBe(true);
    });

    test('should handle many players', () => {
      const manyPlayers = Array.from({ length: 10 }, (_, i) => `Player${i + 1}`);
      const multiPlayerGame = new GameStateManager('game-multi', manyPlayers);

      expect(multiPlayerGame.getPlayerScores().length).toBe(10);
    });

    test('should handle zero scores', () => {
      gameManager.startBidding();
      gameManager.startScoring();

      const players = gameManager.getPlayerScores();
      players.forEach((player) => {
        gameManager.recordRoundScore(player.playerId, 0);
      });

      const updatedPlayers = gameManager.getPlayerScores();
      updatedPlayers.forEach((player) => {
        expect(player.cumulativeScore).toBe(0);
      });
    });
  });
});
