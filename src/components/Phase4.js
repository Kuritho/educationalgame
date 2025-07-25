import React, { useState, useEffect, useRef } from 'react';
import '../styles/Phase4.css';
import LivesCounter from './LivesCounter';

const Phase4 = ({ proceed, loseLife, lives: initialLives }) => {
  const [maze, setMaze] = useState([]);
  const [letters, setLetters] = useState({});
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [exitPosition, setExitPosition] = useState({ x: 15, y: 15 });
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
  const recognitionRef = useRef(null);

  const letterPool = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
                     'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

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

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setMessage('Voice control not supported in your browser. Use keyboard instead.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const result = event.results[event.results.length - 1][0].transcript;
      const spokenLetter = result.trim().toUpperCase().charAt(0);
      
      setLastSpokenLetter(spokenLetter);
      
      const letterPos = Object.entries(letters).find(
        ([_, letter]) => letter === spokenLetter
      );

      if (letterPos) {
        const [posKey] = letterPos;
        const [x, y] = posKey.split(',').map(Number);
        moveBeeToPosition({ x, y });
      } else {
        setMessage(`Letter "${spokenLetter}" not found. Try: ${Object.values(letters).join(', ')}`);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
      
      let errorMessage = 'Voice control error: ';
      switch(event.error) {
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          if (retryCount < 3) {
            const delay = Math.min(1000 * (2 ** retryCount), 8000);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              recognitionRef.current.start();
            }, delay);
            return;
          }
          break;
        case 'not-allowed':
        case 'permission-denied':
          errorMessage = 'Microphone access denied. Please allow microphone permissions.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your audio devices.';
          break;
        default:
          errorMessage = `Voice recognition error (${event.error}). Try again later.`;
      }
      
      setMessage(errorMessage);
    };

    recognitionRef.current.onstart = () => {
      setRetryCount(0);
    };

    recognitionRef.current.onend = () => {
      if (listening) {
        recognitionRef.current.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [letters, listening, retryCount]);

  // Keyboard fallback
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (listening) return; // Skip if voice control is active
      
      const pressedKey = e.key.toUpperCase();
      if (letterPool.includes(pressedKey)) {
        setLastSpokenLetter(pressedKey);
        
        const letterPos = Object.entries(letters).find(
          ([_, letter]) => letter === pressedKey
        );

        if (letterPos) {
          const [posKey] = letterPos;
          const [x, y] = posKey.split(',').map(Number);
          moveBeeToPosition({ x, y });
        } else {
          setMessage(`Letter "${pressedKey}" not found. Try: ${Object.values(letters).join(', ')}`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [letters, listening]);

  const generateMaze = () => {
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
    setMessage(`Find the hive! Round ${currentRound}/5`);
    setTimeLeft(300);
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
    if (currentRound < 5) {
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

  const toggleVoiceControl = () => {
    if (!recognitionRef.current) {
      setMessage('Voice control not supported in your browser');
      return;
    }

    // Check network connection
    if (!navigator.onLine) {
      setMessage('Network unavailable. Voice control requires internet connection.');
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      setMessage('Voice control turned off');
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
        setMessage('Listening... Say a letter to move');
      } catch (e) {
        console.error('Failed to start recognition:', e);
        setMessage('Error starting voice control. Please refresh and try again.');
      }
    }
  };

  const renderCell = (cellValue, x, y) => {
    const isPlayer = x === playerPosition.x && y === playerPosition.y;
    const isExit = x === exitPosition.x && y === exitPosition.y;
    const wasVisited = visited.some(pos => pos.x === x && pos.y === y);
    const hasLetter = letters[`${x},${y}`];

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

  return (
    <div className="mobile-maze-container">
      <div className="header">
        <span>Busy Bee Challenge</span>
        <div className="header-info">
          <span>Round: {currentRound}/5</span>
          <span>Time: {timeLeft}s</span>
          <span>Score: {score}</span>
        </div>
      </div>
      <LivesCounter lives={initialLives} />
      <h1>🐝 Voice-Controlled Bee Maze 🍯</h1>
      
      <div className="message-box">{message}</div>
      
      <div className="voice-control-panel">
        {isSpeechSupported && (
          <button 
            onClick={toggleVoiceControl}
            className={`voice-control-button ${listening ? 'active' : ''}`}
          >
            {listening ? '🎤 Listening... (Say a letter)' : '🎤 Enable Voice Control'}
          </button>
        )}
        <div className="voice-feedback">
          {lastSpokenLetter && `You said: ${lastSpokenLetter}`}
          <div className="available-letters">
            Available letters: {Object.values(letters).join(', ')}
          </div>
        </div>
      </div>
      
      <div className="maze-wrapper">
        <div className="maze-grid">
          {maze.map((row, y) => (
            <div key={y} className="maze-row">
              {row.map((cell, x) => renderCell(cell, x, y))}
            </div>
          ))}
        </div>
      </div>

      <div className="instructions">
        <p><strong>How to Play:</strong></p>
        <ul>
          <li>{isSpeechSupported ? 'Click the microphone button and say a letter to move' : 'Use your keyboard to type letters (A-Z)'}</li>
          <li>Collect letters (10pts each) and reach the hive 🏡</li>
          <li>Complete all 5 rounds before time runs out!</li>
          {!isSpeechSupported && <li>Voice control is not supported in your browser</li>}
        </ul>
      </div>
    </div>
  );
};

export default Phase4;