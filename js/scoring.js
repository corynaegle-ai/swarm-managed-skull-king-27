/**
 * Scoring Module
 * 
 * Core scoring calculation functions for Skull King card game.
 * This module provides functions to calculate scores based on bids and tricks won.
 */

const Scoring = (() => {
    /**
     * Calculate the score for a single player based on their bid and tricks won
     * @param {number} bid - The number of tricks bid
     * @param {number} trickswon - The number of tricks actually won
     * @returns {number} The score earned in this round
     */
    function calculateRoundScore(bid, trickswon) {
        // Validate inputs
        if (typeof bid !== 'number' || typeof trickswon !== 'number') {
            console.error('Invalid input: bid and tricks won must be numbers');
            return 0;
        }

        if (bid < 0 || trickswon < 0) {
            console.error('Invalid input: bid and tricks won must be non-negative');
            return 0;
        }

        // If bid matches tricks won
        if (bid === trickswon) {
            // Score is 10 + (5 * tricks won)
            return 10 + (5 * trickswon);
        } else {
            // Bid does not match tricks won - player loses
            // Score is -(absolute difference between bid and tricks won * 10)
            return -Math.abs(bid - trickswon) * 10;
        }
    }

    /**
     * Calculate cumulative score for a player across multiple rounds
     * @param {Array<number>} roundScores - Array of scores from each round
     * @returns {number} The cumulative score
     */
    function calculateCumulativeScore(roundScores) {
        if (!Array.isArray(roundScores)) {
            console.error('Invalid input: roundScores must be an array');
            return 0;
        }

        return roundScores.reduce((total, score) => {
            return total + (typeof score === 'number' ? score : 0);
        }, 0);
    }

    /**
     * Get score breakdown details for display
     * @param {number} bid - The number of tricks bid
     * @param {number} trickswon - The number of tricks actually won
     * @returns {object} Object containing bid, tricks won, and calculated score
     */
    function getScoreBreakdown(bid, trickswon) {
        const score = calculateRoundScore(bid, trickswon);
        const isSuccess = bid === trickswon;

        return {
            bid: bid,
            trickswon: trickswon,
            score: score,
            isSuccess: isSuccess,
            difference: Math.abs(bid - trickswon),
            calculation: isSuccess
                ? `10 + (5 × ${trickswon}) = ${score}`
                : `-(${Math.abs(bid - trickswon)} × 10) = ${score}`
        };
    }

    /**
     * Rank players by their cumulative scores
     * @param {Array<object>} players - Array of player objects with scores
     * @returns {Array<object>} Ranked player objects with rank property added
     */
    function rankPlayers(players) {
        if (!Array.isArray(players)) {
            console.error('Invalid input: players must be an array');
            return [];
        }

        // Sort by cumulative score in descending order
        const sorted = [...players].sort((a, b) => {
            const scoreA = typeof a.cumulativeScore === 'number' ? a.cumulativeScore : 0;
            const scoreB = typeof b.cumulativeScore === 'number' ? b.cumulativeScore : 0;
            return scoreB - scoreA;
        });

        // Add rank to each player
        return sorted.map((player, index) => ({
            ...player,
            rank: index + 1
        }));
    }

    // Public API
    return {
        calculateRoundScore: calculateRoundScore,
        calculateCumulativeScore: calculateCumulativeScore,
        getScoreBreakdown: getScoreBreakdown,
        rankPlayers: rankPlayers
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scoring;
}