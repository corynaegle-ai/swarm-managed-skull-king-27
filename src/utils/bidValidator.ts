/**
 * Validates a bid against the hand count for the current round
 * @param bid - The bid value to validate (can be null or undefined)
 * @param handCount - The number of hands available (equals round number)
 * @returns An error message if invalid, empty string if valid
 */
export const validateBid = (bid: number | null | undefined, handCount: number): string => {
  // Check if bid is missing
  if (bid === null || bid === undefined || bid === '') {
    return 'Bid is required';
  }

  // Convert to number for additional validation
  const bidValue = Number(bid);

  // Check if conversion resulted in a valid number
  if (isNaN(bidValue)) {
    return 'Bid must be a valid number';
  }

  // Check if it's a negative number
  if (bidValue < 0) {
    return 'Bid cannot be negative';
  }

  // Check if it's an integer
  if (!Number.isInteger(bidValue)) {
    return 'Bid must be a whole number';
  }

  // Check if bid exceeds hand count
  if (bidValue > handCount) {
    return `Bid cannot exceed ${handCount} hands available in this round`;
  }

  return '';
};

/**
 * Validates all bids for a round
 * @param bids - Object mapping player IDs to their bids
 * @param handCount - The number of hands available (equals round number)
 * @returns Object mapping player IDs to error messages (empty object if all valid)
 */
export const validateAllBids = (
  bids: Record<string, number | null | undefined>,
  handCount: number
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(bids).forEach(([playerId, bid]) => {
    const error = validateBid(bid, handCount);
    if (error) {
      errors[playerId] = error;
    }
  });

  return errors;
};

/**
 * Checks if all players have submitted valid bids
 * @param bids - Object mapping player IDs to their bids
 * @param handCount - The number of hands available (equals round number)
 * @returns true if all bids are valid and present, false otherwise
 */
export const areAllBidsValid = (
  bids: Record<string, number | null | undefined>,
  handCount: number
): boolean => {
  return Object.values(bids).every((bid) => validateBid(bid, handCount) === '');
};
