import React from 'react';
import '../styles.css';

const GameOver = ({ restartGame }) => {
  return (
    <div className="game-over-screen">
      <h1>Game Over!</h1>
      <p>You've used all your lives.</p>
      <button onClick={restartGame} className="restart-button">
        Play Again
      </button>
    </div>
  );
};

export default GameOver;