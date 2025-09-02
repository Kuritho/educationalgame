import React, { useState, useEffect, useRef } from 'react';
import './styles/Phase5.css';

const SQUARE_WORDS = [
  'apple', 'banana', 'cat', 'dog', 'elephant',
  'flower', 'giraffe', 'house', 'ice cream'
];

const WIN_SOUND = '/sounds/success.mp3';
const LOSE_SOUND = '/sounds/lose.mp3';
const BACKGROUND_MUSIC = '/sounds/bgm.mp3';

function Square({ value, word, isWinning, onClick, isTeacherMode, isTeacherTurn }) {
  return (
    <div 
      className={`squared ${value || 'empty'} ${isWinning ? 'win-square' : ''} ${isTeacherMode && isTeacherTurn && !value ? 'teacher-active' : ''}`}
      onClick={onClick}
    >
      <div className="squared-words">{word}</div>
      {value && <div className="squared-marks">{value}</div>}
      {isWinning && <span className="trophy-icon">🏆</span>}
    </div>
  );
}

function Board({ squares, spokenWords, winningSquares, onSquareClick, isTeacherMode, isTeacherTurn }) {
  return (
    <div className="game-brd">
      {squares.map((_, i) => (
        <Square
          key={i}
          value={squares[i]}
          word={spokenWords[i]}
          isWinning={winningSquares.includes(i)}
          onClick={() => onSquareClick(i)}
          isTeacherMode={isTeacherMode}
          isTeacherTurn={isTeacherTurn}
        />
      ))}
    </div>
  );
}

function Phase5({ proceed, loseLife }) {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [gameWon, setGameWon] = useState(false);
  const [winningSquares, setWinningSquares] = useState([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [spokenWords, setSpokenWords] = useState([...SQUARE_WORDS].sort(() => Math.random() - 0.5));
  const [feedback, setFeedback] = useState('');
  const [playerTurn, setPlayerTurn] = useState(1);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const [isTeacherMode, setIsTeacherMode] = useState(true);
  const [isTeacherTurn, setIsTeacherTurn] = useState(false);

  const winSoundRef = useRef(null);
  const loseSoundRef = useRef(null);
  const backgroundMusicRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      setFeedback('Voice control not supported. Click squares instead.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      const spokenWord = event.results[0][0].transcript.trim().toLowerCase();
      handleVoiceCommand(spokenWord);
    };

    recognitionRef.current.onend = () => {
      setListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setFeedback(`Oops! Didn't catch that. Try again!`);
      setListening(false);
    };

    winSoundRef.current = new Audio(WIN_SOUND);
    loseSoundRef.current = new Audio(LOSE_SOUND);
    backgroundMusicRef.current = new Audio(BACKGROUND_MUSIC);
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3;

    const playBackgroundMusic = () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.play().catch(error => {
          console.log("Background music play failed, trying again after user interaction:", error);
        });
      }
    };

    playBackgroundMusic();

    const handleFirstInteraction = () => {
      playBackgroundMusic();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
  
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
   
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [currentSquares]);

 
  useEffect(() => {
    if (isTeacherMode && !xIsNext && !gameWon && currentSquares.includes(null) && !gameCompleted) {
      setIsTeacherTurn(true);
      setFeedback("Teacher's turn - click on a square");
    } else {
      setIsTeacherTurn(false);
    }
  }, [xIsNext, gameWon, currentSquares, gameCompleted, isTeacherMode]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinningSquares([a, b, c]);
        return squares[a];
      }
    }
    return null;
  };

  const playSound = (soundRef) => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(error => {
        console.log("Audio play failed:", error);
      });
    }
  };

  const handleSquareClick = (i) => {
    if (!isTeacherTurn || currentSquares[i] || gameWon || gameCompleted) return;
    
    const nextSquares = currentSquares.slice();
    nextSquares[i] = 'O';
    
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setFeedback(`Teacher chose: ${spokenWords[i]}`);
    setPlayerTurn(1);
    setIsTeacherTurn(false);

    const winner = calculateWinner(nextSquares);
    if (winner) {
      setGameWon(true);
      const winnerKey = winner === 'X' ? 'player1' : 'player2';
      setScores(prev => ({
        ...prev,
        [winnerKey]: prev[winnerKey] + 1
      }));
      

      if (winner === 'X') {
        playSound(winSoundRef);
      } else {
        playSound(loseSoundRef);
      }
 
      if (winner === 'O') {
        loseLife();
      }
  
      if (round >= 5) {
        setTimeout(() => {
          declareOverallWinner();
        }, 2000);
      } else {
        setTimeout(() => {
          nextRound();
        }, 2000);
      }
    } else if (!nextSquares.includes(null)) {
     
      setTimeout(() => {
        if (round >= 5) {
          declareOverallWinner();
        } else {
          nextRound();
        }
      }, 1500);
    }
  };

  const handleVoiceCommand = (spokenWord) => {
    if (playerTurn !== 1 || gameWon || gameCompleted) return;
    
    const wordIndex = spokenWords.findIndex(word => 
      word.toLowerCase() === spokenWord.toLowerCase()
    );

    if (wordIndex === -1) {
      setFeedback(`Say one of: ${spokenWords.filter((w, i) => !currentSquares[i]).join(', ')}`);
      return;
    }

    if (currentSquares[wordIndex]) {
      setFeedback(`${spokenWords[wordIndex]} is already taken! Try another.`);
      return;
    }

    const nextSquares = currentSquares.slice();
    nextSquares[wordIndex] = 'X';
    
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setFeedback(`You chose: ${spokenWords[wordIndex]}`);
    setPlayerTurn(2); 

    const winner = calculateWinner(nextSquares);
    if (winner) {
      setGameWon(true);
      const winnerKey = winner === 'X' ? 'player1' : 'player2';
      setScores(prev => ({
        ...prev,
        [winnerKey]: prev[winnerKey] + 1
      }));
      
      if (winner === 'X') {
        playSound(winSoundRef);
      } else {
        playSound(loseSoundRef);
      }
      
      if (winner === 'O') {
        loseLife();
      }
      
      if (round >= 5) {
        setTimeout(() => {
          declareOverallWinner();
        }, 2000);
      } else {
        setTimeout(() => {
          nextRound();
        }, 2000);
      }
    } else if (!nextSquares.includes(null)) {
      setTimeout(() => {
        if (round >= 5) {
          declareOverallWinner();
        } else {
          nextRound();
        }
      }, 1500);
    }
  };

  const declareOverallWinner = () => {
    setGameCompleted(true);
    let winnerMessage = "";
    if (scores.player1 > scores.player2) {
      winnerMessage = `You win the game ${scores.player1}-${scores.player2}! 🎉`;
      playSound(winSoundRef);
    } else if (scores.player2 > scores.player1) {
      winnerMessage = `Teacher wins the game ${scores.player2}-${scores.player1}!`;
      playSound(loseSoundRef);
    } else {
      winnerMessage = `It's a tie! ${scores.player1}-${scores.player2}`;
    }
    setFeedback(winnerMessage);
  };

  const nextRound = () => {
    setRound(prev => prev + 1);
    resetBoard();
    setFeedback(`Round ${round + 1}! Your turn first.`);
    setPlayerTurn(1);
  };

  const resetBoard = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setGameWon(false);
    setWinningSquares([]);
    setSpokenWords([...SQUARE_WORDS].sort(() => Math.random() - 0.5));
    setFeedback(`Round ${round + 1} of 5 - Your turn!`);
  };

  const startListening = () => {
    if (recognitionRef.current && !gameWon && !gameCompleted && playerTurn === 1) {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current.start();
          setListening(true);
          setFeedback(`Say a word...`);
        }, 300);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setFeedback('Error starting voice control. Try clicking squares instead.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleProceedToNextPhase = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
    proceed();
  };

  const toggleTeacherMode = () => {
    setIsTeacherMode(!isTeacherMode);
    setFeedback(isTeacherMode ? "AI mode activated" : "Teacher mode activated");
  };

  const skipTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <div className="phase-con">
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>Welcome to Sight Word Tic Tac Toe! 🎯</h2>
            <div className="tutorial-steps">
              <div className="tutorial-step">
                <span className="step-number">1</span>
                <p>Click the microphone button to speak words 🎤</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">2</span>
                <p>Say a word from the board to claim that square 🗣️</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">3</span>
                <p>Get three in a row to win the round 📊</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">4</span>
                <p>Beat the teacher in 5 rounds to win! 🏆</p>
              </div>
            </div>
            <button onClick={skipTutorial} className="start-playing-btn">
              Start Playing!
            </button>
          </div>
        </div>
      )}
      
      <h2>SIGHT WORD TIC TAC TOE</h2>
      <h2 className="thline">Round {round} of 5</h2>
      <div className="display-score">
        <span className="score-x">You: {scores.player1}</span>
        <span className="score-o">Teacher: {scores.player2}</span>
      </div>
      
      <p className="dtails">
        {playerTurn === 1 ? 
          (listening ? 'Speak now!' : 'Click the mic to speak!') : 
          (isTeacherMode ? 'Teacher\'s turn - click on a square' : 'AI\'s turn')
        }
      </p>
      
      <div className="voice-con">
        {isSpeechSupported && (
          <button 
            onClick={toggleListening}
            className={`lst-button ${listening ? 'active' : ''}`}
            disabled={gameWon || gameCompleted || playerTurn !== 1 || showTutorial}
          >
            {listening ? '🎤 Listening...' : '🎤 Start Speaking'}
          </button>
        )}
        <div className="fback">{feedback}</div>
      </div>

      <div className="tic-tac-toe-game">
        <Board 
          squares={currentSquares}
          spokenWords={spokenWords}
          winningSquares={winningSquares}
          onSquareClick={handleSquareClick}
          isTeacherMode={isTeacherMode}
          isTeacherTurn={isTeacherTurn}
        />
      </div>

      {gameCompleted && (
        <div className="game-complete-overlay">
          <div className="game-complete-content">
            <h2>Game Complete! 🎊</h2>
            <div className="f-score">
              <div className="s-player">You: {scores.player1} wins</div>
              <div className="s-player">Teacher: {scores.player2} wins</div>
            </div>
            <div className="win-message">{feedback}</div>
            <button 
              onClick={handleProceedToNextPhase}
              className="proceed-button"
            >
              Proceed to Next Phase →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Phase5;