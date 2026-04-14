/**
 * Game state management for Skull King game.
 * Tracks progression through 10 rounds, player scores, and phase transitions.
 */

export type GamePhase = 'setup' | 'bidding' | 'scoring' | 'complete';

export interface PlayerScore {
  playerId: string;
  playerName: string;
  cumulativeScore: number;
  roundScores: number[];
}

export interface GameState {
  currentRound: number; // 1-10
  gamePhase: GamePhase;
  players: PlayerScore[];
  isGameOver: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameStateManager {
  getState(): GameState;
  initializeGame(playerNames: string[]): GameState;
  transitionPhase(): GameState;
  recordRoundScores(roundScores: Map<string, number>): GameState;
  startNewGame(playerNames: string[]): GameState;
  getPlayerScores(): PlayerScore[];
  getCurrentPhase(): GamePhase;
  getCurrentRound(): number;
  isGameComplete(): boolean;
}

/**
 * Creates and manages game state with proper phase transitions.
 */
export function createGameStateManager(): GameStateManager {
  let state: GameState = {
    currentRound: 0,
    gamePhase: 'setup',
    players: [],
    isGameOver: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function validatePlayerNames(playerNames: string[]): void {
    if (!playerNames || playerNames.length === 0) {
      throw new Error('At least one player is required');
    }
    if (playerNames.length > 6) {
      throw new Error('Maximum 6 players allowed');
    }
    if (playerNames.some((name) => !name || name.trim() === '')) {
      throw new Error('All player names must be non-empty');
    }
  }

  function initializeGameState(playerNames: string[]): GameState {
    validatePlayerNames(playerNames);

    const players: PlayerScore[] = playerNames.map((name) => ({
      playerId: `player_${Math.random().toString(36).substr(2, 9)}`,
      playerName: name,
      cumulativeScore: 0,
      roundScores: [],
    }));

    const newState: GameState = {
      currentRound: 1,
      gamePhase: 'bidding',
      players,
      isGameOver: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    state = newState;
    return state;
  }

  function validatePhaseTransition(fromPhase: GamePhase, toPhase: GamePhase): void {
    const validTransitions: Record<GamePhase, GamePhase[]> = {
      setup: ['bidding'],
      bidding: ['scoring'],
      scoring: ['bidding', 'complete'],
      complete: ['bidding'],
    };

    if (!validTransitions[fromPhase]?.includes(toPhase)) {
      throw new Error(
        `Invalid phase transition from ${fromPhase} to ${toPhase}`
      );
    }
  }

  function transitionPhaseInternal(): GameState {
    const currentPhase = state.gamePhase;
    let nextPhase: GamePhase = 'setup';
    let nextRound = state.currentRound;
    let isGameComplete = false;

    switch (currentPhase) {
      case 'setup':
        nextPhase = 'bidding';
        break;
      case 'bidding':
        nextPhase = 'scoring';
        break;
      case 'scoring':
        // Check if we're at the end of round 10
        if (state.currentRound >= 10) {
          nextPhase = 'complete';
          isGameComplete = true;
        } else {
          nextPhase = 'bidding';
          nextRound = state.currentRound + 1;
        }
        break;
      case 'complete':
        // This shouldn't happen in normal flow, but handle it
        nextPhase = 'setup';
        break;
    }

    validatePhaseTransition(currentPhase, nextPhase);

    const newState: GameState = {
      ...state,
      gamePhase: nextPhase,
      currentRound: nextRound,
      isGameOver: isGameComplete,
      updatedAt: new Date(),
    };

    state = newState;
    return state;
  }

  function recordRoundScoresInternal(
    roundScores: Map<string, number>
  ): GameState {
    if (state.gamePhase !== 'scoring') {
      throw new Error('Scores can only be recorded during scoring phase');
    }

    if (roundScores.size !== state.players.length) {
      throw new Error(
        `Expected scores for ${state.players.length} players, got ${roundScores.size}`
      );
    }

    const updatedPlayers = state.players.map((player) => {
      const roundScore = roundScores.get(player.playerId);
      if (roundScore === undefined) {
        throw new Error(`Missing score for player ${player.playerName}`);
      }

      return {
        ...player,
        cumulativeScore: player.cumulativeScore + roundScore,
        roundScores: [...player.roundScores, roundScore],
      };
    });

    const newState: GameState = {
      ...state,
      players: updatedPlayers,
      updatedAt: new Date(),
    };

    state = newState;
    return state;
  }

  function startNewGameInternal(playerNames: string[]): GameState {
    validatePlayerNames(playerNames);

    const players: PlayerScore[] = playerNames.map((name) => ({
      playerId: `player_${Math.random().toString(36).substr(2, 9)}`,
      playerName: name,
      cumulativeScore: 0,
      roundScores: [],
    }));

    const newState: GameState = {
      currentRound: 1,
      gamePhase: 'bidding',
      players,
      isGameOver: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    state = newState;
    return state;
  }

  return {
    getState: () => ({ ...state }),
    initializeGame: initializeGameState,
    transitionPhase: transitionPhaseInternal,
    recordRoundScores: recordRoundScoresInternal,
    startNewGame: startNewGameInternal,
    getPlayerScores: () => state.players.map((p) => ({ ...p })),
    getCurrentPhase: () => state.gamePhase,
    getCurrentRound: () => state.currentRound,
    isGameComplete: () => state.isGameOver,
  };
}
