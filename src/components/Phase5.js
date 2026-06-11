// Phase5.js - Letter Tiles Word Building Game (10 Rounds with 6 Random Tiles - Same Color)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/Phase5.css';

// Import sound files
import backgroundMusic from '../components/sounds/bee.mp3';
import successSound from '../components/sounds/success.mp3';

const Phase5 = ({ proceed, loseLife, lives: initialLives }) => {
  // State declarations
  const [currentWord, setCurrentWord] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [letterTiles, setLetterTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const [message, setMessage] = useState('');
  const [listening, setListening] = useState(false);
  const [lastSpokenLetter, setLastSpokenLetter] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [shuffledTiles, setShuffledTiles] = useState([]);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const successAudioRef = useRef(null);

  // Word bank for Phase 5 - 22 words
  const wordBank = [
    { word: "BAT", description: "A flying mammal that sleeps upside down 🦇", letters: ['B', 'A', 'T'] },
    { word: "CAT", description: "A furry pet that says meow 🐱", letters: ['C', 'A', 'T'] },
    { word: "PAN", description: "A cooking tool used for frying 🍳", letters: ['P', 'A', 'N'] },
    { word: "MAN", description: "An adult male human 👨", letters: ['M', 'A', 'N'] },
    { word: "BED", description: "A piece of furniture for sleeping 🛏️", letters: ['B', 'E', 'D'] },
    { word: "SAD", description: "Feeling unhappy or sorrowful 😢", letters: ['S', 'A', 'D'] },
    { word: "SUN", description: "The star that gives us light and warmth ☀️", letters: ['S', 'U', 'N'] },
    { word: "TEN", description: "The number after nine 🔟", letters: ['T', 'E', 'N'] },
    { word: "BAG", description: "A container for carrying things 🎒", letters: ['B', 'A', 'G'] },
    { word: "PIN", description: "A small pointed piece of metal 📍", letters: ['P', 'I', 'N'] },
    { word: "PIG", description: "A pink farm animal that says oink 🐷", letters: ['P', 'I', 'G'] },
    { word: "NET", description: "A mesh fabric used for catching things 🥅", letters: ['N', 'E', 'T'] },
    { word: "FOX", description: "A clever orange wild animal 🦊", letters: ['F', 'O', 'X'] },
    { word: "HEN", description: "A female chicken 🐔", letters: ['H', 'E', 'N'] },
    { word: "SIX", description: "The number after five 6️⃣", letters: ['S', 'I', 'X'] },
    { word: "CUT", description: "To slice or divide something ✂️", letters: ['C', 'U', 'T'] },
    { word: "BUG", description: "A small insect 🐛", letters: ['B', 'U', 'G'] },
    { word: "HAM", description: "Meat from a pig's thigh 🍖", letters: ['H', 'A', 'M'] },
    { word: "KIT", description: "A set of tools or a baby animal 🧰", letters: ['K', 'I', 'T'] },
    { word: "VAN", description: "A vehicle for transporting things 🚐", letters: ['V', 'A', 'N'] },
    { word: "CAR", description: "A vehicle for driving on roads 🚗", letters: ['C', 'A', 'R'] }
  ];

  // Pool of random letters to add as extra tiles
  const randomLetterPool = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // Keep track of used words to avoid repetition
  const [usedWords, setUsedWords] = useState([]);

  // Generate random extra letters (not including letters from the word)
  const generateRandomLetters = (wordLetters, count = 3) => {
    const extraLetters = [];
    const usedLetters = new Set(wordLetters);
    
    // Filter out letters that are already in the word
    const availableLetters = randomLetterPool.filter(letter => !usedLetters.has(letter));
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * availableLetters.length);
      extraLetters.push(availableLetters[randomIndex]);
    }
    
    return extraLetters;
  };

  // Shuffle tiles function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get random word that hasn't been used yet
  const getRandomWord = () => {
    const availableWords = wordBank.filter(word => !usedWords.includes(word.word));
    if (availableWords.length === 0) {
      // If all words are used, reset used words
      setUsedWords([]);
      return wordBank[Math.floor(Math.random() * wordBank.length)];
    }
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  // Load new round
  const loadNewRound = () => {
    if (round > 10) {
      // Game completed - all 10 rounds done
      setMessage('🎉 Congratulations! You completed all 10 rounds! 🎉');
      setTimerActive(false);
      setTimeout(() => {
        proceed(score + 100);
      }, 2000);
      return;
    }

    // Select random word that hasn't been used
    const selectedWordObj = getRandomWord();
    
    // Mark this word as used
    setUsedWords(prev => [...prev, selectedWordObj.word]);
    
    setCurrentWord(selectedWordObj.word);
    setCurrentDescription(selectedWordObj.description);
    
    // Create letter tiles from the word
    const wordTiles = selectedWordObj.letters.map((letter, index) => ({
      id: `word-${letter}-${index}-${Date.now()}-${Math.random()}`,
      letter: letter,
      used: false,
      isExtra: false
    }));
    
    // Generate random extra letters to make total of 6 tiles
    const extraCount = 6 - selectedWordObj.word.length;
    const extraLetters = generateRandomLetters(selectedWordObj.letters, extraCount);
    const extraTiles = extraLetters.map((letter, index) => ({
      id: `extra-${letter}-${index}-${Date.now()}-${Math.random()}`,
      letter: letter,
      used: false,
      isExtra: true
    }));
    
    // Combine word tiles and extra tiles (total will be 6)
    const allTiles = [...wordTiles, ...extraTiles];
    
    // Shuffle all tiles
    const shuffled = shuffleArray(allTiles);
    
    setLetterTiles(allTiles);
    setShuffledTiles(shuffled);
    setSelectedTiles([]);
    setSubmittedAnswer('');
    setTimeLeft(60);
    setTimerActive(true);
    
    const extraCountActual = shuffled.filter(tile => tile.isExtra).length;
    setMessage(`Round ${round}/10: Spell "${selectedWordObj.word}"! (Find the ${selectedWordObj.word.length} correct letters from ${shuffled.length} tiles) 🎯`);
    setLastSpokenLetter('');
  };

  // Initialize game
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

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(backgroundMusic);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    successAudioRef.current = new Audio(successSound);
    successAudioRef.current.volume = 0.5;
    
    const playBackgroundMusic = async () => {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.log('Background music play failed:', error);
      }
    };
    
    playBackgroundMusic();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Play success sound
  const playSuccessSound = () => {
    if (successAudioRef.current) {
      successAudioRef.current.currentTime = 0;
      successAudioRef.current.play().catch(error => {
        console.log('Success sound play failed:', error);
      });
    }
  };

  // Handle tile selection
  const handleTileClick = (tile) => {
    if (tile.used) return;
    
    // Mark tile as used
    const updatedTiles = letterTiles.map(t => 
      t.id === tile.id ? { ...t, used: true } : t
    );
    setLetterTiles(updatedTiles);
    
    // Add to selected tiles
    const newSelectedTiles = [...selectedTiles, tile];
    setSelectedTiles(newSelectedTiles);
    
    // Update submitted answer
    const newAnswer = newSelectedTiles.map(t => t.letter).join('');
    setSubmittedAnswer(newAnswer);
    
    // Check if answer matches the word
    if (newAnswer === currentWord) {
      handleCorrectAnswer();
    } else if (newAnswer.length === currentWord.length) {
      // Wrong answer with full length
      handleWrongAnswer();
    }
  };

  // Handle removing a tile from selection
  const handleRemoveTile = (tileToRemove) => {
    // Find the tile in selected tiles and remove it
    const tileIndex = selectedTiles.findIndex(t => t.id === tileToRemove.id);
    if (tileIndex !== -1) {
      const newSelectedTiles = selectedTiles.filter((_, index) => index !== tileIndex);
      setSelectedTiles(newSelectedTiles);
      
      // Unmark the tile as used
      const updatedTiles = letterTiles.map(t =>
        t.id === tileToRemove.id ? { ...t, used: false } : t
      );
      setLetterTiles(updatedTiles);
      
      // Update submitted answer
      const newAnswer = newSelectedTiles.map(t => t.letter).join('');
      setSubmittedAnswer(newAnswer);
    }
  };

  // Handle correct answer
  const handleCorrectAnswer = () => {
    setTimerActive(false);
    playSuccessSound();
    const pointsEarned = 10;
    setMessage(`✅ Correct! +${pointsEarned} points! You spelled "${currentWord}" correctly!`);
    setScore(prev => prev + pointsEarned);
    
    setTimeout(() => {
      if (round < 10) {
        setRound(prev => prev + 1);
      } else {
        setRound(prev => prev + 1); // This will trigger completion
      }
    }, 2000);
  };

  // Handle wrong answer
  const handleWrongAnswer = () => {
    loseLife();
    const remainingLives = initialLives - 1;
    setMessage(`❌ Wrong! The correct word was "${currentWord}". ${remainingLives} lives remaining.`);
    
    setTimeout(() => {
      if (initialLives <= 1) {
        setMessage("💀 Game Over! You ran out of lives! 💀");
        setTimeout(() => {
          proceed(score);
        }, 2000);
      } else {
        // Retry same round - reset tiles
        resetRound();
      }
    }, 2000);
  };

  // Reset current round
  const resetRound = () => {
    const originalWord = wordBank.find(w => w.word === currentWord);
    if (originalWord) {
      // Create letter tiles from the word
      const wordTiles = originalWord.letters.map((letter, index) => ({
        id: `word-${letter}-${index}-${Date.now()}-${Math.random()}`,
        letter: letter,
        used: false,
        isExtra: false
      }));
      
      // Generate random extra letters to make total of 6 tiles
      const extraCount = 6 - originalWord.word.length;
      const extraLetters = generateRandomLetters(originalWord.letters, extraCount);
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
      setTimeLeft(60);
      setTimerActive(true);
      setMessage(`🔄 Try again! Spell: ${currentDescription}`);
    }
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

  // Voice recognition for spelling letters
  const handleDetectedLetter = useCallback((detectedLetter) => {
    setLastSpokenLetter(detectedLetter);
    
    // Find unused tile with matching letter
    const availableTile = letterTiles.find(tile => 
      !tile.used && tile.letter.toUpperCase() === detectedLetter.toUpperCase()
    );
    
    if (availableTile) {
      setMessage(`🎤 You said: ${detectedLetter.toUpperCase()} - Adding to your word!`);
      handleTileClick(availableTile);
    } else {
      // Check if letter exists but is already used
      const usedTile = letterTiles.find(tile => 
        tile.used && tile.letter.toUpperCase() === detectedLetter.toUpperCase()
      );
      
      if (usedTile) {
        setMessage(`⚠️ Letter "${detectedLetter.toUpperCase()}" is already used! Try a different letter.`);
      } else {
        setMessage(`❌ Letter "${detectedLetter.toUpperCase()}" is not available! Choose from the tiles.`);
      }
    }
  }, [letterTiles]);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setMessage('Voice control not supported. Click tiles instead.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim().toUpperCase();
      console.log('Detected:', transcript);
      
      // Check if it's a single letter
      if (transcript.length === 1 && /[A-Z]/i.test(transcript)) {
        handleDetectedLetter(transcript);
      } else {
        // Check for letter pronunciations
        const letterMap = {
          'AY': 'A', 'EH': 'A', 'ALPHA': 'A',
          'BEE': 'B', 'BE': 'B', 'BRAVO': 'B',
          'SEE': 'C', 'SEA': 'C', 'CHARLIE': 'C',
          'DEE': 'D', 'DELTA': 'D',
          'EE': 'E', 'ECHO': 'E',
          'EFF': 'F', 'FOXTROT': 'F',
          'GEE': 'G', 'GOLF': 'G',
          'AITCH': 'H', 'HOTEL': 'H',
          'JAY': 'J', 'JULIET': 'J',
          'KAY': 'K', 'KILO': 'K',
          'EL': 'L', 'LIMA': 'L',
          'EM': 'M', 'MIKE': 'M',
          'EN': 'N', 'NOVEMBER': 'N',
          'OH': 'O', 'OSCAR': 'O',
          'PEE': 'P', 'PAPA': 'P',
          'CUE': 'Q', 'QUEBEC': 'Q',
          'ARE': 'R', 'ROMEO': 'R',
          'ESS': 'S', 'SIERRA': 'S',
          'TEE': 'T', 'TANGO': 'T',
          'YOU': 'U', 'UNIFORM': 'U',
          'VEE': 'V', 'VICTOR': 'V',
          'DOUBLE YOU': 'W', 'WHISKEY': 'W',
          'EX': 'X', 'XRAY': 'X',
          'WHY': 'Y', 'YANKEE': 'Y',
          'ZEE': 'Z', 'ZED': 'Z', 'ZULU': 'Z'
        };
        
        for (const [pronunciation, letter] of Object.entries(letterMap)) {
          if (transcript.includes(pronunciation)) {
            handleDetectedLetter(letter);
            return;
          }
        }
        
        setMessage(`🤔 Didn't catch that. Say a single letter like "A" or "BEE" for B`);
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setMessage(`Error: ${event.error}. Try again.`);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [handleDetectedLetter]);

  // Toggle voice control
  const toggleVoiceControl = () => {
    if (!recognitionRef.current) return;
    
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      setMessage('🎤 Microphone off - Click tiles to spell');
    } else {
      setListening(true);
      setMessage('🎤 Listening... Say a letter to add it to your word');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setMessage('Error starting voice recognition. Try refreshing.');
        setListening(false);
      }
    }
  };

  // Submit answer button
  const handleSubmitAnswer = () => {
    if (submittedAnswer === currentWord) {
      handleCorrectAnswer();
    } else if (submittedAnswer.length > 0) {
      handleWrongAnswer();
    } else {
      setMessage('Please select some letters first!');
    }
  };

  // Clear all selected tiles
  const handleClearSelection = () => {
    const updatedTiles = letterTiles.map(t => ({ ...t, used: false }));
    setLetterTiles(updatedTiles);
    setSelectedTiles([]);
    setSubmittedAnswer('');
    setMessage('🗑️ Selection cleared! Try again.');
  };

  // Shuffle remaining tiles
  const handleShuffleTiles = () => {
    const unusedTiles = letterTiles.filter(t => !t.used);
    setShuffledTiles(shuffleArray(unusedTiles));
    setMessage('🔀 Tiles shuffled!');
  };

  const skipTutorial = () => {
    setShowTutorial(false);
  };

  // Get available tiles (unused)
  const availableTiles = shuffledTiles.filter(tile => !tile.used);

  return (
    <div className="phase5-container">
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>🔤 Letter Tiles Game! - 10 Rounds 🎯</h2>
            <div className="tutorial-steps">
              <div className="tutorial-step">
                <span className="step-number">1</span>
                <p>Read the description and emoji clue 📝</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">2</span>
                <p>You'll see 6 letter tiles - but only some belong to the word! 🤔</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">3</span>
                <p>Figure out which letters spell the word 🧠</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">4</span>
                <p>Click on letters to build the word (or use voice) 🎤</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">5</span>
                <p>Click on selected letters to remove them 🔄</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">6</span>
                <p>Complete all 10 rounds to win! 🏆</p>
              </div>
            </div>
            <button onClick={skipTutorial} className="start-playing-btn">
              Start Playing! 🎮
            </button>
          </div>
        </div>
      )}
      
      <div className="header">
        <span>🐝 Letter Tiles Challenge - Phase 5</span>
        <div className="header-info">
          <span>📊 Round: {round}/10</span>
          <span>⭐ Score: {score}</span>
          <span>❤️ Lives: {initialLives}</span>
          <span>⏱️ Time: {timeLeft}s</span>
        </div>
      </div>
      
      <div className="game-content">
        <div className="word-description">
          <h3>📖 Spell the word:</h3>
          <p className="description-text">{currentDescription}</p>
          <div className="word-length-hint">
            💡 Hint: {currentWord.length} letter{currentWord.length !== 1 ? 's' : ''}
          </div>
          <div className="tiles-count-hint">
            🎲 Find the correct {currentWord.length} letters from {availableTiles.length} tiles
          </div>
        </div>

        {/* Selected word display */}
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
              <div className="empty-selection">Click tiles or say letters to build your word...</div>
            )}
          </div>
        </div>

        <div className="message-box">{message}</div>
        
        <div className="voice-control-panel">
          {isSpeechSupported && (
            <button 
              onClick={toggleVoiceControl}
              className={`voice-control-button ${listening ? 'active' : ''}`}
              disabled={showTutorial}
            >
              {listening ? (
                <>
                  <span className="pulse-dot"></span>
                  🎤 Listening... Say a letter
                </>
              ) : (
                '🎤 Enable Voice Control'
              )}
            </button>
          )}
          
          {lastSpokenLetter && (
            <div className="voice-feedback">
              <span>Last said: </span>
              <span className="detected-letter">{lastSpokenLetter}</span>
            </div>
          )}
        </div>

        {/* Letter Tiles Grid - All tiles have the same color */}
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
            <button onClick={handleSubmitAnswer} className="action-button submit">
              ✓ Submit Answer
            </button>
          </div>
        </div>
      </div>

      <div className="instructions">
        <p><strong>📚 How to Play - 10 Rounds with Hidden Challenge:</strong></p>
        <ul>
          <li>Read the description and figure out which word to spell 🧠</li>
          <li>You get 6 letter tiles - but only {currentWord ? currentWord.length : 'some'} of them spell the word! </li>
          <li>All tiles look the same - you must figure out which ones are correct! 🤔</li>
          <li>Click on tiles to add them to your word</li>
          <li>Click on selected letters to remove them</li>
          <li>{isSpeechSupported ? '🎤 Click the microphone and say letters clearly' : 'Use the letter tiles to spell the word'}</li>
          <li>Complete all 10 rounds before time runs out! ⏱️</li>
          <li>Each correct word gives you 10 points ⭐</li>
          <li>Choose wisely - wrong letters will cost you a life! ⚠️</li>
        </ul>
      </div>
    </div>
  );
};

export default Phase5;