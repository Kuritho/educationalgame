import React, { useState } from 'react';
import LivesCounter from './LivesCounter';
import '../styles.css';

const GameLayout = ({ user, onLogout, onRestart, children }) => {
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const handleRestartClick = () => {
    setShowRestartConfirm(true);
  };

  const confirmRestart = () => {
    onRestart();
    setShowRestartConfirm(false);
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="player-info">
          <div className="user-name">{user.name}</div>
          <div className="user-status">
            {user.isGuest ? (
              <span className="guest-badge">Guest Player</span>
            ) : (
              <span className="user-badge">Registered Player</span>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleRestartClick} 
            className="action-button restart-button"
          >
            <svg className="button-icon" viewBox="0 0 24 24">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
            Restart Game
          </button>
          
          <button 
            onClick={onLogout} 
            className="action-button logout-button"
          >
            <svg className="button-icon" viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </button>
        </div>

        <div className="game-status">
          <LivesCounter lives={5} />
        </div>
      </header>

      {showRestartConfirm && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <div className="dialog-icon">⟳</div>
            <h3>Restart Game?</h3>
            <p>All progress will be reset to Phase 1</p>
            <div className="dialog-buttons">
              <button 
                onClick={confirmRestart} 
                className="dialog-button confirm-button"
              >
                Yes, Restart
              </button>
              <button 
                onClick={() => setShowRestartConfirm(false)} 
                className="dialog-button cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="game-content">
        {children}
      </main>
    </div>
  );
};

export default GameLayout;