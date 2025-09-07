import React, { useState, useEffect, useRef } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import './styles/Phase3.css';

const Phase3 = ({ proceed, loseLife}) => {
  // Audio reference
  const audioRef = useRef(null);
  
  // Extended word bank with correct answers and distractors
  const wordBank = [
    { image: 'bat.png', correct: 'bat', distractors: ['fat', 'mat'] },
    { image: 'cat.png', correct: 'cat', distractors: ['hat', 'sat'] },
    { image: 'dog.png', correct: 'dog', distractors: ['log', 'fog'] },
    { image: 'sun.png', correct: 'sun', distractors: ['fun', 'run'] },
    { image: 'fish.png', correct: 'fish', distractors: ['dish', 'wish'] },
    { image: 'cake.png', correct: 'cake', distractors: ['lake', 'make'] },
    { image: 'bird.png', correct: 'bird', distractors: ['word', 'herd'] },
    { image: 'moon.png', correct: 'moon', distractors: ['soon', 'noon'] },
    { image: 'star.png', correct: 'star', distractors: ['car', 'far'] },
    { image: 'tree.png', correct: 'tree', distractors: ['free', 'see'] },
    { image: 'house.png', correct: 'house', distractors: ['mouse', 'blouse'] },
    { image: 'apple.png', correct: 'apple', distractors: ['pebble', 'grapple'] },
    { image: 'ball.png', correct: 'ball', distractors: ['mall', 'tall'] },
    { image: 'duck.png', correct: 'duck', distractors: ['luck', 'tuck'] },
    { image: 'egg.png', correct: 'egg', distractors: ['leg', 'peg'] },
    { image: 'frog.png', correct: 'frog', distractors: ['log', 'bog'] },
    { image: 'goat.png', correct: 'goat', distractors: ['boat', 'coat'] },
    { image: 'hat.png', correct: 'hat', distractors: ['cat', 'bat'] },
    { image: 'igloo.png', correct: 'igloo', distractors: ['blue', 'glue'] },
    { image: 'jam.png', correct: 'jam', distractors: ['ham', 'ram'] },
    { image: 'kite.png', correct: 'kite', distractors: ['bite', 'light'] },
    { image: 'lion.png', correct: 'lion', distractors: ['iron', 'line'] },
    { image: 'nest.png', correct: 'nest', distractors: ['best', 'rest'] },
    { image: 'owl.png', correct: 'owl', distractors: ['bowl', 'towel'] },
    { image: 'pig.png', correct: 'pig', distractors: ['big', 'dig'] },
    { image: 'queen.png', correct: 'queen', distractors: ['green', 'screen'] },
    { image: 'ring.png', correct: 'ring', distractors: ['sing', 'wing'] },
    { image: 'turtle.png', correct: 'turtle', distractors: ['myrtle', 'hurdle'] },
    { image: 'umbrella.png', correct: 'umbrella', distractors: ['arella', 'cinderella'] },
    { image: 'violin.png', correct: 'violin', distractors: ['linen', 'melon'] },
    { image: 'wings.png', correct: 'wings', distractors: ['things', 'sings'] },
    { image: 'x-ray.png', correct: 'x-ray', distractors: ['play', 'tray'] },
    { image: 'yoyo.png', correct: 'yoyo', distractors: ['coco', 'zozo'] },
    { image: 'zebra.png', correct: 'zebra', distractors: ['debra', 'libra'] }
  ];

  const [currentRound, setCurrentRound] = usePersistedState('phase3_round', 1);
  const [currentItems, setCurrentItems] = useState([]);
  const [selectedCells, setSelectedCells] = usePersistedState('phase3_selectedCells', {});
  const [completedItems, setCompletedItems] = usePersistedState('phase3_completedItems', []);
  const [usedItems, setUsedItems] = usePersistedState('phase3_usedItems', []);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);

  // Initialize audio on component mount
  useEffect(() => {
    // Create and configure audio
    audioRef.current = new Audio('/sounds/bgm.mp3');
    audioRef.current.loop = true;
    
    // Attempt to play audio
    const playAudio = () => {
      audioRef.current.play().catch(error => {
        console.log("Audio play failed, may require user interaction:", error);
      });
    };
    
    // Try to play immediately
    playAudio();
    
    // Also try to play on a user interaction event
    const handleUserInteraction = () => {
      playAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    // Cleanup function to pause audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Initialize each round with random items that haven't been used yet
  useEffect(() => {
    // Get items that haven't been used yet
    const availableItems = wordBank.filter(item => !usedItems.includes(item.correct));
    
    // Increase difficulty with each round
    let itemsPerRound = 4;
    if (currentRound === 2) itemsPerRound = 5;
    else if (currentRound >= 3) itemsPerRound = 6;
    
    // If we don't have enough items for the round, reset the used items
    if (availableItems.length < itemsPerRound) {
      setUsedItems([]);
      const shuffled = [...wordBank].sort(() => 0.5 - Math.random()).slice(0, itemsPerRound);
      
      const itemsWithRandomizedOptions = shuffled.map(item => {
        const allOptions = [item.correct, ...item.distractors];
        const shuffledOptions = [...allOptions].sort(() => 0.5 - Math.random());
        
        return {
          ...item,
          options: shuffledOptions,
          correctPosition: shuffledOptions.indexOf(item.correct)
        };
      });
      
      setCurrentItems(itemsWithRandomizedOptions);
      setUsedItems(shuffled.map(item => item.correct));
    } else {
      const shuffled = [...availableItems].sort(() => 0.5 - Math.random()).slice(0, itemsPerRound);
      
      const itemsWithRandomizedOptions = shuffled.map(item => {
        const allOptions = [item.correct, ...item.distractors];
        const shuffledOptions = [...allOptions].sort(() => 0.5 - Math.random());
        
        return {
          ...item,
          options: shuffledOptions,
          correctPosition: shuffledOptions.indexOf(item.correct)
        };
      });
      
      setCurrentItems(itemsWithRandomizedOptions);
      setUsedItems([...usedItems, ...shuffled.map(item => item.correct)]);
    }
    
    setRoundCompleted(false);
    setCompletedItems([]);
    setFeedback(`Round ${currentRound} - Match the pictures to their names!`);
  }, [currentRound]);

  // Check if round is completed
  useEffect(() => {
    const itemsPerRound = currentRound === 1 ? 4 : currentRound === 2 ? 5 : 6;
    if (completedItems.length === itemsPerRound && !roundCompleted) {
      setRoundCompleted(true);
      setFeedback(`Round ${currentRound} completed!`);
      new Audio('/sounds/success.mp3').play();
    }
  }, [completedItems, currentRound, roundCompleted]);

  const handleOptionClick = (rowIndex, option, correctAnswer) => {
    if (roundCompleted || completedItems.includes(rowIndex) || showTutorial) return;

    const isCorrect = option === correctAnswer;
    const cellKey = `${currentRound}-${rowIndex}-${option}`;

    if (isCorrect) {
      setCompletedItems([...completedItems, rowIndex]);
      setSelectedCells({...selectedCells, [cellKey]: 'correct'});
      setFeedback(`Correct! ${correctAnswer} matches the picture!`);
      new Audio('/sounds/correct.mp3').play();
    } else {
      loseLife();
      setSelectedCells({...selectedCells, [cellKey]: 'wrong'});
      setFeedback(`Try again! Find the word for ${correctAnswer}`);
      new Audio('/sounds/incorrect.mp3').play();
    }
  };

  const nextRound = () => {
    if (currentRound < 5) {
      setCurrentRound(currentRound + 1);
      setCompletedItems([]);
    } else {
      // Clear persisted state when moving to next phase
      localStorage.removeItem('phase3_round');
      localStorage.removeItem('phase3_selectedCells');
      localStorage.removeItem('phase3_completedItems');
      localStorage.removeItem('phase3_usedItems');
      
      // Stop the background music before proceeding
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      proceed();
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
  };

  // Add restart function
  const restartGame = () => {
    setCurrentRound(1);
    setSelectedCells({});
    setCompletedItems([]);
    setUsedItems([]);
    setRoundCompleted(false);
    setFeedback('Game restarted! Match the pictures to their names!');
  };

  return (
    <div className="phase3-container">
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>Welcome to Sight Word Safari! 🦁</h2>
            <div className="tutorial-steps">
              <div className="tutorial-step">
                <span className="step-number">1</span>
                <p>Look at the picture in the first column 👀</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">2</span>
                <p>Choose the correct word that matches the picture 📝</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">3</span>
                <p>Complete all matches to finish the round 🎯</p>
              </div>
              <div className="tutorial-step">
                <span className="step-number">4</span>
                <p>There are 5 rounds with increasing difficulty! 📈</p>
              </div>
            </div>
            <button onClick={skipTutorial} className="start-playing-btn">
              Start Playing!
            </button>
          </div>
        </div>
      )}
      
      <h2>Level 2: Sight Word Safari</h2>    
      <div className="round-tracker">
        {[1, 2, 3, 4, 5].map(round => (
          <div 
            key={round}
            className={`round-circle ${round < currentRound ? 'completed' : ''} ${round === currentRound ? 'current' : ''}`}
          >
            {round}
          </div>
        ))}
      </div>
      
      <p className="round-feedback">{feedback}</p>
      
      <div className="matching-grid">
        <div className="matching-table">
          {currentItems.map((item, rowIndex) => (
            <div key={rowIndex} className="matching-row">
              <div className="picture-cell">
                <img 
                  src={`/images/${item.image}`} 
                  alt={item.correct} 
                  className={`picture ${completedItems.includes(rowIndex) ? 'completed' : ''}`}
                />
              </div>
              <div className="options-container">
                {item.options.map((option, optionIndex) => {
                  const cellKey = `${currentRound}-${rowIndex}-${option}`;
                  const isSelected = selectedCells[cellKey];
                  const isCorrectAnswer = option === item.correct;
                  
                  return (
                    <button
                      key={optionIndex}
                      className={`option-btn ${isSelected || ''} ${
                        completedItems.includes(rowIndex) && isCorrectAnswer ? 'correct' : ''
                      }`}
                      onClick={() => handleOptionClick(rowIndex, option, item.correct)}
                      disabled={completedItems.includes(rowIndex) || roundCompleted || showTutorial}
                    >
                      {option}
                      {completedItems.includes(rowIndex) && isCorrectAnswer && (
                        <span className="check-mark">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {roundCompleted && (
        <button onClick={nextRound} className="proceed-button" disabled={showTutorial}>
          {currentRound < 5 ? `Start Round ${currentRound + 1}` : "Great Job! Go to Phase 4"}
        </button>
      )}
    </div>
  );
};

export default Phase3;