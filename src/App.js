import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import GameLayout from './components/GameLayout';
import Phase1 from './components/Phase1';
import Phase2 from './components/Phase2';
import Phase3 from './components/Phase3';
import GameOver from './components/GameOver';
import { usePersistedState } from './hooks/usePersistedState';
import './styles.css';

const App = () => {
  const [user, setUser] = usePersistedState('gameUser', null);
  const [lives, setLives] = usePersistedState('gameLives', 5);
  const [currentPhase, setCurrentPhase] = usePersistedState('currentPhase', 1);
  const [gameOver, setGameOver] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('gameUser');
    localStorage.removeItem('gameLives');
    localStorage.removeItem('currentPhase');
    setUser(null);
    setLives(5);
    setCurrentPhase(1);
    setGameOver(false);
  };

  const resetGame = () => {
    setLives(5);
    setCurrentPhase(1);
    setGameOver(false);
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/game" 
          element={
            <GameLayout 
              user={user} 
              onLogout={handleLogout}
              onRestart={resetGame}
            >
              {gameOver ? (
                <GameOver restartGame={resetGame} />
              ) : (
                <>
                  {currentPhase === 1 && <Phase1 proceed={() => setCurrentPhase(2)} loseLife={() => setLives(l => l - 1)} />}
                  {currentPhase === 2 && <Phase2 proceed={() => setCurrentPhase(3)} loseLife={() => setLives(l => l - 1)} />}
                  {currentPhase === 3 && <Phase3 proceed={() => setCurrentPhase(4)} loseLife={() => setLives(l => l - 1)} />}
                </>
              )}
            </GameLayout>
          } 
        />
        <Route path="*" element={<Navigate to="/game" />} />
      </Routes>
    </Router>
  );
};

export default App;