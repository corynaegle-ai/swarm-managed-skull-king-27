# Skull King Round Scoring Interface

This implementation provides a complete Round Scoring Interface for the Skull King card game scorekeeper application.

## Features

### Round Scoring Component (RoundScoringView)

- **Player Bid Display**: Shows each player's bid clearly at the top of their scoring section
- **Tricks Taken Input**: Allows entry of tricks taken (0 to hand count) with validation
- **Bonus Points Input**: Allows entry of bonus points with default value of 0
- **Real-time Score Calculation**: Automatically calculates scores as data is entered
- **Form Validation**: Prevents advancing to next round until all player data is entered
- **Visual Feedback**: Displays calculated score for each player in real-time

## Scoring Rules

The component implements Skull King scoring rules:

- **Match Bid**: If tricks taken equals bid → Score = 10 + tricks taken
- **Miss Bid**: If tricks taken does not equal bid → Score = -bid
- **Bonus Points**: Added to base score

## File Structure

```
src/
├── components/
│   ├── RoundScoring/
│   │   ├── RoundScoringView.tsx          # Main scoring interface component
│   │   └── RoundScoringView.test.tsx     # Comprehensive test suite
│   └── ui/
│       ├── card.tsx                       # Card UI components
│       ├── button.tsx                     # Button UI component
│       ├── input.tsx                      # Input UI component
│       ├── label.tsx                      # Label UI component
│       └── use-toast.tsx                  # Toast notification hook
├── types/
│   └── game.ts                            # TypeScript type definitions
└── README.md                              # This file
```

## Usage

```tsx
import { RoundScoringView } from '@/components/RoundScoring/RoundScoringView';

<RoundScoringView
  round={currentRound}
  players={players}
  handCount={13}
  onNextRound={(scoringData) => {
    // Handle scoring completion
  }}
  onCancel={() => {
    // Handle cancellation
  }}
/>
```

## Acceptance Criteria Status

All acceptance criteria have been satisfied:

1. ✅ **Shows each player's bid clearly during scoring** - Bid displayed in top-right corner of each player section
2. ✅ **Allows entry of tricks taken (0 to hand count)** - Number input with min/max validation
3. ✅ **Allows entry of bonus points (defaults to 0)** - Number input defaulting to 0
4. ✅ **Calculates scores in real-time as data is entered** - Score updates immediately on input change
5. ✅ **Prevents advancing to next round until all data entered** - Next Round button disabled until all tricks filled

## Testing

A comprehensive test suite is included covering:

- Component rendering with player data
- Input validation (tricks within hand count)
- Real-time score calculation
- Form validation and button state
- User interactions (click handlers)
- Edge cases (no match bid, bonus points)

## Implementation Notes

- Built with React and TypeScript for type safety
- Uses Tailwind CSS for styling (responsive design)
- Includes accessible form labels and ARIA attributes
- Toast notifications for user feedback
- No external dependencies beyond React
