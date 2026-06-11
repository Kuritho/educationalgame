// Phase6.js - Voice-Activated Word Puzzle (Like Phase5 but with voice first)
// The word starts hidden/unclickable. User must SAY the word using microphone,
// then tiles become clickable to build the word (similar to Phase5 mechanics)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/Phase6.css';

// Word bank for Phase 6 - Each word has a description and matching pair
const wordPairs = [
  { word: "BAT", description: "A flying mammal that sleeps upside down 🦇", pairHint: "Also a piece of sports equipment" },
  { word: "CAT", description: "A furry pet that says meow 🐱", pairHint: "Something you wipe your feet on" },
  { word: "PAN", description: "A cooking tool used for frying 🍳", pairHint: "Excess body weight" },
  { word: "MAN", description: "An adult male human 👨", pairHint: "Metal container for food" },
  { word: "BED", description: "A piece of furniture for sleeping 🛏️", pairHint: "Angry or crazy" },
  { word: "SAD", description: "Feeling unhappy or sorrowful 😢", pairHint: "Father" },
  { word: "SUN", description: "The star that gives us light and warmth ☀️", pairHint: "Small bread roll" },
  { word: "TEN", description: "The number after nine 🔟", pairHint: "Writing instrument" },
  { word: "BAG", description: "A container for carrying things 🎒", pairHint: "Trash container" },
  { word: "PIN", description: "A small pointed piece of metal 📍", pairHint: "Aircraft that flies" },
  { word: "PIG", description: "A pink farm animal that says oink 🐷", pairHint: "Spider's creation" },
  { word: "NET", description: "A mesh fabric used for catching things 🥅", pairHint: "Moist or damp" },
  { word: "FOX", description: "A clever orange wild animal 🦊", pairHint: "Cardboard container" },
  { word: "HEN", description: "A female chicken 🐔", pairHint: "Mouth part" },
  { word: "SIX", description: "The number after five 6️⃣", pairHint: "Very warm temperature" },
  { word: "CUT", description: "To slice or divide something ✂️", pairHint: "Automobile" },
  { word: "BUG", description: "A small insect 🐛", pairHint: "Drinking cup" },
  { word: "HAM", description: "Meat from a pig's thigh 🍖", pairHint: "Fruit preserve" },
  { word: "KIT", description: "A set of tools or a baby animal 🧰", pairHint: "Headwear" },
  { word: "VAN", description: "A vehicle for transporting things 🚐", pairHint: "Storage container" },
  { word: "CAR", description: "A vehicle for driving on roads 🚗", pairHint: "Glass container" }
];

// Additional word pairs from your list
const additionalPairs = [
  { word: "MAT", description: "A floor covering for wiping feet 🧦", pairHint: "Feline pet" },
  { word: "FAT", description: "Excess body weight 🍔", pairHint: "Cooking tool" },
  { word: "CAN", description: "A metal container for food 🥫", pairHint: "Adult male" },
  { word: "MAD", description: "Feeling angry or crazy 😠", pairHint: "Sleeping furniture" },
  { word: "DAD", description: "A father figure 👨‍👧", pairHint: "Unhappy emotion" },
  { word: "BUN", description: "A small bread roll 🍔", pairHint: "Star in the sky" },
  { word: "PEN", description: "A writing instrument ✒️", pairHint: "Number nine plus one" },
  { word: "BIN", description: "A trash container 🗑️", pairHint: "Carrying container" },
  { word: "JET", description: "A fast aircraft ✈️", pairHint: "Small metal object" },
  { word: "WEB", description: "A spider's creation 🕸️", pairHint: "Farm animal" },
  { word: "WET", description: "Covered with moisture 💧", pairHint: "Fishing tool" },
  { word: "BOX", description: "A cardboard container 📦", pairHint: "Clever animal" },
  { word: "LIP", description: "Part of the mouth 👄", pairHint: "Female chicken" },
  { word: "HOT", description: "High temperature 🔥", pairHint: "Number six" },
  { word: "CAR2", description: "A vehicle 🚗", pairHint: "To divide" },
  { word: "MUG", description: "A drinking cup ☕", pairHint: "Small insect" },
  { word: "JAM", description: "Fruit preserve 🍓", pairHint: "Pork meat" },
  { word: "LEG", description: "Body part for walking 🦵", pairHint: "Young animal set" },
  { word: "CAP", description: "A headwear accessory 🧢", pairHint: "Tool set" },
  { word: "MAP", description: "A navigational chart 🗺️", pairHint: "Road vehicle" },
  { word: "JAR", description: "A glass container 🫙", pairHint: "Road vehicle" }
];

// Combine all words
const allWords = [...wordPairs, ...additionalPairs];

// Alphabet for generating random extra letters
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const Phase6 = ({ proceed, loseLife, lives: initialLives }) => {
  // Game state
  const [currentWord, setCurrentWord] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentPairHint, setCurrentPairHint] = useState('');
  const [letterTiles, setLetterTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const [message, setMessage] = useState('');
  const [listening, setListening] = useState(false);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [spokenWord, setSpokenWord] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [usedWords, setUsedWords] = useState([]);
  const [shuffledTiles, setShuffledTiles] = useState([]);
  
  const recognitionRef = useRef(null);
  
  // Generate random extra letters
  const generateRandomLetters = (wordLetters, count = 1) => {
    const extraLetters = [];
    const usedLetters = new Set(wordLetters);
    const availableLetters = alphabet.split('').filter(l => !usedLetters.has(l));
    
    for (let i = 0; i < count; i++) {
      if (availableLetters.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        extraLetters.push(availableLetters[randomIndex]);
      }
    }
    return extraLetters;
  };
  
  // Shuffle tiles
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Get random word that hasn't been used
  const getRandomWord = () => {
    const availableWords = allWords.filter(word => !usedWords.includes(word.word));
    if (availableWords.length === 0) {
      setUsedWords([]);
      return allWords[Math.floor(Math.random() * allWords.length)];
    }
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };
  
  // Initialize letter tiles AFTER word is revealed
  const initializeTiles = (word) => {
    const wordLetters = word.toUpperCase().split('');
    
    // Create letter tiles from the word
    const wordTiles = wordLetters.map((letter, index) => ({
      id: `word-${letter}-${index}-${Date.now()}-${Math.random()}`,
      letter: letter,
      used: false,
      isExtra: false
    }));
    
    // Generate 1-2 extra letters to make it interesting
    const extraCount = Math.min(2, 6 - word.length);
    const extraLetters = generateRandomLetters(wordLetters, extraCount);
    const extraTiles = extraLetters.map((letter, index) => ({
      id: `extra-${letter}-${index}-${Date.now()}-${Math.random()}`,
      letter: letter,
      used: false,
      isExtra: true
    }));
    
    const allTiles = [...wordTiles, ...extraTiles];
    const shuffled = shuffleArray(allTiles);
    
    setLetterTiles(allTiles);
    setShuffledTiles(shuffled);
    setSelectedTiles([]);
    setSubmittedAnswer('');
    setMessage(`🎤 Great! You said "${word}". Now click the letters in order to spell it!`);
  };
  
  // Load new round (hidden word initially)
  const loadNewRound = () => {
    if (round > 10) {
      setMessage('🎉 Congratulations! You completed all 10 rounds! 🎉');
      setTimerActive(false);
      setTimeout(() => {
        proceed(score + 100);
      }, 2000);
      return;
    }
    
    const selectedWordObj = getRandomWord();
    setUsedWords(prev => [...prev, selectedWordObj.word]);
    setCurrentWord(selectedWordObj.word);
    setCurrentDescription(selectedWordObj.description);
    setCurrentPairHint(selectedWordObj.pairHint);
    setWordRevealed(false);
    setSpokenWord('');
    setLetterTiles([]);
    setSelectedTiles([]);
    setSubmittedAnswer('');
    setTimeLeft(60);
    setTimerActive(true);
    setMessage(`🔒 Round ${round}/10: The word is HIDDEN! Say it into the microphone to reveal the tiles! 🎤`);
  };
  
  // Start game
  useEffect(() => {
    loadNewRound();
  }, [round]);
  
  // Timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleTimeOut();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, timerActive]);
  
  // Handle tile selection (only allowed after word is revealed)
  const handleTileClick = (tile) => {
    if (!wordRevealed) {
      setMessage(`🔒 Say "${currentWord}" using the microphone first to unlock the tiles!`);
      return;
    }
    if (tile.used) return;
    
    const updatedTiles = letterTiles.map(t => 
      t.id === tile.id ? { ...t, used: true } : t
    );
    setLetterTiles(updatedTiles);
    
    const newSelectedTiles = [...selectedTiles, tile];
    setSelectedTiles(newSelectedTiles);
    
    const newAnswer = newSelectedTiles.map(t => t.letter).join('');
    setSubmittedAnswer(newAnswer);
    
    if (newAnswer === currentWord.toUpperCase()) {
      handleCorrectAnswer();
    } else if (newAnswer.length === currentWord.length) {
      handleWrongAnswer();
    }
  };
  
  // Handle removing a tile from selection
  const handleRemoveTile = (tileToRemove) => {
    if (!wordRevealed) return;
    
    const tileIndex = selectedTiles.findIndex(t => t.id === tileToRemove.id);
    if (tileIndex !== -1) {
      const newSelectedTiles = selectedTiles.filter((_, index) => index !== tileIndex);
      setSelectedTiles(newSelectedTiles);
      
      const updatedTiles = letterTiles.map(t =>
        t.id === tileToRemove.id ? { ...t, used: false } : t
      );
      setLetterTiles(updatedTiles);
      
      const newAnswer = newSelectedTiles.map(t => t.letter).join('');
      setSubmittedAnswer(newAnswer);
    }
  };
  
  // Handle correct answer
  const handleCorrectAnswer = () => {
    setTimerActive(false);
    const pointsEarned = 10;
    setMessage(`✅ Correct! +${pointsEarned} points! You spelled "${currentWord.toUpperCase()}" correctly!`);
    setScore(prev => prev + pointsEarned);
    
    setTimeout(() => {
      if (round < 10) {
        setRound(prev => prev + 1);
      } else {
        setRound(prev => prev + 1);
      }
    }, 2000);
  };
  
  // Handle wrong answer
  const handleWrongAnswer = () => {
    loseLife();
    const remainingLives = initialLives - 1;
    setMessage(`❌ Wrong! The correct word was "${currentWord.toUpperCase()}". ${remainingLives} lives remaining.`);
    
    setTimeout(() => {
      if (initialLives <= 1) {
        setMessage("💀 Game Over! You ran out of lives! 💀");
        setTimeout(() => {
          proceed(score);
        }, 2000);
      } else {
        resetRound();
      }
    }, 2000);
  };
  
  // Reset current round
  const resetRound = () => {
    setWordRevealed(false);
    setSpokenWord('');
    setLetterTiles([]);
    setSelectedTiles([]);
    setSubmittedAnswer('');
    setTimeLeft(60);
    setTimerActive(true);
    setMessage(`🔄 Try again! Say "${currentWord}" into the microphone to reveal the tiles!`);
  };
  
  // Handle timeout
  const handleTimeOut = () => {
    setTimerActive(false);
    loseLife();
    
    if (initialLives <= 1) {
      setMessage("💀 Game Over! You ran out of lives! 💀");
      setTimeout(() => {
        proceed(score);
      }, 2000);
    } else {
      setMessage(`⏰ Time's up! Lost a life. ${initialLives - 1} lives remaining.`);
      setTimeout(() => {
        resetRound();
      }, 2000);
    }
  };
  
  // Voice recognition for saying the hidden word
  const handleDetectedWord = useCallback((detectedWord) => {
    if (wordRevealed) {
      setMessage(`🎤 You said: "${detectedWord}" - But the word is already revealed! Keep building it!`);
      return;
    }
    
    const cleanDetected = detectedWord.toUpperCase().trim();
    const targetWord = currentWord.toUpperCase();
    
    if (cleanDetected === targetWord) {
      setMessage(`🎉 Correct! "${detectedWord}" matches! Tiles are now clickable!`);
      setWordRevealed(true);
      setSpokenWord(detectedWord);
      initializeTiles(currentWord);
      setListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      setMessage(`❌ You said "${detectedWord}". That's not the hidden word. Try again! Hint: ${currentDescription}`);
    }
  }, [currentWord, currentDescription, wordRevealed]);
  
  // Voice recognition setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setMessage('Voice control not supported. Click "Reveal with Text" instead.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      const result = event.results[0];
      const transcript = result[0].transcript.trim().toUpperCase();
      console.log('Detected:', transcript);
      handleDetectedWord(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setMessage(`Error: ${event.error}. Try again or click "Reveal with Text" button.`);
      setListening(false);
    };
    
    recognition.onend = () => {
      setListening(false);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [handleDetectedWord]);
  
  // Toggle voice control
  const toggleVoiceControl = () => {
    if (!recognitionRef.current) {
      setMessage('Speech recognition not supported in this browser.');
      return;
    }
    
    if (wordRevealed) {
      setMessage(`The word is already revealed! Click the tiles to spell "${currentWord}"`);
      return;
    }
    
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      setMessage('🎤 Microphone off. Click "Say Word" to try again.');
    } else {
      setListening(true);
      setMessage(`🎤 Listening... Say the hidden word! Hint: ${currentDescription}`);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setMessage('Error starting voice recognition. Try the text button instead.');
        setListening(false);
      }
    }
  };
  
  // Manual text input for revealing word (fallback)
  const [manualWord, setManualWord] = useState('');
  
  const handleManualReveal = () => {
    if (wordRevealed) {
      setMessage(`Word already revealed! Click the tiles to spell "${currentWord}"`);
      return;
    }
    
    if (manualWord.toUpperCase().trim() === currentWord.toUpperCase()) {
      setMessage(`✅ Correct! "${manualWord}" matches! Tiles are now clickable!`);
      setWordRevealed(true);
      setSpokenWord(manualWord);
      initializeTiles(currentWord);
      setManualWord('');
    } else {
      setMessage(`❌ "${manualWord}" is not the hidden word. Try again! Hint: ${currentDescription}`);
      setManualWord('');
    }
  };
  
  // Shuffle remaining tiles
  const handleShuffleTiles = () => {
    if (!wordRevealed) {
      setMessage(`🔒 Say the word first to reveal and shuffle tiles!`);
      return;
    }
    const unusedTiles = letterTiles.filter(t => !t.used);
    setShuffledTiles(shuffleArray(unusedTiles));
    setMessage('🔀 Tiles shuffled!');
  };
  
  // Clear selection
  const handleClearSelection = () => {
    if (!wordRevealed) return;
    const updatedTiles = letterTiles.map(t => ({ ...t, used: false }));
    setLetterTiles(updatedTiles);
    setSelectedTiles([]);
    setSubmittedAnswer('');
    setMessage('🗑️ Selection cleared! Try again.');
  };
  
  // Skip tutorial
  const skipTutorial = () => {
    setShowTutorial(false);
  };
  
  // Get available tiles
  const availableTiles = shuffledTiles.filter(tile => !tile.used);
  
  // Get word length hint
  const wordLength = currentWord ? currentWord.length : 0;
  
  return (
    <div className="phase6-container">
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>🎤 PHASE 6: VOICE-ACTIVATED PUZZLE</h2>
            <div className="tutorial-steps">
              <div className="tutorial-step">
                <span className="step-number">1</span>
                <p>The word is HIDDEN at the start! 🔒</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">2</span>
                <p>Read the description and guess the word 🧠</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">3</span>
                <p>SAY the word into your microphone 🎤</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">4</span>
                <p>Once correct, letter tiles appear and become clickable! ✨</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">5</span>
                <p>Click letters in order to spell the word (like Phase 5) 📝</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">6</span>
                <p>Complete all 10 rounds to win! 🏆</p>
              </div>
            </div>
            <button onClick={skipTutorial} className="start-playing-btn">
              Start Phase 6! 🎤
            </button>
          </div>
        </div>
      )}
      
      <div className="header">
        <span>🎤 Voice-Activated Word Puzzle - Phase 6</span>
        <div className="header-info">
          <span>📊 Round: {round}/10</span>
          <span>⭐ Score: {score}</span>
          <span>❤️ Lives: {initialLives}</span>
          <span>⏱️ Time: {timeLeft}s</span>
        </div>
      </div>
      
      <div className="game-content">
        <div className="word-description">
          <h3>{wordRevealed ? 'Spell the word:' : 'Guess the hidden word:'}</h3>
          <p className="description-text">{currentDescription}</p>
          {currentPairHint && (
            <div className="pair-hint">
              💡 Bonus clue: Also means "{currentPairHint}"
            </div>
          )}
          <div className="word-length-hint">
            📏 {wordLength} letter{wordLength !== 1 ? 's' : ''}
          </div>
          {!wordRevealed && (
            <div className="hidden-word-badge">
              🔒 WORD IS HIDDEN - Say it to reveal! 🔒
            </div>
          )}
          {wordRevealed && (
            <div className="revealed-badge">
              ✨ WORD REVEALED: {currentWord.toUpperCase()} ✨
            </div>
          )}
        </div>
        
        {/* Voice Control Panel */}
        <div className="voice-control-panel">
          {!wordRevealed ? (
            <>
              {isSpeechSupported && (
                <button 
                  onClick={toggleVoiceControl}
                  className={`voice-control-button ${listening ? 'active' : ''}`}
                >
                  {listening ? (
                    <>
                      <span className="pulse-dot"></span>
                      🎤 Listening... Say the word!
                    </>
                  ) : (
                    '🎤 Say the Hidden Word'
                  )}
                </button>
              )}
              
              <div className="manual-fallback">
                <span>or type the word:</span>
                <input
                  type="text"
                  value={manualWord}
                  onChange={(e) => setManualWord(e.target.value.toUpperCase())}
                  placeholder="Type word here..."
                  className="manual-input"
                  maxLength={wordLength}
                />
                <button onClick={handleManualReveal} className="reveal-text-btn">
                  Reveal with Text
                </button>
              </div>
            </>
          ) : (
            <div className="voice-success">
              ✅ Word "{spokenWord}" recognized! Tiles are now active!
            </div>
          )}
        </div>
        
        {/* Selected word display */}
        {wordRevealed && (
          <div className="selected-word-container">
            <h4>Your word:</h4>
            <div className="selected-letters">
              {selectedTiles.map((tile, index) => (
                <div 
                  key={`selected-${tile.id}`} 
                  className="selected-letter"
                  onClick={() => handleRemoveTile(tile)}
                >
                  {tile.letter}
                  <span className="remove-icon">✖</span>
                </div>
              ))}
              {selectedTiles.length === 0 && (
                <div className="empty-selection">Click tiles to build the word...</div>
              )}
            </div>
          </div>
        )}
        
        <div className="message-box">{message}</div>
        
        {/* Letter Tiles Grid - Only visible and clickable after word is revealed */}
        {wordRevealed && (
          <div className="tiles-container">
            <h4>Available Letters ({availableTiles.length} tiles):</h4>
            <div className="tiles-grid">
              {availableTiles.map((tile) => (
                <button
                  key={tile.id}
                  className="letter-tile"
                  onClick={() => handleTileClick(tile)}
                >
                  {tile.letter}
                </button>
              ))}
            </div>
            
            <div className="action-buttons">
              <button onClick={handleShuffleTiles} className="action-button shuffle">
                🔀 Shuffle Tiles
              </button>
              <button onClick={handleClearSelection} className="action-button clear">
                🗑️ Clear Selection
              </button>
            </div>
          </div>
        )}
        
        {/* Waiting state when word is hidden */}
        {!wordRevealed && (
          <div className="waiting-container">
            <div className="waiting-message">
              🎤🔒 Waiting for you to say or type the word...
            </div>
            <div className="microphone-animation">
              🎙️
            </div>
          </div>
        )}
      </div>
      
      <div className="instructions">
        <p><strong>🎤 How to Play - Voice-Activated Word Puzzle:</strong></p>
        <ul>
          <li>The word is HIDDEN at the start of each round 🔒</li>
          <li>Read the description and emoji clue to guess the word 📝</li>
          <li>Click the microphone and SAY the word clearly 🎤</li>
          <li>OR type the word in the text box as a fallback ⌨️</li>
          <li>Once correct, letter tiles appear and become clickable ✨</li>
          <li>Click letters in order to spell the word (like Phase 5)</li>
          <li>Click on selected letters to remove them if needed 🔄</li>
          <li>Complete all 10 rounds before time runs out! ⏱️</li>
          <li>Each correct word gives you 10 points ⭐</li>
        </ul>
      </div>
    </div>
  );
};

export default Phase6;