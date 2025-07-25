import React, { useState, useEffect, useRef } from 'react';
import './styles/Phase5.css';

const SQUARE_WORDS = [
  'apple', 'banana', 'cat', 'dog', 'elephant',
  'flower', 'giraffe', 'house', 'ice cream'
];

function Square({ value, word, isWinning }) {
  return (
    <div className={`square ${value || 'empty'} ${isWinning ? 'winning-square' : ''}`}>
      <div className="square-word">{word}</div>
      {value && <div className="square-mark">{value}</div>}
      {isWinning && <span className="trophy-icon">🏆</span>}
    </div>
  );
}

function Board({ squares, spokenWords, winningSquares }) {
  return (
    <div className="game-board">
      {squares.map((_, i) => (
        <Square
          key={i}
          value={squares[i]}
          word={spokenWords[i]}
          isWinning={winningSquares.includes(i)}
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
  
  // Game round tracking
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [gameCompleted, setGameCompleted] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
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
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentSquares]);

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

  const handleVoiceCommand = (spokenWord) => {
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
    nextSquares[wordIndex] = xIsNext ? 'X' : 'O';
    
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    setFeedback(`Player ${playerTurn} chose: ${spokenWords[wordIndex]}`);
    setPlayerTurn(playerTurn === 1 ? 2 : 1);

    const winner = calculateWinner(nextSquares);
    if (winner) {
      setGameWon(true);
      // Update scores
      const winnerKey = winner === 'X' ? 'player1' : 'player2';
      setScores(prev => ({
        ...prev,
        [winnerKey]: prev[winnerKey] + 1
      }));
      
      speak(`Player ${winner} wins this round!`);
      
      // Check if game is complete (5 rounds)
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
      // Draw
      speak("It's a draw! No points this round.");
      setTimeout(() => {
        if (round >= 5) {
          declareOverallWinner();
        } else {
          nextRound();
        }
      }, 1500);
    } else {
      speak(`Player ${playerTurn === 1 ? 2 : 1}, click the microphone to speak!`);
    }
  };

  const declareOverallWinner = () => {
    setGameCompleted(true);
    let winnerMessage = "";
    if (scores.player1 > scores.player2) {
      winnerMessage = `Player X wins the game ${scores.player1}-${scores.player2}! 🎉`;
    } else if (scores.player2 > scores.player1) {
      winnerMessage = `Player O wins the game ${scores.player2}-${scores.player1}! 🎉`;
    } else {
      winnerMessage = `It's a tie! ${scores.player1}-${scores.player2}`;
    }
    speak(winnerMessage);
    setFeedback(winnerMessage);
  };

  const nextRound = () => {
    setRound(prev => prev + 1);
    resetBoard();
    speak(`Round ${round + 1}! Player 1's turn first.`);
    setPlayerTurn(1);
  };

  const resetBoard = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setGameWon(false);
    setWinningSquares([]);
    setSpokenWords([...SQUARE_WORDS].sort(() => Math.random() - 0.5));
    setFeedback(`Round ${round + 1} of 5 - Player 1's turn!`);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.2; // More playful voice
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !gameWon && !gameCompleted) {
      recognitionRef.current.stop();
      setTimeout(() => {
        recognitionRef.current.start();
        setListening(true);
        setFeedback(`Player ${playerTurn}, say a word...`);
        speak(`Player ${playerTurn}, say a word from the board`);
      }, 300);
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

  const resetGame = () => {
    setRound(1);
    setScores({ player1: 0, player2: 0 });
    setGameCompleted(false);
    resetBoard();
  };

  if (gameCompleted) {
    return (
      <div className="phase-container">
        <h2>Game Complete! 🎊</h2>
        <div className="final-score">
          <div className="score-player">Player X: {scores.player1} wins</div>
          <div className="score-player">Player O: {scores.player2} wins</div>
        </div>
        <div className="winner-message">{feedback}</div>
        <button 
          onClick={resetGame}
          className="play-again-button"
        >
          Play Again!
        </button>
      </div>
    );
  }

  return (
    <div className="phase-container">
      <h2>SIGHT WORD!</h2> 
      <h2 className="secondline">Tic Tac Toe</h2>
      <h2 className="thirline">Round {round} of 5</h2>
      <div className="score-display">
        <span className="score-x">X: {scores.player1}</span>
        <span className="score-o">O: {scores.player2}</span>
      </div>
      
      <p className="instructions">Player {playerTurn}'s turn: {listening ? 'Speak now!' : 'Click the mic to speak!'}</p>
      
      <div className="voice-controls">
        <button 
          onClick={toggleListening}
          className={`listen-button ${listening ? 'active' : ''}`}
          disabled={gameWon || gameCompleted}
        >
          {listening ? '🎤 Listening...' : '🎤 Start Speaking'}
        </button>
        <div className="feedback">{feedback}</div>
      </div>

      <div className="tic-tac-toe-game">
        <Board 
          squares={currentSquares}
          spokenWords={spokenWords}
          winningSquares={winningSquares}
        />
      </div>
    </div>
  );
}

export default Phase5;