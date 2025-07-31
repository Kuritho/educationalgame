import React, { useState } from 'react';
import Phase1 from './Phase1';
import Phase2 from './Phase2';
import Phase3 from './Phase3';
import Phase4 from './Phase4'; // Import Phase4
import Phase5 from './Phase5'; // Import Phase5
import LivesCounter from './LivesCounter';
import GameOver from './GameOver';
import GameComplete from './GameComplete';
import './styles.css';

const Game = () => {
  const [lives, setLives] = useState(5); // Start with 5 lives
  const [currentPhase, setCurrentPhase] = useState(1);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'over', or 'complete'

  const loseLife = () => {
    setLives(prevLives => {
      const newLives = prevLives - 1;
      if (newLives <= 0) {
        setGameStatus('over');
      }
      return Math.max(0, newLives); // Ensure lives don't go negative
    });
  };

  const proceedToNextPhase = () => {
    if (currentPhase < 4) {
      setCurrentPhase(prev => prev + 1);
    } else {
      setGameStatus('complete');
    }
  };

  const restartGame = () => {
    setLives(5);
    setCurrentPhase(1);
    setGameStatus('playing');
  };

  const renderPhase = () => {
    if (gameStatus === 'over') return <GameOver onRestart={restartGame} />;
    if (gameStatus === 'complete') return <GameComplete onRestart={restartGame} />;

    switch(currentPhase) {
      case 1:
        return <Phase1 proceed={proceedToNextPhase} loseLife={loseLife} />;
      case 2:
        return <Phase2 proceed={proceedToNextPhase} loseLife={loseLife} />;
      case 3:
        return <Phase3 proceed={proceedToNextPhase} loseLife={loseLife} />;
      case 4:
  return <Phase4 
    proceed={proceedToNextPhase} 
    loseLife={loseLife} 
    lives={lives}  // Pass the lives prop
  />;
      case 5:
        return <Phase5 proceed={proceedToNextPhase} loseLife={loseLife} />;
      default:
        return <GameComplete onRestart={restartGame} />;
    }
  };

  return (
    <div className="game-container">
      {gameStatus === 'playing' && <LivesCounter lives={lives} />}
      {renderPhase()}
    </div>
  );
};

export default Game;