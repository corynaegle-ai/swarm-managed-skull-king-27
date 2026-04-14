import * as scoring from './scoring.js';

/**
 * Game State Management
 * Maintains all game data including rounds, bids, tricks, and scores
 */
class GameState {
  constructor(playerCount = 2, roundsCount = 10) {
    this.playerCount = playerCount;
    this.totalRounds = roundsCount;
    this.currentRound = 1;
    this.players = this.initializePlayers();
    this.currentPhase = 'bidding'; // 'bidding' or 'play'
    this.roundHistory = []; // Complete history of all rounds
  }

  /**
   * Initialize player data structures
   */
  initializePlayers() {
    const players = [];
    for (let i = 0; i < this.playerCount; i++) {
      players.push({
        id: i,
        name: `Player ${i + 1}`,
        totalScore: 0,
        currentBid: null,
        tricksWon: 0,
        roundScores: [], // [{ round, bid, tricksWon, score, breakdown }, ...]
      });
    }
    return players;
  }

  /**
   * Get player by ID
   */
  getPlayer(playerId) {
    if (playerId < 0 || playerId >= this.playerCount) {
      throw new Error(`Invalid player ID: ${playerId}`);
    }
    return this.players[playerId];
  }

  /**
   * Check if all players have bid
   */
  allPlayersBidded() {
    return this.players.every((p) => p.currentBid !== null);
  }

  /**
   * Check if round is complete
   */
  isRoundComplete() {
    return this.allPlayersBidded() && this.players.every((p) => p.tricksWon !== undefined);
  }

  /**
   * Reset for next round
   */
  nextRound() {
    if (this.currentRound >= this.totalRounds) {
      return false; // Game is over
    }
    this.currentRound++;
    this.players.forEach((p) => {
      p.currentBid = null;
      p.tricksWon = 0;
    });
    this.currentPhase = 'bidding';
    return true;
  }

  /**
   * Check if game is over
   */
  isGameOver() {
    return this.currentRound > this.totalRounds;
  }
}

/**
 * Game Controller
 * Handles game flow, scoring, and DOM updates
 */
class GameController {
  constructor(playerCount = 2, roundsCount = 10) {
    this.gameState = new GameState(playerCount, roundsCount);
    this.initializeDOM();
  }

  /**
   * Initialize DOM elements and set up event listeners
   */
  initializeDOM() {
    this.updateGameInfo();
    this.updatePlayerScoresTable();
    this.setupNewGameButton();
  }

  /**
   * Setup new game button listener
   */
  setupNewGameButton() {
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => this.resetGame());
    }
  }

  /**
   * Record a player's bid for the current round
   * @param {number} playerId - The player's ID
   * @param {number} bid - The bid amount (0 or positive integer)
   * @throws {Error} if player ID is invalid or bid is invalid
   */
  recordPlayerBid(playerId, bid) {
    try {
      const player = this.gameState.getPlayer(playerId);

      // Validate bid
      if (bid === null || bid === undefined || bid < 0 || !Number.isInteger(bid)) {
        throw new Error(`Invalid bid amount: ${bid}`);
      }

      // Check if bid exceeds possible tricks (max tricks in a round = currentRound)
      if (bid > this.gameState.currentRound) {
        throw new Error(
          `Bid ${bid} exceeds maximum possible tricks ${this.gameState.currentRound}`
        );
      }

      player.currentBid = bid;
      console.log(`Player ${playerId} bid: ${bid}`);
    } catch (error) {
      console.error('Error recording player bid:', error.message);
      throw error;
    }
  }

  /**
   * Record tricks won by a player in the current round
   * @param {number} playerId - The player's ID
   * @param {number} tricks - Number of tricks won
   * @throws {Error} if player ID is invalid or tricks value is invalid
   */
  recordTricksWon(playerId, tricks) {
    try {
      const player = this.gameState.getPlayer(playerId);

      // Validate tricks
      if (tricks === null || tricks === undefined || tricks < 0 || !Number.isInteger(tricks)) {
        throw new Error(`Invalid tricks count: ${tricks}`);
      }

      // Check if tricks exceeds possible tricks in this round
      if (tricks > this.gameState.currentRound) {
        throw new Error(`Tricks ${tricks} exceeds maximum possible ${this.gameState.currentRound}`);
      }

      player.tricksWon = tricks;
      console.log(`Player ${playerId} won: ${tricks} tricks`);
    } catch (error) {
      console.error('Error recording tricks won:', error.message);
      throw error;
    }
  }

  /**
   * Calculate and display round scores
   * Updates game state with score calculations and DOM display
   * @returns {Array} Array of score objects with breakdown details
   */
  calculateAndDisplayRoundScores() {
    try {
      if (!this.gameState.allPlayersBidded()) {
        throw new Error('Not all players have placed their bids');
      }

      const roundScores = [];

      // Calculate score for each player
      this.gameState.players.forEach((player) => {
        const bid = player.currentBid;
        const tricksWon = player.tricksWon;

        // Use scoring.js function to calculate round score
        const scoreResult = scoring.calculateRoundScore(bid, tricksWon);

        const roundScore = {
          playerId: player.id,
          round: this.gameState.currentRound,
          bid,
          tricksWon,
          score: scoreResult.score,
          breakdown: scoreResult.breakdown, // Includes reasoning for calculation
        };

        roundScores.push(roundScore);

        // Update player's total score
        player.totalScore += scoreResult.score;

        // Store in round history
        player.roundScores.push(roundScore);

        console.log(
          `Round ${this.gameState.currentRound} - Player ${player.id}: Score = ${scoreResult.score} (Bid: ${bid}, Tricks: ${tricksWon})`
        );
      });

      // Store round in game history
      this.gameState.roundHistory.push({
        round: this.gameState.currentRound,
        scores: roundScores,
      });

      // Update DOM with results
      this.displayRoundScoreBreakdown(roundScores);
      this.updateScoreDisplay();

      return roundScores;
    } catch (error) {
      console.error('Error calculating round scores:', error.message);
      throw error;
    }
  }

  /**
   * Display round score breakdown to players
   * Shows calculation details for transparency
   * @param {Array} roundScores - Array of score objects with breakdown
   */
  displayRoundScoreBreakdown(roundScores) {
    try {
      const gameStatusDiv = document.getElementById('game-status');
      if (!gameStatusDiv) return;

      // Create breakdown HTML
      let breakdownHTML = `<div class="round-score-breakdown"><h3>Round ${this.gameState.currentRound} Results:</h3>`;

      roundScores.forEach((scoreObj) => {
        const player = this.gameState.players[scoreObj.playerId];
        breakdownHTML += `
          <div class="score-breakdown-item">
            <strong>${player.name}:</strong>
            <span class="score-value">${scoreObj.score}</span>
            <span class="score-details">(Bid: ${scoreObj.bid}, Won: ${scoreObj.tricksWon}) - ${scoreObj.breakdown}</span>
          </div>
        `;
      });

      breakdownHTML += '</div>';

      // Append breakdown to game status (without overwriting existing content)
      const breakdownContainer = document.createElement('div');
      breakdownContainer.innerHTML = breakdownHTML;
      gameStatusDiv.appendChild(breakdownContainer);

      console.log('Round score breakdown displayed');
    } catch (error) {
      console.error('Error displaying round score breakdown:', error.message);
    }
  }

  /**
   * Update score display in real-time
   * Updates the player scores table and final scores screen if game is over
   */
  updateScoreDisplay() {
    try {
      this.updatePlayerScoresTable();

      // If game is over, show final scores screen
      if (this.gameState.isGameOver()) {
        this.displayFinalScores();
      }

      console.log('Score display updated');
    } catch (error) {
      console.error('Error updating score display:', error.message);
    }
  }

  /**
   * Update the player scores table in the DOM
   */
  updatePlayerScoresTable() {
    try {
      const tableBody = document.querySelector('#player-scores-table tbody');
      if (!tableBody) {
        console.warn('Player scores table body not found');
        return;
      }

      // Clear existing rows
      tableBody.innerHTML = '';

      // Add rows for each player
      this.gameState.players.forEach((player) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${player.name}</td>
          <td>${player.totalScore}</td>
        `;
        tableBody.appendChild(row);
      });

      console.log('Player scores table updated');
    } catch (error) {
      console.error('Error updating player scores table:', error.message);
    }
  }

  /**
   * Update game info display (round and phase)
   */
  updateGameInfo() {
    try {
      const roundNumber = document.getElementById('round-number');
      const currentPhase = document.getElementById('current-phase');
      const phaseIndicator = document.getElementById('phase-indicator');
      const roundInfo = document.getElementById('round-info');

      if (roundNumber) roundNumber.textContent = this.gameState.currentRound;
      if (currentPhase) currentPhase.textContent = this.gameState.currentPhase;
      if (phaseIndicator) phaseIndicator.textContent = this.formatPhase(this.gameState.currentPhase);
      if (roundInfo)
        roundInfo.textContent = `Round ${this.gameState.currentRound} of ${this.gameState.totalRounds}`;

      console.log('Game info updated');
    } catch (error) {
      console.error('Error updating game info:', error.message);
    }
  }

  /**
   * Display final scores screen
   */
  displayFinalScores() {
    try {
      const finalScoresScreen = document.getElementById('final-scores-screen');
      const finalScoresContent = finalScoresScreen.querySelector('.final-scores-content');

      if (!finalScoresContent) return;

      // Sort players by score (descending)
      const sortedPlayers = [...this.gameState.players].sort((a, b) => b.totalScore - a.totalScore);

      let scoresHTML = '<ol class="final-scores-list">';
      sortedPlayers.forEach((player, index) => {
        scoresHTML += `
          <li class="final-score-item">
            <span class="player-name">${player.name}</span>
            <span class="player-score">${player.totalScore}</span>
          </li>
        `;
      });
      scoresHTML += '</ol>';

      finalScoresContent.innerHTML = scoresHTML;
      finalScoresScreen.classList.remove('hidden');

      console.log('Final scores displayed');
    } catch (error) {
      console.error('Error displaying final scores:', error.message);
    }
  }

  /**
   * Reset game to initial state
   */
  resetGame() {
    try {
      this.gameState = new GameState(this.gameState.playerCount, this.gameState.totalRounds);
      this.initializeDOM();

      const finalScoresScreen = document.getElementById('final-scores-screen');
      if (finalScoresScreen) {
        finalScoresScreen.classList.add('hidden');
      }

      console.log('Game reset');
    } catch (error) {
      console.error('Error resetting game:', error.message);
    }
  }

  /**
   * Format phase name for display
   */
  formatPhase(phase) {
    const phaseMap = {
      bidding: 'Bidding Phase',
      play: 'Play Phase',
    };
    return phaseMap[phase] || phase;
  }

  /**
   * Get game state (useful for external access)
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Advance to play phase
   */
  advanceToPlayPhase() {
    this.gameState.currentPhase = 'play';
    this.updateGameInfo();
  }

  /**
   * Complete round and advance to next
   */
  completeRound() {
    const hasNextRound = this.gameState.nextRound();
    if (hasNextRound) {
      this.updateGameInfo();
      console.log(`Advanced to round ${this.gameState.currentRound}`);
    } else {
      console.log('Game is over');
    }
    return hasNextRound;
  }
}

// Export for use in other modules
export { GameState, GameController };
