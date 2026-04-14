# Skull King Game - Player Setup

## Overview

This implementation provides a complete player setup system for the Skull King game that allows a scorekeeper to add 2-8 players before the game begins.

## Features

### PlayerManager Class
The `PlayerManager` class handles all player-related operations:
- **add_player(name)**: Add a player with validation
- **remove_player(name)**: Remove a player during setup
- **get_players()**: Get list of current players
- **player_count()**: Get number of players
- **is_ready_for_game()**: Check if valid player count for starting
- **clear_players()**: Reset all players

### GameEngine Class
The `GameEngine` class orchestrates the game and enforces constraints:
- Prevents adding players after game starts
- Prevents removing players after game starts
- Enforces 2-8 player requirement before starting
- Manages game state

## Acceptance Criteria

All acceptance criteria are satisfied:

1. **Can add players with unique names** ✅
   - Players are added with validation in `PlayerManager.add_player()`
   - Name is stored after stripping whitespace

2. **Prevents duplicate player names** ✅
   - Duplicate detection is case-insensitive
   - Checked before adding each player in `add_player()`
   - Raises `ValueError` with clear message

3. **Enforces 2-8 player limit** ✅
   - `PlayerManager.add_player()` rejects additions beyond 8 players
   - `GameEngine.start_game()` validates 2-8 range before starting

4. **Can remove players during setup** ✅
   - `PlayerManager.remove_player()` removes players by name
   - Case-insensitive removal
   - Raises `ValueError` if player not found
   - `GameEngine` prevents removal after game starts

5. **Cannot start game with fewer than 2 players** ✅
   - `GameEngine.start_game()` validates minimum 2 players
   - Raises `ValueError` if count < 2 or > 8
   - Clear error messages indicate required player count

## Validation Rules

### Player Names
- Must be strings
- Cannot be empty or whitespace-only
- Duplicate detection is case-insensitive
- Leading/trailing whitespace is trimmed
- Special characters and unicode are supported

### Player Count
- Minimum: 2 players
- Maximum: 8 players
- Game cannot start outside this range

### Game State
- Players cannot be added after game starts
- Players cannot be removed after game starts
- Game state transitions prevent invalid operations

## Testing

Comprehensive test suites are provided:

- **test_player_manager.py**: 40+ tests covering:
  - Player addition with validation
  - Duplicate detection (exact, case-insensitive, whitespace variants)
  - Player limits (2-8)
  - Player removal
  - Game readiness checks
  - Edge cases (special characters, unicode, etc.)

- **test_game_engine.py**: 20+ tests covering:
  - Engine setup
  - Player management through engine
  - Game start validation
  - Player change prevention after start
  - Integration scenarios

Run tests with: `pytest tests/`

## Usage Example

```python
from game.engine import GameEngine

# Create game engine
engine = GameEngine()

# Add players
engine.add_player("Alice")
engine.add_player("Bob")
engine.add_player("Charlie")
engine.add_player("Diana")

# View current players
print(engine.get_players())  # ['Alice', 'Bob', 'Charlie', 'Diana']
print(engine.get_player_count())  # 4

# Remove a player if needed
engine.remove_player("Diana")

# Start the game (must have 2-8 players)
engine.start_game()

# Game is now running - cannot add/remove players
try:
    engine.add_player("Eve")
except RuntimeError as e:
    print(e)  # Cannot add players after game has started
```

## Error Handling

All validation errors provide clear, actionable messages:

- **Empty name**: "Player name cannot be empty"
- **Duplicate name**: "Player 'Alice' already exists"
- **Too many players**: "Cannot add more than 8 players"
- **Player not found**: "Player 'Bob' not found"
- **Invalid start**: "Cannot start game with 1 players. Must have between 2 and 8 players."
- **Post-start changes**: "Cannot add/remove players after game has started"
