import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Phase1 from './components/Phase1';
import Phase2 from './components/Phase2';
import Phase3 from './components/Phase3';
import Phase4 from './components/Phase4';
import Phase5 from './components/Phase5';
import Phase6 from './components/Phase6';
import Phase7 from './components/Phase7';
import GameOver from './components/GameOver';
import Congratulations from './components/Congratulations';
import LivesCounter from './components/LivesCounter';
import './styles.css';

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

const App = () => {
  const [lives, setLives] = useState(5);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const navigate = useNavigate();

  // Reset game when lives change to 0
  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true);
    }
  }, [lives]);

  const loseLife = () => {
    setLives(prev => prev - 1);
  };

  const proceedToNextPhase = () => {
    if (currentPhase < 7) {
      setCurrentPhase(prev => prev + 1);
      navigate(`/phase${currentPhase + 1}`);
    } else {
      setGameCompleted(true);
    }
  };

  const resetGame = () => {
    setLives(5);
    setCurrentPhase(1);
    setGameOver(false);
    setGameCompleted(false);
    navigate('/phase1');
  };

  if (gameOver) {
    return <GameOver resetGame={resetGame} />;
  }

  if (gameCompleted) {
    return <Congratulations resetGame={resetGame} />;
  }

  return (
    <div className="game-container">
      <LivesCounter lives={lives} />
      
      <Routes>
        <Route path="/" element={<Navigate to="/phase1" />} />
        <Route path="/phase1" element={<Phase1 proceed={proceedToNextPhase} loseLife={loseLife} />} />
        <Route path="/phase2" element={<Phase2 proceed={proceedToNextPhase} loseLife={loseLife} />} />
        <Route path="/phase3" element={<Phase3 proceed={proceedToNextPhase} loseLife={loseLife} />} />
        <Route path="/phase4" element={<Phase4 proceed={proceedToNextPhase} loseLife={loseLife} />} />
        <Route path="/phase5" element={<Phase5 proceed={proceedToNextPhase} loseLife={loseLife} />} />
        <Route path="/phase6" element={<Phase6 proceed={proceedToNextPhase} loseLife={loseLife} />} />
        <Route path="/phase7" element={<Phase7 proceed={proceedToNextPhase} loseLife={loseLife} />} />
      </Routes>
    </div>
  );
};

export default AppWrapper;