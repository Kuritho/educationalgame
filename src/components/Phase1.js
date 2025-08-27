import React, { useState, useEffect } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import './styles/Phase1.css';

const Phase1 = ({ proceed, loseLife }) => {
  const [completed, setCompleted] = usePersistedState('phase1_completed', false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [items, setItems] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(true);
  const [femaleVoice, setFemaleVoice] = useState(null);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const letterItems = {
    A: ['Apple', 'Ant', 'Airplane', 'Alligator'],
    B: ['Banana', 'Bear', 'Ball', 'Butterfly'],
    C: ['Cat', 'Car', 'Cake', 'Cow'],
    D: ['Dog', 'Dolphin', 'Duck', 'Dinosaur'],
    E: ['Elephant', 'Egg', 'Eagle', 'Engine'],
    F: ['Fish', 'Flower', 'Frog', 'Fox'],
    G: ['Giraffe', 'Grapes', 'Guitar', 'Goat'],
    H: ['House', 'Heart', 'Horse', 'Helicopter'],
    I: ['Ice Cream', 'Igloo', 'Island', 'Iguana'],
    J: ['Jellyfish', 'Jaguar', 'Jar', 'Jet'],
    K: ['Kangaroo', 'Key', 'Kite', 'Koala'],
    L: ['Lion', 'Lemon', 'Lighthouse', 'Leaf'],
    M: ['Monkey', 'Moon', 'Mountain', 'Mouse'],
    N: ['Nest', 'Nose', 'Net', 'Nurse'],
    O: ['Orange', 'Owl', 'Octopus', 'Ostrich'],
    P: ['Panda', 'Pizza', 'Pencil', 'Penguin'],
    Q: ['Queen', 'Quilt', 'Quill', 'Quartz'],
    R: ['Rabbit', 'Rainbow', 'Robot', 'Rose'],
    S: ['Sun', 'Star', 'Snake', 'Ship'],
    T: ['Tree', 'Tiger', 'Train', 'Turtle'],
    U: ['Umbrella', 'Unicorn', 'UFO', 'Uniform'],
    V: ['Violin', 'Volcano', 'Vase', 'Vegetable'],
    W: ['Whale', 'Watermelon', 'Wheel', 'Wolf'],
    X: ['Xylophone', 'X-ray', 'Xiphias', 'Xerus'],
    Y: ['Yak', 'Yacht', 'Yo-yo', 'Yogurt'],
    Z: ['Zebra', 'Zipper', 'Zoo', 'Zucchini']
  };

  // Check if speech synthesis is supported and find a female voice
  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setSpeechSynthesisSupported(false);
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // Load available voices and try to find a female voice
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') || // Common female voice
        voice.name.toLowerCase().includes('karen') ||    // Common female voice (Windows)
        voice.name.toLowerCase().includes('victoria') || // Common female voice
        voice.name.toLowerCase().includes('zira')        // Common female voice (Windows)
      );
      
      // If no specifically female voice found, use the first available voice
      setFemaleVoice(femaleVoice || voices[0]);
    };

    // Load voices when they become available
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const handleComplete = () => {
    setCompleted(true);
    proceed();
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setItems(letterItems[letter] || []);
  };

  const speakText = (text) => {
    if (!speechSynthesisSupported) {
      alert('Text-to-speech is not supported in your browser. Please try a modern browser like Chrome or Firefox.');
      return;
    }

    if (playingAudio) {
      window.speechSynthesis.cancel();
    }

    setPlayingAudio(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set female voice if available
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Adjust settings for a more natural female voice
    utterance.rate = 0.7; // Slightly slower for clarity
    utterance.pitch = 3.2; // Slightly higher pitch for female voice
    utterance.volume = 2.0;
    
    utterance.onend = () => {
      setPlayingAudio(false);
    };
    
    utterance.onerror = () => {
      setPlayingAudio(false);
      console.error('Speech synthesis error');
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const handleItemClick = (item) => {
    if (playingAudio) {
      window.speechSynthesis.cancel();
      setPlayingAudio(false);
      return;
    }
    
    speakText(item);
  };

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="phase-container">
      <h2>Exercise: Alphabet Adventure</h2>
      <p>Click a letter to see items that start with it!</p>
      
      {!speechSynthesisSupported && (
        <div className="browser-warning">
          <p>⚠️ Text-to-speech is not fully supported in your browser. For the best experience, please use Chrome or Firefox.</p>
        </div>
      )}
      
      {/* <button onClick={handleComplete} disabled={completed}>
        {completed ? "Already Completed" : "Complete Phase"}
      </button> */}
      
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
                className={`item-btn ${playingAudio ? 'disabled' : ''}`}
                onClick={() => handleItemClick(item)}
                disabled={playingAudio}
              >
                <div className="item-image-placeholder">
                  {item.charAt(0)}
                </div>
                <span>{item}</span>
                <div className="speaker-icon">
                  {playingAudio ? (
                    <i className="fas fa-volume-up"></i>
                  ) : (
                    <i className="fas fa-volume-mute"></i>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {playingAudio && (
        <div className="audio-playing">
          <p>Listening to word pronunciation...</p>
          <div className="audio-wave"></div>
          <button 
            className="stop-audio-btn"
            onClick={() => {
              window.speechSynthesis.cancel();
              setPlayingAudio(false);
            }}
          >
            Stop
          </button>
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