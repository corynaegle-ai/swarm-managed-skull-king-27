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
   * Only caches references to existing DOM elements from score-display.html
   * Does NOT create or modify the DOM structure
   */
  initializeDisplay() {
    // Cache references to existing DOM elements
    // These elements are defined in score-display.html
    this.leaderDiv = document.getElementById('current-leader');
    this.scoresDiv = document.getElementById('player-scores');
    this.roundDiv = document.getElementById('round-info');
    this.finalStandingsDiv = document.getElementById('final-standings');
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
    
    // Find or create the final-rankings-container
    let container = finalStandingsDiv.querySelector('.final-rankings-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'final-rankings-container';
      finalStandingsDiv.appendChild(container);
    }
    
    // Show the container
    container.style.display = 'block';
    
    // Find or create the heading
    let heading = container.querySelector('h2');
    if (!heading) {
      heading = document.createElement('h2');
      container.appendChild(heading);
    }
    heading.textContent = 'Final Rankings';
    
    // Find or create the podium
    let podium = container.querySelector('.podium');
    if (!podium) {
      podium = document.createElement('div');
      podium.className = 'podium';
      container.appendChild(podium);
    }
    
    // Clear existing ranking items
    podium.innerHTML = '';
    
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
    if (!leaderDiv || this.gameEnded || this.players.length === 0) return;

    // Find leader by finding max total score
    const leader = this.players.reduce((prev, current) => 
      (prev.totalScore > current.totalScore) ? prev : current);

    if (leader) {
      // Update existing child elements instead of replacing parent
      const nameEl = leaderDiv.querySelector('.leader-name');
      const scoreEl = leaderDiv.querySelector('.leader-score');
      
      if (nameEl) nameEl.textContent = leader.name;
      if (scoreEl) scoreEl.textContent = `${leader.totalScore} points`;
    }
  }

  /**
   * Update player scores display
   */
  updatePlayerScoresDisplay() {
    const scoresDiv = document.getElementById('player-scores');
    if (!scoresDiv || this.gameEnded) return;

    const sortedPlayers = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
    
    // Find or create the scores-list container
    let list = scoresDiv.querySelector('.scores-list');
    if (!list) {
      list = document.createElement('div');
      list.className = 'scores-list';
      scoresDiv.appendChild(list);
    }
    
    // Clear existing items but keep the list container
    list.innerHTML = '';

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
  }

  /**
   * Update round information display
   */
  updateRoundInfo() {
    const roundDiv = document.getElementById('round-info');
    if (!roundDiv) return;

    // Find or create the round-info-content container
    let content = roundDiv.querySelector('.round-info-content');
    if (!content) {
      content = document.createElement('div');
      content.className = 'round-info-content';
      roundDiv.appendChild(content);
    }
    
    // Update the round number span
    let roundNumber = content.querySelector('.round-number');
    if (!roundNumber) {
      const label = document.createElement('span');
      label.className = 'round-label';
      label.textContent = 'Round:';
      content.appendChild(label);
      
      roundNumber = document.createElement('span');
      roundNumber.className = 'round-number';
      content.appendChild(roundNumber);
    }
    
    roundNumber.textContent = `${this.currentRound} / ${this.totalRounds}`;
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
