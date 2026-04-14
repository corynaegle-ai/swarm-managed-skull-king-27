import { addPlayer, removePlayer, getPlayers, isValidPlayerName } from './playerManager.js';

const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;

const playerNameInput = document.querySelector('#player-name-input');
const addPlayerBtn = document.querySelector('#add-player-btn');
const playerListContainer = document.querySelector('#player-list-container');
const startGameBtn = document.querySelector('#start-game-btn');
const playerSetupSection = document.querySelector('.player-setup-section');
const gameInfoSection = document.querySelector('.game-info-section');
const playerScoresSection = document.querySelector('.player-scores-section');
const playerScoresTable = document.querySelector('#player-scores-table tbody');
const bidPhaseContainer = document.querySelector('#bid-phase-container');
const errorMessage = document.querySelector('#error-message');
const playerSetupForm = document.querySelector('#player-setup-form');

/**
 * Clears error message display
 */
function clearError() {
  if (errorMessage) {
    errorMessage.textContent = '';
    errorMessage.classList.remove('visible');
  }
}

/**
 * Displays error message
 */
function showError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.add('visible');
  }
}

/**
 * Updates the disabled state of buttons based on current player count
 */
function updateButtonStates() {
  const players = getPlayers();
  const playerCount = players.length;

  // Add Player button: disable if at max players
  if (addPlayerBtn) {
    addPlayerBtn.disabled = playerCount >= MAX_PLAYERS;
  }

  // Input field: disable if at max players
  if (playerNameInput) {
    playerNameInput.disabled = playerCount >= MAX_PLAYERS;
  }

  // Start Game button: disable if fewer than MIN_PLAYERS
  if (startGameBtn) {
    startGameBtn.disabled = playerCount < MIN_PLAYERS;
  }
}

/**
 * Renders the player list with remove buttons
 */
function renderPlayerList() {
  const players = getPlayers();

  // Clear existing content
  playerListContainer.innerHTML = '';

  if (players.length === 0) {
    const noPlayersMsg = document.createElement('div');
    noPlayersMsg.className = 'no-players-message';
    noPlayersMsg.textContent = 'No players added yet';
    playerListContainer.appendChild(noPlayersMsg);
  } else {
    const playerList = document.createElement('ul');
    playerList.className = 'player-list';

    players.forEach((player, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'player-list-item';

      const playerNameSpan = document.createElement('span');
      playerNameSpan.className = 'player-name';
      playerNameSpan.textContent = player.name;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove-player-btn';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', `Remove ${player.name}`);
      removeButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleRemovePlayer(index);
      });

      listItem.appendChild(playerNameSpan);
      listItem.appendChild(removeButton);
      playerList.appendChild(listItem);
    });

    playerListContainer.appendChild(playerList);
  }

  // Render player count info
  renderPlayerCountInfo();

  // Update button states
  updateButtonStates();
}

/**
 * Renders the player count information message
 */
function renderPlayerCountInfo() {
  const players = getPlayers();
  const playerCount = players.length;

  // Remove any existing player-count-info element
  const existingCountInfo = playerListContainer.querySelector('.player-count-info');
  if (existingCountInfo) {
    existingCountInfo.remove();
  }

  // Create and add new player count info
  const countInfo = document.createElement('div');
  countInfo.className = 'player-count-info';

  if (playerCount >= MIN_PLAYERS) {
    countInfo.classList.add('ready');
    countInfo.textContent = `${playerCount} player${playerCount !== 1 ? 's' : ''} ready to start`;
  } else {
    const needed = MIN_PLAYERS - playerCount;
    countInfo.textContent = `Add ${needed} more player${needed !== 1 ? 's' : ''} to start`;
  }

  playerListContainer.appendChild(countInfo);
}

/**
 * Handles adding a new player
 */
function handleAddPlayer(e) {
  e.preventDefault();
  clearError();

  const playerName = playerNameInput.value.trim();

  if (!isValidPlayerName(playerName)) {
    showError('Player name is required');
    playerNameInput.focus();
    return;
  }

  try {
    addPlayer(playerName);
    playerNameInput.value = '';
    playerNameInput.focus();
    renderPlayerList();
  } catch (error) {
    showError(error.message);
    playerNameInput.focus();
  }
}

/**
 * Handles removing a player
 */
function handleRemovePlayer(index) {
  removePlayer(index);
  clearError();
  renderPlayerList();
}

/**
 * Handles game start - transitions from setup to game phase
 */
function handleStartGame(e) {
  e.preventDefault();

  const players = getPlayers();

  if (players.length < MIN_PLAYERS) {
    showError(`Need at least ${MIN_PLAYERS} players to start`);
    return;
  }

  // Hide player setup section
  if (playerSetupSection) {
    playerSetupSection.style.display = 'none';
  }

  // Show game info section if it was hidden
  if (gameInfoSection) {
    gameInfoSection.style.display = 'block';
  }

  // Show player scores section
  if (playerScoresSection) {
    playerScoresSection.style.display = 'block';
  }

  // Populate initial scores table
  renderScoresTable();

  // Show bid phase container for gameplay
  if (bidPhaseContainer) {
    bidPhaseContainer.style.display = 'block';
  }

  clearError();
}

/**
 * Renders the scores table with all players
 */
function renderScoresTable() {
  const players = getPlayers();

  // Clear existing rows
  playerScoresTable.innerHTML = '';

  // Add a row for each player
  players.forEach((player) => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = player.name;

    const scoreCell = document.createElement('td');
    scoreCell.textContent = player.score || 0;

    row.appendChild(nameCell);
    row.appendChild(scoreCell);
    playerScoresTable.appendChild(row);
  });
}

/**
 * Initializes the app
 */
function initializeApp() {
  // Attach form submit listener
  if (playerSetupForm) {
    playerSetupForm.addEventListener('submit', handleAddPlayer);
  }

  // Attach start game button listener
  if (startGameBtn) {
    startGameBtn.addEventListener('click', handleStartGame);
  }

  // Initial render
  renderPlayerList();
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
