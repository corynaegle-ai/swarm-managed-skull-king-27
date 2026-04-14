/**
 * Skull King - Main Application Entry Point
 * Initializes app state and DOM readiness
 */

// Application state
const appState = {
    gameActive: false,
    players: [],
    currentRound: 0,
    initialized: false
};

/**
 * Initialize the application when DOM is ready
 */
function initializeApp() {
    try {
        // Verify required DOM elements exist
        const appContainer = document.getElementById('app');
        const mainContent = document.getElementById('main-content');
        const gameSection = document.getElementById('game-section');

        if (!appContainer || !mainContent || !gameSection) {
            throw new Error('Required DOM elements not found');
        }

        // Set app initialized flag
        appState.initialized = true;

        // Log successful initialization
        console.log('Skull King app initialized successfully', appState);

    } catch (error) {
        console.error('Failed to initialize Skull King app:', error);
        throw error;
    }
}

// Initialize when DOM content is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM already loaded
    initializeApp();
}
