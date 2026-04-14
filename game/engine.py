"""Game engine for Skull King.

Coordinates game flow, player management, and game state.
"""

from game.player_manager import PlayerManager


class GameEngine:
    """Main game engine for Skull King.
    
    Manages:
    - Player setup and validation
    - Game state
    - Game flow
    """
    
    def __init__(self):
        """Initialize game engine with player manager."""
        self.player_manager = PlayerManager()
        self.game_started = False
    
    def add_player(self, name):
        """Add a player during setup.
        
        Args:
            name: Player name
            
        Raises:
            ValueError: If validation fails
            RuntimeError: If game has already started
        """
        if self.game_started:
            raise RuntimeError("Cannot add players after game has started")
        
        self.player_manager.add_player(name)
    
    def remove_player(self, name):
        """Remove a player during setup.
        
        Args:
            name: Player name to remove
            
        Raises:
            ValueError: If player not found
            RuntimeError: If game has already started
        """
        if self.game_started:
            raise RuntimeError("Cannot remove players after game has started")
        
        self.player_manager.remove_player(name)
    
    def start_game(self):
        """Start the game.
        
        Raises:
            ValueError: If player count is invalid (must be 2-8)
        """
        if not self.player_manager.is_ready_for_game():
            player_count = self.player_manager.player_count()
            raise ValueError(
                f"Cannot start game with {player_count} players. "
                f"Must have between {self.player_manager.MIN_PLAYERS} and "
                f"{self.player_manager.MAX_PLAYERS} players."
            )
        
        self.game_started = True
    
    def get_players(self):
        """Get current players.
        
        Returns:
            List of player names
        """
        return self.player_manager.get_players()
    
    def get_player_count(self):
        """Get number of players.
        
        Returns:
            Number of players
        """
        return self.player_manager.player_count()
