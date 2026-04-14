/**
 * RoundScoringForm Component
 * Form for entering bid and trick results, uses scoring engine
 */

import React, { useState } from 'react';
import { calculateHandScore } from './js/scoring';

interface ScoringFormProps {
  handNumber: number;
  onSubmit: (score: any) => void;
}

const RoundScoringForm: React.FC<ScoringFormProps> = ({ handNumber, onSubmit }) => {
  const [bid, setBid] = useState(0);
  const [tricks, setTricks] = useState(0);
  const [bonus, setBonus] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use scoring engine to calculate hand score
    const score = calculateHandScore(bid, tricks, handNumber, bonus);
    onSubmit(score);
  };

  return (
    <form onSubmit={handleSubmit} className="round-scoring-form">
      <h3>Hand {handNumber}</h3>
      
      <div className="form-group">
        <label htmlFor="bid">Bid:</label>
        <input
          id="bid"
          type="number"
          value={bid}
          onChange={(e) => setBid(parseInt(e.target.value) || 0)}
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="tricks">Tricks Won:</label>
        <input
          id="tricks"
          type="number"
          value={tricks}
          onChange={(e) => setTricks(parseInt(e.target.value) || 0)}
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="bonus">Bonus Points:</label>
        <input
          id="bonus"
          type="number"
          value={bonus}
          onChange={(e) => setBonus(parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>

      <button type="submit">Submit Hand</button>
    </form>
  );
};

export default RoundScoringForm;
