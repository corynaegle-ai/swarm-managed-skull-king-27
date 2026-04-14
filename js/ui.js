/**
 * UI Module
 * 
 * Handles rendering and updating the game UI, including score display.
 */

const UI = (() => {
    /**
     * Render the score table with all players and their round-by-round scores
     * @param {Array<object>} players - Array of player objects
     * @param {number} currentRound - Current round number
     */
    function renderScoreTable(players, currentRound) {
        const tbody = document.getElementById('scoreTableBody');
        if (!tbody) {
            console.error('Score table body not found');
            return;
        }

        tbody.innerHTML = '';

        players.forEach(player => {
            const row = document.createElement('tr');
            row.className = 'score-table-row';

            // Player name
            const nameCell = document.createElement('td');
            nameCell.className = 'player-name-cell';
            nameCell.textContent = player.name;
            row.appendChild(nameCell);

            // Round scores
            for (let i = 0; i < 10; i++) {
                const scoreCell = document.createElement('td');
                scoreCell.className = 'score-cell';

                const score = player.roundScores[i];

                // Apply styling based on score value
                if (score > 0) {
                    scoreCell.classList.add('positive');
                } else if (score < 0) {
                    scoreCell.classList.add('negative');
                } else {
                    scoreCell.classList.add('neutral');
                }

                // Highlight current round
                if (i === currentRound - 1) {
                    scoreCell.classList.add('current-round');
                }

                scoreCell.textContent = score !== 0 ? score : '-';
                row.appendChild(scoreCell);
            }

            // Total score
            const totalCell = document.createElement('td');
            totalCell.className = 'total-cell';
            
            const cumulativeScore = player.cumulativeScore || 0;
            if (cumulativeScore > 0) {
                totalCell.classList.add('positive');
            } else if (cumulativeScore < 0) {
                totalCell.classList.add('negative');
            }

            totalCell.textContent = cumulativeScore;
            row.appendChild(totalCell);

            tbody.appendChild(row);
        });
    }

    /**
     * Render the score breakdown for current round
     * @param {Array<object>} players - Array of player objects
     * @param {number} currentRound - Current round number
     */
    function renderScoreBreakdown(players, currentRound) {
        const breakdown = document.getElementById('scoreBreakdown');
        if (!breakdown) {
            console.error('Score breakdown container not found');
            return;
        }

        breakdown.innerHTML = '';

        players.forEach((player, index) => {
            const roundData = player.roundData[currentRound - 1];
            if (!roundData) {
                return;
            }

            const card = document.createElement('div');
            card.className = 'breakdown-card';

            // Player header
            const header = document.createElement('div');
            header.className = 'breakdown-player-name';
            
            const avatar = document.createElement('div');
            avatar.className = 'breakdown-player-avatar';
            avatar.textContent = player.name.charAt(0).toUpperCase();
            header.appendChild(avatar);
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = player.name;
            header.appendChild(nameSpan);
            
            card.appendChild(header);

            // Breakdown items
            const bid = roundData.bid || 0;
            const trickswon = roundData.trickswon || 0;

            const bidItem = document.createElement('div');
            bidItem.className = 'breakdown-item';
            bidItem.innerHTML = `
                <span class="breakdown-label">Bid:</span>
                <span class="breakdown-value">${bid}</span>
            `;
            card.appendChild(bidItem);

            const tricksItem = document.createElement('div');
            tricksItem.className = 'breakdown-item';
            tricksItem.innerHTML = `
                <span class="breakdown-label">Tricks Won:</span>
                <span class="breakdown-value">${trickswon}</span>
            `;
            card.appendChild(tricksItem);

            // Calculate score
            const breakdown_data = Scoring.getScoreBreakdown(bid, trickswon);
            const scoreClass = breakdown_data.score > 0 ? 'positive' : breakdown_data.score < 0 ? 'negative' : 'neutral';

            const scoreItem = document.createElement('div');
            scoreItem.className = 'breakdown-item';
            scoreItem.innerHTML = `
                <span class="breakdown-label">Round Score:</span>
                <span class="breakdown-value ${scoreClass}">${breakdown_data.score}</span>
            `;
            card.appendChild(scoreItem);

            // Details
            const details = document.createElement('div');
            details.className = 'breakdown-details';
            details.innerHTML = `
                <div class="detail-item">
                    <span class="detail-label">Match:</span>
                    <span class="detail-value">${breakdown_data.isSuccess ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Difference:</span>
                    <span class="detail-value">${breakdown_data.difference}</span>
                </div>
                <div class="detail-item" style="grid-column: 1 / -1;">
                    <span class="detail-label">Calculation:</span>
                    <span class="detail-value" style="font-size: 0.95em;">${breakdown_data.calculation}</span>
                </div>
            `;
            card.appendChild(details);

            breakdown.appendChild(card);
        });
    }

    /**
     * Render running totals for all players
     * @param {Array<object>} players - Array of player objects
     */
    function renderRunningTotals(players) {
        const totals = document.getElementById('runningTotals');
        if (!totals) {
            console.error('Running totals container not found');
            return;
        }

        totals.innerHTML = '';

        // Rank players by score
        const ranked = Scoring.rankPlayers(players);

        ranked.forEach(player => {
            const card = document.createElement('div');
            card.className = 'total-card';
            
            const cumulativeScore = player.cumulativeScore || 0;
            if (cumulativeScore > 0) {
                card.classList.add('positive');
            } else if (cumulativeScore < 0) {
                card.classList.add('negative');
            }

            card.innerHTML = `
                <div class="total-card-player">${player.name}</div>
                <div class="total-card-score">${cumulativeScore}</div>
                <div class="total-card-rank">#${player.rank}</div>
            `;

            totals.appendChild(card);
        });
    }

    /**
     * Update the game status display
     * @param {string} status - Current game status
     * @param {number} currentRound - Current round number
     */
    function updateGameStatus(status, currentRound) {
        const statusEl = document.getElementById('gameStatus');
        const roundEl = document.getElementById('currentRound');

        if (statusEl) {
            let statusText = 'Unknown';
            switch (status) {
                case 'setup':
                    statusText = 'Game Ready - Waiting to Start';
                    break;
                case 'inProgress':
                    statusText = 'Game In Progress';
                    break;
                case 'completed':
                    statusText = 'Game Completed';
                    break;
                default:
                    statusText = status;
            }
            statusEl.textContent = statusText;
        }

        if (roundEl && currentRound) {
            roundEl.textContent = `Round: ${currentRound} / 10`;
        }
    }

    /**
     * Render player cards
     * @param {Array<object>} players - Array of player objects
     */
    function renderPlayerCards(players) {
        const playersList = document.getElementById('playersList');
        if (!playersList) {
            console.error('Players list container not found');
            return;
        }

        playersList.innerHTML = '';

        players.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.innerHTML = `
                <div class="player-name">${player.name}</div>
                <div class="player-status">Total Score: <strong>${player.cumulativeScore || 0}</strong></div>
            `;
            playersList.appendChild(card);
        });
    }

    /**
     * Update all UI elements with current game state
     * @param {object} gameState - Current game state
     */
    function updateUI(gameState) {
        updateGameStatus(gameState.gameStatus, gameState.currentRound);
        renderPlayerCards(gameState.players);
        renderScoreTable(gameState.players, gameState.currentRound);
        renderScoreBreakdown(gameState.players, gameState.currentRound);
        renderRunningTotals(gameState.players);
    }

    // Public API
    return {
        renderScoreTable: renderScoreTable,
        renderScoreBreakdown: renderScoreBreakdown,
        renderRunningTotals: renderRunningTotals,
        updateGameStatus: updateGameStatus,
        renderPlayerCards: renderPlayerCards,
        updateUI: updateUI
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}