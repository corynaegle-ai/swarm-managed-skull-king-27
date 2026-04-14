/**
 * Score Display Module
 * Handles rendering and updating player scores with leader highlighting
 */

class ScoreDisplay {
  constructor(containerId = 'scores-container') {
    this.container = document.getElementById(containerId);
    this.players = [];
    this.updateListeners = [];
  }

  /**
   * Initialize with player data
   * @param {Array} players - Array of player objects with { name, score } properties
   */
  init(players) {
    this.players = players;
    this.render();
  }

  /**
   * Update a player's score and trigger real-time update
   * @param {string|number} playerId - The player identifier
   * @param {number} newScore - The new score value
   */
  updatePlayerScore(playerId, newScore) {
    const player = this.players.find(p => p.id === playerId || p.name === playerId);
    if (player) {
      player.score = newScore;
      this.render();
      this.triggerScoreUpdateAnimation(playerId);
      this.notifyListeners();
    }
  }

  /**
   * Get the current leader
   * @returns {Object} Player object with highest score
   */
  getCurrentLeader() {
    if (this.players.length === 0) return null;
    return this.players.reduce((leader, current) => 
      current.score > leader.score ? current : leader
    );
  }

  /**
   * Get sorted players by score (descending)
   * @returns {Array} Sorted array of players
   */
  getSortedPlayers() {
    return [...this.players].sort((a, b) => b.score - a.score);
  }

  /**
   * Render all player score cards
   */
  render() {
    if (!this.container) {
      console.error('Score container not found');
      return;
    }

    const sortedPlayers = this.getSortedPlayers();
    const leader = this.getCurrentLeader();

    this.container.innerHTML = sortedPlayers.map((player, index) => 
      this.createPlayerCard(player, index + 1, leader)
    ).join('');

    // Attach event listeners to cards
    this.attachCardListeners();
  }

  /**
   * Create HTML for a player score card
   * @param {Object} player - Player object
   * @param {number} rank - Player's rank position
   * @param {Object} leader - Current leader object
   * @returns {string} HTML string for the card
   */
  createPlayerCard(player, rank, leader) {
    const isLeader = leader && player.id === leader.id;
    const leaderClass = isLeader ? 'leader' : '';
    const leaderBadge = isLeader ? '<span class="leader-badge">👑 Leader</span>' : '';

    return `
      <div class="player-score-card ${leaderClass}" data-player-id="${player.id || player.name}">
        <div class="card-rank">${rank}</div>
        <div class="card-content">
          <div class="card-header">
            <h2 class="player-name">${this.escapeHtml(player.name)}</h2>
            ${leaderBadge}
          </div>
          <div class="card-score">${player.score}</div>
        </div>
      </div>
    `;
  }

  /**
   * Trigger visual animation for score update
   * @param {string|number} playerId - The player identifier
   */
  triggerScoreUpdateAnimation(playerId) {
    const card = this.container.querySelector(`[data-player-id="${playerId}"]`);
    if (card) {
      card.classList.add('updating');
      setTimeout(() => {
        card.classList.remove('updating');
      }, 300);
    }
  }

  /**
   * Attach event listeners to player cards
   */
  attachCardListeners() {
    const cards = this.container.querySelectorAll('.player-score-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        this.handleCardClick(e);
      });
    });
  }

  /**
   * Handle click events on player cards
   * @param {Event} event - Click event
   */
  handleCardClick(event) {
    const card = event.currentTarget;
    const playerId = card.getAttribute('data-player-id');
    this.notifyListeners({ type: 'cardClick', playerId });
  }

  /**
   * Register a listener for score updates
   * @param {Function} callback - Function to call on updates
   */
  onUpdate(callback) {
    this.updateListeners.push(callback);
  }

  /**
   * Notify all registered listeners
   * @param {Object} data - Data to pass to listeners
   */
  notifyListeners(data = {}) {
    this.updateListeners.forEach(callback => {
      try {
        callback({
          players: this.players,
          leader: this.getCurrentLeader(),
          ...data
        });
      } catch (error) {
        console.error('Error in score update listener:', error);
      }
    });
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get current scores
   * @returns {Array} Current players array
   */
  getScores() {
    return this.players;
  }

  /**
   * Reset all scores to zero
   */
  resetScores() {
    this.players.forEach(player => {
      player.score = 0;
    });
    this.render();
    this.notifyListeners({ type: 'reset' });
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplay;
}
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
