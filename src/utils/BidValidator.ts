export function validateBid(
  input: string,
  handCount: number
): { valid: boolean; value: number; error?: string } {
  const parsed = parseInt(input, 10);
  if (Number.isNaN(parsed))
    return { valid: false, value: 0, error: "Bid must be a number" };
  if (parsed < 0)
    return { valid: false, value: 0, error: "Bid cannot be negative" };
  if (parsed > handCount)
    return {
      valid: false,
      value: 0,
      error: `Bid cannot exceed ${handCount}`,
    };
  return { valid: true, value: parsed };
}
