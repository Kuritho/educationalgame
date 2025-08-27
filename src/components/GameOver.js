import React, { useEffect } from 'react';
import './styles/GameOver.css';

const GameOver = ({ restartGame }) => {
  useEffect(() => {
    // Create particles
    const particles = [];
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'game-over-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.width = `${Math.random() * 10 + 5}px`;
      particle.style.height = particle.style.width;
      particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      document.querySelector('.game-over-screen').appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

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