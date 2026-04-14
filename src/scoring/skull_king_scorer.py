"""Skull King Game Scoring Engine.

Implements complex scoring rules for the Skull King card game:
- Non-zero bids: +20 per correct trick, -10 per difference
- Zero bids: +10×hands if exact, -10×hands if any tricks taken
- Bonuses only apply when bid is exactly met
"""

from dataclasses import dataclass
from typing import List, Dict, Optional


@dataclass
class ScoreBreakdown:
    """Transparent score breakdown for a single round."""
    player_id: str
    hand_number: int
    bid: int
    tricks_taken: int
    base_score: int
    bonus_score: int = 0
    total_score: int = 0
    is_exact: bool = False
    notes: str = ""


class SkullKingScorer:
    """Calculates Skull King scores with transparent breakdowns."""

    def __init__(self):
        """Initialize the scorer."""
        self.player_scores: Dict[str, int] = {}
        self.score_history: List[ScoreBreakdown] = []

    def calculate_hand_score(
        self,
        player_id: str,
        hand_number: int,
        bid: int,
        tricks_taken: int,
    ) -> ScoreBreakdown:
        """Calculate score for a single hand.
        
        Args:
            player_id: Unique identifier for the player
            hand_number: Hand/round number (1-indexed)
            bid: Number of tricks player bid to take
            tricks_taken: Actual number of tricks taken
            
        Returns:
            ScoreBreakdown with detailed score information
            
        Raises:
            ValueError: If bid or tricks_taken are negative
        """
        if bid < 0:
            raise ValueError("Bid cannot be negative")
        if tricks_taken < 0:
            raise ValueError("Tricks taken cannot be negative")

        is_exact = bid == tricks_taken
        base_score = 0
        bonus_score = 0
        notes = ""

        if bid == 0:
            # Zero bid scoring: ±10 per hand
            if is_exact:
                # Exactly correct: +10 × hand number
                base_score = 10 * hand_number
                notes = f"Zero bid exactly met: +10 × {hand_number} hands"
            else:
                # Took any tricks: -10 × hand number
                base_score = -10 * hand_number
                notes = f"Zero bid failed (took {tricks_taken} tricks): -10 × {hand_number} hands"
        else:
            # Non-zero bid scoring
            if is_exact:
                # Exactly correct: +20 per trick
                base_score = 20 * bid
                bonus_score = 10 * bid  # Bonus only when exact
                notes = f"Bid exactly met ({bid} tricks): +20 × {bid} + bonus +10 × {bid}"
            else:
                # Failed: -10 per trick difference
                difference = abs(bid - tricks_taken)
                base_score = -10 * difference
                notes = f"Bid failed by {difference} tricks: -10 × {difference}"

        total_score = base_score + bonus_score

        breakdown = ScoreBreakdown(
            player_id=player_id,
            hand_number=hand_number,
            bid=bid,
            tricks_taken=tricks_taken,
            base_score=base_score,
            bonus_score=bonus_score,
            total_score=total_score,
            is_exact=is_exact,
            notes=notes,
        )

        self.score_history.append(breakdown)
        return breakdown

    def update_total_score(self, player_id: str, points: int) -> None:
        """Update total score for a player.
        
        Args:
            player_id: Player identifier
            points: Points to add (can be negative)
        """
        if player_id not in self.player_scores:
            self.player_scores[player_id] = 0
        self.player_scores[player_id] += points

    def get_total_score(self, player_id: str) -> int:
        """Get total accumulated score for a player.
        
        Args:
            player_id: Player identifier
            
        Returns:
            Total score, or 0 if player not found
        """
        return self.player_scores.get(player_id, 0)

    def get_player_history(self, player_id: str) -> List[ScoreBreakdown]:
        """Get score history for a specific player.
        
        Args:
            player_id: Player identifier
            
        Returns:
            List of score breakdowns for this player
        """
        return [record for record in self.score_history if record.player_id == player_id]

    def reset(self) -> None:
        """Reset all scores and history."""
        self.player_scores.clear()
        self.score_history.clear()
