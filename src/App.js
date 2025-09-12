import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import GameLayout from './components/GameLayout';
import Phase1 from './components/Phase1';
import Phase2 from './components/Phase2';
import Phase3 from './components/Phase3';
import Phase4 from './components/Phase4';
import Phase5 from './components/Phase5';
import Phase6 from './components/Phase6';
import Phase7 from './components/Phase7';
import GameOver from './components/GameOver';
import Success from './components/success';
import { usePersistedState } from './hooks/usePersistedState';
import { AudioProvider } from './components/AudioContext';
import './styles.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>Please try restarting the app</p>
          <button onClick={() => window.location.reload()}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [user, setUser] = usePersistedState('gameUser', null);
  const [lives, setLives] = usePersistedState('gameLives', 5);
  const [currentPhase, setCurrentPhase] = usePersistedState('currentPhase', 1);
  const [gameOver, setGameOver] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const loseLife = () => {
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives <= 0) {
      setGameOver(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gameUser');
    localStorage.removeItem('gameLives');
    localStorage.removeItem('currentPhase');
    setUser(null);
    setLives(5);
    setCurrentPhase(1);
    setGameOver(false);
    setGameCompleted(false);
  };

  const resetGame = () => {
    setLives(5);
    setCurrentPhase(1);
    setGameOver(false);
    setGameCompleted(false);
    
    // Clear all phase-specific persisted states
    localStorage.removeItem('phase3_round');
    localStorage.removeItem('phase3_selectedCells');
    localStorage.removeItem('phase3_completedItems');
    localStorage.removeItem('phase4_position');
    localStorage.removeItem('phase5_choices');
    localStorage.removeItem('phase6_levels');
    localStorage.removeItem('phase7_timer');
  };

  const completeGame = () => {
    setGameCompleted(true);
  };

  if (!user) {
    return (
      <AudioProvider>
        <Router>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginForm setUser={setUser} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ErrorBoundary>
        </Router>
      </AudioProvider>
    );
  }

  return (
    <AudioProvider>
      <Router>
        <ErrorBoundary>
          <Routes>
            <Route 
              path="/game" 
              element={
                <GameLayout 
                  user={user}
                  onLogout={handleLogout}
                  onRestart={resetGame}
                  lives={lives}
                >
                  {gameOver ? (
                    <GameOver restartGame={resetGame} />
                  ) : gameCompleted ? (
                    <Success restartGame={resetGame} />
                  ) : (
                    <>
                      {currentPhase === 1 && <Phase1 proceed={() => setCurrentPhase(2)} loseLife={loseLife} />}
                      {currentPhase === 2 && <Phase2 proceed={() => setCurrentPhase(3)} loseLife={loseLife} />}
                      {currentPhase === 3 && <Phase3 proceed={() => setCurrentPhase(4)} loseLife={loseLife} />}
                      {currentPhase === 4 && <Phase4 proceed={() => setCurrentPhase(5)} loseLife={loseLife} />}
                      {currentPhase === 5 && <Phase5 proceed={() => setCurrentPhase(6)} loseLife={loseLife} />}
                      {currentPhase === 6 && <Phase6 proceed={() => setCurrentPhase(7)} loseLife={loseLife} />}
                      {currentPhase === 7 && <Phase7 proceed={completeGame} loseLife={loseLife} />}
                    </>
                  )}
                </GameLayout>
              } 
            />
            <Route path="/success" element={<Success restartGame={resetGame} />} />
            <Route path="/gameover" element={<GameOver restartGame={resetGame} />} />
            <Route path="*" element={<Navigate to="/game" />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </AudioProvider>
  );
};

export default App;
