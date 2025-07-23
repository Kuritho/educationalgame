import React from 'react';

const GameOver = ({ resetGame }) => {
  return (
    <div className="game-over">
      <h1>Game Over!</h1>
      <p>You've used all your lives.</p>
      <button onClick={resetGame}>Try Again</button>
    </div>
  );
};

export default GameOver;