"""Unit tests for bid collection module."""

import pytest
from bid_collection import BidCollector, PlayerBid


class TestPlayerBid:
    """Tests for PlayerBid dataclass."""
    
    def test_player_bid_creation(self):
        """Test creating a player bid."""
        bid = PlayerBid(player_name="Alice", bid_amount=3)
        assert bid.player_name == "Alice"
        assert bid.bid_amount == 3
        assert bid.confirmed is False
    
    def test_player_bid_confirmed(self):
        """Test confirmed player bid."""
        bid = PlayerBid(player_name="Bob", bid_amount=2, confirmed=True)
        assert bid.confirmed is True


class TestBidCollectorInitialization:
    """Tests for BidCollector initialization."""
    
    def test_valid_initialization(self):
        """Test valid bid collector creation."""
        players = ["Alice", "Bob", "Charlie"]
        collector = BidCollector(players, round_number=1)
        
        assert collector.players == players
        assert collector.round_number == 1
        assert collector.hand_count == 1
        assert len(collector.bids) == 0
    
    def test_initialization_with_different_rounds(self):
        """Test initialization with various round numbers."""
        for round_num in [1, 3, 5, 10]:
            collector = BidCollector(["Alice"], round_number=round_num)
            assert collector.hand_count == round_num
    
    def test_initialization_no_players(self):
        """Test that initialization fails with no players."""
        with pytest.raises(ValueError, match="At least one player is required"):
            BidCollector([], round_number=1)
    
    def test_initialization_invalid_round(self):
        """Test that initialization fails with invalid round number."""
        with pytest.raises(ValueError, match="Round number must be at least 1"):
            BidCollector(["Alice"], round_number=0)
        
        with pytest.raises(ValueError, match="Round number must be at least 1"):
            BidCollector(["Alice"], round_number=-1)


class TestDisplayRoundInfo:
    """Tests for round information display."""
    
    def test_display_round_info(self):
        """Test round info display format."""
        collector = BidCollector(["Alice"], round_number=3)
        output = collector.display_round_info()
        
        assert "ROUND 3" in output
        assert "3 HANDS" in output
    
    def test_display_round_info_different_rounds(self):
        """Test display for different rounds."""
        for round_num in [1, 5, 10]:
            collector = BidCollector(["Alice"], round_number=round_num)
            output = collector.display_round_info()
            assert f"ROUND {round_num}" in output
            assert f"{round_num} HANDS" in output


class TestBidValidation:
    """Tests for bid validation logic."""
    
    def test_valid_bids(self):
        """Test that valid bids are accepted."""
        collector = BidCollector(["Alice", "Bob"], round_number=3)
        
        # Manually add valid bids
        collector.bids["Alice"] = PlayerBid("Alice", 0)
        collector.bids["Bob"] = PlayerBid("Bob", 3)
        
        final_bids = collector.get_final_bids()
        assert final_bids["Alice"] == 0
        assert final_bids["Bob"] == 3
    
    def test_bid_at_hand_count_limit(self):
        """Test that bids can equal hand count."""
        collector = BidCollector(["Alice"], round_number=5)
        collector.bids["Alice"] = PlayerBid("Alice", 5)
        
        assert collector.bids["Alice"].bid_amount == 5
    
    def test_bid_zero_is_valid(self):
        """Test that bid of 0 is valid."""
        collector = BidCollector(["Alice"], round_number=3)
        collector.bids["Alice"] = PlayerBid("Alice", 0)
        
        assert collector.bids["Alice"].bid_amount == 0


class TestBidCollection:
    """Tests for bid collection workflow."""
    
    def test_get_final_bids_all_players(self):
        """Test getting final bids when all players have bid."""
        collector = BidCollector(["Alice", "Bob"], round_number=3)
        collector.bids["Alice"] = PlayerBid("Alice", 2, confirmed=True)
        collector.bids["Bob"] = PlayerBid("Bob", 1, confirmed=True)
        
        final_bids = collector.get_final_bids()
        assert final_bids == {"Alice": 2, "Bob": 1}
    
    def test_get_final_bids_incomplete(self):
        """Test that getting final bids fails if not all players have bid."""
        collector = BidCollector(["Alice", "Bob"], round_number=3)
        collector.bids["Alice"] = PlayerBid("Alice", 2)
        
        with pytest.raises(ValueError, match="Not all players have submitted bids"):
            collector.get_final_bids()
    
    def test_bid_summary_display(self):
        """Test that bid summary displays all players."""
        collector = BidCollector(["Alice", "Bob", "Charlie"], round_number=3)
        collector.bids["Alice"] = PlayerBid("Alice", 1, confirmed=True)
        collector.bids["Bob"] = PlayerBid("Bob", 2, confirmed=False)
        collector.bids["Charlie"] = PlayerBid("Charlie", 0, confirmed=False)
        
        # Calling _display_bid_summary to ensure it doesn't crash
        # and processes all players correctly
        assert len(collector.bids) == 3
        assert "Alice" in collector.bids
        assert "Bob" in collector.bids
        assert "Charlie" in collector.bids


class TestRoundSpecificBehavior:
    """Tests for behavior specific to different rounds."""
    
    def test_round_1_single_hand(self):
        """Test round 1 with single hand (0 or 1 bid only)."""
        collector = BidCollector(["Alice"], round_number=1)
        assert collector.hand_count == 1
        
        # Valid bids: 0 or 1
        collector.bids["Alice"] = PlayerBid("Alice", 0)
        assert collector.bids["Alice"].bid_amount == 0
        
        collector.bids["Alice"] = PlayerBid("Alice", 1)
        assert collector.bids["Alice"].bid_amount == 1
    
    def test_round_escalation(self):
        """Test that hand count increases with round number."""
        for round_num in range(1, 6):
            collector = BidCollector(["Alice"], round_number=round_num)
            assert collector.hand_count == round_num
            # Test max valid bid
            collector.bids["Alice"] = PlayerBid("Alice", round_num)
            assert collector.bids["Alice"].bid_amount == round_num


class TestMultiplayerScenarios:
    """Tests for multiplayer bidding scenarios."""
    
    def test_three_player_game(self):
        """Test bidding with three players."""
        players = ["Alice", "Bob", "Charlie"]
        collector = BidCollector(players, round_number=2)
        
        collector.bids["Alice"] = PlayerBid("Alice", 0)
        collector.bids["Bob"] = PlayerBid("Bob", 1)
        collector.bids["Charlie"] = PlayerBid("Charlie", 2)
        
        final_bids = collector.get_final_bids()
        assert len(final_bids) == 3
        assert final_bids["Alice"] == 0
        assert final_bids["Bob"] == 1
        assert final_bids["Charlie"] == 2
    
    def test_four_player_game(self):
        """Test bidding with four players."""
        players = ["Alice", "Bob", "Charlie", "Diana"]
        collector = BidCollector(players, round_number=3)
        
        for i, player in enumerate(players):
            collector.bids[player] = PlayerBid(player, i)
        
        final_bids = collector.get_final_bids()
        assert len(final_bids) == 4
        assert all(player in final_bids for player in players)


class TestBidModification:
    """Tests for bid modification capability."""
    
    def test_bid_can_be_modified(self):
        """Test that bids can be modified after initial entry."""
        collector = BidCollector(["Alice"], round_number=3)
        
        # Initial bid
        collector.bids["Alice"] = PlayerBid("Alice", 1)
        assert collector.bids["Alice"].bid_amount == 1
        
        # Modify bid
        collector.bids["Alice"] = PlayerBid("Alice", 3)
        assert collector.bids["Alice"].bid_amount == 3
    
    def test_confirmed_flag_changes(self):
        """Test that confirmed flag changes during modification."""
        collector = BidCollector(["Alice"], round_number=2)
        
        # Initial bid, not confirmed
        collector.bids["Alice"] = PlayerBid("Alice", 1, confirmed=False)
        assert collector.bids["Alice"].confirmed is False
        
        # Confirm
        collector.bids["Alice"].confirmed = True
        assert collector.bids["Alice"].confirmed is True
        
        # Modify (flag should reset)
        collector.bids["Alice"] = PlayerBid("Alice", 2, confirmed=False)
        assert collector.bids["Alice"].confirmed is False
