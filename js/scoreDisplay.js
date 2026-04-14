/**
 * ScoreDisplay
 * Manages the rendering and real-time updating of player scores and leader status.
 */
class ScoreDisplay {
  /**
   * @param {string} containerId - ID of the DOM element to render scores into
   */
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      console.error(`ScoreDisplay: Container with ID "${containerId}" not found`);
      return;
    }
    
    this.players = [];
    this.updateCallbacks = [];
  }

  /**
   * Initialize score display with player data
   * @param {Array<{id: number, name: string, score: number}>} players - Array of player objects
   */
  init(players) {
    if (!Array.isArray(players)) {
      console.error('ScoreDisplay.init: players must be an array');
      return;
    }
    
    this.players = players.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score || 0
    }));
    
    this.render();
    this.dispatchUpdate();
  }

  /**
   * Update a single player's score
   * @param {number} playerId - ID of the player
   * @param {number} newScore - New score value
   */
  updatePlayerScore(playerId, newScore) {
    const player = this.players.find(p => p.id === playerId);
    
    if (!player) {
      console.warn(`ScoreDisplay: Player with ID ${playerId} not found`);
      return;
    }
    
    player.score = newScore;
    this.updateScoreDisplay(playerId);
    this.updateLeaderHighlight();
    this.dispatchUpdate();
  }

  /**
   * Update multiple players' scores
   * @param {Array<{id: number, score: number}>} updates - Array of player score updates
   */
  updateMultipleScores(updates) {
    if (!Array.isArray(updates)) {
      console.error('ScoreDisplay.updateMultipleScores: updates must be an array');
      return;
    }
    
    updates.forEach(update => {
      const player = this.players.find(p => p.id === update.id);
      if (player) {
        player.score = update.score;
        this.updateScoreDisplay(update.id);
      }
    });
    
    this.updateLeaderHighlight();
    this.dispatchUpdate();
  }

  /**
   * Get current leader
   * @returns {{id: number, name: string, score: number} | null} Current leader or null if no players
   */
  getLeader() {
    if (this.players.length === 0) return null;
    
    return this.players.reduce((leader, player) => {
      return player.score > leader.score ? player : leader;
    });
  }

  /**
   * Get all players sorted by score (highest first)
   * @returns {Array<{id: number, name: string, score: number}>} Sorted players array
   */
  getRanking() {
    return [...this.players].sort((a, b) => b.score - a.score);
  }

  /**
   * Register callback for score updates
   * @param {Function} callback - Function to call when scores update
   */
  onUpdate(callback) {
    if (typeof callback === 'function') {
      this.updateCallbacks.push(callback);
    }
  }

  /**
   * Render all player score cards
   * @private
   */
  render() {
    if (!this.container) return;
    
    // Clear existing content
    this.container.innerHTML = '';
    
    if (this.players.length === 0) {
      this.container.innerHTML = '<div style="color: #999; text-align: center; padding: 2rem;">No players to display</div>';
      return;
    }
    
    const leader = this.getLeader();
    
    this.players.forEach(player => {
      const isLeader = leader && player.id === leader.id;
      const card = this.createPlayerCard(player, isLeader);
      this.container.appendChild(card);
    });
  }

  /**
   * Create a player score card element
   * @private
   */
  createPlayerCard(player, isLeader) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.setAttribute('data-player-id', player.id);
    
    if (isLeader) {
      card.classList.add('leader');
    }
    
    // Leader badge
    const leaderBadge = isLeader 
      ? '<span class="leader-badge">👑 LEADER</span>' 
      : '';
    
    card.innerHTML = `
      <div class="player-card-header">
        <h3 class="player-name">${this.escapeHtml(player.name)}</h3>
        ${leaderBadge}
      </div>
      <div class="player-card-body">
        <div class="score-display-large">
          <span class="score-value">${player.score}</span>
          <span class="score-label">points</span>
        </div>
      </div>
    `;
    
    return card;
  }

  /**
   * Update a single player's score display (DOM update only)
   * @private
   */
  updateScoreDisplay(playerId) {
    const card = this.container.querySelector(`[data-player-id="${playerId}"]`);
    
    if (!card) return;
    
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;
    
    const scoreValue = card.querySelector('.score-value');
    if (scoreValue) {
      scoreValue.innerText = player.score;
      this.triggerUpdateAnimation(scoreValue);
    }
  }

  /**
   * Update leader highlighting (DOM update only)
   * @private
   */
  updateLeaderHighlight() {
    const leader = this.getLeader();
    
    // Remove leader class from all cards
    this.container.querySelectorAll('.player-card').forEach(card => {
      card.classList.remove('leader');
      const badge = card.querySelector('.leader-badge');
      if (badge) badge.remove();
    });
    
    // Add leader class and badge to current leader
    if (leader) {
      const leaderCard = this.container.querySelector(`[data-player-id="${leader.id}"]`);
      if (leaderCard) {
        leaderCard.classList.add('leader');
        const header = leaderCard.querySelector('.player-card-header');
        if (header) {
          const badge = document.createElement('span');
          badge.className = 'leader-badge';
          badge.innerText = '👑 LEADER';
          header.appendChild(badge);
        }
      }
    }
  }

  /**
   * Trigger a subtle animation when score is updated
   * @private
   */
  triggerUpdateAnimation(element) {
    if (!element) return;
    
    element.classList.add('score-update-pulse');
    
    // Remove animation class after it completes (300ms)
    setTimeout(() => {
      element.classList.remove('score-update-pulse');
    }, 300);
  }

  /**
   * Dispatch a custom event for external listeners
   * @private
   */
  dispatchUpdate() {
    const event = new CustomEvent('scoreUpdated', {
      detail: {
        players: this.players,
        leader: this.getLeader(),
        timestamp: new Date()
      }
    });
    
    document.dispatchEvent(event);
    this.updateCallbacks.forEach(callback => callback({
      players: this.players,
      leader: this.getLeader(),
      timestamp: new Date()
    }));
  }

  /**
   * Utility to escape HTML in player names
   * @private
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
