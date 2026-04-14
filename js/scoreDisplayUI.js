/**
 * Score Display UI Module
 * Handles rendering and interactions for score display
 */

class ScoreDisplayUI {
  constructor(scoreDisplay) {
    this.scoreDisplay = scoreDisplay;
    this.expandedPlayers = new Set();
  }

  /**
   * Render the leaderboard with current scores
   */
  renderLeaderboard() {
    const leaderboardContent = document.getElementById('leaderboard-content');
    if (!leaderboardContent) {
      console.error('Element with id "leaderboard-content" not found');
      return;
    }

    // Clear existing content
    leaderboardContent.innerHTML = '';

    const sortedPlayers = this.scoreDisplay.getPlayersSortedByScore();
    const leader = this.scoreDisplay.getCurrentLeader();

    sortedPlayers.forEach((player, index) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item';
      
      if (player.playerName === leader.playerName) {
        item.classList.add('leader');
      }

      const playerNameDiv = document.createElement('span');
      playerNameDiv.className = 'player-name';
      playerNameDiv.textContent = `${index + 1}. ${player.playerName}`;

      const scoreDiv = document.createElement('span');
      scoreDiv.className = 'player-score';
      scoreDiv.textContent = player.score;

      item.appendChild(playerNameDiv);
      item.appendChild(scoreDiv);
      leaderboardContent.appendChild(item);
    });
  }

  /**
   * Render the player history accordions
   */
  renderPlayerHistories() {
    const historiesContent = document.getElementById('player-histories-content');
    if (!historiesContent) {
      console.error('Element with id "player-histories-content" not found');
      return;
    }

    // Clear existing content
    historiesContent.innerHTML = '';

    this.scoreDisplay.players.forEach(playerName => {
      const accordionItem = this.createAccordionItem(playerName);
      historiesContent.appendChild(accordionItem);
    });
  }

  /**
   * Create an accordion item for a player
   * @param {string} playerName - Name of the player
   * @returns {HTMLElement} The accordion item element
   */
  createAccordionItem(playerName) {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.dataset.player = playerName;

    // Header
    const header = document.createElement('div');
    header.className = 'accordion-header';
    header.addEventListener('click', () => this.toggleAccordion(playerName, item));

    const playerInfo = document.createElement('div');
    playerInfo.className = 'accordion-player-info';

    const playerName_el = document.createElement('div');
    playerName_el.className = 'accordion-player-name';
    playerName_el.textContent = playerName;

    const totalScore = document.createElement('div');
    totalScore.className = 'accordion-player-total';
    totalScore.textContent = `Total: ${this.scoreDisplay.getPlayerTotal(playerName)}`;

    playerInfo.appendChild(playerName_el);
    playerInfo.appendChild(totalScore);

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'accordion-toggle-icon';
    toggleIcon.textContent = '▼';

    header.appendChild(playerInfo);
    header.appendChild(toggleIcon);

    // Content
    const content = document.createElement('div');
    content.className = 'accordion-content';
    content.innerHTML = this.createBreakdownTable(playerName);

    item.appendChild(header);
    item.appendChild(content);

    return item;
  }

  /**
   * Create the breakdown table HTML for a player's scores
   * @param {string} playerName - Name of the player
   * @returns {string} HTML string for the breakdown table
   */
  createBreakdownTable(playerName) {
    const breakdown = this.scoreDisplay.getPlayerRoundBreakdown(playerName);
    const total = this.scoreDisplay.getPlayerTotal(playerName);

    if (breakdown.length === 0) {
      return '<p class="empty-state">No rounds played yet</p>';
    }

    let html = '<table class="score-breakdown-table"><thead><tr>';
    html += '<th>Round</th><th>Score</th><th>Running Total</th></tr></thead><tbody>';

    breakdown.forEach(round => {
      html += '<tr>';
      html += `<td class="round-number">Round ${round.roundNumber}</td>`;
      html += `<td class="round-score">${round.roundScore}</td>`;
      html += `<td class="running-total">${round.runningTotal}</td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';
    html += `<div class="breakdown-summary">`;
    html += `<span class="breakdown-summary-label">Final Total:</span>`;
    html += `<span class="breakdown-summary-value">${total}</span>`;
    html += `</div>`;

    return html;
  }

  /**
   * Toggle accordion expansion for a player
   * @param {string} playerName - Name of the player
   * @param {HTMLElement} accordionItem - The accordion item element
   */
  toggleAccordion(playerName, accordionItem) {
    const isExpanded = this.expandedPlayers.has(playerName);

    if (isExpanded) {
      this.expandedPlayers.delete(playerName);
      accordionItem.classList.remove('expanded');
    } else {
      this.expandedPlayers.add(playerName);
      accordionItem.classList.add('expanded');
    }
  }

  /**
   * Render all UI components (leaderboard and histories)
   */
  render() {
    this.renderLeaderboard();
    this.renderPlayerHistories();
  }

  /**
   * Update the display with the latest scores
   */
  update() {
    this.renderLeaderboard();
    // Update total scores in accordion headers
    this.scoreDisplay.players.forEach(playerName => {
      const accordionItem = document.querySelector(`[data-player="${playerName}"]`);
      if (accordionItem) {
        const totalSpan = accordionItem.querySelector('.accordion-player-total');
        if (totalSpan) {
          totalSpan.textContent = `Total: ${this.scoreDisplay.getPlayerTotal(playerName)}`;
        }
        // Update the breakdown table
        const content = accordionItem.querySelector('.accordion-content');
        if (content) {
          content.innerHTML = this.createBreakdownTable(playerName);
        }
      }
    });
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplayUI;
}
