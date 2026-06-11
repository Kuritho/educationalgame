// components/Phase4.js - Redesigned with Colors
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
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isMazeReady, setIsMazeReady] = useState(false);
  const [collectedLetters, setCollectedLetters] = useState([]);
  
  const recognitionRef = useRef(null);

  const letterPool = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
                     'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

  const getRandomColor = () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#F39C12', '#E74C3C', '#3498DB', '#9B59B6',
      '#1ABC9C', '#E67E22', '#2ECC71', '#E84393', '#F1C40F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const requestMicrophonePermission = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setMessage('🎤 Requesting microphone access...');
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      setMessage('✅ Microphone granted! Click the mic button to start!');
      initSpeechRecognition();
      return true;
      
    } catch (error) {
      setPermissionStatus('denied');
      if (error.name === 'NotAllowedError') {
        setMessage('❌ Microphone denied. Please enable in settings.');
      } else if (error.name === 'NotFoundError') {
        setMessage('❌ No microphone found on this device.');
      } else {
        setMessage('❌ Could not access microphone.');
      }
      return false;
    } finally {
      setIsRequesting(false);
    }
  };

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
      setListening(true);
      setMessage('🎤 Listening... Say a letter clearly!');
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim().toUpperCase();
      
      if (transcript.length === 1 && /[A-Z]/i.test(transcript)) {
        handleDetectedLetter(transcript);
      } else {
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
        setMessage(`❓ Didn't catch that. Try saying just the letter!`);
      }
    };

    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setListening(false);
      
      if (event.error === 'not-allowed') {
        setMessage('Microphone access denied. Please check permissions.');
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
        setMessage('Error starting voice recognition.');
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
      const dirs = [[0, -2], [2, 0], [0, 2], [-2, 0]].sort(() => Math.random() - 0.5);
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1 && grid[ny][nx] === 1) {
          grid[(y+ny)/2][(x+nx)/2] = 0;
          carve(nx, ny);
        }
      }
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
      if (shuffledLetters[i]) {
        newLetters[`${pos.x},${pos.y}`] = {
          letter: shuffledLetters[i],
          color: getRandomColor()
        };
      }
    });

    setMaze(grid);
    setLetters(newLetters);
    setPlayerPosition({ x: 1, y: 1 });
    setExitPosition({ x: exitX, y: exitY });
    setVisited([{ x: 1, y: 1 }]);
    setTimeLeft(60);
    setTimerActive(true);
    setCollectedLetters([]);
  };

  useEffect(() => {
    generateMaze();
  }, [currentRound]);

  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      loseLife();
      setMessage(`⏰ Time's up! ${initialLives - 1} lives left`);
      if (initialLives <= 1) setTimeout(() => proceed(score), 2000);
      else setTimeout(() => generateMaze(), 1500);
      setTimerActive(false);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, timerActive]);

  const handleDetectedLetter = (letter) => {
    setLastSpokenLetter(letter);
    const pos = Object.entries(letters).find(([, l]) => l.letter === letter)?.[0];
    if (pos) {
      const [x, y] = pos.split(',').map(Number);
      moveToPosition({ x, y });
    } else {
      const remainingLetters = Object.values(letters).map(l => l.letter).join(', ');
      setMessage(`❌ ${letter} not available. Try: ${remainingLetters}`);
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
      setMessage('🚫 No path to that letter!');
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      if (i < path.length) {
        setPlayerPosition(path[i]);
        setVisited(prev => [...prev, path[i]]);
        const key = `${path[i].x},${path[i].y}`;
        if (letters[key]) {
          const letterData = letters[key];
          setCollectedLetters(prev => [...prev, letterData.letter]);
          const newLetters = { ...letters };
          delete newLetters[key];
          setLetters(newLetters);
          setScore(s => s + 10);
          setMessage(`🎉 Collected letter ${letterData.letter}! +10 points`);
        }
        if (path[i].x === exitPosition.x && path[i].y === exitPosition.y) {
          clearInterval(interval);
          if (currentRound < 5) {
            setMessage(`🏆 Round ${currentRound} complete! +50 points! 🏆`);
            setScore(s => s + 50);
            setTimeout(() => setCurrentRound(r => r + 1), 2000);
          } else {
            setMessage('🎉🎉 GRAND CHAMPION! All rounds complete! 🎉🎉');
            setTimeout(() => proceed(score + 200), 2500);
          }
          setTimerActive(false);
        }
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150);
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return '#E74C3C';
    if (timeLeft <= 20) return '#F39C12';
    return '#2ECC71';
  };

  const renderCell = (cell, x, y) => {
    const isPlayer = playerPosition?.x === x && playerPosition?.y === y;
    const isExit = exitPosition?.x === x && exitPosition?.y === y;
    const letterData = letters[`${x},${y}`];
    const isVisited = visited.some(v => v.x === x && v.y === y);
    
    return (
      <div 
        key={`${x}-${y}`} 
        className={`maze-cell ${cell === 1 ? 'wall' : 'path'} ${isPlayer ? 'player' : ''} ${isExit ? 'exit' : ''} ${isVisited && !isPlayer ? 'visited' : ''}`}
        style={letterData && !isPlayer && !isExit ? { backgroundColor: letterData.color + '40' } : {}}
      >
        {isPlayer && <div className="bee">🐝</div>}
        {isExit && <div className="hive">🍯</div>}
        {!isPlayer && !isExit && letterData && (
          <div className="letter" style={{ color: letterData.color, fontWeight: 'bold' }}>
            {letterData.letter}
          </div>
        )}
      </div>
    );
  };

  if (permissionStatus !== 'granted') {
    return (
      <div className="permission-modal-container">
        <div className="permission-overlay">
          <div className="permission-modal">
            <div className="permission-icon">🎤</div>
            <h2>Microphone Required</h2>
            <p>This game needs microphone access for voice control. Your privacy is important - voice is processed locally.</p>
            <button
              className="permission-allow-btn"
              onClick={requestMicrophonePermission}
              disabled={isRequesting}
            >
              {isRequesting ? '🎤 Requesting...' : '🎤 Allow Microphone Access'}
            </button>
            {permissionStatus === 'denied' && (
              <p className="permission-privacy">Please check your browser settings to enable microphone access.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phase4-container">
      <div className="game-header">
        <div className="header-left">
          <span className="bee-icon">🐝</span>
          <span className="round-text">Round {currentRound}/5</span>
        </div>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <span>{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">❤️</span>
            <span>{initialLives}</span>
          </div>
          <div className="stat-item timer" style={{ color: getTimerColor() }}>
            <span className="stat-icon">⏱️</span>
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="message-box" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        {message}
      </div>

      <div className="mic-button-container">
        <button 
          className={`mic-button ${listening ? 'listening' : ''}`}
          onClick={toggleVoiceControl}
        >
          <span className="mic-icon">{listening ? '🔴' : '🎤'}</span>
          {listening ? 'Listening... Tap to Stop' : 'Tap to Say a Letter'}
        </button>
        {lastSpokenLetter && (
          <div className="last-letter">
            Last said: <strong style={{ color: '#FF6B6B', fontSize: '24px' }}>{lastSpokenLetter}</strong>
          </div>
        )}
      </div>

      <div className="letters-remaining">
        <div className="letters-title">📍 Collect These Letters:</div>
        <div className="letters-grid">
          {Object.values(letters).map((l, idx) => (
            <span key={idx} className="letter-badge" style={{ backgroundColor: l.color }}>
              {l.letter}
            </span>
          ))}
          {Object.keys(letters).length === 0 && (
            <span className="hive-message">✨ Go to the hive! ✨</span>
          )}
        </div>
      </div>

      <div className="collected-letters">
        <div className="collected-title">✅ Collected:</div>
        <div className="collected-grid">
          {collectedLetters.map((letter, idx) => (
            <span key={idx} className="collected-badge">✓ {letter}</span>
          ))}
        </div>
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
            <h2>🎤 Welcome to Voice Maze! 🐝</h2>
            <div className="tutorial-step">
              <div className="step-number">1</div>
              <p>Tap the mic button and say a letter clearly</p>
            </div>
            <div className="tutorial-step">
              <div className="step-number">2</div>
              <p>Watch the bee fly to that letter! 🐝</p>
            </div>
            <div className="tutorial-step">
              <div className="step-number">3</div>
              <p>Collect all letters to reach the hive 🍯</p>
            </div>
            <div className="tutorial-step">
              <div className="step-number">4</div>
              <p>Complete 5 rounds to become champion! 🏆</p>
            </div>
            <button className="start-btn" onClick={() => setShowTutorial(false)}>
              Let's Play! 🎮
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Phase4;