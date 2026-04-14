"""Tests for Skull King Scoring Engine."""

import pytest
from src.scoring.skull_king_scorer import SkullKingScorer, ScoreBreakdown


class TestNonZeroBidScoring:
    """Tests for non-zero bid scoring."""

    def test_exact_bid_20_points_per_trick(self):
        """Test that exact bids award +20 per trick."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=1,
            bid=3,
            tricks_taken=3,
        )
        assert breakdown.is_exact is True
        assert breakdown.base_score == 60  # 20 × 3
        assert breakdown.bonus_score == 30  # 10 × 3
        assert breakdown.total_score == 90

    def test_exact_bid_single_trick(self):
        """Test exact bid with single trick."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=1,
            bid=1,
            tricks_taken=1,
        )
        assert breakdown.base_score == 20
        assert breakdown.bonus_score == 10
        assert breakdown.total_score == 30

    def test_missed_bid_minus_10_per_difference(self):
        """Test that missed bids lose -10 per trick difference."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=1,
            bid=3,
            tricks_taken=1,
        )
        assert breakdown.is_exact is False
        assert breakdown.bonus_score == 0  # No bonus for non-exact
        assert breakdown.base_score == -20  # -10 × 2 difference
        assert breakdown.total_score == -20

    def test_overbid_missed(self):
        """Test overbid (took more tricks than bid)."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=1,
            bid=2,
            tricks_taken=5,
        )
        assert breakdown.is_exact is False
        assert breakdown.base_score == -30  # -10 × 3 difference
        assert breakdown.total_score == -30

    def test_zero_bid_difference_calculation(self):
        """Test that difference is correctly calculated for missed bids."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=1,
            bid=4,
            tricks_taken=2,
        )
        assert breakdown.base_score == -20  # -10 × 2 difference


class TestZeroBidScoring:
    """Tests for zero bid scoring."""

    def test_zero_bid_exact_plus_10_per_hand(self):
        """Test that exact zero bids award +10 × hand count."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=3,
            bid=0,
            tricks_taken=0,
        )
        assert breakdown.is_exact is True
        assert breakdown.base_score == 30  # 10 × 3
        assert breakdown.bonus_score == 0
        assert breakdown.total_score == 30

    def test_zero_bid_any_tricks_minus_10_per_hand(self):
        """Test that zero bids with tricks lose -10 × hand count."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=3,
            bid=0,
            tricks_taken=1,
        )
        assert breakdown.is_exact is False
        assert breakdown.base_score == -30  # -10 × 3
        assert breakdown.bonus_score == 0
        assert breakdown.total_score == -30

    def test_zero_bid_multiple_tricks(self):
        """Test zero bid with multiple tricks taken."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=2,
            bid=0,
            tricks_taken=3,
        )
        assert breakdown.is_exact is False
        assert breakdown.base_score == -20  # -10 × 2
        assert breakdown.total_score == -20

    def test_zero_bid_hand_one(self):
        """Test zero bid with hand number 1."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=1,
            bid=0,
            tricks_taken=0,
        )
        assert breakdown.base_score == 10  # 10 × 1
        assert breakdown.total_score == 10


class TestBonusPoints:
    """Tests for bonus point application."""

    def test_bonus_only_on_exact_nonzero_bid(self):
        """Test that bonus is only applied when non-zero bid is exact."""
        scorer = SkullKingScorer()
        
        # Exact bid: should have bonus
        exact = scorer.calculate_hand_score("p1", 1, 2, 2)
        assert exact.bonus_score == 20  # 10 × 2
        
        # Missed bid: no bonus
        missed = scorer.calculate_hand_score("p1", 1, 2, 3)
        assert missed.bonus_score == 0

    def test_bonus_not_applied_to_zero_bid(self):
        """Test that bonus is never applied to zero bids."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=1,
            bid=0,
            tricks_taken=0,
        )
        assert breakdown.bonus_score == 0  # Never bonus for zero bids
        assert breakdown.base_score == 10

    def test_bonus_scales_with_bid(self):
        """Test that bonus scales with the bid amount."""
        scorer = SkullKingScorer()
        
        breakdown_5 = scorer.calculate_hand_score("p1", 1, 5, 5)
        assert breakdown_5.bonus_score == 50  # 10 × 5
        
        breakdown_1 = scorer.calculate_hand_score("p1", 1, 1, 1)
        assert breakdown_1.bonus_score == 10  # 10 × 1


class TestTotalScoreUpdates:
    """Tests for total score tracking."""

    def test_update_and_get_score(self):
        """Test updating and retrieving player scores."""
        scorer = SkullKingScorer()
        scorer.update_total_score("player1", 50)
        assert scorer.get_total_score("player1") == 50

    def test_accumulate_scores(self):
        """Test that scores accumulate correctly."""
        scorer = SkullKingScorer()
        scorer.update_total_score("player1", 30)
        scorer.update_total_score("player1", 20)
        scorer.update_total_score("player1", -10)
        assert scorer.get_total_score("player1") == 40

    def test_negative_scores(self):
        """Test that negative scores are handled correctly."""
        scorer = SkullKingScorer()
        scorer.update_total_score("player1", -30)
        assert scorer.get_total_score("player1") == -30

    def test_multiple_players(self):
        """Test tracking scores for multiple players."""
        scorer = SkullKingScorer()
        scorer.update_total_score("player1", 50)
        scorer.update_total_score("player2", 40)
        assert scorer.get_total_score("player1") == 50
        assert scorer.get_total_score("player2") == 40

    def test_unknown_player_returns_zero(self):
        """Test that unknown players return 0."""
        scorer = SkullKingScorer()
        assert scorer.get_total_score("unknown_player") == 0


class TestScoreBreakdown:
    """Tests for score breakdown transparency."""

    def test_breakdown_contains_all_info(self):
        """Test that breakdown contains all required information."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score(
            player_id="player1",
            hand_number=2,
            bid=3,
            tricks_taken=3,
        )
        assert breakdown.player_id == "player1"
        assert breakdown.hand_number == 2
        assert breakdown.bid == 3
        assert breakdown.tricks_taken == 3
        assert breakdown.is_exact is True
        assert len(breakdown.notes) > 0

    def test_breakdown_notes_for_exact_nonzero(self):
        """Test breakdown notes for exact non-zero bid."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score("p1", 1, 2, 2)
        assert "exactly met" in breakdown.notes.lower()
        assert "20" in breakdown.notes or "10" in breakdown.notes

    def test_breakdown_notes_for_missed_bid(self):
        """Test breakdown notes for missed bid."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score("p1", 1, 3, 1)
        assert "failed" in breakdown.notes.lower()
        assert "2" in breakdown.notes  # 2 trick difference

    def test_breakdown_notes_for_zero_bid_exact(self):
        """Test breakdown notes for exact zero bid."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score("p1", 1, 0, 0)
        assert "zero bid" in breakdown.notes.lower()
        assert "exactly met" in breakdown.notes.lower()

    def test_breakdown_notes_for_zero_bid_failed(self):
        """Test breakdown notes for failed zero bid."""
        scorer = SkullKingScorer()
        breakdown = scorer.calculate_hand_score("p1", 1, 0, 1)
        assert "zero bid" in breakdown.notes.lower()
        assert "failed" in breakdown.notes.lower()

    def test_history_tracking(self):
        """Test that score history is tracked."""
        scorer = SkullKingScorer()
        scorer.calculate_hand_score("p1", 1, 2, 2)
        scorer.calculate_hand_score("p1", 2, 0, 0)
        scorer.calculate_hand_score("p2", 1, 3, 3)
        
        p1_history = scorer.get_player_history("p1")
        assert len(p1_history) == 2
        assert p1_history[0].bid == 2
        assert p1_history[1].bid == 0
        
        p2_history = scorer.get_player_history("p2")
        assert len(p2_history) == 1
        assert p2_history[0].bid == 3


class TestErrorHandling:
    """Tests for error handling."""

    def test_negative_bid_raises_error(self):
        """Test that negative bids raise ValueError."""
        scorer = SkullKingScorer()
        with pytest.raises(ValueError, match="negative"):
            scorer.calculate_hand_score("p1", 1, -1, 0)

    def test_negative_tricks_raises_error(self):
        """Test that negative tricks taken raises ValueError."""
        scorer = SkullKingScorer()
        with pytest.raises(ValueError, match="negative"):
            scorer.calculate_hand_score("p1", 1, 2, -1)


class TestIntegration:
    """Integration tests for complete scoring scenarios."""

    def test_complete_game_scenario(self):
        """Test a complete game with multiple hands and players."""
        scorer = SkullKingScorer()
        
        # Hand 1: Player 1 bids 2, takes 2 (exact)
        b1 = scorer.calculate_hand_score("p1", 1, 2, 2)
        scorer.update_total_score("p1", b1.total_score)
        
        # Hand 1: Player 2 bids 0, takes 0 (exact)
        b2 = scorer.calculate_hand_score("p2", 1, 0, 0)
        scorer.update_total_score("p2", b2.total_score)
        
        # Hand 2: Player 1 bids 3, takes 1 (missed)
        b3 = scorer.calculate_hand_score("p1", 2, 3, 1)
        scorer.update_total_score("p1", b3.total_score)
        
        # Hand 2: Player 2 bids 1, takes 1 (exact)
        b4 = scorer.calculate_hand_score("p2", 2, 1, 1)
        scorer.update_total_score("p2", b4.total_score)
        
        # Check totals
        # P1: 90 (hand 1 exact) + (-20 from 2 trick diff in hand 2) = 70
        assert scorer.get_total_score("p1") == 70
        
        # P2: 10 (hand 1 exact zero bid) + 30 (hand 2 exact 1 trick) = 40
        assert scorer.get_total_score("p2") == 40

    def test_reset_scores(self):
        """Test that reset clears all scores and history."""
        scorer = SkullKingScorer()
        scorer.calculate_hand_score("p1", 1, 2, 2)
        scorer.update_total_score("p1", 90)
        
        assert len(scorer.score_history) == 1
        assert scorer.get_total_score("p1") == 90
        
        scorer.reset()
        
        assert len(scorer.score_history) == 0
        assert scorer.get_total_score("p1") == 0
