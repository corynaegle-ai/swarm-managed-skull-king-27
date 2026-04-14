/**
 * Score Display Module
 * Handles displaying and tracking game scores with round history
 */

class ScoreDisplay {
  constructor() {
    this.scores = new Map(); // Map of player -> array of round scores
    this.players = []; // Array of player names
    this.currentRound = 0;
    this.totalScores = new Map(); // Running totals
  }

  /**
   * Initialize score tracking for a set of players
   * @param {string[]} playerNames - Array of player names
   */
  initializePlayers(playerNames) {
    this.players = playerNames;
    playerNames.forEach(name => {
      this.scores.set(name, []);
      this.totalScores.set(name, 0);
    });
  }

  /**
   * Add a score for a player in the current round
   * @param {string} playerName - Name of the player
   * @param {number} roundScore - Points scored in this round
   */
  addRoundScore(playerName, roundScore) {
    if (!this.scores.has(playerName)) {
      throw new Error(`Player "${playerName}" not initialized`);
    }
    
    const scores = this.scores.get(playerName);
    scores.push(roundScore);
    
    // Update running total
    const currentTotal = this.totalScores.get(playerName);
    this.totalScores.set(playerName, currentTotal + roundScore);
  }

  /**
   * Complete a round and increment round counter
   */
  completeRound() {
    this.currentRound++;
  }

  /**
   * Get the full score history for a player
   * @param {string} playerName - Name of the player
   * @returns {number[]} Array of round scores
   */
  getPlayerRoundHistory(playerName) {
    if (!this.scores.has(playerName)) {
      throw new Error(`Player "${playerName}" not found`);
    }
    return [...this.scores.get(playerName)];
  }

  /**
   * Get running totals for a player at each round
   * @param {string} playerName - Name of the player
   * @returns {number[]} Array of cumulative scores by round
   */
  getPlayerRunningTotals(playerName) {
    const history = this.getPlayerRoundHistory(playerName);
    const runningTotals = [];
    let sum = 0;
    
    history.forEach(roundScore => {
      sum += roundScore;
      runningTotals.push(sum);
    });
    
    return runningTotals;
  }

  /**
   * Get the current total score for a player
   * @param {string} playerName - Name of the player
   * @returns {number} Total score
   */
  getPlayerTotal(playerName) {
    if (!this.totalScores.has(playerName)) {
      throw new Error(`Player "${playerName}" not found`);
    }
    return this.totalScores.get(playerName);
  }

  /**
   * Get all players' current totals
   * @returns {Object} Object with player names as keys and totals as values
   */
  getAllPlayerTotals() {
    const totals = {};
    this.totalScores.forEach((total, playerName) => {
      totals[playerName] = total;
    });
    return totals;
  }

  /**
   * Get the current leader
   * @returns {Object} Object with {playerName, score}
   */
  getCurrentLeader() {
    let leader = { playerName: '', score: -Infinity };
    
    this.totalScores.forEach((score, playerName) => {
      if (score > leader.score) {
        leader = { playerName, score };
      }
    });
    
    return leader;
  }

  /**
   * Get score breakdown for display
   * @returns {Object} Object mapping player names to their round breakdown
   */
  getScoreBreakdown() {
    const breakdown = {};
    
    this.players.forEach(playerName => {
      breakdown[playerName] = {
        roundScores: this.getPlayerRoundHistory(playerName),
        runningTotals: this.getPlayerRunningTotals(playerName),
        total: this.getPlayerTotal(playerName)
      };
    });
    
    return breakdown;
  }

  /**
   * Reset all scores (new game)
   */
  reset() {
    this.scores.clear();
    this.totalScores.clear();
    this.players = [];
    this.currentRound = 0;
  }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreDisplay;
}
