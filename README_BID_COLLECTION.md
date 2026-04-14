# Bid Collection System

## Overview

The Bid Collection system is responsible for gathering and validating bids from all players before each round of Skull King. It ensures game integrity by preventing invalid bids and requiring confirmation from all players.

## Features

### 1. Round Information Display
- Clearly displays the current round number and hand count
- Hand count always equals the round number
- Provides visual separation with formatted output

### 2. Bid Validation
- Prevents bids exceeding the hand count for that round
- Accepts valid bids from 0 to hand_count (inclusive)
- Rejects invalid input with clear error messages

### 3. Complete Player Collection
- Requires a bid from every player before proceeding
- Tracks which players have submitted bids
- Ensures no player is skipped

### 4. Bid Modification Support
- Allows players to review all bids before confirming
- Permits modification of any bid after initial submission
- Players can change their bid multiple times

### 5. Bid Summary Display
- Shows all bids in a clear, formatted table
- Indicates which bids are confirmed
- Displays hand count limit for reference

## Usage

```python
from bid_collection import BidCollector

# Initialize for round 3 (3 hands, 3 players)
players = ["Alice", "Bob", "Charlie"]
collector = BidCollector(players, round_number=3)

# Collect bids interactively
final_bids = collector.collect_bids()
# Returns: {"Alice": 2, "Bob": 1, "Charlie": 3}

# Or manually set bids for testing
from bid_collection import PlayerBid
collector.bids["Alice"] = PlayerBid("Alice", 2, confirmed=True)
final_bids = collector.get_final_bids()
```

## API Reference

### BidCollector Class

#### `__init__(players: List[str], round_number: int)`
Initialize the bid collector.

**Parameters:**
- `players`: List of player names
- `round_number`: Current round (1-indexed), equals hand count

**Raises:**
- `ValueError`: If no players provided or invalid round number

#### `display_round_info() -> str`
Return formatted round and hand count information.

#### `collect_bids() -> Dict[str, int]`
Interactively collect and validate bids from all players.
Allows modification before final confirmation.

**Returns:**
Dictionary mapping player names to confirmed bid amounts

#### `get_final_bids() -> Dict[str, int]`
Get the final confirmed bids.

**Raises:**
- `ValueError`: If not all players have submitted bids

### PlayerBid Dataclass

Represents a single player's bid.

**Attributes:**
- `player_name: str` - Name of the player
- `bid_amount: int` - Bid amount (0 to hand_count)
- `confirmed: bool` - Whether bid is confirmed (default: False)

## Workflow

1. **Initialization**: Create BidCollector with player list and round number
2. **Display Info**: Show current round and hand count
3. **Collect Bids**: Request bid from each player (0 to hand_count)
4. **Summary & Review**: Display all bids with modification option
5. **Confirmation**: Players confirm all bids
6. **Return to Game**: Proceed to scoring phase with confirmed bids

## Validation Rules

- Bid must be an integer
- Bid must be >= 0
- Bid must be <= hand_count (which equals round_number)
- All players must submit a bid
- All bids must be confirmed before proceeding

## Error Handling

The system provides clear, user-friendly error messages:
- Invalid bid (exceeds hand count)
- Invalid input (non-integer)
- Missing player bids
- Unknown player name during modification

## Testing

Comprehensive test suite included in `tests/test_bid_collection.py`:

```bash
pytest tests/test_bid_collection.py -v
```

Test coverage includes:
- Initialization validation
- Bid validation rules
- Single and multiplayer scenarios
- Bid modification workflows
- Round-specific behaviors
