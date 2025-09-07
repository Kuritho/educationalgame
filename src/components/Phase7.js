import React, { useState, useEffect } from 'react';
import './styles/Phase7.css';
import thecat from './images/cat.png';
import puppy from './images/puppy.png';
import rabbit from './images/rabbit.png';
import pig from './images/pig.png';
import pumpkin from './images/pumpkin.png';

const Phase7 = ({ proceed, loseLife }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  // Background music effect
  useEffect(() => {
    const audio = new Audio('/sounds/bgm2.mp3');
    audio.loop = true;
    audio.volume = 0.5; // Set volume to 50%
    
    // Play audio when component mounts
    audio.play().catch(error => {
      console.log("Audio play failed:", error);
      // Some browsers require user interaction before playing audio
    });
    
    // Cleanup function to pause audio when component unmounts
    return () => {
      audio.pause();
    };
  }, []);

  const stories = [
    {
      id: 1,
      title: "MY CAT TITO",
      image: thecat,
      color: "#FF9E80", // Soft coral
      content: [
        "My cat is called Tito.",
        "Tito is small and orange.",
        "Tito likes playing with its yarn ball.",
        "I love Tito."
      ],
      questions: [
        {
          id: 'name',
          question: "What's my cat's name?",
          options: ["Tito", "Leo"],
          correctAnswer: "Tito"
        },
        {
          id: 'play',
          question: "What does it like to play with?",
          options: ["Plants", "Yarn"],
          correctAnswer: "Yarn"
        }
      ]
    },
    {
      id: 2,
      title: "THE LOST PUPPY",
      image: puppy,
      color: "#81D4FA", // Light blue
      content: [
        "Max the puppy got lost in the park.",
        "He was scared but then he smelled cookies.",
        "A kind girl named Emma was baking cookies nearby.",
        "Emma helped Max find his way home."
      ],
      questions: [
        {
          id: 'name',
          question: "Who helped the puppy?",
          options: ["Emma", "Lucas"],
          correctAnswer: "Emma"
        },
        {
          id: 'smell',
          question: "What did Max smell?",
          options: ["Cookies", "Flowers"],
          correctAnswer: "Cookies"
        }
      ]
    },
    {
      id: 3,
      title: "THE RABBIT",
      image: rabbit,
      color: "#C5E1A5", // Light green
      content: [
        "The rabbit hopped in the field.",
        "It found a carrot",
        "The carrot is orange.",
      ],
      questions: [
        {
          id: 'name',
          question: "What did the rabbit find?",
          options: ["cabbage", "carrot"],
          correctAnswer: "carrot"
        },
        {
          id: 'color',
          question: "What color was the carrot?",
          options: ["orange", "yellow"],
          correctAnswer: "orange"
        }
      ]
    },
    {
      id: 4,
      title: "THE PINK PIG",
      image: pig,
      color: "#F48FB1", // Pink
      content: [
        "The pig rolled in the mud.",
        "It was happy and pink.",
        "The mud is soft.",
      ],
      questions: [
        {
          id: 'name',
          question: "Where did the pig roll?",
          options: ["grass", "mud"],
          correctAnswer: "mud"
        },
        {
          id: 'feeling',
          question: "How did the pig feel?",
          options: ["happy", "sad"],
          correctAnswer: "happy"
        }
      ]
    },
    {
      id: 5,
      title: "BEN'S GIANT VEGETABLES",
      image: pumpkin,
      color: "#FFCC80", // Light orange
      content: [
        "Ben planted special seeds from his grandpa.",
        "The vegetables grew bigger than Ben!",
        "He shared them with the whole neighborhood.",
        "The biggest pumpkin won first prize at the fair."
      ],
      questions: [
        {
          id: 'name',
          question: "Where did Ben get the special seeds?",
          options: ["His grandpa", "The store"],
          correctAnswer: "His grandpa"
        },
        {
          id: 'prize',
          question: "What won first prize at the fair?",
          options: ["Biggest pumpkin", "Tallest sunflower"],
          correctAnswer: "Biggest pumpkin"
        }
      ]
    }
  ];

  const currentStory = stories[currentStoryIndex];

  const handleAnswerChange = (questionId, selectedAnswer) => {
    setAnswers({
      ...answers,
      [questionId]: selectedAnswer
    });
  };

  const checkAnswers = () => {
    let correct = 0;
    currentStory.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);

    if (correct === currentStory.questions.length) {
      // All answers correct - enable proceed button
    } else {
      // Some answers wrong - lose a life
      loseLife();
    }
  };

  const nextStory = () => {
    // Reset for next story
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // All stories completed
      proceed();
    }
  };

  const startGame = () => {
    setShowInstructions(false);
  };

  const allQuestionsAnswered = currentStory.questions.every(q => answers[q.id]);

  // Show instructions screen
  if (showInstructions) {
    return (
      <div className="instructions-screen">
        <div className="instructions-content">
          <h1>Reading Comprehension Game</h1>
          <div className="instructions-list">
            <h2>How to Play:</h2>
            <ol>
              <li>Read the story carefully</li>
              <li>Answer the questions about the story</li>
              <li>Select one answer for each question</li>
              <li>Click "Check Answers" when you're done</li>
              <li>Get all answers right to move to the next story!</li>
            </ol>
            <div className="tips">
              <h3>Tips:</h3>
              <ul>
                <li>Read the story more than once if needed</li>
                <li>Pay attention to details like names and colors</li>
                <li>Take your time - there's no rush!</li>
              </ul>
            </div>
          </div>
          <button onClick={startGame} className="start-button">
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="story-quiz" style={{ "--theme-color": currentStory.color }}>
      <div className="story-header">
        <h1>{currentStory.title}</h1>
        <div className="story-progress">
          Story {currentStoryIndex + 1} of {stories.length}
        </div>
      </div>
      
      <div className="story-content-container">
        <div className="story-text">
          {currentStory.content.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <img 
          src={currentStory.image} 
          alt={currentStory.title} 
          className="story-image"
        />
      </div>

      <div className="instructions">
        <p>Read the story and mark the correct option.</p>
      </div>

      <div className="questions">
        {currentStory.questions.map((q) => (
          <div key={q.id} className="question">
            <p>{q.question}</p>
            <div className="options">
              {q.options.map((option) => (
                <label key={option} className={submitted ? 
                  (answers[q.id] === option ? 
                    (option === q.correctAnswer ? 'correct' : 'incorrect') : 
                    (option === q.correctAnswer ? 'correct-answer' : '')
                  ) : ''}>
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={answers[q.id] === option}
                    onChange={() => handleAnswerChange(q.id, option)}
                    disabled={submitted}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button 
          onClick={checkAnswers} 
          disabled={!allQuestionsAnswered}
          className="check-answers-btn"
        >
          Check Answers
        </button>
      ) : (
        <div className="result">
          <p>You got {score} out of {currentStory.questions.length} correct!</p>
          {score === currentStory.questions.length ? (
            <>
              <p className="success">Great job! You got all answers right!</p>
              <button onClick={nextStory} className="next-btn">
                {currentStoryIndex < stories.length - 1 ? 'Next Story' : 'Finish'}
              </button>
            </>
          ) : (
            <>
              <p className="try-again">Try again to get all answers correct!</p>
              <button onClick={() => setSubmitted(false)} className="try-again-btn">Try Again</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Phase7;