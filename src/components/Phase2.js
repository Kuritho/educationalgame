import React, { useState, useEffect } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import './styles/Phase2.css';

const Phase2 = ({ proceed, loseLife }) => {
  // Extended word bank with images
  const wordBank = [
    { letter: 'A', word: 'Apple', image: 'apple.png', color: '#FF6B6B' },
    { letter: 'B', word: 'Ball', image: 'ball.png', color: '#FF6B6B' },
    { letter: 'C', word: 'Cat', image: 'cat.png', color: '#FF6B6B' },
    { letter: 'D', word: 'Dog', image: 'dog.png', color: '#FF6B6B' },
    { letter: 'E', word: 'Egg', image: 'egg.png', color: '#FF6B6B' },
    { letter: 'F', word: 'Fish', image: 'fish.png', color: '#FF6B6B' },
    { letter: 'G', word: 'Goat', image: 'goat.png', color: '#FF6B6B' },
    { letter: 'H', word: 'Hat', image: 'hat.png', color: '#FF6B6B' },
    { letter: 'I', word: 'Igloo', image: 'igloo.png', color: '#FF6B6B' },
    { letter: 'J', word: 'Jam', image: 'jam.png', color: '#FF6B6B' },
    { letter: 'K', word: 'Kite', image: 'kite.png', color: '#FF6B6B' },
    { letter: 'L', word: 'Lion', image: 'lion.png', color: '#FF6B6B' },
    { letter: 'M', word: 'Moon', image: 'moon.png', color: '#FF6B6B' },
    { letter: 'N', word: 'Nest', image: 'nest.png', color: '#FF6B6B' },
    { letter: 'O', word: 'Owl', image: 'owl.png', color: '#FF6B6B' },
    { letter: 'P', word: 'Pig', image: 'pig.png', color: '#FF6B6B' },
    { letter: 'Q', word: 'Queen', image: 'queen.png', color: '#FF6B6B' },
    { letter: 'R', word: 'Ring', image: 'ring.png', color: '#FF6B6B' },
    { letter: 'S', word: 'Star', image: 'star.png', color: '#FF6B6B' },
    { letter: 'T', word: 'Turtle', image: 'turtle.png', color: '#FF6B6B' },
    { letter: 'U', word: 'Umbrella', image: 'umbrella.png', color: '#FF6B6B' },
    { letter: 'V', word: 'Violin', image: 'violin.png', color: '#FF6B6B' },
    { letter: 'W', word: 'Wings', image: 'wings.png', color: '#FF6B6B' },
    { letter: 'X', word: 'X-Ray', image: 'x-ray.png', color: '#FF6B6B' },
    { letter: 'Y', word: 'Yoyo', image: 'yoyo.png', color: '#FF6B6B' },
    { letter: 'Z', word: 'Zebra', image: 'zebra.png', color: '#FF6B6B' },
  ];

  const [selectedLetters, setSelectedLetters] = useState([]);
  const [selectedPictures, setSelectedPictures] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [gameItems, setGameItems] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [currentRound, setCurrentRound] = usePersistedState('phase2_round', 1);
  const [matchedPairs, setMatchedPairs] = usePersistedState('phase2_matchedPairs', []);
  const [completed, setCompleted] = usePersistedState('phase2_completed', false);
  const [usedItems, setUsedItems] = usePersistedState('phase2_usedItems', []);

  // Initialize each round
  useEffect(() => {
    // Get items that haven't been used yet
    const availableItems = wordBank.filter(item => !usedItems.includes(item.letter));
    
    // Increase difficulty with each round
    let itemsPerRound = 4;
    if (currentRound === 2) itemsPerRound = 5;
    else if (currentRound >= 3) itemsPerRound = 6;
    
    // If we don't have enough items for the round, reset the used items
    if (availableItems.length < itemsPerRound) {
      setUsedItems([]);
      const shuffled = [...wordBank].sort(() => 0.5 - Math.random());
      const roundItems = shuffled.slice(0, itemsPerRound);
      
      setGameItems(roundItems);
      setSelectedLetters(roundItems.map(item => item.letter));
      setSelectedPictures([...roundItems].sort(() => 0.5 - Math.random()));
      setUsedItems(roundItems.map(item => item.letter));
    } else {
      const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
      const roundItems = shuffled.slice(0, itemsPerRound);
      
      setGameItems(roundItems);
      setSelectedLetters(roundItems.map(item => item.letter));
      setSelectedPictures([...roundItems].sort(() => 0.5 - Math.random()));
      setUsedItems([...usedItems, ...roundItems.map(item => item.letter)]);
    }
    
    setMatchedPairs([]);
    setCurrentSelection(null);
    setRoundCompleted(false);
    setCelebrate(false);
  }, [currentRound]);

  // Check if round is completed
  useEffect(() => {
    const itemsPerRound = currentRound === 1 ? 4 : currentRound === 2 ? 5 : 6;
    if (matchedPairs.length === itemsPerRound && !roundCompleted) {
      setRoundCompleted(true);
      setFeedback(`Great job! Round ${currentRound} complete!`);
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2000);
    }
  }, [matchedPairs, currentRound, roundCompleted]);

  const handleLetterClick = (letter) => {
    if (matchedPairs.includes(letter) || roundCompleted) return;
    
    setCurrentSelection(letter);
    setFeedback(`Find the ${letter} picture!`);
  };

  const handlePictureClick = (picture) => {
    if (!currentSelection || roundCompleted) return;
    
    const correctItem = gameItems.find(item => item.letter === currentSelection);
    
    if (correctItem.word === picture.word) {
      // Correct match
      setMatchedPairs([...matchedPairs, currentSelection]);
      setFeedback(`Yay! ${currentSelection} is for ${picture.word}`);
      
      // Play pronunciation audio
      const audio = new Audio(`/sounds/correct.mp3`);
      audio.play();
    } else {
      // Incorrect match
      loseLife();
      setFeedback(`Oops! Try again. ${currentSelection} is for ${correctItem.word}`);
    }
    
    setCurrentSelection(null);
  };

  const nextRound = () => {
    if (currentRound < 5) {
      setCurrentRound(currentRound + 1);
    } else {
      // Clear persisted state when game is complete
      localStorage.removeItem('phase2_round');
      localStorage.removeItem('phase2_matchedPairs');
      localStorage.removeItem('phase2_completed');
      localStorage.removeItem('phase2_usedItems');
      proceed();
    }
  };

  const getLetterColor = (letter) => {
    const item = gameItems.find(item => item.letter === letter);
    return item ? item.color : '#4a6fa5';
  };

  return (
    <div className={`phase2-container ${celebrate ? 'celebrate' : ''}`}>
      {/* Animated background elements */}
      <div className="bubbles">
        {[...Array(10)].map((_, i) => <div key={i} className="bubble"></div>)}
      </div>
      
      <header className="game-header">
        <h2>Alphabet Matching</h2>
        <div className="progress-tracker">
          {[1, 2, 3, 4, 5].map(round => (
            <div 
              key={round} 
              className={`progress-circle ${round < currentRound ? 'completed' : ''} ${round === currentRound ? 'current' : ''}`}
            >
              {round}
            </div>
          ))}
        </div>
        <p className="round-counter">Round {currentRound} of 5</p>
      </header>
      
      <div className="feedback-container">
        {feedback && (
          <div className={`feedback ${matchedPairs.includes(currentSelection) ? 'correct' : ''}`}>
            {feedback}
          </div>
        )}
      </div>
      
      <div className="game-board">
        <div className="letters-side">
          <h3>✨ Letters ✨</h3>
          <p className="instruction-text">Match the letters to their pictures and learn the alphabet!</p>
          <div className="letters-grid">
            {selectedLetters.map((letter, index) => {
              const color = getLetterColor(letter);
              return (
                <button
                  key={index}
                  className={`letter-btn ${currentSelection === letter ? 'selected' : ''} ${matchedPairs.includes(letter) ? 'matched' : ''}`}
                  onClick={() => handleLetterClick(letter)}
                  disabled={matchedPairs.includes(letter) || roundCompleted}
                  style={{
                    backgroundColor: matchedPairs.includes(letter) ? '#4CAF50' : color,
                    transform: currentSelection === letter ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="pictures-side">
          <h3>🖼️ Pictures 🖼️</h3>
          <div className="pictures-grid">
            {selectedPictures.map((picture, index) => {
              const matched = isPictureMatched(picture);
              const item = gameItems.find(i => i.word === picture.word);
              return (
                <button
                  key={index}
                  className={`picture-btn ${matched ? 'matched' : ''}`}
                  onClick={() => handlePictureClick(picture)}
                  disabled={matched || !currentSelection || roundCompleted}
                  style={{
                    borderColor: item?.color || '#ddd',
                    transform: matched ? 'rotate(0)' : ''
                  }}
                >
                  <div className="picture-frame" style={{ backgroundColor: item?.color }}>
                    <img 
                      src={`/images/${picture.image}`} 
                      alt={picture.word}
                      className="picture-image"
                    />
                  </div>
                  {matched && (
                    <span className="picture-label">{picture.word}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {roundCompleted && (
        <button
          onClick={nextRound}
          className="proceed-button"
        >
          {currentRound < 5 ? (
            <>
              <span className="sparkle">✨</span> Next Round <span className="sparkle">✨</span>
            </>
          ) : (
            "Great Job! Go to Phase 3 🎉"
          )}
        </button>
      )}
      
      {/* Confetti effect */}
      {celebrate && (
        <div className="confetti">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti-piece"></div>
          ))}
        </div>
      )}
    </div>
  );

  function isPictureMatched(picture) {
    return matchedPairs.some(letter => {
      const item = gameItems.find(i => i.letter === letter);
      return item && item.word === picture.word;
    });
  }
};

export default Phase2;