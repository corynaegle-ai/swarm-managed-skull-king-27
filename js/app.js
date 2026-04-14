// ============================= 
// Player Setup & Management
// ============================= 

import { addPlayer, removePlayer, getPlayers, resetPlayers } from './playerManager.js';

// DOM Elements
const playerNameInput = document.querySelector('#player-name-input');
const addPlayerBtn = document.querySelector('#add-player-btn');
const playerListContainer = document.querySelector('#player-list-container');
const startGameBtn = document.querySelector('#start-game-btn');
const playerSetupForm = document.querySelector('#player-setup-form');
const errorMessageDisplay = document.querySelector('#error-message');

// Constants
const MAX_PLAYERS = 8;
const MIN_PLAYERS = 2;
const MAX_PLAYER_NAME_LENGTH = 20;

/**
 * Display error message to user
 */
function showError(message) {
  if (errorMessageDisplay) {
    errorMessageDisplay.textContent = message;
    errorMessageDisplay.classList.add('visible');
    setTimeout(() => {
      errorMessageDisplay.classList.remove('visible');
    }, 4000);
  }
}

/**
 * Clear error message
 */
function clearError() {
  if (errorMessageDisplay) {
    errorMessageDisplay.textContent = '';
    errorMessageDisplay.classList.remove('visible');
  }
}

/**
 * Validate player name input
 */
function validatePlayerName(name) {
  const trimmedName = name.trim();
  
  // Check if empty
  if (!trimmedName) {
    return { valid: false, error: 'Player name cannot be empty.' };
  }
  
  // Check if too long
  if (trimmedName.length > MAX_PLAYER_NAME_LENGTH) {
    return { valid: false, error: `Player name cannot exceed ${MAX_PLAYER_NAME_LENGTH} characters.` };
  }
  
  // Check for duplicates
  const existingPlayers = getPlayers();
  const isDuplicate = existingPlayers.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
  if (isDuplicate) {
    return { valid: false, error: 'A player with this name already exists.' };
  }
  
  return { valid: true, error: null };
}

/**
 * Render the player list display
 */
function renderPlayerList() {
  const players = getPlayers();
  
  if (!playerListContainer) return;
  
  // Clear existing list
  playerListContainer.innerHTML = '';
  
  if (players.length === 0) {
    playerListContainer.innerHTML = '<p class="no-players-message">No players added yet. Add at least 2 players to start the game.</p>';
    return;
  }
  
  // Create list
  const playersList = document.createElement('ul');
  playersList.classList.add('player-list');
  
  players.forEach((player, index) => {
    const playerItem = document.createElement('li');
    playerItem.classList.add('player-list-item');
    
    const playerNameSpan = document.createElement('span');
    playerNameSpan.classList.add('player-name');
    playerNameSpan.textContent = player.name;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.classList.add('remove-player-btn');
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', `Remove player ${player.name}`);
    removeBtn.setAttribute('data-player-index', index);
    
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      removePlayerHandler(index);
    });
    
    playerItem.appendChild(playerNameSpan);
    playerItem.appendChild(removeBtn);
    playersList.appendChild(playerItem);
  });
  
  playerListContainer.appendChild(playersList);
}

/**
 * Handle add player form submission
 */
function handleAddPlayer(e) {
  e.preventDefault();
  
  if (!playerNameInput) return;
  
  const playerName = playerNameInput.value;
  const validation = validatePlayerName(playerName);
  
  if (!validation.valid) {
    showError(validation.error);
    return;
  }
  
  // Add player
  addPlayer(playerName);
  clearError();
  
  // Clear input
  playerNameInput.value = '';
  playerNameInput.focus();
  
  // Update displays
  renderPlayerList();
  updateButtonStates();
}

/**
 * Handle remove player
 */
function removePlayerHandler(index) {
  removePlayer(index);
  renderPlayerList();
  updateButtonStates();
  clearError();
}

/**
 * Update button states based on current player count
 */
function updateButtonStates() {
  const playerCount = getPlayers().length;
  const isMaxPlayers = playerCount >= MAX_PLAYERS;
  const isMinPlayers = playerCount >= MIN_PLAYERS;
  
  // Update Add Player button
  if (addPlayerBtn) {
    addPlayerBtn.disabled = isMaxPlayers;
    if (isMaxPlayers) {
      addPlayerBtn.setAttribute('title', `Maximum ${MAX_PLAYERS} players reached`);
    } else {
      addPlayerBtn.removeAttribute('title');
    }
  }
  
  // Update Start Game button
  if (startGameBtn) {
    startGameBtn.disabled = !isMinPlayers;
    if (!isMinPlayers) {
      startGameBtn.setAttribute('title', `Add at least ${MIN_PLAYERS} players to start`);
    } else {
      startGameBtn.removeAttribute('title');
    }
  }
}

/**
 * Handle Start Game button click
 */
function handleStartGame(e) {
  e.preventDefault();
  
  const players = getPlayers();
  
  if (players.length < MIN_PLAYERS) {
    showError(`Add at least ${MIN_PLAYERS} players to start the game.`);
    return;
  }
  
  // TODO: Transition to game phase
  console.log('Game starting with players:', players);
  alert(`Starting game with ${players.length} players: ${players.map(p => p.name).join(', ')}`);
}

/**
 * Initialize the app
 */
function init() {
  // Reset players on page load
  resetPlayers();
  renderPlayerList();
  updateButtonStates();
  
  // Attach event listeners
  if (playerSetupForm) {
    playerSetupForm.addEventListener('submit', handleAddPlayer);
  }
  
  if (addPlayerBtn) {
    addPlayerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleAddPlayer({ preventDefault: () => {} });
    });
  }
  
  if (startGameBtn) {
    startGameBtn.addEventListener('click', handleStartGame);
  }
  
  // Allow Enter key in input to add player
  if (playerNameInput) {
    playerNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddPlayer({ preventDefault: () => {} });
      }
    });
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
