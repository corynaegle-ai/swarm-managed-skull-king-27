/**
 * Skull King - Main Application Entry Point
 * Initializes the app state and manages the application lifecycle
 */

// Application State
const appState = {
    initialized: false,
    version: '1.0.0',
    gameStarted: false,
    players: [],
    currentRound: 0,
    gameLog: []
};

/**
 * Initialize the application
 * Sets up event listeners and initial state
 */
function initializeApp() {
    try {
        console.log('Initializing Skull King application...');
        
        // Verify DOM is ready
        const appElement = document.getElementById('app');
        if (!appElement) {
            throw new Error('Application root element #app not found');
        }

        // Mark app as initialized
        appState.initialized = true;
        appState.gameLog.push('App initialized');
        
        // Setup event listeners
        setupEventListeners();
        
        // Log initialization success
        console.log('Skull King v' + appState.version + ' - Ready to play!');
        logAppState();
        
        return true;
    } catch (error) {
        console.error('Failed to initialize application:', error);
        return false;
    }
}

/**
 * Setup application event listeners
 */
function setupEventListeners() {
    // Document ready events can be added here
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded');
    });
}

/**
 * Log current application state
 */
function logAppState() {
    console.log('App State:', appState);
}

/**
 * Add entry to game log
 * @param {string} message - Log message
 */
function addGameLog(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    appState.gameLog.push(logEntry);
    console.log(logEntry);
}

/**
 * Get current application state
 * @returns {Object} - Current app state
 */
function getAppState() {
    return appState;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}
