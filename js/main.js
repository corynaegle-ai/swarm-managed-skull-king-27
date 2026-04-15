// Game state object
const gameState = {
  currentRound: 1,
  maxRounds: 10,
  bids: [],
  currentPhase: 'bidding'
};

/**
 * Transitions to the scoring phase.
 * Displays bid summary, updates phase state, and dispatches phase-changed event.
 */
function proceedToScoring() {
  // Build and display bid summary
  const summary = gameState.bids.map(b => `${b.playerId}: ${b.bidAmount}`).join('\n');
  console.log('Bid Summary:\n' + summary);
  
  // Update game phase
  gameState.currentPhase = 'scoring';
  
  // Dispatch phase-changed event for other components to listen
  document.dispatchEvent(new CustomEvent('phase-changed', {
    detail: {
      phase: 'scoring',
      bids: gameState.bids
    }
  }));
}

// Wire up confirm button to proceed to scoring phase
document.addEventListener('DOMContentLoaded', function() {
  const confirmBtn = document.getElementById('confirm-btn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', proceedToScoring);
  }
});
