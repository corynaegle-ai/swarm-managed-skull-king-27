# Skull King Game - Player Setup

## Overview

This implementation provides a complete player setup system for the Skull King game that allows a scorekeeper to add 2-8 players before the game begins.

## Features

### PlayerManager Class
The `PlayerManager` class handles all player-related operations:
- **addPlayer(name)**: Add a player with validation
- **removePlayer(playerId)**: Remove a player during setup
- **getPlayers()**: Get list of current players
- **getPlayerCount()**: Get number of players
- **canStartGame()**: Check if valid player count for starting (2-8 players)
- **reset()**: Reset all players

### GameState Class
The `GameState` class orchestrates the game and enforces constraints:
- Manages game phases (setup, playing, finished)
- Prevents adding players after game starts
- Prevents removing players after game starts
- Enforces 2-8 player requirement before starting
- Provides complete game state snapshots

## Acceptance Criteria

All acceptance criteria are satisfied:

1. **Can add players with unique names** ✅
   - Players are added with validation in `PlayerManager.addPlayer()`
   - Name is stored after trimming whitespace
   - Duplicate detection is case-insensitive

2. **Prevents duplicate player names** ✅
   - Duplicate detection is case-insensitive
   - Checked before adding each player in `addPlayer()`
   - Throws Error with clear message

3. **Enforces 2-8 player limit** ✅
   - `PlayerManager.addPlayer()` rejects additions beyond 8 players
   - `GameState.canStartGame()` validates BOTH 2-8 range
   - `GameState.startGame()` validates full 2-8 range before starting

4. **Can remove players during setup** ✅
   - `PlayerManager.removePlayer()` removes players by ID
   - `GameState` prevents removal after game starts
   - Throws Error if player not found

5. **Cannot start game with fewer than 2 players** ✅
   - `GameState.startGame()` validates both minimum (>=2) and maximum (<=8)
   - Throws Error with message mentioning both bounds
   - Clear error messages indicate required player count range

## Validation Rules

### Player Names
- Must be strings
- Cannot be empty or whitespace-only
- Duplicate detection is case-insensitive
- Leading/trailing whitespace is trimmed
- Must be 50 characters or less

### Player Count
- Minimum: 2 players
- Maximum: 8 players
- Game cannot start outside this range
- All validation methods check BOTH bounds

### Game State
- Setup phase: Players can be added and removed
- Playing phase: No player changes allowed
- Game state transitions prevent invalid operations

## Implementation Details

### PlayerManager
- Uses a Map<string, Player> for O(1) player lookups
- Maintains a Set<string> of player names (lowercase) for fast duplicate detection
- Auto-generates unique player IDs
- Stores creation timestamp for each player

### GameState
- Wraps PlayerManager to add phase management
- Enforces phase-based access control (setup vs playing)
- Validates bounds in BOTH canStartGame() and startGame()

## Usage Example

```typescript
import { GameState } from './src/GameState';

// Create game state
const gameState = new GameState();

// Add players
gameState.addPlayer('Alice');
gameState.addPlayer('Bob');
gameState.addPlayer('Charlie');
gameState.addPlayer('Diana');

// View current players
console.log(gameState.getPlayers());  // 4 players
console.log(gameState.getPlayerCount());  // 4

// Remove a player if needed
const players = gameState.getPlayers();
gameState.removePlayer(players[3].id);

// Check if can start
if (gameState.canStartGame()) {
  gameState.startGame();
}

// Game is now in playing phase - cannot add/remove players
try {
  gameState.addPlayer('Eve');
} catch (e) {
  console.log(e.message);  // Cannot add players outside of setup phase
}
```

## Error Handling

All validation errors provide clear, actionable messages:

- **Empty name**: "Player name must be a non-empty string"
- **Whitespace name**: "Player name cannot be empty or whitespace only"
- **Duplicate name**: "Player name \"Alice\" is already taken. Player names must be unique."
- **Too many players**: "Maximum of 8 players reached. Cannot add more players."
- **Player not found**: "Player with ID ... not found"
- **Invalid start (too few)**: "Cannot start game with 1 players. Must have between 2 and 8 players."
- **Invalid start (too many)**: "Cannot start game with 9 players. Must have between 2 and 8 players."
- **Post-start changes**: "Cannot add/remove players outside of setup phase"

## Testing

Comprehensive test suites verify:
- Player addition with validation
- Duplicate detection (exact, case-insensitive, whitespace variants)
- Player count limits (2-8) in both canStartGame() and startGame()
- Player removal
- Game readiness checks
- Phase-based access control
- Edge cases and error conditions

Run tests with: `npm test`
