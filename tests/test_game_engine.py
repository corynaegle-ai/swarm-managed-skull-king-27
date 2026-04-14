"""Tests for GameEngine class."""

import pytest
from game.engine import GameEngine


class TestGameEngineSetup:
    """Test game setup through engine."""
    
    def test_create_engine(self):
        """Test creating a game engine."""
        engine = GameEngine()
        assert engine.game_started is False
        assert engine.get_player_count() == 0
    
    def test_add_players_through_engine(self):
        """Test adding players through engine."""
        engine = GameEngine()
        engine.add_player("Alice")
        engine.add_player("Bob")
        
        assert engine.get_player_count() == 2
        assert set(engine.get_players()) == {"Alice", "Bob"}
    
    def test_remove_players_before_start(self):
        """Test removing players before game starts."""
        engine = GameEngine()
        engine.add_player("Alice")
        engine.add_player("Bob")
        
        engine.remove_player("Alice")
        assert engine.get_player_count() == 1


class TestCannotStartWithFewerThan2Players:
    """Test that game cannot start with fewer than 2 players."""
    
    def test_cannot_start_with_0_players(self):
        """Test that game cannot start with 0 players."""
        engine = GameEngine()
        with pytest.raises(ValueError, match="Cannot start game"):
            engine.start_game()
    
    def test_cannot_start_with_1_player(self):
        """Test that game cannot start with 1 player."""
        engine = GameEngine()
        engine.add_player("Alice")
        
        with pytest.raises(ValueError, match="Cannot start game"):
            engine.start_game()
    
    def test_can_start_with_2_players(self):
        """Test that game can start with 2 players (minimum)."""
        engine = GameEngine()
        engine.add_player("Alice")
        engine.add_player("Bob")
        
        engine.start_game()
        assert engine.game_started is True
    
    def test_can_start_with_4_players(self):
        """Test that game can start with 4 players."""
        engine = GameEngine()
        for i in range(1, 5):
            engine.add_player(f"Player{i}")
        
        engine.start_game()
        assert engine.game_started is True
    
    def test_can_start_with_8_players(self):
        """Test that game can start with 8 players (maximum)."""
        engine = GameEngine()
        for i in range(1, 9):
            engine.add_player(f"Player{i}")
        
        engine.start_game()
        assert engine.game_started is True
    
    def test_cannot_start_with_9_players(self):
        """Test that game cannot start with more than 8 players."""
        engine = GameEngine()
        for i in range(1, 9):
            engine.add_player(f"Player{i}")
        
        # Should not be able to add 9th
        with pytest.raises(ValueError):
            engine.add_player("Player9")


class TestGameStartPreventsChanges:
    """Test that game start prevents player changes."""
    
    def test_cannot_add_player_after_start(self):
        """Test that players cannot be added after game starts."""
        engine = GameEngine()
        engine.add_player("Alice")
        engine.add_player("Bob")
        engine.start_game()
        
        with pytest.raises(RuntimeError, match="Cannot add players"):
            engine.add_player("Charlie")
    
    def test_cannot_remove_player_after_start(self):
        """Test that players cannot be removed after game starts."""
        engine = GameEngine()
        engine.add_player("Alice")
        engine.add_player("Bob")
        engine.start_game()
        
        with pytest.raises(RuntimeError, match="Cannot remove players"):
            engine.remove_player("Alice")


class TestGameEngineValidation:
    """Test validation through game engine."""
    
    def test_duplicate_names_rejected(self):
        """Test that duplicate names are rejected through engine."""
        engine = GameEngine()
        engine.add_player("Alice")
        
        with pytest.raises(ValueError, match="already exists"):
            engine.add_player("Alice")
    
    def test_maximum_players_enforced(self):
        """Test that maximum players limit is enforced through engine."""
        engine = GameEngine()
        for i in range(1, 9):
            engine.add_player(f"Player{i}")
        
        with pytest.raises(ValueError, match="Cannot add more than"):
            engine.add_player("Player9")


class TestIntegrationScenarios:
    """Test realistic game setup scenarios."""
    
    def test_typical_4_player_game(self):
        """Test setting up and starting a typical 4-player game."""
        engine = GameEngine()
        names = ["Alice", "Bob", "Charlie", "Diana"]
        
        for name in names:
            engine.add_player(name)
        
        assert engine.get_player_count() == 4
        assert set(engine.get_players()) == set(names)
        
        engine.start_game()
        assert engine.game_started is True
    
    def test_player_removal_and_replacement(self):
        """Test removing a player and adding a replacement."""
        engine = GameEngine()
        engine.add_player("Alice")
        engine.add_player("Bob")
        engine.add_player("Charlie")
        
        engine.remove_player("Bob")
        engine.add_player("Diana")
        
        assert engine.get_player_count() == 3
        assert set(engine.get_players()) == {"Alice", "Charlie", "Diana"}
    
    def test_add_remove_until_ready(self):
        """Test adding and removing players until game is ready."""
        engine = GameEngine()
        
        # Add some players
        engine.add_player("Alice")
        engine.add_player("Bob")
        assert engine.get_player_count() == 2
        
        # Game should be ready with 2
        engine.start_game()
        assert engine.game_started is True
