import { validateBid } from "../BidValidator";

describe("BidValidator", () => {
  describe("validateBid", () => {
    it("should return error for NaN input (abc)", () => {
      const result = validateBid("abc", 5);
      expect(result.valid).toBe(false);
      expect(result.value).toBe(0);
      expect(result.error).toBe("Bid must be a number");
    });

    it("should return error for empty string", () => {
      const result = validateBid("", 5);
      expect(result.valid).toBe(false);
      expect(result.value).toBe(0);
      expect(result.error).toBe("Bid must be a number");
    });

    it("should return error for negative number", () => {
      const result = validateBid("-1", 5);
      expect(result.valid).toBe(false);
      expect(result.value).toBe(0);
      expect(result.error).toBe("Bid cannot be negative");
    });

    it("should return error when bid exceeds handCount", () => {
      const result = validateBid("6", 5);
      expect(result.valid).toBe(false);
      expect(result.value).toBe(0);
      expect(result.error).toBe("Bid cannot exceed 5");
    });

    it("should return valid result for valid bid", () => {
      const result = validateBid("3", 5);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(3);
      expect(result.error).toBeUndefined();
    });

    it("should return valid result for zero bid", () => {
      const result = validateBid("0", 5);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(0);
      expect(result.error).toBeUndefined();
    });
  });
});
