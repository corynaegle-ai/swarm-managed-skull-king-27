/**
 * Score Display Component
 * Handles rendering and updating of player scores in real-time
 */

class ScoreDisplay {
  constructor(containerSelector = '#scores-container', gameState = null) {
    this.container = document.querySelector(containerSelector);
    this.gameState = gameState;
    this.playerScores = new Map();
    this.currentLeader = null;
    
    if (!this.container) {
      console.warn(`Score display container not found: ${containerSelector}`);
    }
  }

  /**
   * Initialize the score display with initial player data
   * @param {Array} players - Array of player objects with id and name properties
   */
  initialize(players) {
    if (!Array.isArray(players) || players.length === 0) {
      console.error('Invalid players data provided to ScoreDisplay');
      return;
    }

    // Initialize scores map
    players.forEach(player => {
      this.playerScores.set(player.id, {
        id: player.id,
        name: player.name,
        score: 0,
        roundScores: []
      });
    });

    this.render();
  }

  /**
   * Update a player's score
   * @param {string} playerId - The player's ID
   * @param {number} points - Points to add to the player's score
   */
  updatePlayerScore(playerId, points) {
    if (!this.playerScores.has(playerId)) {
      console.error(`Player with ID ${playerId} not found`);
      return;
    }

    const playerData = this.playerScores.get(playerId);
    playerData.score += points;
    
    if (!playerData.roundScores) {
      playerData.roundScores = [];
    }
    playerData.roundScores.push(points);

    this.updateLeader();
    this.render();
    this.dispatchScoreUpdateEvent(playerId, playerData.score);
  }

  /**
   * Set a player's total score (replaces current score)
   * @param {string} playerId - The player's ID
   * @param {number} totalScore - The total score value
   */
  setPlayerScore(playerId, totalScore) {
    if (!this.playerScores.has(playerId)) {
      console.error(`Player with ID ${playerId} not found`);
      return;
    }

    const playerData = this.playerScores.get(playerId);
    playerData.score = totalScore;

    this.updateLeader();
    this.render();
    this.dispatchScoreUpdateEvent(playerId, totalScore);
  }

  /**
   * Update leader based on current scores
   */
  updateLeader() {
    let maxScore = -Infinity;
    let newLeader = null;

    this.playerScores.forEach(playerData => {
      if (playerData.score > maxScore) {
        maxScore = playerData.score;
        newLeader = playerData.id;
      }
    });

    this.currentLeader = newLeader;
  }

  /**
   * Get all player scores sorted by score (descending)
   * @returns {Array} Array of player data objects sorted by score
   */
  getSortedScores() {
    return Array.from(this.playerScores.values())
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get the current leader
   * @returns {Object|null} Current leader player data or null
   */
  getLeader() {
    if (!this.currentLeader) {
      return null;
    }
    return this.playerScores.get(this.currentLeader);
  }

  /**
   * Render the score display
   */
  render() {
    if (!this.container) {
      console.warn('Score display container not available for rendering');
      return;
    }

    this.container.innerHTML = '';
    const sortedScores = this.getSortedScores();

    sortedScores.forEach((playerData, index) => {
      const isLeader = playerData.id === this.currentLeader;
      const card = this.createPlayerScoreCard(playerData, isLeader, index + 1);
      this.container.appendChild(card);
    });
  }

  /**
   * Create a player score card element
   * @param {Object} playerData - Player data object
   * @param {boolean} isLeader - Whether this player is the current leader
   * @param {number} rank - The player's rank
   * @returns {HTMLElement} The score card element
   */
  createPlayerScoreCard(playerData, isLeader, rank) {
    const card = document.createElement('div');
    card.className = 'player-score-card';
    card.dataset.playerId = playerData.id;
    
    if (isLeader) {
      card.classList.add('leader');
    }

    card.innerHTML = `
      <div class="card-rank">${rank}</div>
      <div class="card-content">
        <div class="card-header">
          <h3 class="player-name">${this.escapeHtml(playerData.name)}</h3>
          ${isLeader ? '<div class="leader-badge">👑 Leader</div>' : ''}
        </div>
        <div class="card-score">${playerData.score}</div>
      </div>
    `;

    return card;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Dispatch custom event for score update
   * @param {string} playerId - The player's ID
   * @param {number} newScore - The new score value
   */
  dispatchScoreUpdateEvent(playerId, newScore) {
    const event = new CustomEvent('scoreUpdated', {
      detail: {
        playerId,
        newScore,
        leader: this.currentLeader
      },
      bubbles: true
    });
    
    if (this.container) {
      this.container.dispatchEvent(event);
    }
  }

  /**
   * Reset all scores to zero
   */
  reset() {
    this.playerScores.forEach(playerData => {
      playerData.score = 0;
      playerData.roundScores = [];
    });
    
    this.currentLeader = null;
    this.render();
  }

  /**
   * Get player data by ID
   * @param {string} playerId - The player's ID
   * @returns {Object|null} Player data or null if not found
   */
  getPlayerData(playerId) {
    return this.playerScores.get(playerId) || null;
  }

  /**
   * Get all player data
   * @returns {Map} Map of all player data
   */
  getAllPlayers() {
    return new Map(this.playerScores);
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplay;
}
