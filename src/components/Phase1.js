import React, { useState, useEffect, useRef } from 'react';
import { usePersistedState } from '../hooks/usePersistedState';
import './styles/Phase1.css';

const Phase1 = ({ proceed, loseLife }) => {
  const [completed, setCompleted] = usePersistedState('phase1_completed', false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [items, setItems] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  
  // Song and pronunciation state
  const [selectedSongSet, setSelectedSongSet] = useState(0);
  const [selectedPronunciation, setSelectedPronunciation] = useState(0);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoError, setVideoError] = useState(false);
  
  const videoRef = useRef(null);
  const interactionAttempted = useRef(false);
  const utteranceRef = useRef(null);
  const audioElementRef = useRef(null);

  // Pre-recorded audio fallback - using Web Speech API with multiple attempts
  // This creates audio on-the-fly using the Web Speech API which works across browsers

  // Video URLs
  const songVideos = {
    song1: {
      name: "Classic ABC Song 🎵",
      videoUrl: "/videos/abc-song.mp4",
      lyrics: [
        "A, B, C, D, E, F, G",
        "H, I, J, K, L, M, N, O, P",
        "Q, R, S, T, U, V",
        "W, X, Y, and Z",
        "Now I know my ABC's,",
        "Next time won't you sing with me?"
      ]
    },
    song2: {
      name: "Phonics Fun Song 🎓",
      videoUrl: "/videos/phonics-song.mp4",
      lyrics: [
        "A says ah, A says ah, Every letter makes a sound!",
        "B says buh, B says buh, Let's all sing along!",
        "C says kuh, C says kuh, Learning is so fun!",
        "D says duh, D says duh, We've only just begun!"
      ]
    },
    song3: {
      name: "Alphabet Adventure 🎪",
      videoUrl: "/videos/alphabet-adventure.mp4",
      lyrics: [
        "Come along and sing with me,",
        "Learning letters, A to Z!",
        "Every letter has a sound,",
        "Let's explore and dance around!"
      ]
    }
  };

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

  const letterPronunciations = {
    A: [
      { name: "Standard", sound: "AY", example: "Apple", fullText: "A says AY. A is for Apple." },
      { name: "Phonics", sound: "AH", example: "Ant", fullText: "AH! AH! A makes the AH sound. Like Ant!" },
      { name: "Musical", sound: "AY-EE", example: "Amazing", fullText: "AY-EE~ A~ AY-EE~ A is for Amazing~" }
    ],
    B: [
      { name: "Standard", sound: "BEE", example: "Ball", fullText: "B says BEE. B is for Ball." },
      { name: "Phonics", sound: "BUH", example: "Bear", fullText: "BUH! BUH! B makes the BUH sound. Like Bear!" },
      { name: "Musical", sound: "BEE-OH", example: "Bumblebee", fullText: "BEE-OH~ B~ BEE-OH~ B is for Bumblebee~" }
    ],
    C: [
      { name: "Standard", sound: "SEE", example: "Cat", fullText: "C says SEE. C is for Cat." },
      { name: "Phonics", sound: "KUH", example: "Car", fullText: "KUH! KUH! C makes the KUH sound. Like Car!" },
      { name: "Musical", sound: "SEE-EE", example: "Circus", fullText: "SEE-EE~ C~ SEE-EE~ C is for Circus~" }
    ],
    D: [
      { name: "Standard", sound: "DEE", example: "Dog", fullText: "D says DEE. D is for Dog." },
      { name: "Phonics", sound: "DUH", example: "Duck", fullText: "DUH! DUH! D makes the DUH sound. Like Duck!" },
      { name: "Musical", sound: "DEE-OH", example: "Drum", fullText: "DEE-OH~ D~ DEE-OH~ D is for Drum~" }
    ],
    E: [
      { name: "Standard", sound: "EE", example: "Elephant", fullText: "E says EE. E is for Elephant." },
      { name: "Phonics", sound: "EH", example: "Egg", fullText: "EH! EH! E makes the EH sound. Like Egg!" },
      { name: "Musical", sound: "EE-EE", example: "Echo", fullText: "EE-EE~ E~ EE-EE~ E is for Echo~" }
    ],
    F: [
      { name: "Standard", sound: "EFF", example: "Fish", fullText: "F says EFF. F is for Fish." },
      { name: "Phonics", sound: "FFF", example: "Frog", fullText: "FFF! FFF! F makes the FFF sound. Like Frog!" },
      { name: "Musical", sound: "EFF-OH", example: "Flute", fullText: "EFF-OH~ F~ EFF-OH~ F is for Flute~" }
    ],
    G: [
      { name: "Standard", sound: "JEE", example: "Giraffe", fullText: "G says JEE. G is for Giraffe." },
      { name: "Phonics", sound: "GUH", example: "Grapes", fullText: "GUH! GUH! G makes the GUH sound. Like Grapes!" },
      { name: "Musical", sound: "JEE-OH", example: "Guitar", fullText: "JEE-OH~ G~ JEE-OH~ G is for Guitar~" }
    ],
    H: [
      { name: "Standard", sound: "AYCH", example: "House", fullText: "H says AYCH. H is for House." },
      { name: "Phonics", sound: "HUH", example: "Heart", fullText: "HUH! HUH! H makes the HUH sound. Like Heart!" },
      { name: "Musical", sound: "AYCH-OH", example: "Harmony", fullText: "AYCH-OH~ H~ AYCH-OH~ H is for Harmony~" }
    ],
    I: [
      { name: "Standard", sound: "EYE", example: "Ice cream", fullText: "I says EYE. I is for Ice cream." },
      { name: "Phonics", sound: "IH", example: "Igloo", fullText: "IH! IH! I makes the IH sound. Like Igloo!" },
      { name: "Musical", sound: "EYE-EE", example: "Island", fullText: "EYE-EE~ I~ EYE-EE~ I is for Island~" }
    ],
    J: [
      { name: "Standard", sound: "JAY", example: "Jellyfish", fullText: "J says JAY. J is for Jellyfish." },
      { name: "Phonics", sound: "JUH", example: "Jaguar", fullText: "JUH! JUH! J makes the JUH sound. Like Jaguar!" },
      { name: "Musical", sound: "JAY-OH", example: "Jazz", fullText: "JAY-OH~ J~ JAY-OH~ J is for Jazz~" }
    ],
    K: [
      { name: "Standard", sound: "KAY", example: "Kangaroo", fullText: "K says KAY. K is for Kangaroo." },
      { name: "Phonics", sound: "KUH", example: "Key", fullText: "KUH! KUH! K makes the KUH sound. Like Key!" },
      { name: "Musical", sound: "KAY-OH", example: "Kite", fullText: "KAY-OH~ K~ KAY-OH~ K is for Kite~" }
    ],
    L: [
      { name: "Standard", sound: "ELL", example: "Lion", fullText: "L says ELL. L is for Lion." },
      { name: "Phonics", sound: "LLL", example: "Leaf", fullText: "LLL! LLL! L makes the LLL sound. Like Leaf!" },
      { name: "Musical", sound: "ELL-OH", example: "Lullaby", fullText: "ELL-OH~ L~ ELL-OH~ L is for Lullaby~" }
    ],
    M: [
      { name: "Standard", sound: "EMM", example: "Monkey", fullText: "M says EMM. M is for Monkey." },
      { name: "Phonics", sound: "MMM", example: "Moon", fullText: "MMM! MMM! M makes the MMM sound. Like Moon!" },
      { name: "Musical", sound: "EMM-OH", example: "Magic", fullText: "EMM-OH~ M~ EMM-OH~ M is for Magic~" }
    ],
    N: [
      { name: "Standard", sound: "ENN", example: "Nest", fullText: "N says ENN. N is for Nest." },
      { name: "Phonics", sound: "NNN", example: "Nose", fullText: "NNN! NNN! N makes the NNN sound. Like Nose!" },
      { name: "Musical", sound: "ENN-OH", example: "Night", fullText: "ENN-OH~ N~ ENN-OH~ N is for Night~" }
    ],
    O: [
      { name: "Standard", sound: "OH", example: "Orange", fullText: "O says OH. O is for Orange." },
      { name: "Phonics", sound: "AH", example: "Octopus", fullText: "AH! AH! O makes the AH sound. Like Octopus!" },
      { name: "Musical", sound: "OH-OH", example: "Ocean", fullText: "OH-OH~ O~ OH-OH~ O is for Ocean~" }
    ],
    P: [
      { name: "Standard", sound: "PEE", example: "Panda", fullText: "P says PEE. P is for Panda." },
      { name: "Phonics", sound: "PUH", example: "Pizza", fullText: "PUH! PUH! P makes the PUH sound. Like Pizza!" },
      { name: "Musical", sound: "PEE-OH", example: "Popcorn", fullText: "PEE-OH~ P~ PEE-OH~ P is for Popcorn~" }
    ],
    Q: [
      { name: "Standard", sound: "KYOO", example: "Queen", fullText: "Q says KYOO. Q is for Queen." },
      { name: "Phonics", sound: "KWUH", example: "Quilt", fullText: "KWUH! KWUH! Q makes the KWUH sound. Like Quilt!" },
      { name: "Musical", sound: "KYOO-OH", example: "Quiet", fullText: "KYOO-OH~ Q~ KYOO-OH~ Q is for Quiet~" }
    ],
    R: [
      { name: "Standard", sound: "ARR", example: "Rabbit", fullText: "R says ARR. R is for Rabbit." },
      { name: "Phonics", sound: "RRR", example: "Rainbow", fullText: "RRR! RRR! R makes the RRR sound. Like Rainbow!" },
      { name: "Musical", sound: "ARR-OH", example: "Rain", fullText: "ARR-OH~ R~ ARR-OH~ R is for Rain~" }
    ],
    S: [
      { name: "Standard", sound: "ESS", example: "Sun", fullText: "S says ESS. S is for Sun." },
      { name: "Phonics", sound: "SSS", example: "Snake", fullText: "SSS! SSS! S makes the SSS sound. Like Snake!" },
      { name: "Musical", sound: "ESS-OH", example: "Symphony", fullText: "ESS-OH~ S~ ESS-OH~ S is for Symphony~" }
    ],
    T: [
      { name: "Standard", sound: "TEE", example: "Tree", fullText: "T says TEE. T is for Tree." },
      { name: "Phonics", sound: "TUH", example: "Tiger", fullText: "TUH! TUH! T makes the TUH sound. Like Tiger!" },
      { name: "Musical", sound: "TEE-OH", example: "Tambourine", fullText: "TEE-OH~ T~ TEE-OH~ T is for Tambourine~" }
    ],
    U: [
      { name: "Standard", sound: "YOO", example: "Umbrella", fullText: "U says YOO. U is for Umbrella." },
      { name: "Phonics", sound: "UH", example: "Unicorn", fullText: "UH! UH! U makes the UH sound. Like Unicorn!" },
      { name: "Musical", sound: "YOO-OH", example: "Up", fullText: "YOO-OH~ U~ YOO-OH~ U is for Up~" }
    ],
    V: [
      { name: "Standard", sound: "VEE", example: "Violin", fullText: "V says VEE. V is for Violin." },
      { name: "Phonics", sound: "VVV", example: "Volcano", fullText: "VVV! VVV! V makes the VVV sound. Like Volcano!" },
      { name: "Musical", sound: "VEE-OH", example: "Vibration", fullText: "VEE-OH~ V~ VEE-OH~ V is for Vibration~" }
    ],
    W: [
      { name: "Standard", sound: "DOUBLE-YOO", example: "Whale", fullText: "W says DOUBLE-YOO. W is for Whale." },
      { name: "Phonics", sound: "WUH", example: "Watermelon", fullText: "WUH! WUH! W makes the WUH sound. Like Watermelon!" },
      { name: "Musical", sound: "WUH-OH", example: "Wave", fullText: "WUH-OH~ W~ WUH-OH~ W is for Wave~" }
    ],
    X: [
      { name: "Standard", sound: "EKS", example: "Xylophone", fullText: "X says EKS. X is for Xylophone." },
      { name: "Phonics", sound: "KS", example: "X-ray", fullText: "KS! KS! X makes the KS sound. Like X-ray!" },
      { name: "Musical", sound: "EKS-OH", example: "Xylophone", fullText: "EKS-OH~ X~ EKS-OH~ X is for Xylophone~" }
    ],
    Y: [
      { name: "Standard", sound: "WYE", example: "Yak", fullText: "Y says WYE. Y is for Yak." },
      { name: "Phonics", sound: "YUH", example: "Yo-yo", fullText: "YUH! YUH! Y makes the YUH sound. Like Yo-yo!" },
      { name: "Musical", sound: "WYE-OH", example: "Yodel", fullText: "WYE-OH~ Y~ WYE-OH~ Y is for Yodel~" }
    ],
    Z: [
      { name: "Standard", sound: "ZEE", example: "Zebra", fullText: "Z says ZEE. Z is for Zebra." },
      { name: "Phonics", sound: "ZZZ", example: "Zipper", fullText: "ZZZ! ZZZ! Z makes the ZZZ sound. Like Zipper!" },
      { name: "Musical", sound: "ZEE-OH", example: "Buzz", fullText: "ZEE-OH~ Z~ ZEE-OH~ Z is for Buzz~" }
    ]
  };

  // Detect mobile and browser
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(isMobileDevice);
    
    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      setSpeechSupported(false);
    }
  }, []);

  // UNIVERSAL SPEECH FUNCTION - Works on ALL browsers
  const speakText = (text) => {
    return new Promise((resolve) => {
      setPlayingAudio(true);
      
      // Method 1: Try Web Speech API (Chrome, Edge, Safari, most browsers)
      if (window.speechSynthesis) {
        try {
          // Cancel any ongoing speech
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
          }
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 1;
          
          // Try to get a good voice
          const setBestVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              // Prefer English voices
              const englishVoice = voices.find(v => v.lang.startsWith('en-'));
              if (englishVoice) {
                utterance.voice = englishVoice;
              }
            }
          };
          
          setBestVoice();
          
          // If voices aren't loaded yet, try again
          if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
              const voices = window.speechSynthesis.getVoices();
              const englishVoice = voices.find(v => v.lang.startsWith('en-'));
              if (englishVoice) {
                utterance.voice = englishVoice;
              }
            };
          }
          
          utterance.onend = () => {
            setPlayingAudio(false);
            resolve();
          };
          
          utterance.onerror = (e) => {
            console.warn("Speech error, trying fallback:", e);
            // Try fallback
            fallbackSpeak(text, resolve);
          };
          
          // Small delay for better compatibility
          setTimeout(() => {
            try {
              window.speechSynthesis.speak(utterance);
            } catch (e) {
              fallbackSpeak(text, resolve);
            }
          }, 100);
          
          return;
        } catch (e) {
          console.warn("Speech synthesis error:", e);
          fallbackSpeak(text, resolve);
          return;
        }
      }
      
      // Method 2: Fallback to console + visual feedback
      fallbackSpeak(text, resolve);
    });
  };
  
  // Fallback method when speech synthesis fails
  const fallbackSpeak = (text, resolve) => {
    console.log("Speaking (fallback):", text);
    
    // Show visual feedback
    const fallbackMessage = document.createElement('div');
    fallbackMessage.className = 'fallback-speech-message';
    fallbackMessage.innerHTML = `🔊 ${text}`;
    document.body.appendChild(fallbackMessage);
    
    setTimeout(() => {
      fallbackMessage.remove();
    }, 2000);
    
    setTimeout(() => {
      setPlayingAudio(false);
      resolve();
    }, 1500);
  };

  const playVideo = async (songKey, songIndex) => {
    const song = songVideos[songKey];
    if (!song) return;
    
    setVideoError(false);
    setVideoUrl(song.videoUrl);
    setVideoTitle(song.name);
    setShowVideoModal(true);
    setSelectedSongSet(songIndex);
    setIsPlayingSong(true);
    setCurrentSong(song);
  };

  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setShowVideoModal(false);
    setVideoUrl('');
    setIsPlayingSong(false);
    setVideoError(false);
  };

  const pronounceLetter = async (letter, pronunciationIndex) => {
    if (playingAudio) return;
    
    const pronunciation = letterPronunciations[letter]?.[pronunciationIndex];
    if (!pronunciation) return;
    
    await speakText(pronunciation.fullText);
  };

  const handleLetterClick = (letter) => {
    if (showTutorial || playingAudio) return;
    setSelectedLetter(letter);
    setItems(letterItems[letter] || []);
    pronounceLetter(letter, selectedPronunciation);
  };

  const handleItemClick = async (item) => {
    if (showTutorial || playingAudio) return;
    await speakText(item);
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setPlayingAudio(false);
  };

  // Handle user interaction for mobile browsers
  const handleUserInteraction = () => {
    if (!interactionAttempted.current) {
      interactionAttempted.current = true;
      setUserInteracted(true);
      
      // Pre-initialize speech synthesis on user interaction
      if (window.speechSynthesis) {
        // Create a silent utterance to wake up the system
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
        
        // Cancel it after a short time
        setTimeout(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
        }, 200);
      }
    }
  };

  return (
    <div className="phase-container" onClick={handleUserInteraction} onTouchStart={handleUserInteraction}>
      {/* Browser compatibility notice */}
      {!speechSupported && (
        <div className="audio-warning">
          <p>🔊 Your browser doesn't support voice. Visual feedback will be shown instead.</p>
        </div>
      )}
      
      {/* Mobile Warning */}
      {isMobile && !userInteracted && (
        <div className="mobile-warning">
          <p>👆 Tap anywhere to enable voice</p>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>{videoTitle}</h3>
              <button className="close-modal-btn" onClick={closeVideoModal}>✕</button>
            </div>
            <div className="video-container">
              {videoUrl && !videoError && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  webkit-playsinline="true"
                  className="song-video"
                  onEnded={closeVideoModal}
                  onError={() => {
                    setVideoError(true);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {videoError && (
                <div className="video-error">
                  <p>⚠️ Video cannot be played</p>
                  <button onClick={closeVideoModal}>Close</button>
                </div>
              )}
            </div>
            {currentSong && !videoError && (
              <div className="video-lyrics">
                <h4>🎤 Song Lyrics:</h4>
                {currentSong.lyrics.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showTutorial && (
        <div className="tutorial-overlay">
          <div className="tutorial-content">
            <h2>Welcome to Alphabet Adventure! 🎉</h2>
            <div>
              <p>Let's learn letters with crystal clear sounds and videos! 📚</p>
              <ol style={{textAlign: 'left', margin: '15px 0', paddingLeft: '20px', fontSize: '16px', lineHeight: '1.6'}}>
                <li>✨ Click any letter to hear it pronounced clearly</li>
                <li>🎬 Click song buttons to watch fun alphabet videos!</li>
                <li>🔊 Choose from 3 pronunciation styles</li>
                <li>🎯 Click items to hear their names</li>
              </ol>
              {isMobile && (
                <div className="mobile-note">
                  <p>📱 <strong>Mobile Users:</strong> Tap the screen first to enable voice</p>
                </div>
              )}
              {!speechSupported && (
                <div className="mobile-note">
                  <p>🔊 Visual feedback will be shown for words</p>
                </div>
              )}
            </div>
            <button onClick={skipTutorial} className="skip-tutorial-btn">
              Start Playing! 🚀
            </button>
          </div>
        </div>
      )}
      
      <h2>Exercise: Alphabet Adventure 🎓</h2>
      <p>Click a letter to hear it clearly! 👇</p>
      
      {/* Video Song Selection Panel */}
      {!showTutorial && (
        <div className="song-player-panel">
          <h3>🎬 Alphabet Music Videos 🎬</h3>
          <div className="song-buttons">
            {Object.keys(songVideos).map((key, index) => (
              <button
                key={index}
                className={`song-btn ${selectedSongSet === index && isPlayingSong ? 'playing' : ''}`}
                onClick={() => playVideo(key, index)}
              >
                {songVideos[key].name}
                <span className="video-icon">📺</span>
              </button>
            ))}
          </div>
          
          {!userInteracted && isMobile && (
            <div className="tap-prompt">
              <p>👆 Tap once to enable voice</p>
            </div>
          )}
          
          <div className="song-info">
            <p>💡 <strong>Tip:</strong> Click any song button to watch fun learning videos!</p>
            <p>🌐 Works on Chrome, Firefox, Safari, Edge, and all modern browsers</p>
          </div>
        </div>
      )}
      
      {/* Pronunciation Selection Panel */}
      {!showTutorial && (
        <div className="pronunciation-panel">
          <h3>🔊 Pronunciation Styles</h3>
          <div className="pronunciation-buttons">
            <button
              className={`pronunciation-btn ${selectedPronunciation === 0 ? 'active' : ''}`}
              onClick={() => {
                setSelectedPronunciation(0);
                if (selectedLetter) {
                  pronounceLetter(selectedLetter, 0);
                }
              }}
            >
              📖 Standard
            </button>
            <button
              className={`pronunciation-btn ${selectedPronunciation === 1 ? 'active' : ''}`}
              onClick={() => {
                setSelectedPronunciation(1);
                if (selectedLetter) {
                  pronounceLetter(selectedLetter, 1);
                }
              }}
            >
              🎓 Phonics
            </button>
            <button
              className={`pronunciation-btn ${selectedPronunciation === 2 ? 'active' : ''}`}
              onClick={() => {
                setSelectedPronunciation(2);
                if (selectedLetter) {
                  pronounceLetter(selectedLetter, 2);
                }
              }}
            >
              🎵 Musical
            </button>
          </div>
          {selectedLetter && (
            <div className="current-pronunciation-info">
              <p>Letter <strong className="current-letter">{selectedLetter}</strong> - <strong>{letterPronunciations[selectedLetter]?.[selectedPronunciation]?.name}</strong></p>
              <p className="pronunciation-example">
                Says: <em>"{letterPronunciations[selectedLetter]?.[selectedPronunciation]?.sound}"</em> 
                like <strong>{letterPronunciations[selectedLetter]?.[selectedPronunciation]?.example}</strong>
              </p>
              <button 
                className="replay-pronunciation-btn"
                onClick={() => pronounceLetter(selectedLetter, selectedPronunciation)}
                disabled={playingAudio}
              >
                🔄 Say it Again
              </button>
            </div>
          )}
        </div>
      )}
      
      {!userInteracted && !showTutorial && (
        <div className="audio-info">
          <p>👆 Tap anywhere to enable voice on your device</p>
        </div>
      )}
      
      <div className="alphabet-grid">
        {alphabet.map(letter => (
          <button 
            key={letter}
            className={`letter-btn ${selectedLetter === letter ? 'active' : ''}`}
            onClick={() => handleLetterClick(letter)}
            disabled={playingAudio || showTutorial}
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
                className={`item-btn ${playingAudio ? 'disabled' : ''}`}
                onClick={() => handleItemClick(item)}
                disabled={playingAudio}
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
          <p>🎤 Speaking... 🗣️</p>
          <div className="audio-wave"></div>
          <button 
            className="stop-audio-btn"
            onClick={() => {
              if (window.speechSynthesis) {
                try {
                  window.speechSynthesis.cancel();
                } catch(e) {}
              }
              setPlayingAudio(false);
            }}
          >
            Stop ⏹️
          </button>
        </div>
      )}
      
      <button 
        onClick={proceed} 
        className="proceed-button"
        disabled={playingAudio || showTutorial}
      >
        Next ➡️
      </button>
      
      <style jsx>{`
        .fallback-speech-message {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          z-index: 10001;
          animation: slideUp 0.3s ease;
          font-size: 16px;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Phase1;