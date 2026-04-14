/**
 * Scoring Page Script
 * Handles score calculation, form validation, and navigation
 */

// Game state (would typically come from game controller)
let gameState = {
    currentRound: 1,
    totalRounds: 13,
    players: [
        { id: 1, name: 'Player 1', bid: 5 },
        { id: 2, name: 'Player 2', bid: 6 },
        { id: 3, name: 'Player 3', bid: 4 },
        { id: 4, name: 'Player 4', bid: 7 }
    ],
    scores: {}
};

/**
 * Initialize the scoring page with player cards
 */
function initializeScoringPage() {
    renderPlayerCards();
    updateNavigationButtons();
    attachEventListeners();
}

/**
 * Render player cards with input fields
 */
function renderPlayerCards() {
    const playersGrid = document.getElementById('playersGrid');
    playersGrid.innerHTML = '';

    gameState.players.forEach((player) => {
        const playerCard = createPlayerCard(player);
        playersGrid.appendChild(playerCard);
    });
}

/**
 * Create a player card element with form inputs
 * @param {Object} player - Player object with id, name, bid
 * @returns {HTMLElement} Player card element
 */
function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.setAttribute('data-player-id', player.id);

    const maxTricks = 13; // Standard Hearts deck

    card.innerHTML = `
        <div class="player-name">${escapeHtml(player.name)}</div>
        
        <div class="bid-display">
            <span class="bid-label">Bid:</span>
            <span class="bid-value">${player.bid}</span>
        </div>

        <div class="form-group">
            <label for="tricks-${player.id}">
                <span>Tricks Taken</span>
                <span class="input-hint">(0-${maxTricks})</span>
            </label>
            <input 
                type="number" 
                id="tricks-${player.id}" 
                name="tricks-${player.id}" 
                min="0" 
                max="${maxTricks}"
                value="0" 
                required
                aria-label="Tricks taken by ${player.name}"
            />
        </div>

        <div class="form-group">
            <label for="bonus-${player.id}">
                <span>Bonus Points</span>
                <span class="input-hint">(default: 0)</span>
            </label>
            <input 
                type="number" 
                id="bonus-${player.id}" 
                name="bonus-${player.id}" 
                min="0" 
                value="0" 
                aria-label="Bonus points for ${player.name}"
            />
        </div>

        <div class="score-display">
            <div class="score-label">Calculated Score</div>
            <div class="score-value" data-score-value="${player.id}">0</div>
        </div>
    `;

    // Add event listeners for real-time score calculation
    const tricksInput = card.querySelector(`#tricks-${player.id}`);
    const bonusInput = card.querySelector(`#bonus-${player.id}`);

    tricksInput.addEventListener('change', () => calculateScore(player.id));
    bonusInput.addEventListener('change', () => calculateScore(player.id));

    return card;
}

/**
 * Calculate score based on tricks and bonus points
 * Score = tricks - bid + bonus (penalties for missing bid apply)
 * @param {number} playerId - Player ID
 */
function calculateScore(playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    const tricksInput = document.getElementById(`tricks-${playerId}`);
    const bonusInput = document.getElementById(`bonus-${playerId}`);
    const scoreDisplay = document.querySelector(`[data-score-value="${playerId}"]`);

    const tricks = parseInt(tricksInput.value) || 0;
    const bonus = parseInt(bonusInput.value) || 0;

    // Basic scoring: tricks - bid + bonus
    let score = tricks - player.bid + bonus;

    // Penalty for missing bid (negative score if tricks < bid)
    if (tricks < player.bid) {
        score = -(player.bid - tricks) + bonus;
    }

    scoreDisplay.textContent = score;

    // Store the calculated score
    if (!gameState.scores[playerId]) {
        gameState.scores[playerId] = {};
    }
    gameState.scores[playerId][gameState.currentRound] = {
        bid: player.bid,
        tricks: tricks,
        bonus: bonus,
        score: score
    };

    // Update submit button state
    updateSubmitButtonState();
}

/**
 * Update submit button disabled state based on form validity
 */
function updateSubmitButtonState() {
    const form = document.getElementById('scoringForm');
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = !form.checkValidity();
}

/**
 * Update navigation button states
 */
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevRoundBtn');
    const nextBtn = document.getElementById('nextRoundBtn');

    prevBtn.disabled = gameState.currentRound <= 1;
    nextBtn.disabled = gameState.currentRound >= gameState.totalRounds;
}

/**
 * Attach event listeners to form and navigation elements
 */
function attachEventListeners() {
    const form = document.getElementById('scoringForm');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const prevRoundBtn = document.getElementById('prevRoundBtn');
    const nextRoundBtn = document.getElementById('nextRoundBtn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSubmit();
    });

    resetBtn.addEventListener('click', () => {
        form.reset();
        // Recalculate scores after reset
        gameState.players.forEach(player => {
            calculateScore(player.id);
        });
    });

    prevRoundBtn.addEventListener('click', () => {
        if (gameState.currentRound > 1) {
            gameState.currentRound--;
            updateRoundDisplay();
            updateNavigationButtons();
        }
    });

    nextRoundBtn.addEventListener('click', () => {
        if (gameState.currentRound < gameState.totalRounds) {
            gameState.currentRound++;
            updateRoundDisplay();
            updateNavigationButtons();
        }
    });
}

/**
 * Update round display elements
 */
function updateRoundDisplay() {
    document.getElementById('currentRound').textContent = gameState.currentRound;
    document.getElementById('roundDisplay').textContent = `Round ${gameState.currentRound}`;
}

/**
 * Handle form submission
 */
function handleSubmit() {
    const form = document.getElementById('scoringForm');

    if (!form.checkValidity()) {
        alert('Please fill in all required fields with valid values.');
        return;
    }

    // Collect all scores
    const roundScores = {};
    gameState.players.forEach(player => {
        const tricks = parseInt(document.getElementById(`tricks-${player.id}`).value) || 0;
        const bonus = parseInt(document.getElementById(`bonus-${player.id}`).value) || 0;

        roundScores[player.id] = {
            bid: player.bid,
            tricks: tricks,
            bonus: bonus,
            score: gameState.scores[player.id]?.[gameState.currentRound]?.score || 0
        };
    });

    // Dispatch event or call handler to process scores
    console.log(`Round ${gameState.currentRound} scores submitted:`, roundScores);

    // TODO: Send to game controller or API
    // gameController.submitRoundScores(gameState.currentRound, roundScores);

    alert('Scores submitted successfully!');
    form.reset();
}

/**
 * Escape HTML special characters for security
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Initialize page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScoringPage);
} else {
    initializeScoringPage();
}
/**
 * Scoring Interface Module
 *
 * Handles the initialization and management of the round scoring interface.
 * This module creates player scoring cards, manages form validation, calculates
 * scores based on tricks and bonuses, and handles round navigation.
 *
 * Integration:
 * - Works with scoring.html which provides the DOM container and form elements
 * - Uses sessionStorage for game state (players, currentRound, cumulative scores)
 * - Provides the initializeScoringInterface() function called by scoring.html
 */

/**
 * Initialize the scoring interface
 * Called from scoring.html after DOMContentLoaded
 */
function initializeScoringInterface() {
    // Retrieve players data from sessionStorage or use default test data
    let players = JSON.parse(sessionStorage.getItem('players')) || getDefaultTestPlayers();

    const playersGrid = document.getElementById('playersGrid');
    const scoringForm = document.getElementById('scoringForm');
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    const prevRoundBtn = document.getElementById('prevRoundBtn');
    const roundInfo = document.getElementById('roundInfo');

    // Get current round from sessionStorage (defaults to 1 for first round)
    const currentRound = parseInt(sessionStorage.getItem('currentRound')) || 1;
    roundInfo.textContent = `Round ${currentRound}`;

    // Create scoring cards for each player
    players.forEach((player, index) => {
        const maxTricks = currentRound; // Tricks can range from 0 to current round number
        const card = createPlayerScoringCard(player, index, maxTricks);
        playersGrid.appendChild(card);
    });

    // Get all trick input elements for validation
    const tricksInputs = scoringForm.querySelectorAll('input.tricks-input');
    const bonusInputs = scoringForm.querySelectorAll('input.bonus-input');

    /**
     * Validate the form
     * Ensures all tricks inputs are filled (have a value >= 0)
     * Bonus inputs are optional and default to 0
     */
    function validateForm() {
        let allTricksFilled = true;
        tricksInputs.forEach(input => {
            // Check if tricks input is empty or not a valid number >= 0
            if (input.value === '' || isNaN(parseInt(input.value)) || parseInt(input.value) < 0) {
                allTricksFilled = false;
            }
        });
        nextRoundBtn.disabled = !allTricksFilled;
        return allTricksFilled;
    }

    // Add event listeners to all inputs for real-time validation and score updates
    tricksInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateForm();
            updateCalculatedScore(this);
        });
        input.addEventListener('change', validateForm);
    });

    bonusInputs.forEach(input => {
        input.addEventListener('input', function() {
            updateCalculatedScore(this);
        });
    });

    // Handle form submission
    scoringForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            collectScores(players, currentRound, nextRoundBtn);
        }
    });

    // Previous round button handler
    prevRoundBtn.addEventListener('click', function() {
        if (currentRound > 1) {
            sessionStorage.setItem('currentRound', currentRound - 1);
            window.location.reload();
        }
    });

    // Next round button state management
    prevRoundBtn.disabled = currentRound <= 1;

    // Perform initial validation
    validateForm();
}

/**
 * Create a player scoring card with inputs for tricks, bonus, and calculated score
 * @param {Object} player - Player object with name and bid
 * @param {number} index - Player index for ID generation
 * @param {number} maxTricks - Maximum tricks allowed for current round
 * @returns {HTMLElement} - Player card element
 */
function createPlayerScoringCard(player, index, maxTricks) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.id = `player-card-${index}`;

    // Sanitize player name for display
    const playerName = escapeHtml(player.name || `Player ${index + 1}`);
    const playerBid = parseInt(player.bid) || 0;

    card.innerHTML = `
        <h3>${playerName}</h3>

        <!-- Bid Display Section -->
        <div class="card-section">
            <div class="section-label">
                Bid
                <span class="badge" id="bid-${index}">${playerBid}</span>
            </div>
            <div class="bid-display">${playerBid} tricks</div>
        </div>

        <!-- Tricks Input Section -->
        <div class="card-section">
            <div class="form-group">
                <label for="tricks-${index}">Tricks Taken</label>
                <input
                    type="number"
                    id="tricks-${index}"
                    class="tricks-input"
                    data-player-index="${index}"
                    min="0"
                    max="${maxTricks}"
                    placeholder="0"
                    required
                    aria-describedby="tricks-help-${index}"
                >
                <span class="help-text" id="tricks-help-${index}">0 to ${maxTricks}</span>
            </div>
        </div>

        <!-- Bonus Points Input Section -->
        <div class="card-section">
            <div class="form-group">
                <label for="bonus-${index}">Bonus Points</label>
                <input
                    type="number"
                    id="bonus-${index}"
                    class="bonus-input"
                    data-player-index="${index}"
                    value="0"
                    placeholder="0"
                    aria-describedby="bonus-help-${index}"
                >
                <span class="help-text" id="bonus-help-${index}">Optional, defaults to 0</span>
            </div>
        </div>

        <!-- Score Display Section -->
        <div class="card-section">
            <div class="form-group">
                <label>Calculated Score</label>
                <div class="score-display" id="score-${index}">-</div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Update the calculated score display for a player
 * Called whenever tricks or bonus input changes
 * @param {HTMLElement} inputElement - The input element that triggered the update
 */
function updateCalculatedScore(inputElement) {
    // Find the parent player card
    const playerCard = inputElement.closest('.player-card');
    if (!playerCard) return;

    const playerIndex = inputElement.dataset.playerIndex;

    // Get tricks and bonus values
    const tricksInput = playerCard.querySelector(`input#tricks-${playerIndex}`);
    const bonusInput = playerCard.querySelector(`input#bonus-${playerIndex}`);
    const scoreDisplay = playerCard.querySelector(`#score-${playerIndex}`);
    const bidBadge = playerCard.querySelector(`#bid-${playerIndex}`);

    if (!tricksInput || !bonusInput || !scoreDisplay || !bidBadge) return;

    const tricks = tricksInput.value === '' ? null : parseInt(tricksInput.value);
    const bonus = bonusInput.value === '' ? 0 : parseInt(bonusInput.value) || 0;
    const bid = parseInt(bidBadge.textContent) || 0;

    // Only display score if tricks have been entered
    if (tricks === null) {
        scoreDisplay.textContent = '-';
        scoreDisplay.className = 'score-display';
        return;
    }

    // Calculate score using Skull King scoring logic
    const score = calculateScore(tricks, bid, bonus);

    // Update display
    scoreDisplay.textContent = score;
    scoreDisplay.className = 'score-display';

    if (score === 0) {
        scoreDisplay.classList.add('zero');
    } else if (score < 0) {
        scoreDisplay.classList.add('negative');
    }
}

/**
 * Calculate score based on Skull King rules
 *
 * Scoring Rules:
 * - If bid is 0:
 *   - If tricks taken is 0: +10 points (succeeded)
 *   - If tricks taken > 0: -10 points (failed)
 * - If bid > 0:
 *   - If tricks == bid: 10 + (bid * 5) points (met bid exactly)
 *   - If tricks != bid: -(bid) points (missed bid)
 *
 * @param {number} tricks - Number of tricks taken
 * @param {number} bid - Original bid
 * @param {number} bonus - Bonus points to add
 * @returns {number} - Total calculated score
 */
function calculateScore(tricks, bid, bonus = 0) {
    let baseScore = 0;

    if (bid === 0) {
        // Bid 0 scoring
        baseScore = tricks === 0 ? 10 : -10;
    } else {
        // Bid > 0 scoring
        if (tricks === bid) {
            // Succeeded: 10 + (5 per trick)
            baseScore = 10 + (bid * 5);
        } else {
            // Failed: negative bid amount
            baseScore = -bid;
        }
    }

    return baseScore + bonus;
}

/**
 * Collect scores from the form and save to sessionStorage
 * @param {Array} players - Array of player objects
 * @param {number} currentRound - Current round number
 * @param {HTMLElement} nextRoundBtn - Next round button element
 */
function collectScores(players, currentRound, nextRoundBtn) {
    const scoringForm = document.getElementById('scoringForm');
    const scores = [];

    // Collect scores from each player card
    players.forEach((player, index) => {
        const tricksInput = scoringForm.querySelector(`#tricks-${index}`);
        const bonusInput = scoringForm.querySelector(`#bonus-${index}`);
        const scoreDisplay = scoringForm.querySelector(`#score-${index}`);

        if (tricksInput && bonusInput && scoreDisplay) {
            const tricks = parseInt(tricksInput.value) || 0;
            const bonus = parseInt(bonusInput.value) || 0;
            const roundScore = parseInt(scoreDisplay.textContent) || 0;

            // Calculate cumulative score
            const previousScores = JSON.parse(sessionStorage.getItem('cumulativeScores')) || {};
            const playerCumulativeScore = (previousScores[player.name] || 0) + roundScore;

            scores.push({
                playerName: player.name,
                round: currentRound,
                bid: player.bid,
                tricks: tricks,
                bonus: bonus,
                roundScore: roundScore,
                cumulativeScore: playerCumulativeScore
            });
        }
    });

    // Save round scores to sessionStorage
    const roundScores = JSON.parse(sessionStorage.getItem('roundScores')) || [];
    roundScores.push({
        round: currentRound,
        scores: scores
    });
    sessionStorage.setItem('roundScores', JSON.stringify(roundScores));

    // Update cumulative scores
    const cumulativeScores = {};
    scores.forEach(score => {
        cumulativeScores[score.playerName] = score.cumulativeScore;
    });
    sessionStorage.setItem('cumulativeScores', JSON.stringify(cumulativeScores));

    // Move to next round
    const nextRound = currentRound + 1;
    sessionStorage.setItem('currentRound', nextRound);

    // Redirect to bidding interface (or show message if all rounds complete)
    // This assumes there's a bidding.html page to return to
    window.location.href = 'bidding.html';
}

/**
 * Get default test players
 * Used only for initial testing and demonstration
 * @returns {Array} - Array of default player objects
 */
function getDefaultTestPlayers() {
    return [
        { name: 'Player 1', bid: 0 },
        { name: 'Player 2', bid: 0 },
        { name: 'Player 3', bid: 0 },
        { name: 'Player 4', bid: 0 }
    ];
}

/**
 * Escape HTML special characters for safe display
 * Prevents XSS attacks when displaying user-provided names
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for HTML context
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize the scoring interface when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeScoringInterface();
});
