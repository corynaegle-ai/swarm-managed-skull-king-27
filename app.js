/**
 * Skull King - Main Application Entry Point
 * Initializes the app state and sets up the game environment
 */

(function() {
    'use strict';

    // App state object
    const appState = {
        initialized: false,
        version: '1.0.0',
        gameActive: false,
        players: [],
        currentRound: 0,
        maxRounds: 10
    };

    /**
     * Initialize the application
     */
    function initializeApp() {
        try {
            // Verify DOM elements are present
            const appElement = document.getElementById('app');
            const mainContent = document.getElementById('main-content');
            const gameSection = document.getElementById('game-section');

            if (!appElement || !mainContent || !gameSection) {
                throw new Error('Required DOM elements not found');
            }

            // Mark app as initialized
            appState.initialized = true;

            // Log initialization
            console.log('Skull King app initialized successfully');
            console.log('App version:', appState.version);
            console.log('DOM elements verified and ready');

        } catch (error) {
            console.error('Failed to initialize app:', error.message);
            handleInitializationError(error);
        }
    }

    /**
     * Handle initialization errors
     * @param {Error} error - The error that occurred
     */
    function handleInitializationError(error) {
        const gameSection = document.getElementById('game-section');
        if (gameSection) {
            gameSection.innerHTML = '<p style="color: red;">Error initializing application: ' + error.message + '</p>';
        }
    }

    /**
     * Get the current app state
     * @returns {Object} The application state
     */
    function getAppState() {
        return appState;
    }

    /**
     * Reset app state
     */
    function resetAppState() {
        appState.gameActive = false;
        appState.players = [];
        appState.currentRound = 0;
        console.log('App state reset');
    }

    // Initialize app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

    // Expose functions to global scope for use by other modules
    window.SkullKing = {
        getAppState: getAppState,
        resetAppState: resetAppState,
        appState: appState
    };

})();
