import { collectBids } from './bid-phase.js';

const gameState = {
  players: [],
  scores: {},
  currentPhase: 'bidding',
  bids: [],
};

function initGame(players) {
  gameState.players = players;
  gameState.scores = players.reduce((acc, player) => {
    acc[player.id] = 0;
    return acc;
  }, {});
}

function startRound() {
  gameState.currentPhase = 'bidding';
  collectBids(gameState.players);
}

export { gameState, initGame, startRound };
