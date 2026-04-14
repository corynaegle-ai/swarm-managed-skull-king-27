import { useState, useCallback, useEffect } from 'react';

interface BidState {
  [playerId: string]: number | null;
}

interface BidConfirmationState {
  [playerId: string]: boolean;
}

interface UseBidCollectionResult {
  bids: BidState;
  confirmed: BidConfirmationState;
  setBid: (playerId: string, bid: number | null) => void;
  confirmBid: (playerId: string) => void;
  modifyBid: (playerId: string) => void;
  allBidsConfirmed: boolean;
  resetBids: () => void;
  getBidsAsObject: () => Record<string, number>;
}

export const useBidCollection = (playerIds: string[]): UseBidCollectionResult => {
  const [bids, setBids] = useState<BidState>(() => {
    const initialBids: BidState = {};
    playerIds.forEach((id) => {
      initialBids[id] = null;
    });
    return initialBids;
  });

  const [confirmed, setConfirmed] = useState<BidConfirmationState>(() => {
    const initialConfirmed: BidConfirmationState = {};
    playerIds.forEach((id) => {
      initialConfirmed[id] = false;
    });
    return initialConfirmed;
  });

  // Update state when player IDs change
  useEffect(() => {
    const newBids: BidState = {};
    const newConfirmed: BidConfirmationState = {};
    playerIds.forEach((id) => {
      newBids[id] = bids[id] ?? null;
      newConfirmed[id] = confirmed[id] ?? false;
    });
    setBids(newBids);
    setConfirmed(newConfirmed);
  }, [playerIds]); // Re-run when playerIds array changes

  const setBid = useCallback((playerId: string, bid: number | null) => {
    setBids((prev) => ({ ...prev, [playerId]: bid }));
    setConfirmed((prev) => ({ ...prev, [playerId]: false }));
  }, []);

  const confirmBid = useCallback((playerId: string) => {
    setConfirmed((prev) => ({ ...prev, [playerId]: true }));
  }, []);

  const modifyBid = useCallback((playerId: string) => {
    setConfirmed((prev) => ({ ...prev, [playerId]: false }));
  }, []);

  const resetBids = useCallback(() => {
    const newBids: BidState = {};
    const newConfirmed: BidConfirmationState = {};
    playerIds.forEach((id) => {
      newBids[id] = null;
      newConfirmed[id] = false;
    });
    setBids(newBids);
    setConfirmed(newConfirmed);
  }, [playerIds]);

  const allBidsConfirmed = playerIds.every(
    (id) => bids[id] !== null && confirmed[id] === true
  );

  const getBidsAsObject = useCallback(() => {
    const result: Record<string, number> = {};
    playerIds.forEach((id) => {
      if (bids[id] !== null) {
        result[id] = bids[id] as number;
      }
    });
    return result;
  }, [bids, playerIds]);

  return {
    bids,
    confirmed,
    setBid,
    confirmBid,
    modifyBid,
    allBidsConfirmed,
    resetBids,
    getBidsAsObject,
  };
};
