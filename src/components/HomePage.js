import React from 'react';
import { Link } from 'react-router-dom';
import './styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="forest-theme">
      {/* Forest background layers */}
      <div className="forest-layer trees-deep"></div>
      <div className="forest-layer trees-mid"></div>
      <div className="forest-layer trees-front"></div>
      <div className="forest-layer ground"></div>
      
      {/* Animated forest creatures */}
      <div className="forest-creature owl animate-float"></div>
      <div className="forest-creature fox animate-float-delay"></div>
      
      <div className="home-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title animate-pop-in">Reading Adventure</h1>
            <p className="hero-subtitle animate-pop-in">Journey through the magical reading!</p>
            <div className="cta-container animate-pop-in">
              <Link to="/login" className="start-button forest-btn">
                <span className="button-text">Begin Adventure</span>
                <span className="button-icon">🌳</span>
              </Link>
              <div className="hero-features">
                <span className="feature-bubble">Educational</span>
                <span className="feature-bubble">Interactive</span>
                <span className="feature-bubble">Reading</span>
                <span className="feature-bubble">Verbal</span>
                <span className="feature-bubble">Fun</span>
              </div>
            </div>
          </div>
          <div className="hero-illustration animate-float">
            <div className="reading-bear"></div>
          </div>
        </div>
        
        <div className="section game-description forest-section">
          <h2 className="section-title animate-slide-up">How to Play</h2>
          <div className="steps-container">
            <div className="step-card animate-card-1 forest-card">
              <div className="step-icon">1</div>
              <h3>Match Letters</h3>
              <p>Help the owl find letters in the trees</p>
              <div className="card-decoration acorn"></div>
            </div>
            <div className="step-card animate-card-2 forest-card">
              <div className="step-icon">2</div>
              <h3>Complete Phases</h3>
              <p>Follow the fox through the forest path</p>
              <div className="card-decoration leaf"></div>
            </div>
            <div className="step-card animate-card-3 forest-card">
              <div className="step-icon">3</div>
              <h3>Manage Lives</h3>
              <p>Collect 5 magical berries to stay safe</p>
              <div className="card-decoration berry"></div>
            </div>
          </div>
        </div>
        
        <div className="section testimonial-section forest-section">
          <h2 className="section-title animate-slide-up">What Players Say</h2>
          <div className="testimonial-card animate-pop-in forest-card">
            <div className="testimonial-decoration"></div>
            <p>"My child improved their reading skills dramatically!"</p>
            <div className="testimonial-author">- Kurt</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;