import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Phase6.css';

// All rhyming sets for BINGO
const rhymingSets = [
  ['cat', 'hat', 'bat', 'mat', 'rat', 'sat', 'fat', 'pat'],
  ['dog', 'log', 'fog', 'jog', 'hog', 'bog', 'cog', 'sog'],
  ['can', 'fan', 'man', 'pan', 'ran', 'tan', 'van', 'plan'],
  ['car', 'star', 'jar', 'bar', 'far', 'tar', 'scar', 'guitar'],
  ['bin', 'pin', 'win', 'tin', 'chin', 'grin', 'spin', 'thin'],
  ['cab', 'grab', 'crab', 'lab', 'dab', 'nab', 'drab', 'tab'],
  ['bee', 'see', 'tree', 'free', 'knee', 'flea', 'tea', 'me'],
  ['goat', 'boat', 'coat', 'float', 'note', 'quote', 'remote', 'wrote'],
  ['fish', 'dish', 'wish', 'swish', 'squish', 'bliss', 'kiss', 'miss'],
  ['mouse', 'house', 'spouse', 'louse', 'douse', 'rouse', 'grouse', 'carouse']
];

// All possible rhyming words (flat)
const allRhymingWords = rhymingSets.flat();

const getRandomFromArray = (arr, n) => {
  const copy = [...arr];
  const result = [];
  while (result.length < n && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};

// Generate a 4x4 card with one straight line of rhyming words, rest are random non-rhyming
function generateCardWithRhymingLine() {
  // Pick a random rhyming set and a random line type/position
  const rhymeSet = rhymingSets[Math.floor(Math.random() * rhymingSets.length)];
  const rhymeWords = getRandomFromArray(rhymeSet, 4);

  // Decide line type: 0=row, 1=col, 2=diag1, 3=diag2
  const lineType = Math.floor(Math.random() * 4);
  const linePos = Math.floor(Math.random() * 4);

  // Fill card with random non-rhyming words
  const nonRhymeWords = getRandomFromArray(
    allRhymingWords.filter(w => !rhymeWords.includes(w)),
    12
  );
  const card = Array(4).fill(null).map(() => Array(4).fill(null));
  let nonRhymeIdx = 0;

  // Place rhyming words in the chosen line
  for (let i = 0; i < 4; i++) {
    let row, col;
    if (lineType === 0) { row = linePos; col = i; } // row
    else if (lineType === 1) { row = i; col = linePos; } // col
    else if (lineType === 2) { row = i; col = i; } // diag1
    else { row = i; col = 3 - i; } // diag2
    card[row][col] = rhymeWords[i];
  }
  // Fill the rest with non-rhyming words
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!card[row][col]) {
        card[row][col] = nonRhymeWords[nonRhymeIdx++];
      }
    }
  }
  return { card, rhymeWords, rhymeSet, lineType, linePos };
};

// Helper: get rhyme set for a line
const getRhymeSet = (lineWords) => {
  for (const set of rhymingSets) {
    if (lineWords.every(word => set.includes(word))) {
      return set;
    }
  }
  return null;
};

// Check for BINGO (4 in a row, column, or diagonal) AND all words in the line must rhyme
const checkBingo = (selections, card) => {
  // Check rows
  for (let i = 0; i < 4; i++) {
    const rowIndexes = [0, 1, 2, 3].map(j => ({ row: i, col: j }));
    if (rowIndexes.every(idx => selections.some(sel => sel.row === idx.row && sel.col === idx.col))) {
      const rowWords = rowIndexes.map(idx => card[idx.row][idx.col]);
      if (getRhymeSet(rowWords)) return true;
    }
  }
  // Check columns
  for (let j = 0; j < 4; j++) {
    const colIndexes = [0, 1, 2, 3].map(i => ({ row: i, col: j }));
    if (colIndexes.every(idx => selections.some(sel => sel.row === idx.row && sel.col === idx.col))) {
      const colWords = colIndexes.map(idx => card[idx.row][idx.col]);
      if (getRhymeSet(colWords)) return true;
    }
  }
  // Check diagonals
  const diag1Indexes = [0, 1, 2, 3].map(i => ({ row: i, col: i }));
  if (diag1Indexes.every(idx => selections.some(sel => sel.row === idx.row && sel.col === idx.col))) {
    const diag1Words = diag1Indexes.map(idx => card[idx.row][idx.col]);
    if (getRhymeSet(diag1Words)) return true;
  }
  const diag2Indexes = [0, 1, 2, 3].map(i => ({ row: i, col: 3 - i }));
  if (diag2Indexes.every(idx => selections.some(sel => sel.row === idx.row && sel.col === idx.col))) {
    const diag2Words = diag2Indexes.map(idx => card[idx.row][idx.col]);
    if (getRhymeSet(diag2Words)) return true;
  }
  return false;
};

const Phase6 = ({ proceed, loseLife }) => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [calledWords, setCalledWords] = useState([]);
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState(null);
  const audioRef = useRef(null);
  const [showWinScreen, setShowWinScreen] = useState(false);

  // Player's Bingo card (4x4 grid)
  const [playerCard, setPlayerCard] = useState([]);
  const [playerSelections, setPlayerSelections] = useState([]);
  const [aiCard, setAiCard] = useState([]);
  const [aiSelections, setAiSelections] = useState([]);

  // Initialize the game
  const startGame = () => {
    // Player gets a winnable card
    const playerObj = generateCardWithRhymingLine();
    setPlayerCard(playerObj.card);
    setPlayerSelections([]);

    // AI gets a winnable card
    const aiObj = generateCardWithRhymingLine();
    setAiCard(aiObj.card);
    setAiSelections([]);

    // Reset game state
    setGameStarted(true);
    setMessage("Game started! Find the called words on your card!");
    setWinner(null);
    setShowWinScreen(false);
    setCalledWords([]);
    setCurrentWord('');
  };

  useEffect(() => {
    // Auto-play background music when component mounts
    if (audioRef.current) {
      const playAudio = async () => {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.log("Autoplay prevented:", error);
        }
      };
      playAudio();
    }

    if (
      gameStarted &&
      playerCard.length === 4 &&
      aiCard.length === 4 &&
      currentWord === ''
    ) {
      callNextWord();
    }
    // eslint-disable-next-line
  }, [gameStarted, playerCard, aiCard]);

  // Call a random word
  const callNextWord = () => {
    if (winner) return;

    const availableWords = allRhymingWords.filter(word => !calledWords.includes(word));

    if (availableWords.length === 0) {
      setMessage("No more words to call! It's a tie!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const newWord = availableWords[randomIndex];

    setCurrentWord(newWord);
    setCalledWords([...calledWords, newWord]);
    setMessage(`Find: ${newWord}`);

    // AI automatically checks its card with 80% probability (reduced from 100%)
    if (Math.random() < 0.8) {
      checkAiCard(newWord);
    }
  };

  // AI checks its card for the called word
  const checkAiCard = (word) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (aiCard[i][j] === word && !aiSelections.some(sel => sel.row === i && sel.col === j)) {
          const newSelections = [...aiSelections, { row: i, col: j }];
          setAiSelections(newSelections);

          if (checkBingo(newSelections, aiCard)) {
            setWinner('AI');
            setMessage("AI got BINGO with a rhyming line!");
            setShowWinScreen(true);
            // Call the loseLife function from props
            loseLife();
            return;
          }
        }
      }
    }
  };

  // Player clicks a word on their card
  const handlePlayerSelect = (row, col) => {
    if (winner) return;

    const word = playerCard[row][col];

    if (word === currentWord && !playerSelections.some(sel => sel.row === row && sel.col === col)) {
      const newSelections = [...playerSelections, { row, col }];
      setPlayerSelections(newSelections);

      // Check for BINGO immediately after player selects a word
      if (checkBingo(newSelections, playerCard)) {
        setWinner('Player');
        setMessage("You got BINGO with a rhyming line! You win!");
        // Proceed to next round after a short delay
        setTimeout(() => {
          proceed && proceed();
        }, 1500);
      } else {
        // Only call next word if player didn't win
        setTimeout(callNextWord, 1000);
      }
    } else if (word !== currentWord) {
      setMessage(`That's not "${currentWord}"! Keep looking!`);
    }
  };

  // Render a Bingo card
  const renderCard = (card, selections, isPlayer = false) => {
    return (
      <div className={`bingo-card ${isPlayer ? 'player-card' : 'ai-card'}`}>
        {card.map((row, rowIndex) => (
          <div key={rowIndex} className="bingo-row">
            {row.map((word, colIndex) => {
              const isSelected = selections.some(sel => sel.row === rowIndex && sel.col === colIndex);
              return (
                <div
                  key={colIndex}
                  className={`bingo-cell 
                    ${isSelected ? 'selected' : ''}
                    ${isPlayer ? 'clickable' : ''}`}
                  onClick={isPlayer ? () => handlePlayerSelect(rowIndex, colIndex) : null}
                >
                  {word}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // Add this function to get the next random word
  const handleNextWord = () => {
    if (winner) return;
    
    const availableWords = allRhymingWords.filter(word => !calledWords.includes(word));
    if (availableWords.length === 0) {
      setMessage("No more words to call! It's a tie!");
      return;
    }
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const newWord = availableWords[randomIndex];
    setCurrentWord(newWord);
    setCalledWords([...calledWords, newWord]);
    setMessage(`Find: ${newWord}`);
    
    // AI checks with 80% probability (reduced from 100%)
    if (Math.random() < 0.8) {
      checkAiCard(newWord);
    }
  };

  return (
    <div className="phase6-container">
      {/* Background music - auto plays without controls */}
      <audio ref={audioRef} loop autoPlay>
        <source src="/sounds/bgm2.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <h1>Rhyming Word Bingo!</h1>
      <p className="instructions">
        When a word is called, click it on your card if you have it. Get a straight line of rhyming words to win!
      </p>
      
      {/* AI Win Screen */}
      {showWinScreen && (
        <div className="win-screen">
          <h2>AI Wins!</h2>
          <p>The AI got BINGO before you did!</p>
          <button className="try-again-button" onClick={startGame}>
            Try Again
          </button>
        </div>
      )}
      
      {!gameStarted ? (
        <button className="start-button" onClick={startGame}>
          Start Game
        </button>
      ) : (
        <>
          <div className="message-box">{message}</div>
          
          {/* Only show game content if no win screen is shown */}
          {!showWinScreen && (
            <>
              {/* Vertical card layout */}
              <div className="cards-vertical-layout">
                {/* Player Card */}
                <div className="player-board">
                  <h2>Your Card</h2>
                  {renderCard(playerCard, playerSelections, true)}
                </div>
                
                {/* Current Word */}
                <div className="current-word-display">
                  {currentWord && `Find: ${currentWord}`}
                </div>

                {/* Next Word Button - Always visible when game is active */}
                {gameStarted && !winner && (
                  <button className="next-word-button" onClick={handleNextWord}>
                    Next Word
                  </button>
                )}

                {/* AI Card */}
                <div className="ai-board">
                  <h2>AI's Card</h2>
                  {renderCard(aiCard, aiSelections)}
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="action-buttons">
                {winner && winner !== 'AI' && (
                  <button className="restart-button" onClick={startGame}>
                    Play Again
                  </button>
                )}
                <button className="exit-button" onClick={() => navigate('/game')}>
                  Exit Game
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Phase6;