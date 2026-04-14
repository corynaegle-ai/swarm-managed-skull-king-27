"""Player management module for Skull King game.

Handles player setup, validation, and management during game initialization.
"""


class PlayerManager:
    """Manages players during game setup and play.
    
    Enforces constraints:
    - Player count between 2-8
    - Unique player names (case-insensitive)
    - Player removal during setup
    """
    
    MIN_PLAYERS = 2
    MAX_PLAYERS = 8
    
    def __init__(self):
        """Initialize empty player list."""
        self._players = []
    
    def add_player(self, name):
        """Add a player with validation.
        
        Args:
            name: Player name (string)
            
        Raises:
            ValueError: If name is invalid, duplicate, or player limit reached
            TypeError: If name is not a string
        """
        # Type validation
        if not isinstance(name, str):
            raise TypeError(f"Player name must be a string, got {type(name).__name__}")
        
        # Empty/whitespace validation
        if not name or not name.strip():
            raise ValueError("Player name cannot be empty")
        
        # Normalize the name for storage and checking
        normalized_name = name.strip()
        
        # Check for duplicates (case-insensitive)
        existing_names = [p.lower() for p in self._players]
        if normalized_name.lower() in existing_names:
            raise ValueError(f"Player '{normalized_name}' already exists")
        
        # Check player limit
        if len(self._players) >= self.MAX_PLAYERS:
            raise ValueError(f"Cannot add more than {self.MAX_PLAYERS} players")
        
        # Add the player
        self._players.append(normalized_name)
    
    def remove_player(self, name):
        """Remove a player by name (case-insensitive).
        
        Args:
            name: Player name to remove
            
        Raises:
            ValueError: If player not found
        """
        if not isinstance(name, str):
            raise TypeError(f"Player name must be a string, got {type(name).__name__}")
        
        # Find and remove (case-insensitive)
        for i, player in enumerate(self._players):
            if player.lower() == name.lower():
                self._players.pop(i)
                return
        
        raise ValueError(f"Player '{name}' not found")
    
    def get_players(self):
        """Get list of current players.
        
        Returns:
            List of player names
        """
        return self._players.copy()
    
    def player_count(self):
        """Get current number of players.
        
        Returns:
            Number of players
        """
        return len(self._players)
    
    def is_ready_for_game(self):
        """Check if player setup is valid for starting game.
        
        Returns:
            True if player count is within valid range
        """
        return self.MIN_PLAYERS <= len(self._players) <= self.MAX_PLAYERS
    
    def clear_players(self):
        """Clear all players (for reset/new game)."""
        self._players = []
