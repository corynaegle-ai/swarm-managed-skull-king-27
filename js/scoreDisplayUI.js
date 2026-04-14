/**
 * Score Display UI Module
 * Handles rendering and interaction for score display components
 */

class ScoreDisplayUI {
  constructor(scoreDisplay) {
    if (!scoreDisplay || !(scoreDisplay instanceof ScoreDisplay)) {
      throw new Error('ScoreDisplayUI requires a valid ScoreDisplay instance');
    }
    this.scoreDisplay = scoreDisplay;
    this.leaderboardContainer = document.getElementById('leaderboard-content');
    this.historiesContainer = document.getElementById('player-histories-content');
    
    if (!this.leaderboardContainer || !this.historiesContainer) {
      console.warn('ScoreDisplayUI: Required DOM elements not found. Display will not render.');
    }
  }

  /**
   * Render the current leaderboard
   */
  renderLeaderboard() {
    if (!this.leaderboardContainer) return;
    
    // Clear existing items
    this.leaderboardContainer.innerHTML = '';
    
    const totals = this.scoreDisplay.getAllPlayerTotals();
    const leader = this.scoreDisplay.getCurrentLeader();
    
    // Sort players by score descending
    const sortedPlayers = Object.entries(totals)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    
    if (sortedPlayers.length === 0) {
      this.leaderboardContainer.innerHTML = '<div class="empty-state">No scores yet</div>';
      return;
    }
    
    // Create leaderboard items
    sortedPlayers.forEach(([playerName, score]) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item';
      
      if (playerName === leader.playerName) {
        item.classList.add('leader');
      }
      
      item.innerHTML = `
        <span class="player-name">${this._escapeHtml(playerName)}</span>
        <span class="player-score">${score}</span>
      `;
      
      this.leaderboardContainer.appendChild(item);
    });
  }

  /**
   * Render the score history with expandable accordion items
   */
  renderHistories() {
    if (!this.historiesContainer) return;
    
    // Clear existing items
    this.historiesContainer.innerHTML = '';
    
    const breakdown = this.scoreDisplay.getScoreBreakdown();
    
    if (this.scoreDisplay.players.length === 0) {
      this.historiesContainer.innerHTML = '<div class="empty-state">No players initialized</div>';
      return;
    }
    
    // Create accordion items for each player
    this.scoreDisplay.players.forEach((playerName) => {
      const data = breakdown[playerName];
      const accordionItem = this._createAccordionItem(playerName, data);
      this.historiesContainer.appendChild(accordionItem);
    });
  }

  /**
   * Create an accordion item for a player's history
   * @param {string} playerName - Player name
   * @param {Object} data - Score breakdown data
   * @returns {HTMLElement} Accordion item element
   */
  _createAccordionItem(playerName, data) {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    
    const header = document.createElement('div');
    header.className = 'accordion-header';
    
    const playerInfo = document.createElement('div');
    playerInfo.className = 'accordion-player-info';
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'accordion-player-name';
    nameSpan.textContent = this._escapeHtml(playerName);
    
    const totalSpan = document.createElement('span');
    totalSpan.className = 'accordion-player-total';
    totalSpan.textContent = `Total: ${data.total}`;
    
    playerInfo.appendChild(nameSpan);
    playerInfo.appendChild(totalSpan);
    
    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'accordion-toggle-icon';
    toggleIcon.textContent = '▼';
    
    header.appendChild(playerInfo);
    header.appendChild(toggleIcon);
    
    const content = document.createElement('div');
    content.className = 'accordion-content';
    
    // Create score breakdown table
    const table = this._createScoreBreakdownTable(data);
    content.appendChild(table);
    
    // Create summary
    const summary = document.createElement('div');
    summary.className = 'breakdown-summary';
    summary.innerHTML = `
      <span class="breakdown-summary-label">Final Total:</span>
      <span class="breakdown-summary-value">${data.total}</span>
    `;
    content.appendChild(summary);
    
    item.appendChild(header);
    item.appendChild(content);
    
    // Add click handler for expand/collapse
    header.addEventListener('click', () => {
      item.classList.toggle('expanded');
    });
    
    return item;
  }

  /**
   * Create a score breakdown table
   * @param {Object} data - Score breakdown data
   * @returns {HTMLElement} Table element
   */
  _createScoreBreakdownTable(data) {
    const table = document.createElement('table');
    table.className = 'score-breakdown-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const roundHeader = document.createElement('th');
    roundHeader.textContent = 'Round';
    
    const scoreHeader = document.createElement('th');
    scoreHeader.textContent = 'Points';
    
    const totalHeader = document.createElement('th');
    totalHeader.textContent = 'Running Total';
    
    headerRow.appendChild(roundHeader);
    headerRow.appendChild(scoreHeader);
    headerRow.appendChild(totalHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    const { roundScores, runningTotals } = data;
    
    if (roundScores.length === 0) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = 3;
      emptyCell.style.textAlign = 'center';
      emptyCell.style.color = '#999';
      emptyCell.textContent = 'No rounds played yet';
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
    } else {
      roundScores.forEach((score, index) => {
        const row = document.createElement('tr');
        
        const roundCell = document.createElement('td');
        roundCell.className = 'round-number';
        roundCell.textContent = index + 1;
        
        const scoreCell = document.createElement('td');
        scoreCell.className = 'round-score';
        scoreCell.textContent = score;
        
        const totalCell = document.createElement('td');
        totalCell.className = 'running-total';
        totalCell.textContent = runningTotals[index];
        
        row.appendChild(roundCell);
        row.appendChild(scoreCell);
        row.appendChild(totalCell);
        tbody.appendChild(row);
      });
    }
    
    table.appendChild(tbody);
    return table;
  }

  /**
   * Update the display (render both leaderboard and histories)
   */
  update() {
    this.renderLeaderboard();
    this.renderHistories();
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplayUI;
}
