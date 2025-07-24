import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Reading Adventure</h1>
        <p>Learn while having fun!</p>
        <Link to="/login" className="start-button">
          Start Game
        </Link>
      </div>
      <div className="game-description">
        <h2>How to Play</h2>
        <ul>
          <li>Match letters to pictures</li>
          <li>Complete all phases</li>
          <li>You have 5 lives</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;