import { collectBids } from "./bid-phase.js";

const gameState = {
  players: [],
  currentRound: 1,
  totalRounds: 10,
  bids: [],
  currentPhase: 'setup',
};

function startRound() {
  gameState.currentPhase = 'bidding';
  updatePhaseDisplay();
  collectBids();
}

function updatePhaseDisplay() {
  const phaseDisplay = document.getElementById('current-phase');
  const phaseIndicator = document.getElementById('phase-indicator');
  phaseDisplay.textContent = gameState.currentPhase.charAt(0).toUpperCase() + gameState.currentPhase.slice(1);
  phaseIndicator.textContent = gameState.currentPhase.charAt(0).toUpperCase() + gameState.currentPhase.slice(1) + ' Phase';
}

export { gameState, startRound };
