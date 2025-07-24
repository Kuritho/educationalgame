import React from 'react';
import '../styles.css';

const LivesCounter = ({ lives }) => {
  return (
    <div className="lives-counter-container">
      <div className="lives-counter">
        {Array.from({ length: 5 }).map((_, i) => (
          <span 
            key={i} 
            className={`heart ${i < lives ? 'active' : 'lost'}`}
          >
            {i < lives ? '❤️' : '💔'}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LivesCounter;