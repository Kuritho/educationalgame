import React from 'react';

const Congratulations = ({ resetGame }) => {
  return (
    <div className="congratulations">
      <h1>Congratulations! 🎉</h1>
      <p>You've completed all 7 phases!</p>
      <button onClick={resetGame}>Play Again</button>
    </div>
  );
};

export default Congratulations;