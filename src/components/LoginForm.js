import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const LoginForm = ({ setUser }) => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setUser({ name, isGuest: false });
      navigate('/game');
    }
  };

  const handleGuestLogin = () => {
    setUser({ name: 'Guest', isGuest: true });
    navigate('/game');
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Enter Your Name</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
          className="name-input"
        />
        <button type="submit" className="login-button">
          Start Game
        </button>
        <button 
          type="button" 
          onClick={handleGuestLogin}
          className="guest-button"
        >
          Play as Guest
        </button>
      </form>
    </div>
  );
};

export default LoginForm;