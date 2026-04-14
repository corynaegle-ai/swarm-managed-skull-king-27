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
      // Make idempotent: subtract old score before adding new one
      const oldScore = player.scores[this.currentRound] || 0;
      player.totalScore -= oldScore;
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
    finalStandingsDiv.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'final-rankings-container';
    
    const heading = document.createElement('h2');
    heading.textContent = 'Final Rankings';
    container.appendChild(heading);
    
    const podium = document.createElement('div');
    podium.className = 'podium';
    
    rankings.forEach((player, index) => {
      const place = index + 1;
      const placeText = this.getPlaceText(place);
      // Use data-place values that match CSS selectors: "1", "2", "3" or "other"
      const dataPlace = place <= 3 ? place.toString() : 'other';
      const playerClass = place === 1 ? 'winner' : '';
      
      const item = document.createElement('div');
      item.className = `ranking-item ${playerClass}`;
      item.setAttribute('data-place', dataPlace);
      
      const badge = document.createElement('div');
      badge.className = 'place-badge';
      badge.textContent = placeText;
      item.appendChild(badge);
      
      const name = document.createElement('div');
      name.className = 'player-name';
      name.textContent = player.name;
      item.appendChild(name);
      
      const score = document.createElement('div');
      score.className = 'final-score';
      score.textContent = `${player.totalScore} points`;
      item.appendChild(score);
      
      podium.appendChild(item);
    });
    
    container.appendChild(podium);
    finalStandingsDiv.appendChild(container);
  }

  /**
   * Get ordinal text for placement (1st, 2nd, 3rd, etc.)
   * Handles English ordinal rules: teens (11-13) always use 'th',
   * otherwise use 'st' for 1 mod 10, 'nd' for 2 mod 10, 'rd' for 3 mod 10
   * @param {number} place - Placement number
   * @returns {string} Ordinal text
   */
  getPlaceText(place) {
    // Handle teens (11-13) as special cases
    if (place % 100 >= 11 && place % 100 <= 13) {
      return `${place}th`;
    }
    // Apply ordinal suffix based on last digit
    const lastDigit = place % 10;
    if (lastDigit === 1) return `${place}st`;
    if (lastDigit === 2) return `${place}nd`;
    if (lastDigit === 3) return `${place}rd`;
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
      leaderDiv.innerHTML = '';
      const info = document.createElement('div');
      info.className = 'leader-info';
      
      const label = document.createElement('span');
      label.className = 'leader-label';
      label.textContent = 'Current Leader:';
      info.appendChild(label);
      
      const name = document.createElement('span');
      name.className = 'leader-name';
      name.textContent = leader.name;
      info.appendChild(name);
      
      const score = document.createElement('span');
      score.className = 'leader-score';
      score.textContent = `${leader.totalScore} points`;
      info.appendChild(score);
      
      leaderDiv.appendChild(info);
    }
  }

  /**
   * Update player scores display
   */
  updatePlayerScoresDisplay() {
    const scoresDiv = document.getElementById('player-scores');
    if (!scoresDiv || this.gameEnded) return;

    const sortedPlayers = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
    
    scoresDiv.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'scores-list';

    sortedPlayers.forEach(player => {
      const item = document.createElement('div');
      item.className = 'player-score-item';
      
      const name = document.createElement('span');
      name.className = 'player-name';
      name.textContent = player.name;
      item.appendChild(name);
      
      const total = document.createElement('span');
      total.className = 'player-total';
      total.textContent = player.totalScore.toString();
      item.appendChild(total);
      
      list.appendChild(item);
    });

    scoresDiv.appendChild(list);
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
