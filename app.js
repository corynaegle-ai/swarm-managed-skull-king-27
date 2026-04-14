/**
 * Skull King - Main Application Entry Point
 * Vanilla JavaScript Application
 */

// Application State
const appState = {
    gameTitle: 'Skull King',
    isInitialized: false,
    currentScreen: 'home',
    players: [],
    gamePhase: null,
    version: '1.0.0'
};

/**
 * Initialize the application
 * Sets up initial state and DOM references
 */
function initializeApp() {
    console.log('Initializing Skull King application...');
    
    try {
        // Verify critical DOM elements exist
        const appElement = document.getElementById('app');
        const mainContentElement = document.getElementById('main-content');
        const gameSectionElement = document.getElementById('game-section');
        
        if (!appElement || !mainContentElement || !gameSectionElement) {
            throw new Error('Critical DOM elements not found');
        }
        
        // Mark app as initialized
        appState.isInitialized = true;
        
        console.log('Skull King application initialized successfully');
        console.log('Application State:', appState);
        
    } catch (error) {
        console.error('Failed to initialize application:', error.message);
        throw error;
    }
}

/**
 * Get current application state
 * @returns {Object} Current application state
 */
function getAppState() {
    return appState;
}

/**
 * Update application state
 * @param {Object} updates - State updates to apply
 */
function updateAppState(updates) {
    try {
        Object.assign(appState, updates);
        console.log('Application state updated:', appState);
    } catch (error) {
        console.error('Failed to update application state:', error.message);
        throw error;
    }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}