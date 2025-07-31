import React, { useState } from 'react';
import './styles/Phase7.css';
import thecat from  './images/cat.png';
import puppy from  './images/puppy.png';
import rabbit from  './images/rabbit.png';
import pig from  './images/pig.png';
import pumpkin from  './images/pumpkin.png';

const Phase7 = ({ proceed, loseLife }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const stories = [
    {
      id: 1,
      title: "MY CAT TITO",
      image: thecat,
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

  const allQuestionsAnswered = currentStory.questions.every(q => answers[q.id]);

  return (
    <div className="story-quiz">
      <h1>{currentStory.title}</h1>
      <div className="story-progress">
        Story {currentStoryIndex + 1} of {stories.length}
      </div>
      
      <div className="story-content-container">
        <div className="story-text">
          {currentStory.content.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <img 
          src={currentStory.image} 
          alt={currentStory.altText} 
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
        >
          Check Answers
        </button>
      ) : (
        <div className="result">
          <p>You got {score} out of {currentStory.questions.length} correct!</p>
          {score === currentStory.questions.length ? (
            <>
              <p className="success">Great job! You got all answers right!</p>
              <button onClick={nextStory}>
                {currentStoryIndex < stories.length - 1 ? 'Next Story' : 'Finish'}
              </button>
            </>
          ) : (
            <>
              <p className="try-again">Try again to get all answers correct!</p>
              <button onClick={() => setSubmitted(false)}>Try Again</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Phase7;