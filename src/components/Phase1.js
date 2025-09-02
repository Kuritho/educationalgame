import React, { useState, useEffect, useRef } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import './styles/Phase1.css';

const Phase1 = ({ proceed, loseLife }) => {
  const [completed, setCompleted] = usePersistedState('phase1_completed', false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [items, setItems] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [audioError, setAudioError] = useState(false);
  const [tutorialAudioReady, setTutorialAudioReady] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [userInteracted, setUserInteracted] = useState(false);
  const [audioContextAllowed, setAudioContextAllowed] = useState(false);
  
  const audioRef = useRef(null);
  const tutorialAudioRef = useRef(null);
  const interactionAttempted = useRef(false);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const letterItems = {
    A: ['Apple', 'Ant', 'Airplane', 'Alligator'],
    B: ['Banana', 'Bear', 'Ball', 'Butterfly'],
    C: ['Cat', 'Car', 'Cake', 'Cow'],
    D: ['Dog', 'Dolphin', 'Duck', 'Dinosaur'],
    E: ['Elephant', 'Egg', 'Eagle', 'Engine'],
    F: ['Fish', 'Flower', 'Frog', 'Fox'],
    G: ['Giraffe', 'Grapes', 'Guitar', 'Goat'],
    H: ['House', 'Heart', 'Horse', 'Helicopter'],
    I: ['Ice Cream', 'Igloo', 'Island', 'Iguana'],
    J: ['Jellyfish', 'Jaguar', 'Jar', 'Jet'],
    K: ['Kangaroo', 'Key', 'Kite', 'Koala'],
    L: ['Lion', 'Lemon', 'Lighthouse', 'Leaf'],
    M: ['Monkey', 'Moon', 'Mountain', 'Mouse'],
    N: ['Nest', 'Nose', 'Net', 'Nurse'],
    O: ['Orange', 'Owl', 'Octopus', 'Ostrich'],
    P: ['Panda', 'Pizza', 'Pencil', 'Penguin'],
    Q: ['Queen', 'Quilt', 'Quill', 'Quartz'],
    R: ['Rabbit', 'Rainbow', 'Robot', 'Rose'],
    S: ['Sun', 'Star', 'Snake', 'Ship'],
    T: ['Tree', 'Tiger', 'Train', 'Turtle'],
    U: ['Umbrella', 'Unicorn', 'UFO', 'Uniform'],
    V: ['Violin', 'Volcano', 'Vase', 'Vegetable'],
    W: ['Whale', 'Watermelon', 'Wheel', 'Wolf'],
    X: ['Xylophone', 'X-ray', 'Xiphias', 'Xerus'],
    Y: ['Yak', 'Yacht', 'Yo-yo', 'Yogurt'],
    Z: ['Zebra', 'Zipper', 'Zoo', 'Zucchini']
  };

  // Handle initial user interaction for audio
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!interactionAttempted.current) {
        setUserInteracted(true);
        interactionAttempted.current = true;
        
        // Try to unlock audio context on iOS
        if (window.AudioContext) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          oscillator.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop();
          audioContext.close();
          setAudioContextAllowed(true);
        }
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Get available voices and filter for child-friendly ones
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const childFriendlyVoices = voices.filter(voice => 
          voice.lang.startsWith('en-') && // English voices
          !voice.name.toLowerCase().includes('compact') && // Exclude compact voices
          !voice.name.toLowerCase().includes('enhanced') // Exclude enhanced voices
        );
        
        setAvailableVoices(childFriendlyVoices);
      }
    };

    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Initial load with timeout for mobile browsers
    const voiceTimer = setTimeout(loadVoices, 1000);
    
    return () => clearTimeout(voiceTimer);
  }, []);

  // Get the best voice for children
  const getChildFriendlyVoice = () => {
    if (availableVoices.length === 0) return null;
    
    // Prefer female voices as they're often clearer for children
    const preferredVoices = availableVoices.filter(voice =>
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('samantha') || // Common clear voice
      voice.name.toLowerCase().includes('karen') || // Common clear voice (Australian English)
      voice.name.toLowerCase().includes('victoria') // Common clear voice
    );

    // If no preferred voices, use any available English voice
    return preferredVoices.length > 0 ? preferredVoices[0] : availableVoices[0];
  };

  // Preload tutorial audio with better error handling
  useEffect(() => {
    // Skip audio preloading on mobile to save bandwidth
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setTutorialAudioReady(true);
      return;
    }

    const testAudioUrl = (url) => {
      return new Promise((resolve) => {
        const audio = new Audio();
        audio.preload = 'auto';
        
        audio.addEventListener('canplaythrough', () => {
          resolve(true);
        });
        
        audio.addEventListener('error', () => {
          resolve(false);
        });
        
        audio.src = url;
        audio.load();
        
        setTimeout(() => resolve(false), 2000);
      });
    };

    const initializeAudio = async () => {
      const audioUrls = [
        'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3',
      ];

      let audioAvailable = false;

      for (const url of audioUrls) {
        const isAvailable = await testAudioUrl(url);
        if (isAvailable) {
          tutorialAudioRef.current = new Audio(url);
          audioAvailable = true;
          break;
        }
      }

      if (!audioAvailable) {
        setAudioError(true);
        setTutorialAudioReady(true);
        return;
      }

      tutorialAudioRef.current.addEventListener('canplaythrough', () => {
        setTutorialAudioReady(true);
      });

      tutorialAudioRef.current.addEventListener('error', (e) => {
        setAudioError(true);
        setTutorialAudioReady(true);
      });

      tutorialAudioRef.current.load();
    };

    initializeAudio();

    return () => {
      if (tutorialAudioRef.current) {
        tutorialAudioRef.current.pause();
        tutorialAudioRef.current = null;
      }
    };
  }, []);

  // Play tutorial audio when ready
  useEffect(() => {
    if (showTutorial && tutorialAudioReady && tutorialAudioRef.current && !audioError && userInteracted) {
      const playTutorial = async () => {
        try {
          setPlayingAudio(true);
          
          // On mobile, we'll skip the tutorial audio and show text instead
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          if (isMobile) {
            setAudioError(true); // This will trigger the text tutorial
            setPlayingAudio(false);
            return;
          }
          
          await tutorialAudioRef.current.play();
          
          tutorialAudioRef.current.onended = () => {
            setPlayingAudio(false);
            setShowTutorial(false);
          };
        } catch (error) {
          setAudioError(true);
          setPlayingAudio(false);
        }
      };
      
      playTutorial();
    }
  }, [showTutorial, tutorialAudioReady, audioError, userInteracted]);

  const handleComplete = () => {
    setCompleted(true);
    proceed();
  };

  const handleLetterClick = (letter) => {
    if (showTutorial) return;
    setSelectedLetter(letter);
    setItems(letterItems[letter] || []);
  };

  const handleItemClick = (item) => {
    if (showTutorial || playingAudio || !userInteracted) return;
    
    try {
      setPlayingAudio(true);
      
      // Check if speech synthesis is available and allowed
      if ('speechSynthesis' in window && availableVoices.length > 0) {
        const utterance = new SpeechSynthesisUtterance(item);
        
        // Configure for child-friendly speech
        const voice = getChildFriendlyVoice();
        if (voice) {
          utterance.voice = voice;
        }
        
        utterance.rate = 0.8; // Slower speed for clarity
        utterance.pitch = 1.1; // Slightly higher pitch (more friendly)
        utterance.volume = 1.0;
        
        // Add slight pauses between words for multi-word items
        if (item.includes(' ')) {
          utterance.text = item.split(' ').join('... '); // Add pauses between words
        }
        
        utterance.onend = () => {
          setPlayingAudio(false);
        };
        
        utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e);
          setPlayingAudio(false);
        };
        
        // Cancel any ongoing speech before starting new one
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        
        // Add a small delay for mobile devices
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 100);
      } else {
        // Fallback: visual feedback with longer delay for multi-word items
        const delay = item.includes(' ') ? 1500 : 1000;
        setTimeout(() => {
          setPlayingAudio(false);
        }, delay);
      }
    } catch (error) {
      console.error('Error with speech synthesis:', error);
      setPlayingAudio(false);
    }
  };

  const skipTutorial = () => {
    if (tutorialAudioRef.current) {
      tutorialAudioRef.current.pause();
      tutorialAudioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setShowTutorial(false);
    setPlayingAudio(false);
  };

  // Auto-skip tutorial if audio fails to load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showTutorial && !tutorialAudioReady) {
        setAudioError(true);
        setTutorialAudioReady(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [showTutorial, tutorialAudioReady]);

  return (
    <div className="phase-container">
      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>Welcome to Alphabet Adventure! 🎉</h2>
            {audioError ? (
              <div>
                <p>Let's learn about letters and words! 📚</p>
                <ol style={{textAlign: 'left', margin: '15px 0', paddingLeft: '20px', fontSize: '16px', lineHeight: '1.6'}}>
                  <li>✨ Click on any letter to see items that start with it</li>
                  <li>🎵 Click on an item to hear its pronunciation</li>
                  <li>🔤 Explore all the letters from A to Z!</li>
                  <li>🎯 Have fun learning!</li>
                </ol>
              </div>
            ) : (
              <div>
                <p>Listening to game instructions... 🔊</p>
                <div className="audio-wave"></div>
              </div>
            )}
            <button onClick={skipTutorial} className="skip-tutorial-btn">
              {audioError ? 'Start Playing! 🚀' : 'Skip Tutorial'}
            </button>
          </div>
        </div>
      )}
      
      <h2>Exercise: Alphabet Adventure 🎓</h2>
      <p>Click a letter to see items that start with it! 👇</p>
      
      {!userInteracted && (
        <div className="audio-info">
          <p>👆 Tap anywhere to enable audio features</p>
        </div>
      )}
      
      {audioError && availableVoices.length === 0 && (
        <div className="audio-warning">
          <p>🔈 Text-to-speech not available. Click items to see their names!</p>
        </div>
      )}
      
      {audioError && availableVoices.length > 0 && (
        <div className="audio-info">
          <p>🎵 Click items to hear clear pronunciation!</p>
        </div>
      )}
      
      <div className="alphabet-grid">
        {alphabet.map(letter => (
          <button 
            key={letter}
            className={`letter-btn ${selectedLetter === letter ? 'active' : ''} ${showTutorial ? 'disabled' : ''}`}
            onClick={() => handleLetterClick(letter)}
            disabled={showTutorial}
          >
            {letter}
          </button>
        ))}
      </div>
      
      {selectedLetter && (
        <div className="items-container">
          <h3>Items starting with {selectedLetter}:</h3>
          <div className="items-grid">
            {items.map(item => (
              <button
                key={item}
                className={`item-btn ${playingAudio ? 'disabled' : ''} ${showTutorial ? 'disabled' : ''} ${!userInteracted ? 'disabled' : ''}`}
                onClick={() => handleItemClick(item)}
                disabled={playingAudio || showTutorial || !userInteracted}
              >
                <div className="item-image-placeholder">
                  {item.charAt(0)}
                </div>
                <span>{item}</span>
                <div className="speaker-icon">
                  {playingAudio ? '🔊' : '🔈'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {playingAudio && !showTutorial && (
        <div className="audio-playing">
          <p>Speaking word... 🗣️</p>
          <div className="audio-wave"></div>
          <button 
            className="stop-audio-btn"
            onClick={() => {
              if (window.speechSynthesis && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
              }
              setPlayingAudio(false);
            }}
          >
            Stop Audio ⏹️
          </button>
        </div>
      )}
      
      <button 
        onClick={proceed} 
        className="proceed-button"
        disabled={playingAudio || showTutorial}
      >
        Go to Phase 2 ➡️
      </button>
    </div>
  );
};

export default Phase1;
