/**
 * Skull King - Main Application Entry Point
 * Initializes app state and sets up DOM event listeners
 */

// App State
const appState = {
    initialized: false,
    gameStarted: false,
    players: [],
    currentRound: 0,
    gameVersion: '1.0.0'
};

/**
 * Initialize the application
 */
function initializeApp() {
    try {
        // Verify critical DOM elements exist
        const appContainer = document.getElementById('app');
        const mainContent = document.getElementById('main-content');
        const gameSection = document.getElementById('game-section');

        if (!appContainer || !mainContent || !gameSection) {
            throw new Error('Critical DOM elements not found');
        }

        // Mark app as initialized
        appState.initialized = true;
        appState.gameStarted = false;

        // Log initialization success
        console.log('Skull King app initialized successfully', appState);
        
        return true;
    } catch (error) {
        console.error('Failed to initialize app:', error);
        return false;
    }
}

/**
 * DOM Content Loaded Event
 * Triggered when the DOM is fully parsed
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const success = initializeApp();
        if (!success) {
            console.error('Application initialization failed');
        }
    });
} else {
    // DOM is already loaded (e.g., when script is deferred)
    const success = initializeApp();
    if (!success) {
        console.error('Application initialization failed');
    }
}

// Export for testing (if applicable)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { appState, initializeApp };
}
