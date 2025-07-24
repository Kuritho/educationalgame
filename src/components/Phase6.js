import React, { useState, useEffect } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import '../styles.css';

const Phase3 = ({ proceed, loseLife }) => {
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
    { image: 'frog.png', correct: 'frog', distractors: ['log', 'bog'] }
  ];

  const [currentRound, setCurrentRound] = usePersistedState('phase3_round', 1);
  const [currentItems, setCurrentItems] = useState([]);
  const [selectedCells, setSelectedCells] = usePersistedState('phase3_selectedCells', {});
  const [completedItems, setCompletedItems] = usePersistedState('phase3_completedItems', []);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Initialize each round with 4 random items and randomized option positions
  useEffect(() => {
    const shuffled = [...wordBank].sort(() => 0.5 - Math.random()).slice(0, 4);
    
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
    setRoundCompleted(false);
    setFeedback(`Round ${currentRound} - Match the pictures to their names!`);
  }, [currentRound]);

  // Check if round is completed
  useEffect(() => {
    if (completedItems.length === 4 && !roundCompleted) {
      setRoundCompleted(true);
      setFeedback(`Round ${currentRound} completed!`);
      new Audio('/audio/success.mp3').play();
    }
  }, [completedItems, currentRound, roundCompleted]);

  const handleOptionClick = (rowIndex, option, correctAnswer) => {
    if (roundCompleted || completedItems.includes(rowIndex)) return;

    const isCorrect = option === correctAnswer;
    const cellKey = `${currentRound}-${rowIndex}-${option}`;

    if (isCorrect) {
      setCompletedItems([...completedItems, rowIndex]);
      setSelectedCells({...selectedCells, [cellKey]: 'correct'});
      setFeedback(`Correct! ${correctAnswer} matches the picture!`);
      new Audio('/audio/correct.mp3').play();
    } else {
      loseLife();
      setSelectedCells({...selectedCells, [cellKey]: 'wrong'});
      setFeedback(`Try again! Find the word for ${correctAnswer}`);
      new Audio('/audio/wrong.mp3').play();
    }
  };

  const nextRound = () => {
    if (currentRound < 3) {
      setCurrentRound(currentRound + 1);
      setCompletedItems([]);
    } else {
      proceed();
    }
  };

  return (
    <div className="phase3-container">
      <h2>Phase 3: Picture Match Challenge</h2>
      
      <div className="round-tracker">
        {[1, 2, 3].map(round => (
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
        <table>
          <thead>
            <tr>
              <th>Picture</th>
              <th>Option 1</th>
              <th>Option 2</th>
              <th>Option 3</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, rowIndex) => (
              <tr key={rowIndex}>
                <td className="picture-cell">
                  <img 
                    src={`/images/${item.image}`} 
                    alt={item.correct} 
                    className={`picture ${completedItems.includes(rowIndex) ? 'completed' : ''}`}
                  />
                </td>
                {item.options.map((option, optionIndex) => {
                  const cellKey = `${currentRound}-${rowIndex}-${option}`;
                  const isSelected = selectedCells[cellKey];
                  const isCorrectAnswer = option === item.correct;
                  
                  return (
                    <td key={optionIndex}>
                      <button
                        className={`option-btn ${isSelected || ''} ${
                          completedItems.includes(rowIndex) && isCorrectAnswer ? 'correct' : ''
                        }`}
                        onClick={() => handleOptionClick(rowIndex, option, item.correct)}
                        disabled={completedItems.includes(rowIndex) || roundCompleted}
                      >
                        {option}
                        {completedItems.includes(rowIndex) && isCorrectAnswer && (
                          <span className="check-mark">✓</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {roundCompleted && (
        <button onClick={nextRound} className="proceed-button">
          {currentRound < 3 ? `Start Round ${currentRound + 1}` : "Great Job! Go to Phase 4"}
        </button>
      )}
    </div>
  );
};

export default Phase3;
