import React from 'react';
import './styles/LivesCounter.css';

const LivesCounter = ({ lives }) => {
  return (
    <div className="lives-counter">
      {Array.from({ length: 5 }).map((_, i) => (
        <div 
          key={i} 
          className={`heart ${i < lives ? 'active' : 'lost'}`}
          aria-label={i < lives ? 'Active life' : 'Lost life'}
        />
      ))}
    </div>
  );
};

export default LivesCounter;