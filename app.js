/**
 * Skull King - Main Application File
 * Initializes app state and sets up DOM manipulation
 */

(function() {
    'use strict';

    // Application state
    const appState = {
        initialized: false,
        gameStatus: 'idle',
        players: [],
        currentRound: 0,
        version: '1.0.0'
    };

    /**
     * Initialize the application
     */
    function initializeApp() {
        try {
            // Verify required DOM elements exist
            const requiredElements = ['app', 'main-content', 'game-section'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
            }

            // Set initial state
            appState.initialized = true;
            appState.gameStatus = 'ready';

            // Log initialization
            console.log('Skull King Application Initialized', appState);

            // Call setup functions
            setupEventListeners();
            renderGameContent();

        } catch (error) {
            handleError('Initialization Error', error);
        }
    }

    /**
     * Set up event listeners for the application
     */
    function setupEventListeners() {
        try {
            // Future event listeners will be added here
            document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM is fully loaded');
            });
        } catch (error) {
            handleError('Event Listener Setup Error', error);
        }
    }

    /**
     * Render initial game content
     */
    function renderGameContent() {
        try {
            const gameSection = document.getElementById('game-section');
            if (!gameSection) {
                throw new Error('game-section element not found');
            }

            // Create a welcome message without overwriting the container
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'game-welcome';
            welcomeDiv.innerHTML = `
                <h2>Welcome to Skull King</h2>
                <p>A strategic card game for 2-6 players.</p>
                <p>Game content loading...</p>
            `;

            // Only update content if game-section contains just the placeholder paragraph
            if (gameSection.children.length === 1 && gameSection.children[0].tagName === 'P') {
                gameSection.replaceChild(welcomeDiv, gameSection.children[0]);
            }
        } catch (error) {
            handleError('Render Content Error', error);
        }
    }

    /**
     * Get the current application state
     * @returns {Object} Current app state
     */
    function getAppState() {
        return { ...appState };
    }

    /**
     * Handle errors gracefully
     * @param {string} context - Error context
     * @param {Error} error - Error object
     */
    function handleError(context, error) {
        const errorMessage = `${context}: ${error.message}`;
        console.error(errorMessage);
        // Don't throw - allow app to continue running
    }

    /**
     * Expose public API
     */
    window.SkullKingApp = {
        getState: getAppState,
        init: initializeApp
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        // DOM is already loaded (e.g., if script is loaded defer or async)
        initializeApp();
    }
})();