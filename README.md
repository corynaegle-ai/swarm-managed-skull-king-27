# Skull King Game

A multiplayer trick-taking card game implementation built with React and TypeScript.

## Features

- **Game Flow**: Turn-based gameplay with bidding and playing phases
- **Score Display**: Real-time standings with round history and rankings
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Round Management**: Automatic round progression and score calculation

## Project Structure

```
src/
├── components/
│   ├── ScoreDisplay.tsx      # Score display component
│   ├── GameFlow.tsx          # Game flow management
│   ├── BiddingPhase.tsx      # Bidding phase UI
│   ├── PlayPhase.tsx         # Play phase UI
│   └── ...
├── types/
│   └── index.ts              # TypeScript type definitions
├── styles/
│   └── index.css             # Global styles
└── App.tsx
```

## Getting Started

```bash
npm install
npm start
```

## Testing

```bash
npm test
```

## Score Display

The Score Display component shows:
- Current total scores for all players
- Score breakdown by round
- Final rankings at game end
- Clear indication of the current leader
- Responsive design for all device sizes
