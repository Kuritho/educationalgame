import React, { useState, useEffect } from 'react';
import '../styles.css';

const Phase2 = ({ proceed, loseLife }) => {
  // Extended word bank with images
  const wordBank = [
    { letter: 'A', word: 'Apple', image: 'apple.png', color: '#FF6B6B' },
    { letter: 'B', word: 'Ball', image: 'ball.png', color: '#4ECDC4' },
    { letter: 'C', word: 'Cat', image: 'cat.png', color: '#FFD166' },
    { letter: 'D', word: 'Dog', image: 'dog.png', color: '#06D6A0' },
    { letter: 'E', word: 'Egg', image: 'egg.png', color: '#FF9E7D' },
    { letter: 'F', word: 'Fish', image: 'fish.png', color: '#A0CED9' },
    { letter: 'G', word: 'Goat', image: 'goat.png', color: '#FFC09F' },
    { letter: 'H', word: 'Hat', image: 'hat.png', color: '#ADF7B6' },
    { letter: 'I', word: 'Igloo', image: 'igloo.png', color: '#AFCBFF' },
    { letter: 'J', word: 'Jam', image: 'jam.png', color: '#FFEE93' },
    { letter: 'K', word: 'Kite', image: 'kite.png', color: '#D6A3DC' },
    { letter: 'L', word: 'Lion', image: 'lion.png', color: '#FFC8A2' }
  ];

  const [currentRound, setCurrentRound] = useState(1);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [selectedPictures, setSelectedPictures] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [gameItems, setGameItems] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // Initialize each round
  useEffect(() => {
    const shuffled = [...wordBank].sort(() => 0.5 - Math.random());
    const roundItems = shuffled.slice(0, 4);
    
    setGameItems(roundItems);
    setSelectedLetters(roundItems.map(item => item.letter));
    setSelectedPictures([...roundItems].sort(() => 0.5 - Math.random()));
    setMatchedPairs([]);
    setCurrentSelection(null);
    setRoundCompleted(false);
    setCelebrate(false);
  }, [currentRound]);

  // Check if round is completed
  useEffect(() => {
    if (matchedPairs.length === 4 && !roundCompleted) {
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
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1);
    } else {
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
        <h2>🌈 Alphabet Adventure 🎈</h2>
        <div className="progress-tracker">
          {[1, 2, 3].map(round => (
            <div 
              key={round} 
              className={`progress-circle ${round < currentRound ? 'completed' : ''} ${round === currentRound ? 'current' : ''}`}
            >
              {round}
            </div>
          ))}
        </div>
        <p className="round-counter">Round {currentRound} of 3</p>
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
          {currentRound < 3 ? (
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