/**
 * Game Module
 * 
 * Main game flow and logic for Skull King card game.
 * Integrates scoring engine and manages game state.
 */

const Game = (() => {
    // Game state
    let gameState = {
        players: [],
        currentRound: 1,
        maxRounds: 10,
        gameStatus: 'setup',
        roundData: []
    };

    /**
     * Initialize a new game with players
     * @param {Array<string>} playerNames - Array of player names
     */
    function initializeGame(playerNames) {
        if (!Array.isArray(playerNames) || playerNames.length === 0) {
            console.error('Invalid input: must provide array of player names');
            return false;
        }

        gameState.players = playerNames.map((name, index) => ({
            id: index,
            name: name,
            roundScores: new Array(gameState.maxRounds).fill(0),
            cumulativeScore: 0,
            roundData: []
        }));

        gameState.currentRound = 1;
        gameState.gameStatus = 'inProgress';
        gameState.roundData = [];

        console.log('Game initialized with players:', playerNames);
        return true;
    }

    /**
     * Record a player's bid for the current round
     * @param {number} playerId - Player ID
     * @param {number} bid - Number of tricks bid
     */
    function recordBid(playerId, bid) {
        const player = gameState.players[playerId];
        if (!player) {
            console.error('Player not found:', playerId);
            return false;
        }

        if (typeof bid !== 'number' || bid < 0) {
            console.error('Invalid bid:', bid);
            return false;
        }

        if (!player.roundData[gameState.currentRound - 1]) {
            player.roundData[gameState.currentRound - 1] = {};
        }

        player.roundData[gameState.currentRound - 1].bid = bid;
        return true;
    }

    /**
     * Record tricks won by a player in the current round
     * @param {number} playerId - Player ID
     * @param {number} trickswon - Number of tricks won
     */
    function recordTrickswon(playerId, trickswon) {
        const player = gameState.players[playerId];
        if (!player) {
            console.error('Player not found:', playerId);
            return false;
        }

        if (typeof trickswon !== 'number' || trickswon < 0) {
            console.error('Invalid tricks won:', trickswon);
            return false;
        }

        if (!player.roundData[gameState.currentRound - 1]) {
            player.roundData[gameState.currentRound - 1] = {};
        }

        player.roundData[gameState.currentRound - 1].trickswon = trickswon;
        return true;
    }

    /**
     * Complete the current round by calculating all scores
     */
    function completeRound() {
        // Calculate scores for all players in current round
        gameState.players.forEach(player => {
            const roundIndex = gameState.currentRound - 1;
            const data = player.roundData[roundIndex];

            if (data && typeof data.bid === 'number' && typeof data.trickswon === 'number') {
                // Use Scoring module to calculate score
                const score = Scoring.calculateRoundScore(data.bid, data.trickswon);
                player.roundScores[roundIndex] = score;
                player.cumulativeScore = Scoring.calculateCumulativeScore(player.roundScores);
            }
        });

        console.log('Round', gameState.currentRound, 'completed');
        return true;
    }

    /**
     * Move to the next round
     */
    function nextRound() {
        if (gameState.currentRound >= gameState.maxRounds) {
            endGame();
            return false;
        }

        gameState.currentRound++;
        console.log('Moving to round', gameState.currentRound);
        return true;
    }

    /**
     * End the game and determine winner
     */
    function endGame() {
        gameState.gameStatus = 'completed';
        const rankedPlayers = Scoring.rankPlayers(gameState.players);
        console.log('Game ended. Final standings:', rankedPlayers);
        return rankedPlayers;
    }

    /**
     * Get current game state
     */
    function getGameState() {
        return {
            ...gameState,
            players: gameState.players.map(p => ({
                ...p
            }))
        };
    }

    /**
     * Get a specific player's data
     * @param {number} playerId - Player ID
     */
    function getPlayerData(playerId) {
        const player = gameState.players[playerId];
        if (!player) {
            console.error('Player not found:', playerId);
            return null;
        }
        return { ...player };
    }

    /**
     * Get all players ranked by score
     */
    function getRankedPlayers() {
        return Scoring.rankPlayers(gameState.players);
    }

    // Public API
    return {
        initializeGame: initializeGame,
        recordBid: recordBid,
        recordTrickswon: recordTrickswon,
        completeRound: completeRound,
        nextRound: nextRound,
        endGame: endGame,
        getGameState: getGameState,
        getPlayerData: getPlayerData,
        getRankedPlayers: getRankedPlayers
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}