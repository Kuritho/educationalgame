import React from 'react';
import { useNavigate } from 'react-router-dom';

const Success = ({ restartGame }) => {
  const navigate = useNavigate();
  
  const handleClaimReward = () => {
    // Add your reward claiming logic here
    alert('Congratulations! Your reward has been claimed!');
  };
  
  return (
    <div className="success-container">
      <div className="success-content">
        <div className="celebration-animation">🎉</div>
        <h1>Congratulations! You've Won! 🏆</h1>
        <p className="success-message">You've successfully completed all phases of Reading Adventure!</p>
        <p className="reward-message">Claim your reward for your achievement!</p>
        
        <div className="button-group">
          <button onClick={handleClaimReward} className="success-button reward-button">
            Claim Your Reward
          </button>
          <button onClick={restartGame} className="success-button play-again-button">
            Play Again
          </button>
          <button onClick={() => navigate('/success')} className="success-button home-button">
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;