/**
 * Skull King - Main Application Entry Point
 * 
 * This file initializes the application state and sets up
 * the core functionality for the Skull King game.
 */

// ==========================================
// Application State
// ==========================================

const AppState = {
    isInitialized: false,
    gameStatus: 'idle',
    players: [],
    currentRound: 0,
};

// ==========================================
// DOM Elements
// ==========================================

const DOM = {
    app: document.getElementById('app'),
    mainContent: document.getElementById('main-content'),
    gameSection: document.getElementById('game-section'),
};

// ==========================================
// Utility Functions
// ==========================================

/**
 * Validates that required DOM elements exist
 * @returns {boolean} True if all required elements are present
 */
function validateDOMElements() {
    const requiredElements = ['app', 'main-content', 'game-section'];
    for (const elementId of requiredElements) {
        if (!document.getElementById(elementId)) {
            console.error(`Missing required DOM element: #${elementId}`);
            return false;
        }
    }
    return true;
}

/**
 * Logs application initialization message
 */
function logInitialization() {
    console.log('=== Skull King Application Initialized ===');
    console.log('App State:', AppState);
    console.log('DOM Elements Validated: OK');
}

// ==========================================
// Initialization
// ==========================================

/**
 * Initializes the application
 * Called when DOM is ready
 */
function initializeApp() {
    try {
        // Validate DOM structure
        if (!validateDOMElements()) {
            throw new Error('DOM validation failed');
        }

        // Set initial state
        AppState.isInitialized = true;
        AppState.gameStatus = 'ready';

        // Log successful initialization
        logInitialization();

    } catch (error) {
        console.error('Failed to initialize application:', error.message);
        AppState.isInitialized = false;
    }
}

// ==========================================
// Event Listeners
// ==========================================

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}

// ==========================================
// Exports (for testing or module integration)
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AppState,
        initializeApp,
        validateDOMElements,
    };
}
