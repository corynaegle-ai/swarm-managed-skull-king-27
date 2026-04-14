"""Bid collection module for Skull King card game.

Handles collecting and validating bids from all players before each round.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class PlayerBid:
    """Represents a player's bid for a round."""
    player_name: str
    bid_amount: int
    confirmed: bool = False


class BidCollector:
    """Manages bid collection for a round in Skull King."""

    def __init__(self, players: List[str], round_number: int):
        """Initialize bid collector for a round.
        
        Args:
            players: List of player names
            round_number: Current round number (also equals hand count)
        
        Raises:
            ValueError: If no players provided or invalid round number
        """
        if not players:
            raise ValueError("At least one player is required")
        if round_number < 1:
            raise ValueError("Round number must be at least 1")
        
        self.players = players
        self.round_number = round_number
        self.hand_count = round_number  # Round number equals hand count
        self.bids: Dict[str, PlayerBid] = {}
        self.bid_order = []
        
    def display_round_info(self) -> str:
        """Display current round and hand count information.
        
        Returns:
            Formatted string showing round and hand count
        """
        return f"\n{'='*50}\nROUND {self.round_number} - {self.hand_count} HANDS\n{'='*50}\n"
    
    def collect_bids(self) -> Dict[str, int]:
        """Collect bids from all players with validation and modification support.
        
        Returns:
            Dictionary mapping player names to their final confirmed bids
        
        Raises:
            ValueError: If bid collection is interrupted
        """
        print(self.display_round_info())
        
        # Initial bid collection phase
        while len(self.bids) < len(self.players):
            for player in self.players:
                if player not in self.bids:
                    self._collect_bid_from_player(player)
        
        # Confirmation and modification phase
        return self._confirm_and_finalize_bids()
    
    def _collect_bid_from_player(self, player: str) -> None:
        """Collect a single bid from a player with validation.
        
        Args:
            player: Player name
        
        Raises:
            ValueError: If bid input is invalid
        """
        while True:
            try:
                bid_str = input(f"Enter bid for {player} (0-{self.hand_count}): ").strip()
                bid = int(bid_str)
                
                if bid < 0 or bid > self.hand_count:
                    print(f"❌ Invalid bid! Bid must be between 0 and {self.hand_count}.")
                    continue
                
                self.bids[player] = PlayerBid(player_name=player, bid_amount=bid, confirmed=False)
                print(f"✓ {player} bid: {bid}")
                break
                
            except ValueError:
                print("❌ Please enter a valid number.")
    
    def _confirm_and_finalize_bids(self) -> Dict[str, int]:
        """Allow players to review and modify bids, then finalize.
        
        Returns:
            Dictionary of confirmed bids
        """
        while True:
            # Display current bids
            self._display_bid_summary()
            
            # Ask for confirmation or modifications
            response = input("\nConfirm all bids? (yes/no) or enter player name to modify: ").strip().lower()
            
            if response == 'yes':
                # Mark all as confirmed and return
                for bid in self.bids.values():
                    bid.confirmed = True
                return {name: bid.bid_amount for name, bid in self.bids.items()}
            
            elif response == 'no':
                # Ask which player to modify
                player_to_modify = input("Enter player name to modify (or 'cancel' to keep reviewing): ").strip()
                if player_to_modify.lower() != 'cancel':
                    if player_to_modify in self.bids:
                        self._modify_bid(player_to_modify)
                    else:
                        print(f"❌ Player '{player_to_modify}' not found.")
            
            elif response in self.bids:
                # Directly modify specified player
                self._modify_bid(response)
            
            else:
                print("❌ Invalid response. Please enter 'yes', 'no', or a player name.")
    
    def _modify_bid(self, player: str) -> None:
        """Modify a player's bid.
        
        Args:
            player: Player name to modify
        """
        current_bid = self.bids[player].bid_amount
        print(f"\nModifying bid for {player} (current bid: {current_bid})")
        
        while True:
            try:
                new_bid_str = input(f"Enter new bid for {player} (0-{self.hand_count}): ").strip()
                new_bid = int(new_bid_str)
                
                if new_bid < 0 or new_bid > self.hand_count:
                    print(f"❌ Invalid bid! Bid must be between 0 and {self.hand_count}.")
                    continue
                
                self.bids[player] = PlayerBid(
                    player_name=player,
                    bid_amount=new_bid,
                    confirmed=False
                )
                print(f"✓ {player}'s bid updated to: {new_bid}")
                break
                
            except ValueError:
                print("❌ Please enter a valid number.")
    
    def _display_bid_summary(self) -> None:
        """Display a summary of all current bids."""
        print("\n" + "-" * 50)
        print("BID SUMMARY:")
        print("-" * 50)
        for player in self.players:
            if player in self.bids:
                bid = self.bids[player].bid_amount
                status = "✓" if self.bids[player].confirmed else " "
                print(f"{status} {player:15} | Bid: {bid:2} / {self.hand_count}")
            else:
                print(f"  {player:15} | Bid: NOT SET")
        print("-" * 50)
    
    def get_final_bids(self) -> Dict[str, int]:
        """Get the final confirmed bids.
        
        Returns:
            Dictionary mapping player names to confirmed bid amounts
        """
        if len(self.bids) < len(self.players):
            raise ValueError("Not all players have submitted bids")
        
        return {name: bid.bid_amount for name, bid in self.bids.items()}
