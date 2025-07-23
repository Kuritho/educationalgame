import React from 'react';

const LivesCounter = ({ lives }) => {
  return (
    <div className="lives-counter">
      <h3>Lives: {Array(lives).fill('❤️').join(' ')}</h3>
    </div>
  );
};

export default LivesCounter;