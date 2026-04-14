/**
 * Score Display Module
 * Handles score tracking, display, and final rankings calculation
 */

class ScoreDisplay {
  constructor() {
    this.players = [];
    this.currentRound = 0;
    this.roundHistory = [];
    this.gameEnded = false;
    this.totalRounds = 10; // Default total rounds
    this.initializeDisplay();
  }

  /**
   * Initialize the score display DOM elements
   */
  initializeDisplay() {
    const container = document.getElementById('score-display-container');
    if (container) {
      container.innerHTML = `
        <div class="score-display">
          <div class="current-leader" id="current-leader"></div>
          <div class="player-scores" id="player-scores"></div>
          <div class="round-info" id="round-info"></div>
          <div class="final-standings" id="final-standings"></div>
        </div>
      `;
    }
  }

  /**
   * Add a player to the score tracking
   * @param {string} playerName - Name of the player
   * @param {string} playerId - Unique identifier for the player
   */
  addPlayer(playerName, playerId) {
    if (!this.players.find(p => p.id === playerId)) {
      this.players.push({
        id: playerId,
        name: playerName,
        scores: [],
        totalScore: 0
      });
    }
  }

  /**
   * Update player score for current round
   * @param {string} playerId - Unique identifier for the player
   * @param {number} roundScore - Score earned in current round
   */
  updatePlayerScore(playerId, roundScore) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.scores[this.currentRound] = roundScore;
      player.totalScore += roundScore;
    }
  }

  /**
   * Get final rankings sorted by total score (highest first)
   * @returns {Array} Array of players sorted by total score descending
   */
  getFinalRankings() {
    return [...this.players].sort((a, b) => {
      // Sort by total score descending
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      // Tie-breaker: sort by name alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Check if game has reached end condition
   * @returns {boolean} True if game has ended
   */
  checkGameEnd() {
    // Game ends when current round reaches total rounds
    if (this.currentRound >= this.totalRounds && !this.gameEnded) {
      this.gameEnded = true;
      this.displayFinalRankings();
      return true;
    }
    return this.gameEnded;
  }

  /**
   * Display final rankings in the DOM
   */
  displayFinalRankings() {
    const finalStandingsDiv = document.getElementById('final-standings');
    if (!finalStandingsDiv) return;

    const rankings = this.getFinalRankings();
    let rankingsHTML = '<div class="final-rankings-container"><h2>Final Rankings</h2><div class="podium">';

    rankings.forEach((player, index) => {
      const place = index + 1;
      const placeText = this.getPlaceText(place);
      const playerClass = place === 1 ? 'winner' : '';

      rankingsHTML += `
        <div class="ranking-item ${playerClass}" data-place="${place}">
          <div class="place-badge">${placeText}</div>
          <div class="player-name">${player.name}</div>
          <div class="final-score">${player.totalScore} points</div>
        </div>
      `;
    });

    rankingsHTML += '</div></div>';
    finalStandingsDiv.innerHTML = rankingsHTML;
  }

  /**
   * Get ordinal text for placement (1st, 2nd, 3rd, etc.)
   * @param {number} place - Placement number
   * @returns {string} Ordinal text
   */
  getPlaceText(place) {
    if (place === 1) return '1st';
    if (place === 2) return '2nd';
    if (place === 3) return '3rd';
    return `${place}th`;
  }

  /**
   * Update score display with current state
   * @param {number} roundNumber - Current round number
   */
  updateScores(roundNumber) {
    this.currentRound = roundNumber;
    this.updateCurrentLeader();
    this.updatePlayerScoresDisplay();
    this.updateRoundInfo();
    this.checkGameEnd();
  }

  /**
   * Update and display current leader
   */
  updateCurrentLeader() {
    const leaderDiv = document.getElementById('current-leader');
    if (!leaderDiv || this.gameEnded) return;

    const leader = this.players.reduce((prev, current) => 
      (prev.totalScore > current.totalScore) ? prev : current, this.players[0]);

    if (leader) {
      leaderDiv.innerHTML = `
        <div class="leader-info">
          <span class="leader-label">Current Leader:</span>
          <span class="leader-name">${leader.name}</span>
          <span class="leader-score">${leader.totalScore} points</span>
        </div>
      `;
    }
  }

  /**
   * Update player scores display
   */
  updatePlayerScoresDisplay() {
    const scoresDiv = document.getElementById('player-scores');
    if (!scoresDiv || this.gameEnded) return;

    let scoresHTML = '<div class="scores-list">';
    const sortedPlayers = [...this.players].sort((a, b) => b.totalScore - a.totalScore);

    sortedPlayers.forEach(player => {
      scoresHTML += `
        <div class="player-score-item">
          <span class="player-name">${player.name}</span>
          <span class="player-total">${player.totalScore}</span>
        </div>
      `;
    });

    scoresHTML += '</div>';
    scoresDiv.innerHTML = scoresHTML;
  }

  /**
   * Update round information display
   */
  updateRoundInfo() {
    const roundDiv = document.getElementById('round-info');
    if (!roundDiv) return;

    roundDiv.innerHTML = `
      <div class="round-info-content">
        <span class="round-label">Round:</span>
        <span class="round-number">${this.currentRound} / ${this.totalRounds}</span>
      </div>
    `;
  }

  /**
   * Record round history
   * @param {number} roundNumber - Round number
   * @param {object} roundData - Data from the round
   */
  recordRoundHistory(roundNumber, roundData) {
    this.roundHistory[roundNumber] = {
      round: roundNumber,
      data: roundData,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get round history
   * @returns {Array} Array of round history records
   */
  getRoundHistory() {
    return this.roundHistory;
  }

  /**
   * Reset game state
   */
  reset() {
    this.players.forEach(player => {
      player.scores = [];
      player.totalScore = 0;
    });
    this.currentRound = 0;
    this.roundHistory = [];
    this.gameEnded = false;
    this.initializeDisplay();
  }

  /**
   * Set total number of rounds for the game
   * @param {number} rounds - Total number of rounds
   */
  setTotalRounds(rounds) {
    this.totalRounds = rounds;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplay;
}
