import { collectBids } from "./bid-phase.js";

const gameState = {
  players: [],
  scores: {},
  currentRound: 1,
  totalRounds: 10,
  bids: [],
  currentPhase: 'setup'
};

function startRound() {
  console.log(`Starting round ${gameState.currentRound}...`);
}

function endRound() {
  console.log(`Ending round ${gameState.currentRound}...`);
  gameState.currentRound++;
}

export { gameState, startRound };
