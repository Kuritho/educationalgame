// components/Phase4.js - SIMPLIFIED WITH DIRECT PERMISSION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/Phase4.css';

const Phase4 = ({ proceed, loseLife, lives: initialLives }) => {
  const [maze, setMaze] = useState([[]]);
  const [letters, setLetters] = useState({});
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [exitPosition, setExitPosition] = useState({ x: 0, y: 0 });
  const [visited, setVisited] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Find the hive! Round 1/5');
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(true);
  const [listening, setListening] = useState(false);
  const [lastSpokenLetter, setLastSpokenLetter] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isMazeReady, setIsMazeReady] = useState(false);
  
  const recognitionRef = useRef(null);

  const letterPool = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
                     'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

  // Request permission using the global function
  const requestPermission = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setMessage('Requesting microphone access...');
    
    try {
      // Use the global function from index.html
      if (window.requestMicrophonePermission) {
        const granted = await window.requestMicrophonePermission();
        setPermissionGranted(granted);
        if (granted) {
          setMessage('✅ Microphone ready! Click the mic button to start.');
          initSpeechRecognition();
        } else {
          setMessage('❌ Please grant microphone permission in settings.');
        }
      } else {
        // Fallback for browser
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);
        setMessage('✅ Microphone ready!');
        initSpeechRecognition();
      }
    } catch (error) {
      console.error('Permission error:', error);
      setPermissionGranted(false);
      setMessage('❌ Could not access microphone. Please check permissions.');
    }
    setIsRequesting(false);
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage('Speech recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setListening(true);
      setMessage('🎤 Listening... Say a letter');
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const word = result[0].transcript.trim().toUpperCase();
      if (word.length === 1 && /[A-Z]/.test(word)) {
        handleDetectedLetter(word);
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setListening(false);
    };

    recognitionRef.current = recognition;
  };

  const toggleListening = () => {
    if (!permissionGranted) {
      requestPermission();
      return;
    }
    
    if (!recognitionRef.current) {
      initSpeechRecognition();
    }
    
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setMessage('🎤 Microphone off');
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Start error:', e);
      }
    }
  };

  // Generate maze
  const generateMaze = () => {
    setIsMazeReady(false);
    const size = 17;
    const grid = Array(size).fill().map(() => Array(size).fill(1));
    const newLetters = {};

    const carve = (x, y) => {
      grid[y][x] = 0;
      const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1 && grid[ny][nx] === 1) {
          grid[(y+ny)/2][(x+nx)/2] = 0;
          carve(nx, ny);
        }
      }
      setIsMazeReady(true);
    };

    carve(1, 1);
    const exitX = size-2, exitY = size-2;
    grid[exitY][exitX] = 0;

    const positions = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x] === 0 && !(x===1&&y===1) && !(x===exitX&&y===exitY)) {
          positions.push({x, y});
        }
      }
    }

    const shuffledLetters = [...letterPool].sort(() => Math.random() - 0.5);
    positions.sort(() => Math.random() - 0.5).forEach((pos, i) => {
      if (shuffledLetters[i]) newLetters[`${pos.x},${pos.y}`] = shuffledLetters[i];
    });

    setMaze(grid);
    setLetters(newLetters);
    setPlayerPosition({ x: 1, y: 1 });
    setExitPosition({ x: exitX, y: exitY });
    setVisited([{ x: 1, y: 1 }]);
    setTimeLeft(60);
    setTimerActive(true);
  };

  useEffect(() => {
    generateMaze();
  }, [currentRound]);

  // Timer
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      loseLife();
      setMessage(`Time's up! ${initialLives - 1} lives left`);
      if (initialLives <= 1) setTimeout(() => proceed(score), 2000);
      else setTimeout(() => generateMaze(), 1500);
      setTimerActive(false);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, timerActive]);

  const handleDetectedLetter = (letter) => {
    setLastSpokenLetter(letter);
    const pos = Object.entries(letters).find(([, l]) => l === letter)?.[0];
    if (pos) {
      const [x, y] = pos.split(',').map(Number);
      moveToPosition({ x, y });
    }
  };

  const findPath = (start, end) => {
    const queue = [[start]];
    const visitedSet = new Set([`${start.x},${start.y}`]);
    const dirs = [[0,-1],[1,0],[0,1],[-1,0]];
    while (queue.length) {
      const path = queue.shift();
      const current = path[path.length-1];
      if (current.x === end.x && current.y === end.y) return path.slice(1);
      for (const [dx, dy] of dirs) {
        const next = { x: current.x + dx, y: current.y + dy };
        const key = `${next.x},${next.y}`;
        if (!visitedSet.has(key) && maze[next.y]?.[next.x] === 0) {
          visitedSet.add(key);
          queue.push([...path, next]);
        }
      }
    }
    return [];
  };

  const moveToPosition = (target) => {
    const path = findPath(playerPosition, target);
    if (!path.length) {
      setMessage('No path to that letter!');
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      if (i < path.length) {
        setPlayerPosition(path[i]);
        setVisited(prev => [...prev, path[i]]);
        const key = `${path[i].x},${path[i].y}`;
        if (letters[key]) {
          const newLetters = { ...letters };
          delete newLetters[key];
          setLetters(newLetters);
          setScore(s => s + 10);
        }
        if (path[i].x === exitPosition.x && path[i].y === exitPosition.y) {
          clearInterval(interval);
          if (currentRound < 5) {
            setMessage(`Round ${currentRound} complete!`);
            setTimeout(() => setCurrentRound(r => r + 1), 1500);
          } else {
            setMessage('All rounds complete!');
            setTimeout(() => proceed(score + 100), 2000);
          }
          setTimerActive(false);
        }
        i++;
      } else {
        clearInterval(interval);
      }
    }, 200);
  };

  const renderCell = (cell, x, y) => {
    const isPlayer = playerPosition?.x === x && playerPosition?.y === y;
    const isExit = exitPosition?.x === x && exitPosition?.y === y;
    const letter = letters[`${x},${y}`];
    
    return (
      <div key={`${x}-${y}`} className={`maze-cell ${cell === 1 ? 'wall' : 'path'} ${isPlayer ? 'player' : ''} ${isExit ? 'exit' : ''}`}>
        {isPlayer && <div className="bee">🐝</div>}
        {isExit && <div className="hive">🍯</div>}
        {!isPlayer && !isExit && letter && <div className="letter">{letter}</div>}
      </div>
    );
  };

  // Permission modal
  if (!permissionGranted) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a2a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '320px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎤</div>
          <h2 style={{ color: '#6a1b9a', marginBottom: '15px' }}>Microphone Required</h2>
          <p style={{ marginBottom: '30px', color: '#666' }}>
            Tap the button below to allow microphone access for voice control.
          </p>
          <button
            onClick={requestPermission}
            disabled={isRequesting}
            style={{
              backgroundColor: '#7b1fa2',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '50px',
              cursor: 'pointer',
              width: '100%',
              touchAction: 'manipulation'
            }}
          >
            {isRequesting ? 'Requesting...' : '🎤 Allow Microphone'}
          </button>
          <p style={{ fontSize: '11px', color: '#999', marginTop: '20px' }}>
            Your voice is processed locally and never stored
          </p>
        </div>
      </div>
    );
  }

  // Main game
  return (
    <div className="phase4-container">
      <div className="game-header">
        <div>🐝 Bee Maze - Round {currentRound}/5</div>
        <div className="stats">
          <span>⭐ {score}</span>
          <span>❤️ {initialLives}</span>
          <span>⏱️ {timeLeft}s</span>
        </div>
      </div>

      <div className="message-box">{message}</div>

      <div className="mic-button-container">
        <button 
          className={`mic-button ${listening ? 'listening' : ''}`}
          onClick={toggleListening}
          style={{
            padding: '15px 30px',
            fontSize: '20px',
            borderRadius: '50px',
            border: 'none',
            backgroundColor: listening ? '#e74c3c' : '#7b1fa2',
            color: 'white',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          {listening ? '🎤 Listening... Tap to Stop' : '🎤 Tap to Say a Letter'}
        </button>
        {lastSpokenLetter && <div className="last-letter">Last: {lastSpokenLetter}</div>}
      </div>

      <div className="letters-remaining">
        Letters: {Object.values(letters).join(', ') || 'None left! Find the hive!'}
      </div>

      <div className="maze-container">
        {isMazeReady && maze.map((row, y) => (
          <div key={y} className="maze-row">
            {row.map((cell, x) => renderCell(cell, x, y))}
          </div>
        ))}
      </div>

      {showTutorial && (
        <div className="tutorial" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-content">
            <h3>How to Play</h3>
            <p>1. Tap the mic button and say a letter</p>
            <p>2. The bee will move to that letter</p>
            <p>3. Collect all letters to reach the hive 🍯</p>
            <button>Got it!</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .phase4-container {
          max-width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a2a3a, #0f1a24);
          padding: 20px;
          color: white;
        }
        .game-header {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          background: rgba(0,0,0,0.3);
          border-radius: 20px;
          margin-bottom: 20px;
        }
        .stats {
          display: flex;
          gap: 20px;
        }
        .message-box {
          background: #34495e;
          padding: 12px;
          border-radius: 15px;
          text-align: center;
          margin-bottom: 20px;
        }
        .mic-button-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .last-letter {
          text-align: center;
          margin-top: 10px;
          font-size: 18px;
          color: #ffd700;
        }
        .letters-remaining {
          background: #2c3e50;
          padding: 12px;
          border-radius: 15px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 18px;
        }
        .maze-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          background: #2c3e50;
          padding: 10px;
          border-radius: 15px;
          overflow-x: auto;
        }
        .maze-row {
          display: flex;
          gap: 2px;
          justify-content: center;
        }
        .maze-cell {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          border-radius: 6px;
        }
        .wall {
          background: #1a1a2e;
        }
        .path {
          background: #f0e6d2;
        }
        .player {
          background: #f39c12;
        }
        .exit {
          background: #27ae60;
        }
        .bee, .hive {
          font-size: 18px;
        }
        .letter {
          color: #2c3e50;
          font-weight: bold;
        }
        .tutorial {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .tutorial-content {
          background: white;
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          color: #333;
        }
        .tutorial-content button {
          margin-top: 20px;
          padding: 10px 30px;
          background: #7b1fa2;
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 16px;
        }
        @media (max-width: 600px) {
          .maze-cell {
            width: 22px;
            height: 22px;
            font-size: 11px;
          }
          .bee, .hive {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Phase4;