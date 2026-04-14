/**
 * Score Display UI Module
 * Handles rendering of score display and history components
 */

class ScoreDisplayUI {
  constructor(scoreDisplay) {
    this.scoreDisplay = scoreDisplay;
    this.leaderboardContent = document.getElementById('leaderboard-content');
    this.playerHistoriesContent = document.getElementById('player-histories-content');
    
    if (!this.leaderboardContent || !this.playerHistoriesContent) {
      console.error('Required DOM elements not found. Ensure score-display.html is loaded.');
    }
  }

  /**
   * Render the leaderboard with current player scores
   */
  renderLeaderboard() {
    if (!this.leaderboardContent) return;
    
    const sortedPlayers = this.scoreDisplay.getPlayersSortedByScore();
    const leader = this.scoreDisplay.getCurrentLeader();
    
    // Clear existing content
    this.leaderboardContent.innerHTML = '';
    
    if (sortedPlayers.length === 0) {
      this.leaderboardContent.innerHTML = '<div class="empty-state">No players initialized yet</div>';
      return;
    }
    
    sortedPlayers.forEach((player) => {
      const isLeader = player.playerName === leader.playerName;
      const item = document.createElement('div');
      item.className = `leaderboard-item ${isLeader ? 'leader' : ''}`;
      item.innerHTML = `
        <span class="player-name">${this.escapeHtml(player.playerName)}</span>
        <span class="player-score">${player.score}</span>
      `;
      this.leaderboardContent.appendChild(item);
    });
  }

  /**
   * Render the player histories with accordion sections
   */
  renderPlayerHistories() {
    if (!this.playerHistoriesContent) return;
    
    const sortedPlayers = this.scoreDisplay.getPlayersSortedByScore();
    
    // Clear existing content
    this.playerHistoriesContent.innerHTML = '';
    
    if (sortedPlayers.length === 0) {
      this.playerHistoriesContent.innerHTML = '<div class="empty-state">No players initialized yet</div>';
      return;
    }
    
    sortedPlayers.forEach((player) => {
      const playerName = player.playerName;
      const roundBreakdown = this.scoreDisplay.getPlayerRoundBreakdown(playerName);
      const total = this.scoreDisplay.getPlayerTotal(playerName);
      
      // Create accordion item
      const accordionItem = document.createElement('div');
      accordionItem.className = 'accordion-item';
      accordionItem.setAttribute('data-player', playerName);
      
      // Create header
      const header = document.createElement('div');
      header.className = 'accordion-header';
      header.innerHTML = `
        <div class="accordion-player-info">
          <span class="accordion-player-name">${this.escapeHtml(playerName)}</span>
          <span class="accordion-player-total">Total: ${total}</span>
        </div>
        <span class="accordion-toggle-icon">▼</span>
      `;
      
      // Create content
      const content = document.createElement('div');
      content.className = 'accordion-content';
      content.innerHTML = this.renderScoreBreakdownTable(roundBreakdown, total);
      
      // Add click handler to header
      header.addEventListener('click', () => {
        accordionItem.classList.toggle('expanded');
      });
      
      accordionItem.appendChild(header);
      accordionItem.appendChild(content);
      this.playerHistoriesContent.appendChild(accordionItem);
    });
  }

  /**
   * Render the score breakdown table for a player
   * @param {Array} roundBreakdown - Array of {roundNumber, roundScore, runningTotal} objects
   * @param {number} total - Total score for the player
   * @returns {string} HTML string for the breakdown table
   */
  renderScoreBreakdownTable(roundBreakdown, total) {
    if (roundBreakdown.length === 0) {
      return '<div class="empty-state">No rounds played yet</div>';
    }
    
    let html = `
      <table class="score-breakdown-table">
        <thead>
          <tr>
            <th>Round</th>
            <th>Points</th>
            <th>Running Total</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    roundBreakdown.forEach((round) => {
      html += `
        <tr>
          <td class="round-number">Round ${round.roundNumber}</td>
          <td class="round-score">${round.roundScore}</td>
          <td class="running-total">${round.runningTotal}</td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
      <div class="breakdown-summary">
        <span class="breakdown-summary-label">Final Total:</span>
        <span class="breakdown-summary-value">${total}</span>
      </div>
    `;
    
    return html;
  }

  /**
   * Expand a specific player's history accordion
   * @param {string} playerName - Name of the player
   */
  expandPlayerHistory(playerName) {
    const accordionItem = this.playerHistoriesContent.querySelector(`[data-player="${playerName}"]`);
    if (accordionItem) {
      accordionItem.classList.add('expanded');
    }
  }

  /**
   * Collapse a specific player's history accordion
   * @param {string} playerName - Name of the player
   */
  collapsePlayerHistory(playerName) {
    const accordionItem = this.playerHistoriesContent.querySelector(`[data-player="${playerName}"]`);
    if (accordionItem) {
      accordionItem.classList.remove('expanded');
    }
  }

  /**
   * Expand all player history accordions
   */
  expandAllHistories() {
    const accordionItems = this.playerHistoriesContent.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
      item.classList.add('expanded');
    });
  }

  /**
   * Collapse all player history accordions
   */
  collapseAllHistories() {
    const accordionItems = this.playerHistoriesContent.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
      item.classList.remove('expanded');
    });
  }

  /**
   * Update both leaderboard and player histories
   */
  render() {
    this.renderLeaderboard();
    this.renderPlayerHistories();
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplayUI;
}
