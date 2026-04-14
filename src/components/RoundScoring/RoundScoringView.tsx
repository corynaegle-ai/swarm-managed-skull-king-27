import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Round, Player } from '@/types/game';

interface RoundScoringData {
  playerId: string;
  tricksTaken: number | null;
  bonusPoints: number;
  calculatedScore: number;
}

interface RoundScoringViewProps {
  round: Round;
  players: Player[];
  handCount: number;
  onNextRound: (scoringData: RoundScoringData[]) => void;
  onCancel: () => void;
}

export const RoundScoringView: React.FC<RoundScoringViewProps> = ({
  round,
  players,
  handCount,
  onNextRound,
  onCancel,
}) => {
  const { toast } = useToast();
  const [scoringData, setScoringData] = useState<RoundScoringData[]>(() =>
    players.map((player) => ({
      playerId: player.id,
      tricksTaken: null,
      bonusPoints: 0,
      calculatedScore: 0,
    }))
  );

  const playerBids = useMemo(() => {
    const bidsMap: Record<string, number> = {};
    round.bids.forEach((bid) => {
      bidsMap[bid.playerId] = bid.amount;
    });
    return bidsMap;
  }, [round]);

  const handleTricksTakenChange = (playerId: string, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);

    // Validate tricks taken
    if (numValue !== null && (numValue < 0 || numValue > handCount)) {
      toast({
        title: 'Invalid tricks count',
        description: `Tricks taken must be between 0 and ${handCount}`,
        variant: 'destructive',
      });
      return;
    }

    setScoringData((prev) =>
      prev.map((data) => {
        if (data.playerId !== playerId) return data;

        const calculatedScore = calculateScore(
          playerBids[playerId],
          numValue,
          data.bonusPoints
        );

        return {
          ...data,
          tricksTaken: numValue,
          calculatedScore,
        };
      })
    );
  };

  const handleBonusPointsChange = (playerId: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);

    if (isNaN(numValue) || numValue < 0) {
      return;
    }

    setScoringData((prev) =>
      prev.map((data) => {
        if (data.playerId !== playerId) return data;

        const calculatedScore = calculateScore(
          playerBids[playerId],
          data.tricksTaken,
          numValue
        );

        return {
          ...data,
          bonusPoints: numValue,
          calculatedScore,
        };
      })
    );
  };

  const isComplete = scoringData.every((data) => data.tricksTaken !== null);

  const handleNext = () => {
    if (!isComplete) {
      toast({
        title: 'Incomplete scoring',
        description: 'Please enter tricks taken for all players',
        variant: 'destructive',
      });
      return;
    }

    onNextRound(scoringData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Round {round.roundNumber} Scoring</CardTitle>
          <CardDescription>
            Enter the actual tricks taken by each player and any bonus points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {players.map((player) => {
              const playerData = scoringData.find(
                (d) => d.playerId === player.id
              );
              const bid = playerBids[player.id];

              return (
                <div
                  key={player.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{player.name}</h3>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Bid: {bid}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`tricks-${player.id}`}>
                        Tricks Taken (0-{handCount})
                      </Label>
                      <Input
                        id={`tricks-${player.id}`}
                        type="number"
                        min="0"
                        max={handCount}
                        value={playerData?.tricksTaken ?? ''}
                        onChange={(e) =>
                          handleTricksTakenChange(player.id, e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`bonus-${player.id}`}>
                        Bonus Points
                      </Label>
                      <Input
                        id={`bonus-${player.id}`}
                        type="number"
                        min="0"
                        value={playerData?.bonusPoints ?? 0}
                        onChange={(e) =>
                          handleBonusPointsChange(player.id, e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Score</Label>
                      <div className="p-2 bg-gray-100 rounded border text-center font-semibold">
                        {playerData?.calculatedScore ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex gap-2 justify-end pt-6 border-t">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isComplete}
                className={!isComplete ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Next Round
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Calculate score based on Skull King rules:
 * - If tricks taken equals bid: 10 + tricks taken
 * - Otherwise: negative of bid amount
 * - Plus any bonus points
 */
function calculateScore(
  bid: number,
  tricksTaken: number | null,
  bonusPoints: number
): number {
  if (tricksTaken === null) return 0;

  const baseScore = tricksTaken === bid ? 10 + tricksTaken : -bid;
  return baseScore + bonusPoints;
}
