// components/Phase4.js - Alternative with proper permission handling
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
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [isRequesting, setIsRequesting] = useState(false);
  const [isMazeReady, setIsMazeReady] = useState(false);
  
  const recognitionRef = useRef(null);

  const letterPool = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
                     'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

  // Request microphone permission directly
  const requestMicrophonePermission = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setMessage('Requesting microphone access...');
    
    try {
      console.log('Requesting microphone permission...');
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      console.log('Microphone permission granted!');
      setPermissionStatus('granted');
      setMessage('✅ Microphone access granted! Click the mic button to start voice control.');
      
      // Initialize speech recognition after permission is granted
      initSpeechRecognition();
      
      return true;
      
    } catch (error) {
      console.error('Microphone permission error:', error);
      setPermissionStatus('denied');
      
      if (error.name === 'NotAllowedError') {
        setMessage('❌ Microphone permission denied. Please enable microphone in your device settings.');
      } else if (error.name === 'NotFoundError') {
        setMessage('❌ No microphone found on this device.');
      } else {
        setMessage('❌ Could not access microphone. Error: ' + error.message);
      }
      
      return false;
      
    } finally {
      setIsRequesting(false);
    }
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setMessage('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setListening(true);
      setMessage('🎤 Listening... Say a letter clearly');
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setListening(false);
    };

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim().toUpperCase();
      console.log('Detected:', transcript);
      
      // Check if it's a single letter
      if (transcript.length === 1 && /[A-Z]/i.test(transcript)) {
        handleDetectedLetter(transcript);
      } else {
        // Check for letter names (BEE = B, SEE = C, etc.)
        const letterMap = {
          'AY': 'A', 'BEE': 'B', 'SEE': 'C', 'DEE': 'D', 'EE': 'E',
          'EFF': 'F', 'GEE': 'G', 'AITCH': 'H', 'EYE': 'I', 'JAY': 'J',
          'KAY': 'K', 'EL': 'L', 'EM': 'M', 'EN': 'N', 'OH': 'O',
          'PEE': 'P', 'CUE': 'Q', 'AR': 'R', 'ESS': 'S', 'TEE': 'T',
          'YOU': 'U', 'VEE': 'V', 'DOUBLE YOU': 'W', 'EX': 'X', 'WHY': 'Y', 'ZEE': 'Z'
        };
        
        for (const [pronunciation, letter] of Object.entries(letterMap)) {
          if (transcript.includes(pronunciation)) {
            handleDetectedLetter(letter);
            return;
          }
        }
        
        setMessage(`Didn't catch that. Try saying just the letter, like "B" or "BEE" for B`);
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setListening(false);
      
      if (event.error === 'not-allowed') {
        setMessage('Microphone access was denied. Please check permissions.');
        setPermissionStatus('denied');
      } else {
        setMessage(`Error: ${event.error}. Try again.`);
      }
    };

    recognitionRef.current = recognition;
  };

  const toggleVoiceControl = () => {
    if (permissionStatus !== 'granted') {
      requestMicrophonePermission();
      return;
    }
    
    if (!recognitionRef.current) {
      initSpeechRecognition();
    }
    
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setListening(false);
      setMessage('🎤 Microphone turned off');
    } else {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Failed to start:', error);
        setMessage('Error starting voice recognition. Try again.');
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
    } else {
      setMessage(`${letter} not available. Try: ${Object.values(letters).join(', ')}`);
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
            setMessage(`Round ${currentRound} complete! +50 points`);
            setScore(s => s + 50);
            setTimeout(() => setCurrentRound(r => r + 1), 1500);
          } else {
            setMessage('🎉 All rounds complete! 🎉');
            setTimeout(() => proceed(score + 200), 2000);
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

  // Permission modal - shows when permission not granted
  if (permissionStatus !== 'granted') {
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
        zIndex: 999999,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '30px',
          padding: '40px 30px',
          maxWidth: '350px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎤</div>
          <h2 style={{ color: '#6a1b9a', marginBottom: '15px', fontSize: '24px' }}>Microphone Required</h2>
          <p style={{ marginBottom: '25px', color: '#666', lineHeight: '1.5' }}>
            This game needs microphone access for voice control.
          </p>
          <button
            onClick={requestMicrophonePermission}
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
          {permissionStatus === 'denied' && (
            <p style={{ fontSize: '12px', color: '#e74c3c', marginTop: '15px' }}>
              If you don't see the permission popup, please check your device settings.
            </p>
          )}
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
        <span>🐝 Bee Maze - Round {currentRound}/5</span>
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
          onClick={toggleVoiceControl}
        >
          {listening ? '🎤 Listening... Tap to Stop' : '🎤 Tap to Say a Letter'}
        </button>
        {lastSpokenLetter && <div className="last-letter">Last said: {lastSpokenLetter}</div>}
      </div>

      <div className="letters-remaining">
        📍 Find: {Object.values(letters).join(', ') || 'Go to the hive! 🍯'}
      </div>

      <div className="maze-wrapper">
        <div className="maze-grid">
          {isMazeReady && maze.map((row, y) => (
            <div key={y} className="maze-row">
              {row.map((cell, x) => renderCell(cell, x, y))}
            </div>
          ))}
        </div>
      </div>

      {showTutorial && (
        <div className="tutorial-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-content">
            <h2>🎤 Voice-Controlled Bee Maze</h2>
            <div className="tutorial-step">1. Tap the mic button and say a letter</div>
            <div className="tutorial-step">2. The bee will move to that letter 🐝</div>
            <div className="tutorial-step">3. Collect all letters to reach the hive 🍯</div>
            <div className="tutorial-step">4. Complete 5 rounds to win! 🏆</div>
            <button className="start-btn">Start Playing!</button>
          </div>
        </div>
      )}

      <style>{`
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
          padding: 15px 20px;
          background: rgba(0,0,0,0.3);
          border-radius: 20px;
          margin-bottom: 20px;
          font-weight: bold;
          font-size: 18px;
        }
        .stats {
          display: flex;
          gap: 20px;
        }
        .message-box {
          background: #34495e;
          padding: 12px 20px;
          border-radius: 20px;
          text-align: center;
          margin-bottom: 20px;
          font-size: 16px;
        }
        .mic-button-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .mic-button {
          background: #7b1fa2;
          color: white;
          border: none;
          padding: 18px 30px;
          font-size: 20px;
          border-radius: 60px;
          cursor: pointer;
          font-weight: bold;
          transition: transform 0.05s;
        }
        .mic-button.listening {
          background: #e74c3c;
          animation: pulse 1s infinite;
        }
        .mic-button:active {
          transform: scale(0.97);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .last-letter {
          text-align: center;
          margin-top: 12px;
          font-size: 18px;
          color: #ffd700;
        }
        .letters-remaining {
          background: #2c3e50;
          padding: 14px;
          border-radius: 20px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 18px;
        }
        .maze-wrapper {
          background: #2c3e50;
          padding: 15px;
          border-radius: 20px;
          overflow-x: auto;
        }
        .maze-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .maze-row {
          display: flex;
          gap: 2px;
          justify-content: center;
        }
        .maze-cell {
          width: 30px;
          height: 30px;
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
        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .tutorial-content {
          background: white;
          padding: 30px;
          border-radius: 30px;
          max-width: 300px;
          text-align: center;
          color: #333;
        }
        .tutorial-content h2 {
          color: #7b1fa2;
          margin-bottom: 20px;
        }
        .tutorial-step {
          background: #f0f0f0;
          padding: 12px;
          margin: 10px 0;
          border-radius: 15px;
          font-size: 14px;
        }
        .start-btn {
          background: #7b1fa2;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 30px;
          font-size: 16px;
          margin-top: 15px;
          cursor: pointer;
        }
        @media (max-width: 600px) {
          .maze-cell {
            width: 24px;
            height: 24px;
            font-size: 11px;
          }
          .bee, .hive {
            font-size: 14px;
          }
          .mic-button {
            padding: 15px 25px;
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default Phase4;