# Round Scoring Interface Component

The `RoundScoringInterface` component allows a scorekeeper to enter the actual tricks taken by each player during a round, along with any bonus points earned, and displays calculated scores in real-time.

## Features

- **Clear Bid Display**: Shows each player's bid prominently during scoring
- **Tricks Entry**: Input field for tricks taken with validation (0 to hand count)
- **Bonus Points Entry**: Input field for bonus points with default value of 0
- **Real-Time Calculation**: Scores are calculated and displayed automatically as data is entered
- **Form Validation**: Prevents invalid data entry with helpful error messages
- **Submit Prevention**: Blocks advancement to next round until all required data is entered
- **Accessible**: Proper ARIA labels and keyboard navigation support

## Props

### Required Props

- **`players`** (Array): Array of player objects with `id` and `name` properties
  ```js
  [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' }
  ]
  ```

- **`bids`** (Object): Object mapping player IDs to their bids for the round
  ```js
  { p1: 2, p2: 3 }
  ```

- **`handCount`** (Number): The number of cards in the current hand (max tricks possible)

- **`currentRound`** (Number): The current round number for display

- **`onSubmitScores`** (Function): Callback function called when scores are submitted
  - Receives an array of score objects:
    ```js
    [
      {
        playerId: 'p1',
        bid: 2,
        tricksTaken: 2,
        bonusPoints: 0,
        score: 30
      },
      // ... more players
    ]
    ```

- **`onCancel`** (Function): Callback function called when scoring is cancelled

## Scoring Rules

The component uses Skull King scoring rules:

- **Bid Made** (bid == tricks taken): `10 + (10 × bid) + bonus`
- **Bid Failed** (bid ≠ tricks taken): `-(10 × |bid - tricks|) + bonus`

## Example Usage

```jsx
import RoundScoringInterface from './RoundScoringInterface';

const MyComponent = () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' }
  ];

  const bids = {
    p1: 2,
    p2: 1,
    p3: 3
  };

  const handleSubmit = (scores) => {
    console.log('Round scores:', scores);
    // Update game state with scores
  };

  const handleCancel = () => {
    // Return to bid entry or game menu
  };

  return (
    <RoundScoringInterface
      players={players}
      bids={bids}
      handCount={5}
      currentRound={3}
      onSubmitScores={handleSubmit}
      onCancel={handleCancel}
    />
  );
};
```

## Validation Rules

1. **Tricks Taken**:
   - Must be a number
   - Must be >= 0
   - Must be <= handCount
   - Required field

2. **Bonus Points**:
   - Must be a number
   - Must be >= 0
   - Defaults to 0 if empty

3. **Form Submission**:
   - All players must have tricks taken and bonus points entered
   - No validation errors for any player
   - Submit button is disabled until all validation passes

## Styling

The component uses the `RoundScoringInterface.css` file for styling. Key classes:

- `.round-scoring-interface`: Main container
- `.scoring-table`: The main scoring table
- `.row-error`: Row highlighting for players with input errors
- `.input-error`: Input field with validation error
- `.score-value`: Displays calculated score (positive/negative styling)
- `.btn-submit`: Submit button (disabled state handled automatically)
- `.btn-cancel`: Cancel button

## Accessibility

The component includes:

- ARIA labels on input fields
- Semantic HTML structure
- Keyboard navigation support
- Focus management
- Clear error messages for validation failures
- Color-blind friendly color schemes with additional visual indicators

## Testing

Comprehensive test suite included in `__tests__/RoundScoringInterface.test.jsx`:

- Rendering and display
- Input validation
- Real-time score calculation
- Form submission behavior
- User interactions
- Edge cases

Run tests with:
```bash
npm test -- RoundScoringInterface.test.jsx
```
