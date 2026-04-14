/**
 * Score Display UI Module
 * Handles rendering and interaction for score display
 */

class ScoreDisplayUI {
  constructor(scoreDisplay) {
    this.scoreDisplay = scoreDisplay;
    this.expandedPlayers = new Set();
  }

  /**
   * Render the leaderboard (current scores)
   * @param {string} leaderboardSelector - CSS selector for leaderboard container
   */
  renderLeaderboard(leaderboardSelector = '#leaderboard-content') {
    const container = document.querySelector(leaderboardSelector);
    if (!container) {
      console.error(`Container ${leaderboardSelector} not found`);
      return;
    }

    const totals = this.scoreDisplay.getAllPlayerTotals();
    const leader = this.scoreDisplay.getCurrentLeader();

    if (Object.keys(totals).length === 0) {
      container.innerHTML = '<div class="empty-state">No scores yet</div>';
      return;
    }

    // Sort players by score (descending)
    const sortedPlayers = Object.entries(totals)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    container.innerHTML = sortedPlayers
      .map(
        ([playerName, score]) =>
          `<div class="leaderboard-item ${playerName === leader.playerName ? 'leader' : ''}">
        <span class="player-name">${this.escapeHtml(playerName)}</span>
        <span class="player-score">${score}</span>
      </div>`
      )
      .join('');
  }

  /**
   * Render the score history with accordion
   * @param {string} containerSelector - CSS selector for history container
   */
  renderHistory(containerSelector = '#player-histories-content') {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error(`Container ${containerSelector} not found`);
      return;
    }

    const breakdown = this.scoreDisplay.getScoreBreakdown();

    if (this.scoreDisplay.players.length === 0) {
      container.innerHTML = '<div class="empty-state">No players initialized</div>';
      return;
    }

    container.innerHTML = this.scoreDisplay.players
      .map((playerName) => this.createAccordionItem(playerName, breakdown[playerName]))
      .join('');

    // Attach event listeners
    this.attachAccordionListeners();
  }

  /**
   * Create accordion item HTML for a player
   * @param {string} playerName - Name of the player
   * @param {Object} breakdown - Score breakdown object
   * @returns {string} HTML string
   */
  createAccordionItem(playerName, breakdown) {
    const isExpanded = this.expandedPlayers.has(playerName);
    const tableRows = this.createTableRows(breakdown.roundScores, breakdown.runningTotals);

    return `
      <div class="accordion-item ${isExpanded ? 'expanded' : ''}" data-player="${this.escapeHtml(playerName)}">
        <div class="accordion-header">
          <div class="accordion-player-info">
            <span class="accordion-player-name">${this.escapeHtml(playerName)}</span>
            <span class="accordion-player-total">Total: ${breakdown.total}</span>
          </div>
          <span class="accordion-toggle-icon">▼</span>
        </div>
        <div class="accordion-content">
          <table class="score-breakdown-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Round Score</th>
                <th>Running Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="breakdown-summary">
            <span class="breakdown-summary-label">Final Total:</span>
            <span class="breakdown-summary-value">${breakdown.total}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create table rows for score breakdown
   * @param {number[]} roundScores - Array of round scores
   * @param {number[]} runningTotals - Array of running totals
   * @returns {string} HTML string of table rows
   */
  createTableRows(roundScores, runningTotals) {
    if (roundScores.length === 0) {
      return '<tr><td colspan="3" class="empty-state">No rounds played</td></tr>';
    }

    return roundScores
      .map(
        (score, index) =>
          `<tr>
        <td class="round-number">Round ${index + 1}</td>
        <td class="round-score">${score}</td>
        <td class="running-total">${runningTotals[index]}</td>
      </tr>`
      )
      .join('');
  }

  /**
   * Attach click listeners to accordion headers
   */
  attachAccordionListeners() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach((header) => {
      header.addEventListener('click', (e) => this.toggleAccordion(e));
    });
  }

  /**
   * Toggle accordion expansion
   * @param {Event} event - Click event
   */
  toggleAccordion(event) {
    const header = event.currentTarget;
    const item = header.closest('.accordion-item');
    const playerName = item.getAttribute('data-player');

    item.classList.toggle('expanded');

    if (item.classList.contains('expanded')) {
      this.expandedPlayers.add(playerName);
    } else {
      this.expandedPlayers.delete(playerName);
    }
  }

  /**
   * Refresh both leaderboard and history displays
   * @param {string} leaderboardSelector - CSS selector for leaderboard container
   * @param {string} historySelector - CSS selector for history container
   */
  refresh(
    leaderboardSelector = '#leaderboard-content',
    historySelector = '#player-histories-content'
  ) {
    this.renderLeaderboard(leaderboardSelector);
    this.renderHistory(historySelector);
  }

  /**
   * Escape HTML special characters to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplayUI;
}
