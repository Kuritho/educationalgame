import React, { useState, useEffect, useRef } from 'react';
import './styles/Phase5.css';

const words = [
  'apple', 'banana', 'grape',
  'orange', 'lemon', 'peach',
  'melon', 'cherry', 'plum'
];

const shuffleWords = () => {
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 9);
};

const Phase5 = ({ proceed, loseLife }) => {
  const [board, setBoard] = useState(shuffleWords());
  const [marks, setMarks] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [input, setInput] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript.trim();
        setInput(spokenWord);
        handleVoiceSubmit(spokenWord);
      };
      recognitionRef.current = recognition;
    } else {
      alert('Speech Recognition not supported in this browser.');
    }
  }, []);

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      alert(`${winner} wins!`);
      proceed();
    } else if (marks.every(cell => cell !== null)) {
      alert('Draw!');
      loseLife();
    }
  }, [marks]);

  const checkWinner = () => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
      if (marks[a] && marks[a] === marks[b] && marks[a] === marks[c]) {
        return marks[a];
      }
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVoiceSubmit(input);
    setInput('');
  };

  const handleVoiceSubmit = (spokenInput) => {
    const index = board.findIndex((word, i) => word.toLowerCase() === spokenInput.toLowerCase() && !marks[i]);
    if (index !== -1) {
      const newMarks = [...marks];
      newMarks[index] = currentPlayer;
      setMarks(newMarks);
      setCurrentPlayer(prev => prev === 'X' ? 'O' : 'X');
    } else {
      alert('Incorrect or already used word.');
      loseLife();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="tic-tac-toe">
      <h2>Phase 5: Speak the Word!</h2>
      <div className="board">
        {board.map((word, i) => (
          <div key={i} className="cell">
            {marks[i] || word}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="word-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak the word"
        />
        <button type="submit">Submit</button>
        <button type="button" onClick={startListening}>🎤 Speak</button>
      </form>
    </div>
  );
};

export default Phase5;
