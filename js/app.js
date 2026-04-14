/**
 * Main Application Logic
 * Connects UI with player management
 */

(function() {
  'use strict';

  // DOM Elements
  const playerForm = document.getElementById('playerForm');
  const playerNameInput = document.getElementById('playerNameInput');
  const addPlayerBtn = document.getElementById('addPlayerBtn');
  const playerList = document.getElementById('playerList');
  const startGameBtn = document.getElementById('startGameBtn');

  /**
   * Update the player list display
   */
  function updatePlayerListDisplay() {
    const players = PlayerManager.getPlayers();
    playerList.innerHTML = '';

    players.forEach(player => {
      const listItem = document.createElement('li');
      listItem.className = 'player-item';
      listItem.innerHTML = `
        <span class="player-name">${escapeHtml(player.name)}</span>
        <button 
          type="button" 
          class="btn btn-small btn-danger" 
          data-player-id="${player.id}"
          aria-label="Remove ${escapeHtml(player.name)}"
        >
          Remove
        </button>
      `;

      const removeBtn = listItem.querySelector('button');
      removeBtn.addEventListener('click', () => {
        removePlayerHandler(player.id);
      });

      playerList.appendChild(listItem);
    });

    updateGameStartButton();
  }

  /**
   * Update Start Game button state
   */
  function updateGameStartButton() {
    const canStart = PlayerManager.canStartGame();
    startGameBtn.disabled = !canStart;
  }

  /**
   * Handle adding a new player
   */
  function addPlayerHandler() {
    const playerName = playerNameInput.value;
    const result = PlayerManager.addPlayer(playerName);

    if (result.success) {
      playerNameInput.value = '';
      playerNameInput.focus();
      updatePlayerListDisplay();
    } else {
      alert(result.error);
      playerNameInput.focus();
    }
  }

  /**
   * Handle removing a player
   * @param {number} playerId - Player ID
   */
  function removePlayerHandler(playerId) {
    const players = PlayerManager.getPlayers();
    const player = players.find(p => p.id === playerId);

    if (player && confirm(`Remove player "${player.name}"?`)) {
      PlayerManager.removePlayer(playerId);
      updatePlayerListDisplay();
    }
  }

  /**
   * Handle starting the game
   */
  function startGameHandler() {
    if (!PlayerManager.canStartGame()) {
      alert('At least 2 players are required to start the game');
      return;
    }

    const playerSetup = document.getElementById('playerSetup');
    const gameBoard = document.getElementById('gameBoard');

    if (playerSetup && gameBoard) {
      playerSetup.style.display = 'none';
      gameBoard.style.display = 'block';
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Initialize event listeners
   */
  function initializeEventListeners() {
    addPlayerBtn.addEventListener('click', addPlayerHandler);
    playerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addPlayerHandler();
    });
    startGameBtn.addEventListener('click', startGameHandler);
  }

  /**
   * Initialize the application
   */
  function initialize() {
    initializeEventListeners();
    updateGameStartButton();
  }

  // Start the app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
