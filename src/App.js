import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import GameLayout from './components/GameLayout';
// import Phase1 from './components/Phase1';
// import Phase2 from './components/Phase2';
// import Phase3 from './components/Phase3';
// import Phase4 from './components/Phase4'; // Added Phase4 import
// import Phase5 from './components/Phase5'; // Added Phase5 import
// import Phase6 from './components/Phase6'; // Import Phase6
import Phase7 from './components/Phase7'; // Import Phase7
import GameOver from './components/GameOver';
import Success from './components/success'; // Recommended to add a success component
import { usePersistedState } from './hooks/usePersistedState';
import './styles.css';

const App = () => {
  const [user, setUser] = usePersistedState('gameUser', null);
  const [lives, setLives] = usePersistedState('gameLives', 5);
  const [currentPhase, setCurrentPhase] = usePersistedState('currentPhase', 1);
  const [gameOver, setGameOver] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false); // Added for completion state

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
    // Clear phase-specific persisted states
    localStorage.removeItem('phase3_round');
    localStorage.removeItem('phase3_selectedCells');
    localStorage.removeItem('phase3_completedItems');
    localStorage.removeItem('phase4_position'); // Clear Phase4 state if needed
  };

  const completeGame = () => {
    setGameCompleted(true);
    // You might want to save completion status or achievements here
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
          // path="/game" 
          // element={
          //   <GameLayout 
          //     user={user} 
          //     onLogout={handleLogout}
          //     onRestart={resetGame}
          //     lives={lives}
          //   >
          //     {gameOver ? (
          //       <GameOver restartGame={resetGame} />
          //     ) : gameCompleted ? (
          //       <Success restartGame={resetGame} /> // Show success screen when game is completed
          //     ) : (
          //       <>
          //         {/* {currentPhase === 1 && <Phase1 proceed={() => setCurrentPhase(2)} loseLife={loseLife} />}
          //         {currentPhase === 2 && <Phase2 proceed={() => setCurrentPhase(3)} loseLife={loseLife} />}
          //         {currentPhase === 3 && <Phase3 proceed={() => setCurrentPhase(4)} loseLife={loseLife} />}
          //         {currentPhase === 4 && <Phase4 proceed={completeGame} loseLife={loseLife} />}
          //         {currentPhase === 5 && <Phase5 proceed={completeGame} loseLife={loseLife} />} */}
          //       </>
          //     )}
          //   </GameLayout>
          // } 
        />
        
        <Route path='/Phase7' element={<Phase7 />} />
        <Route path="/success" element={<Success restartGame={resetGame} />} />
        <Route path="/gameover" element={<GameOver restartGame={resetGame} />} />
        <Route path="*" element={<Navigate to="/game" />} />
      </Routes>
    </Router>
  );
};

export default App;