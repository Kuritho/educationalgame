import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/Phase4.css';
import LivesCounter from './LivesCounter';

// Import sound files (you'll need to add these to your project)
import backgroundMusic from '../components/sounds/bee.mp3';
import successSound from '../components/sounds/success.mp3';

const Phase4 = ({ proceed, loseLife, lives: initialLives }) => {
  // State declarations
  const [maze, setMaze] = useState([[]]);
  const [letters, setLetters] = useState({});
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [exitPosition, setExitPosition] = useState({ x: 0, y: 0 });
  const [visited, setVisited] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Find the hive! Round 1/5');
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(true);
  const [listening, setListening] = useState(false);
  const [lastSpokenLetter, setLastSpokenLetter] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const recognitionRef = useRef(null);
  const [isMazeReady, setIsMazeReady] = useState(false);
  const audioRef = useRef(null);
  const successAudioRef = useRef(null);

  const letterPool = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
                     'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

  // Comprehensive pronunciation mapping
  const letterPronunciationMap = {
    'ay': 'A', 'eh': 'A', 'alpha': 'A',
    'bee': 'B', 'be': 'B', 'bravo': 'B', 'beer': 'B',
    'see': 'C', 'sea': 'C', 'cee': 'C', 'si': 'C', 'charley': 'C', 'charlie': 'C',
    'dee': 'D', 'delta': 'D', 'dog': 'D', 'day': 'D',
    'ee': 'E', 'echo': 'E', 'eat': 'E',
    'eff': 'F', 'foxtrot': 'F', 'fox': 'F',
    'gee': 'G', 'golf': 'G', 'go': 'G', 'girl': 'G',
    'aitch': 'H', 'haitch': 'H', 'hotel': 'H', 'house': 'H',
    'jay': 'J', 'juliet': 'J', 'jump': 'J', 'jet': 'J',
    'kay': 'K', 'kilo': 'K', 'king': 'K', 'key': 'K',
    'el': 'L', 'lima': 'L', 'love': 'L', 'lake': 'L',
    'em': 'M', 'mike': 'M', 'mother': 'M', 'man': 'M',
    'en': 'N', 'november': 'N', 'no': 'N', 'now': 'N',
    'oh': 'O', 'oscar': 'O', 'open': 'O', 'orange': 'O',
    'pee': 'P', 'papa': 'P', 'pet': 'P', 'park': 'P',
    'cue': 'Q', 'quebec': 'Q', 'queen': 'Q', 'quick': 'Q',
    'are': 'R', 'romeo': 'R', 'red': 'R', 'run': 'R',
    'ess': 'S', 'sierra': 'S', 'sun': 'S', 'sea': 'S',
    'tee': 'T', 'tango': 'T', 'top': 'T', 'talk': 'T',
    'you': 'U', 'uniform': 'U', 'up': 'U', 'under': 'U',
    'vee': 'V', 'victor': 'V', 'van': 'V', 'voice': 'V',
    'double you': 'W', 'double-u': 'W', 'whiskey': 'W', 'water': 'W',
    'ex': 'X', 'x-ray': 'X',
    'why': 'Y', 'yankee': 'Y', 'yes': 'Y', 'yellow': 'Y',
    'zee': 'Z', 'zed': 'Z', 'zulu': 'Z', 'zoo': 'Z'
  };

  // Initialize audio elements
  useEffect(() => {
    audioRef.current = new Audio(backgroundMusic);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Set volume to 30%
    
    successAudioRef.current = new Audio(successSound);
    successAudioRef.current.volume = 0.5;
    
    // Automatically start playing background music
    const playBackgroundMusic = async () => {
      try {
        await audioRef.current.play();
        console.log('Background music started');
      } catch (error) {
        console.log('Background music play failed:', error);
        // Some browsers require user interaction first
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

  // Generate initial maze
  useEffect(() => {
    generateMaze();
  }, []);

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

  // Letter detection handler
  const handleDetectedLetter = useCallback((letter) => {
    console.log('Processing letter:', letter);
    setLastSpokenLetter(letter);
    setMessage(`Moving to ${letter}...`);

    const letterPos = Object.entries(letters).find(
      ([pos, l]) => l === letter
    );

    if (letterPos) {
      const [posKey] = letterPos;
      const [x, y] = posKey.split(',').map(Number);
      moveBeeToPosition({ x, y });
    } else {
      setMessage(`${letter} not found. Try: ${Object.values(letters).join(', ')}`);
    }
  }, [letters]);

  // Voice recognition setup
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setMessage('Voice control not supported. Use keyboard instead.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 10;

    recognition.onresult = (event) => {
      console.log('Raw results:', event.results);
      
      const results = event.results[event.results.length - 1];
      for (let i = 0; i < results.length; i++) {
        const transcript = results[i].transcript.trim().toLowerCase();
        console.log(`Alternative ${i}:`, transcript);
        
        // Check exact single letter first
        if (transcript.length === 1 && letterPool.includes(transcript.toUpperCase())) {
          handleDetectedLetter(transcript.toUpperCase());
          return;
        }
        
        // Check pronunciation map
        for (const [word, letter] of Object.entries(letterPronunciationMap)) {
          if (transcript.includes(word)) {
            handleDetectedLetter(letter);
            return;
          }
        }
      }
      
      setMessage(`Didn't catch that. Try saying just the letter clearly`);
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

  const toggleVoiceControl = () => {
    if (!recognitionRef.current) return;
    
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      setMessage('Microphone off');
    } else {
      setListening(true);
      setMessage('Listening... Say a letter clearly');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setMessage('Error starting voice recognition. Try refreshing the page.');
        setListening(false);
      }
    }
  };

  const generateMaze = () => {
    setIsMazeReady(false);
    const size = 17;
    const grid = Array(size).fill().map(() => Array(size).fill(1));
    const newLetters = {};

    const carve = (x, y) => {
      grid[y][x] = 0;
      
      const directions = [
        { dx: 0, dy: -2 }, { dx: 2, dy: 0 }, 
        { dx: 0, dy: 2 }, { dx: -2, dy: 0 }
      ].sort(() => Math.random() - 0.5);

      for (const { dx, dy } of directions) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 1) {
          grid[(y + ny) / 2][(x + nx) / 2] = 0;
          carve(nx, ny);
        }
      }
      setIsMazeReady(true);
    };

    carve(1, 1);
    const exitX = size-2;
    const exitY = size-2;
    grid[exitY][exitX] = 0;

    const pathPositions = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x] === 0 && !(x === 1 && y === 1) && !(x === exitX && y === exitY)) {
          pathPositions.push({ x, y });
        }
      }
    }

    const shuffledLetters = [...letterPool].sort(() => Math.random() - 0.5);
    const shuffledPositions = [...pathPositions].sort(() => Math.random() - 0.5);

    const placedPositions = [];
    shuffledPositions.forEach(pos => {
      const farEnough = placedPositions.every(placedPos => 
        Math.abs(placedPos.x - pos.x) >= 3 || Math.abs(placedPos.y - pos.y) >= 3
      );
      
      if (farEnough && shuffledLetters.length > 0) {
        newLetters[`${pos.x},${pos.y}`] = shuffledLetters.pop();
        placedPositions.push(pos);
      }
    });

    if (shuffledLetters.length > 0) {
      newLetters[`${exitX},${exitY}`] = shuffledLetters[0];
    }

    setMaze(grid);
    setLetters(newLetters);
    setPlayerPosition({ x: 1, y: 1 });
    setExitPosition({ x: exitX, y: exitY });
    setVisited([{ x: 1, y: 1 }]);
    setMessage(`Find the hive! Round ${currentRound}/1`);
    setTimeLeft(500);
    setTimerActive(true);
    setLastSpokenLetter('');
  };

  const handleTimeOut = () => {
    setTimerActive(false);
    loseLife();
    
    if (initialLives <= 1) {
      setMessage("Game Over! You ran out of lives!");
      setTimeout(() => {
        setCurrentRound(1);
        proceed(score);
      }, 2000);
    } else {
      setMessage(`Time's up! Lost a life. ${initialLives - 1} lives remaining. Restarting round ${currentRound}`);
      setTimeout(() => {
        generateMaze();
      }, 1500);
    }
  };

  const handleReachHive = () => {
    setTimerActive(false);
    // Play success sound when reaching the final letter
    playSuccessSound();
    
    if (currentRound < 1) {
      setMessage(`Round ${currentRound} complete! Starting round ${currentRound + 1}`);
      setTimeout(() => {
        setCurrentRound(prev => prev + 1);
        generateMaze();
      }, 1500);
    } else {
      setMessage('Congratulations! You completed all 5 rounds!');
      setTimeout(() => {
        proceed(score + 100);
      }, 2000);
    }
  };

  const findPath = (start, end) => {
    const queue = [[start]];
    const visited = new Set([`${start.x},${start.y}`]);
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 1, dy: 0 },  // right
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
    ];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current.x === end.x && current.y === end.y) {
        return path.slice(1);
      }

      for (const dir of directions) {
        const next = {
          x: current.x + dir.dx,
          y: current.y + dir.dy,
        };
        const key = `${next.x},${next.y}`;

        if (
          !visited.has(key) &&
          maze[next.y]?.[next.x] === 0
        ) {
          visited.add(key);
          queue.push([...path, next]);
        }
      }
    }

    return [];
  };

  const animateMovement = (path) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < path.length) {
        setPlayerPosition(path[i]);
        setVisited(prev => [...prev, path[i]]);
        
        const posKey = `${path[i].x},${path[i].y}`;
        if (letters[posKey]) {
          const updatedLetters = { ...letters };
          delete updatedLetters[posKey];
          setLetters(updatedLetters);
          setScore(prev => prev + 10);
          
          // Play success sound when collecting a letter
          if (posKey === `${exitPosition.x},${exitPosition.y}`) {
            playSuccessSound();
          }
        }

        if (path[i].x === exitPosition.x && path[i].y === exitPosition.y) {
          handleReachHive();
          clearInterval(interval);
        }

        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);
  };

  const moveBeeToPosition = (targetPos) => {
    const path = findPath(playerPosition, targetPos);
    if (path.length > 0) {
      animateMovement(path);
    } else {
      setMessage("No valid path to that letter!");
    }
  };

  const renderCell = (cellValue, x, y) => {
    console.log(`Rendering cell ${x},${y}`, {
      cellValue,
      playerPosition,
      exitPosition,
      visited,
      letters
    });
    
    const isPlayer = playerPosition && x === playerPosition.x && y === playerPosition.y;
    const isExit = exitPosition && x === exitPosition.x && y === exitPosition.y;
    const wasVisited = visited && visited.some(pos => pos && pos.x === x && pos.y === y);
    const hasLetter = letters && letters[`${x},${y}`];

    if (cellValue === undefined) return null; 

    return (
      <div
        key={`${x}-${y}`}
        className={`maze-cell ${
          isPlayer ? 'player' :
          isExit ? 'exit' :
          wasVisited ? 'visited' :
          cellValue === 1 ? 'wall' : 'path'
        }`}
      >
        {isPlayer && <div className="bee">🐝</div>}
        {isExit && (
          <>
            <div className="beehouse">🏡</div>
            {hasLetter && <div className="maze-letter exit-letter">{hasLetter}</div>}
          </>
        )}
        {!isExit && hasLetter && (
          <div className="maze-letter">{hasLetter}</div>
        )}
      </div>
    );
  };

  const skipTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <div className="mobile-maze-container">
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>Welcome to Voice-Controlled Bee Maze! 🐝</h2>
            <div className="tutorial-steps">
              <div className="tutorial-step">
                <span className="step-number">1</span>
                <p>Click the microphone button to enable voice control 🎤</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">2</span>
                <p>Say a letter clearly to guide the bee to that letter 🗣️</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">3</span>
                <p>Collect letters and reach the hive 🏡</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">4</span>
                <p>Complete before time runs out! ⏱️</p>
              </div>
            </div>
            <button onClick={skipTutorial} className="start-playing-btn">
              Start Playing!
            </button>
          </div>
        </div>
      )}
      
      <div className="header">
        <span>Busy Bee Challenge</span>
        <div className="header-info">
          <span>Round: {currentRound}/1</span>
          <span>Time: {timeLeft}s</span>
          <span>Find its way home</span>
        </div>
      </div>
      
      <h1>🐝Voice-Controlled Bee Maze🍯</h1>
      
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
                Listening... Say a letter
              </>
            ) : (
              '🎤 Enable Voice Control'
            )}
          </button>
        )}
        <div className="voice-feedback">
          {lastSpokenLetter && (
            <>
              <span>You said: </span>
              <span className="detected-letter">{lastSpokenLetter}</span>
            </>
          )}
          <div className="available-letters">
            Available letters: {Object.values(letters).join(', ')}
          </div>
        </div>
      </div>
      
      <div className="maze-wrapper">
        <div className="maze-grid">
          {isMazeReady ? (
            maze.map((row, y) => (
              <div key={y} className="maze-row">
                {row.map((cell, x) => renderCell(cell, x, y))}
              </div>
            ))
          ) : (
            <div className="maze-loading">Loading maze...</div>
          )}
        </div>
      </div>

      <div className="instructions">
        <p><strong>How to Play:</strong></p>
        <ul>
          <li>{isSpeechSupported ? 'Click the microphone button and say a letter clearly' : 'Use your keyboard to type letters (A-Z)'}</li>
          <li>Collect letters and reach the hive 🏡</li>
          <li>Complete all 5 rounds before time runs out!</li>
          {!isSpeechSupported && <li>Voice control is not supported in your browser</li>}
        </ul>
      </div>
    </div>
  );
};

export default Phase4;