/**
 * Score Display UI Module
 * Handles rendering score display and history to the DOM
 */

class ScoreDisplayUI {
  constructor(scoreDisplay) {
    this.scoreDisplay = scoreDisplay;
    this.expandedPlayers = new Set();
    this.initializeEventListeners();
  }

  /**
   * Initialize event listeners for accordion headers
   */
  initializeEventListeners() {
    // Event delegation for accordion headers
    document.addEventListener('click', (e) => {
      const header = e.target.closest('.accordion-header');
      if (header) {
        const playerName = header.dataset.playerName;
        this.togglePlayerHistory(playerName);
      }
    });
  }

  /**
   * Toggle the expanded/collapsed state of a player's history
   * @param {string} playerName - Name of the player
   */
  togglePlayerHistory(playerName) {
    if (this.expandedPlayers.has(playerName)) {
      this.expandedPlayers.delete(playerName);
    } else {
      this.expandedPlayers.add(playerName);
    }
    this.render();
  }

  /**
   * Render the entire score display including leaderboard and histories
   */
  render() {
    this.renderLeaderboard();
    this.renderPlayerHistories();
  }

  /**
   * Render the current leaderboard showing player totals
   */
  renderLeaderboard() {
    const leaderboardContent = document.getElementById('leaderboard-content');
    if (!leaderboardContent) {
      console.error('Leaderboard content container not found');
      return;
    }

    const players = this.scoreDisplay.getPlayersSortedByScore();
    const leader = this.scoreDisplay.getCurrentLeader();

    leaderboardContent.innerHTML = '';

    if (players.length === 0) {
      leaderboardContent.innerHTML = '<div class="empty-state">No players yet</div>';
      return;
    }

    players.forEach((player, index) => {
      const isLeader = player.playerName === leader.playerName && player.score > 0;
      const item = document.createElement('div');
      item.className = `leaderboard-item ${isLeader ? 'leader' : ''}`;
      item.innerHTML = `
        <span class="player-name">#${index + 1} ${player.playerName}</span>
        <span class="player-score">${player.score}</span>
      `;
      leaderboardContent.appendChild(item);
    });
  }

  /**
   * Render the player history section with accordion items
   */
  renderPlayerHistories() {
    const playerHistoriesContent = document.getElementById('player-histories-content');
    if (!playerHistoriesContent) {
      console.error('Player histories content container not found');
      return;
    }

    const players = this.scoreDisplay.players;
    playerHistoriesContent.innerHTML = '';

    if (players.length === 0) {
      playerHistoriesContent.innerHTML = '<div class="empty-state">No player histories yet</div>';
      return;
    }

    players.forEach((playerName) => {
      const accordionItem = this.createAccordionItem(playerName);
      playerHistoriesContent.appendChild(accordionItem);
    });
  }

  /**
   * Create an accordion item for a player's score history
   * @param {string} playerName - Name of the player
   * @returns {HTMLElement} The accordion item element
   */
  createAccordionItem(playerName) {
    const isExpanded = this.expandedPlayers.has(playerName);
    const total = this.scoreDisplay.getPlayerTotal(playerName);
    const roundBreakdown = this.scoreDisplay.getPlayerRoundBreakdown(playerName);

    const item = document.createElement('div');
    item.className = `accordion-item ${isExpanded ? 'expanded' : ''}`;

    // Create header
    const header = document.createElement('div');
    header.className = `accordion-header ${isExpanded ? 'expanded' : ''}`;
    header.dataset.playerName = playerName;
    header.innerHTML = `
      <div class="accordion-player-info">
        <span class="accordion-player-name">${playerName}</span>
        <span class="accordion-player-total">Total: ${total}</span>
      </div>
      <span class="accordion-toggle-icon">▼</span>
    `;

    // Create content
    const content = document.createElement('div');
    content.className = 'accordion-content';

    if (roundBreakdown.length > 0) {
      content.innerHTML = this.createScoreBreakdownTable(roundBreakdown);
    } else {
      content.innerHTML = '<div class="empty-state" style="padding: 20px;">No round history yet</div>';
    }

    item.appendChild(header);
    item.appendChild(content);

    return item;
  }

  /**
   * Create a score breakdown table for a player
   * @param {Array} roundBreakdown - Array of {roundNumber, roundScore, runningTotal} objects
   * @returns {string} HTML string for the table
   */
  createScoreBreakdownTable(roundBreakdown) {
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

    const totalScore = roundBreakdown.length > 0 ? roundBreakdown[roundBreakdown.length - 1].runningTotal : 0;
    html += `
        </tbody>
      </table>
      <div class="breakdown-summary">
        <span class="breakdown-summary-label">Final Total:</span>
        <span class="breakdown-summary-value">${totalScore}</span>
      </div>
    `;

    return html;
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplayUI;
}
