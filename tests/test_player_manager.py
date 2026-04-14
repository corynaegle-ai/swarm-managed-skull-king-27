"""Tests for PlayerManager class."""

import pytest
from game.player_manager import PlayerManager


class TestPlayerAddition:
    """Test adding players to the game."""
    
    def test_add_single_player(self):
        """Test adding a single valid player."""
        manager = PlayerManager()
        manager.add_player("Alice")
        assert manager.player_count() == 1
        assert "Alice" in manager.get_players()
    
    def test_add_multiple_unique_players(self):
        """Test adding multiple players with unique names."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.add_player("Charlie")
        
        assert manager.player_count() == 3
        assert set(manager.get_players()) == {"Alice", "Bob", "Charlie"}
    
    def test_add_player_strips_whitespace(self):
        """Test that player names are stripped of leading/trailing whitespace."""
        manager = PlayerManager()
        manager.add_player("  Alice  ")
        assert manager.get_players()[0] == "Alice"
    
    def test_add_player_empty_name_raises_error(self):
        """Test that empty names are rejected."""
        manager = PlayerManager()
        with pytest.raises(ValueError, match="empty"):
            manager.add_player("")
    
    def test_add_player_whitespace_only_raises_error(self):
        """Test that whitespace-only names are rejected."""
        manager = PlayerManager()
        with pytest.raises(ValueError, match="empty"):
            manager.add_player("   ")
    
    def test_add_player_non_string_raises_error(self):
        """Test that non-string names are rejected."""
        manager = PlayerManager()
        with pytest.raises(TypeError, match="string"):
            manager.add_player(123)
    
    def test_add_player_none_raises_error(self):
        """Test that None is rejected as a name."""
        manager = PlayerManager()
        with pytest.raises(TypeError, match="string"):
            manager.add_player(None)


class TestDuplicateDetection:
    """Test duplicate player name detection."""
    
    def test_prevent_exact_duplicate(self):
        """Test that exact duplicate names are rejected."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        with pytest.raises(ValueError, match="already exists"):
            manager.add_player("Alice")
    
    def test_prevent_case_insensitive_duplicate(self):
        """Test that case-insensitive duplicates are rejected."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        with pytest.raises(ValueError, match="already exists"):
            manager.add_player("alice")
    
    def test_prevent_mixed_case_duplicate(self):
        """Test that mixed-case duplicates are rejected."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        with pytest.raises(ValueError, match="already exists"):
            manager.add_player("ALICE")
    
    def test_prevent_whitespace_variant_duplicate(self):
        """Test that whitespace variants are treated as duplicates."""
        manager = PlayerManager()
        manager.add_player("  Alice  ")
        
        with pytest.raises(ValueError, match="already exists"):
            manager.add_player("Alice")
    
    def test_similar_names_not_duplicates(self):
        """Test that similar but different names are allowed."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Alicia")
        manager.add_player("Bob")
        
        assert manager.player_count() == 3


class TestPlayerLimits:
    """Test player count limits."""
    
    def test_add_maximum_8_players(self):
        """Test adding up to 8 players."""
        manager = PlayerManager()
        names = [f"Player{i}" for i in range(1, 9)]
        for name in names:
            manager.add_player(name)
        
        assert manager.player_count() == 8
    
    def test_reject_9th_player(self):
        """Test that 9th player is rejected."""
        manager = PlayerManager()
        for i in range(1, 9):
            manager.add_player(f"Player{i}")
        
        with pytest.raises(ValueError, match="Cannot add more than"):
            manager.add_player("Player9")
    
    def test_exceed_max_players_with_multiple_additions(self):
        """Test that player limit is enforced consistently."""
        manager = PlayerManager()
        for i in range(1, 9):
            manager.add_player(f"Player{i}")
        
        # Should be at max
        assert manager.player_count() == 8
        
        # Should reject additional players
        with pytest.raises(ValueError):
            manager.add_player("ExtraPlayer")


class TestPlayerRemoval:
    """Test removing players during setup."""
    
    def test_remove_existing_player(self):
        """Test removing a player that exists."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        
        manager.remove_player("Alice")
        assert manager.player_count() == 1
        assert manager.get_players() == ["Bob"]
    
    def test_remove_player_case_insensitive(self):
        """Test that removal is case-insensitive."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        manager.remove_player("alice")
        assert manager.player_count() == 0
    
    def test_remove_nonexistent_player_raises_error(self):
        """Test that removing nonexistent player raises error."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        with pytest.raises(ValueError, match="not found"):
            manager.remove_player("Bob")
    
    def test_remove_all_players_one_by_one(self):
        """Test removing all players sequentially."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.add_player("Charlie")
        
        manager.remove_player("Alice")
        assert manager.player_count() == 2
        
        manager.remove_player("Bob")
        assert manager.player_count() == 1
        
        manager.remove_player("Charlie")
        assert manager.player_count() == 0
    
    def test_remove_then_add_same_player(self):
        """Test that a removed player can be added again."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.remove_player("Alice")
        manager.add_player("Alice")
        
        assert manager.player_count() == 1
        assert manager.get_players() == ["Alice"]


class TestGameReadiness:
    """Test game readiness validation."""
    
    def test_not_ready_with_0_players(self):
        """Test that 0 players is not ready."""
        manager = PlayerManager()
        assert not manager.is_ready_for_game()
    
    def test_not_ready_with_1_player(self):
        """Test that 1 player is not ready."""
        manager = PlayerManager()
        manager.add_player("Alice")
        assert not manager.is_ready_for_game()
    
    def test_ready_with_2_players(self):
        """Test that 2 players is ready (minimum)."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        assert manager.is_ready_for_game()
    
    def test_ready_with_4_players(self):
        """Test that 4 players is ready."""
        manager = PlayerManager()
        for i in range(1, 5):
            manager.add_player(f"Player{i}")
        assert manager.is_ready_for_game()
    
    def test_ready_with_8_players(self):
        """Test that 8 players is ready (maximum)."""
        manager = PlayerManager()
        for i in range(1, 9):
            manager.add_player(f"Player{i}")
        assert manager.is_ready_for_game()


class TestEdgeCases:
    """Test edge cases and special scenarios."""
    
    def test_get_players_returns_copy(self):
        """Test that get_players returns a copy, not reference."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        players = manager.get_players()
        players.append("Bob")  # Modify the returned list
        
        # Original should not be modified
        assert manager.player_count() == 1
        assert manager.get_players() == ["Alice"]
    
    def test_clear_players(self):
        """Test clearing all players."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        
        manager.clear_players()
        assert manager.player_count() == 0
        assert manager.get_players() == []
    
    def test_player_with_special_characters(self):
        """Test player names with special characters."""
        manager = PlayerManager()
        manager.add_player("Player-1")
        manager.add_player("Player_2")
        manager.add_player("Player@3")
        
        assert manager.player_count() == 3
    
    def test_player_with_unicode_characters(self):
        """Test player names with unicode characters."""
        manager = PlayerManager()
        manager.add_player("José")
        manager.add_player("李明")
        
        assert manager.player_count() == 2
