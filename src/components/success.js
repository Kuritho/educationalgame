import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success = ({ restartGame }) => {
  const navigate = useNavigate();
  
  return (
    <div className="success-container">
      <h1>Congratulations! 🎉</h1>
      <p>You've completed all phases of Reading Adventure!</p>
      <div className="button-group">
        <button onClick={restartGame} className="success-button">
          Play Again
        </button>
        <button onClick={() => navigate('/game')} className="success-button">
          Back to Game
        </button>
      </div>
    </div>
  );
};

export default Success;