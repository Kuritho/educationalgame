import React, { useState, useEffect } from 'react';
import '../styles.css';

const Phase1 = ({ proceed, loseLife }) => {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [items, setItems] = useState([]);
  const [audio, setAudio] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(false);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const letterItems = {
    A: ['Apple', 'Ant', 'Airplane', 'Alligator'],
    B: ['Banana', 'Bear', 'Ball', 'Butterfly'],
    C: ['Cat', 'Car', 'Cake', 'Cow'],
    // Add more letters and items as needed
    D: ['Dog', 'Dolphin', 'Duck', 'Dinosaur'],
    E: ['Elephant', 'Egg', 'Eagle', 'Engine'],
    F: ['Fish', 'Flower', 'Frog', 'Fox']
  };

  const audioFiles = {
    'Apple': 'apple.mp3',
    'Ant': 'ant.mp3',
    'Airplane': 'airplane.mp3',
    // Add paths to your audio files
    'Banana': 'banana.mp3',
    'Bear': 'bear.mp3'
    // Continue for all items...
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setItems(letterItems[letter] || []);
  };

  const handleItemClick = (item) => {
    if (playingAudio) return;
    
    // Stop any currently playing audio
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    
    // Create new audio (in a real app, use preloaded audio files)
    const newAudio = new Audio(audioFiles[item]);
    setAudio(newAudio);
    
    newAudio.play();
    setPlayingAudio(true);
    
    // Disable interaction while audio plays
    setTimeout(() => {
      setPlayingAudio(false);
    }, 10000); // 10 seconds
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  return (
    <div className="phase-container">
      <h2>Phase 1: Alphabet Adventure</h2>
      <p>Click a letter to see items that start with it!</p>
      
      <div className="alphabet-grid">
        {alphabet.map(letter => (
          <button 
            key={letter}
            className={`letter-btn ${selectedLetter === letter ? 'active' : ''}`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      
      {selectedLetter && (
        <div className="items-container">
          <h3>Items starting with {selectedLetter}:</h3>
          <div className="items-grid">
            {items.map(item => (
              <button
                key={item}
                className="item-btn"
                onClick={() => handleItemClick(item)}
                disabled={playingAudio}
              >
                <img 
                  src={`/images/${item.toLowerCase()}.png`} 
                  alt={item}
                  className="item-image"
                />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {playingAudio && (
        <div className="audio-playing">
          <p>Listening to: {audio ? audio.src.split('/').pop() : ''}</p>
          <div className="audio-wave"></div>
        </div>
      )}
      
      <button 
        onClick={proceed} 
        className="proceed-button"
        disabled={playingAudio}
      >
        Go to Phase 2
      </button>
    </div>
  );
};

export default Phase1;