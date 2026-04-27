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
  const [userInteracted, setUserInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [videoUnlocked, setVideoUnlocked] = useState(false);
  
  // Song and pronunciation state
  const [selectedSongSet, setSelectedSongSet] = useState(0);
  const [selectedPronunciation, setSelectedPronunciation] = useState(0);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoError, setVideoError] = useState(false);
  
  const audioRef = useRef(null);
  const interactionAttempted = useRef(false);
  const videoRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const speechUtteranceRef = useRef(null);

  // Video URLs - For mobile, we need to ensure these are HTTPS or local
  const songVideos = {
    song1: {
      name: "Classic ABC Song 🎵",
      videoUrl: "/videos/abc-song.mp4", // Local file - works on mobile
      youtubeUrl: null, // Optional: use "https://www.youtube.com/embed/5XEN4cVY5Xs?playsinline=1"
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
      youtubeUrl: null,
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
      youtubeUrl: null,
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
      { name: "Standard", sound: "A", clearSound: "AY", example: "Apple", slowSound: "Aaaay" },
      { name: "Phonics", sound: "Ah", clearSound: "AH", example: "Ant", slowSound: "Aaaah" },
      { name: "Musical", sound: "A", clearSound: "AY-EE", example: "Amazing", slowSound: "Aaaaaa" }
    ],
    B: [
      { name: "Standard", sound: "Bee", clearSound: "BEE", example: "Ball", slowSound: "Beee" },
      { name: "Phonics", sound: "Buh", clearSound: "BUH", example: "Bear", slowSound: "Buh-buh" },
      { name: "Musical", sound: "B", clearSound: "BEE-OH", example: "Bumblebee", slowSound: "Bbbbee" }
    ],
    C: [
      { name: "Standard", sound: "See", clearSound: "SEE", example: "Cat", slowSound: "Seee" },
      { name: "Phonics", sound: "Kuh", clearSound: "KUH", example: "Car", slowSound: "Kuh-kuh" },
      { name: "Musical", sound: "C", clearSound: "SEE-EE", example: "Circus", slowSound: "Cccsee" }
    ],
    D: [
      { name: "Standard", sound: "Dee", clearSound: "DEE", example: "Dog", slowSound: "Deee" },
      { name: "Phonics", sound: "Duh", clearSound: "DUH", example: "Duck", slowSound: "Duh-duh" },
      { name: "Musical", sound: "D", clearSound: "DEE-OH", example: "Drum", slowSound: "Ddddee" }
    ],
    E: [
      { name: "Standard", sound: "Ee", clearSound: "EE", example: "Elephant", slowSound: "Eeee" },
      { name: "Phonics", sound: "Eh", clearSound: "EH", example: "Egg", slowSound: "Ehh-eh" },
      { name: "Musical", sound: "E", clearSound: "EE-EE", example: "Echo", slowSound: "Eeeeee" }
    ],
    F: [
      { name: "Standard", sound: "Eff", clearSound: "EFF", example: "Fish", slowSound: "Efff" },
      { name: "Phonics", sound: "Fff", clearSound: "FFF", example: "Frog", slowSound: "Fff-fff" },
      { name: "Musical", sound: "F", clearSound: "EFF-OH", example: "Flute", slowSound: "Fffeff" }
    ],
    G: [
      { name: "Standard", sound: "Jee", clearSound: "JEE", example: "Giraffe", slowSound: "Jeee" },
      { name: "Phonics", sound: "Guh", clearSound: "GUH", example: "Grapes", slowSound: "Guh-guh" },
      { name: "Musical", sound: "G", clearSound: "JEE-OH", example: "Guitar", slowSound: "Gggjee" }
    ],
    H: [
      { name: "Standard", sound: "Aych", clearSound: "AYCH", example: "House", slowSound: "Aychh" },
      { name: "Phonics", sound: "Huh", clearSound: "HUH", example: "Heart", slowSound: "Huh-huh" },
      { name: "Musical", sound: "H", clearSound: "AYCH-OH", example: "Harmony", slowSound: "Hhhaych" }
    ],
    I: [
      { name: "Standard", sound: "Eye", clearSound: "EYE", example: "Ice cream", slowSound: "Iii" },
      { name: "Phonics", sound: "Ih", clearSound: "IH", example: "Igloo", slowSound: "Ih-ih" },
      { name: "Musical", sound: "I", clearSound: "EYE-EE", example: "Island", slowSound: "Iiiiii" }
    ],
    J: [
      { name: "Standard", sound: "Jay", clearSound: "JAY", example: "Jellyfish", slowSound: "Jayy" },
      { name: "Phonics", sound: "Juh", clearSound: "JUH", example: "Jaguar", slowSound: "Juh-juh" },
      { name: "Musical", sound: "J", clearSound: "JAY-OH", example: "Jazz", slowSound: "Jjjay" }
    ],
    K: [
      { name: "Standard", sound: "Kay", clearSound: "KAY", example: "Kangaroo", slowSound: "Kayy" },
      { name: "Phonics", sound: "Kuh", clearSound: "KUH", example: "Key", slowSound: "Kuh-kuh" },
      { name: "Musical", sound: "K", clearSound: "KAY-OH", example: "Kite", slowSound: "Kkkay" }
    ],
    L: [
      { name: "Standard", sound: "Ell", clearSound: "ELL", example: "Lion", slowSound: "Elll" },
      { name: "Phonics", sound: "Lll", clearSound: "LLL", example: "Leaf", slowSound: "Lll-lll" },
      { name: "Musical", sound: "L", clearSound: "ELL-OH", example: "Lullaby", slowSound: "Lllell" }
    ],
    M: [
      { name: "Standard", sound: "Emm", clearSound: "EMM", example: "Monkey", slowSound: "Emmm" },
      { name: "Phonics", sound: "Mmm", clearSound: "MMM", example: "Moon", slowSound: "Mmm-mmm" },
      { name: "Musical", sound: "M", clearSound: "EMM-OH", example: "Magic", slowSound: "Mmmemm" }
    ],
    N: [
      { name: "Standard", sound: "Enn", clearSound: "ENN", example: "Nest", slowSound: "Ennn" },
      { name: "Phonics", sound: "Nnn", clearSound: "NNN", example: "Nose", slowSound: "Nnn-nnn" },
      { name: "Musical", sound: "N", clearSound: "ENN-OH", example: "Night", slowSound: "Nnnen" }
    ],
    O: [
      { name: "Standard", sound: "Oh", clearSound: "OH", example: "Orange", slowSound: "Ohhh" },
      { name: "Phonics", sound: "Ah", clearSound: "AH", example: "Octopus", slowSound: "Ahhh" },
      { name: "Musical", sound: "O", clearSound: "OH-OH", example: "Ocean", slowSound: "Ooooh" }
    ],
    P: [
      { name: "Standard", sound: "Pee", clearSound: "PEE", example: "Panda", slowSound: "Peee" },
      { name: "Phonics", sound: "Puh", clearSound: "PUH", example: "Pizza", slowSound: "Puh-puh" },
      { name: "Musical", sound: "P", clearSound: "PEE-OH", example: "Popcorn", slowSound: "Pppee" }
    ],
    Q: [
      { name: "Standard", sound: "Queue", clearSound: "KYOO", example: "Queen", slowSound: "Kyooo" },
      { name: "Phonics", sound: "Kwu", clearSound: "KWUH", example: "Quilt", slowSound: "Kwuh-kwuh" },
      { name: "Musical", sound: "Q", clearSound: "KYOO-OH", example: "Quiet", slowSound: "Qqqyoo" }
    ],
    R: [
      { name: "Standard", sound: "Arr", clearSound: "ARR", example: "Rabbit", slowSound: "Arrr" },
      { name: "Phonics", sound: "Rrr", clearSound: "RRR", example: "Rainbow", slowSound: "Rrr-rrr" },
      { name: "Musical", sound: "R", clearSound: "ARR-OH", example: "Rain", slowSound: "Rrrar" }
    ],
    S: [
      { name: "Standard", sound: "Ess", clearSound: "ESS", example: "Sun", slowSound: "Esss" },
      { name: "Phonics", sound: "Sss", clearSound: "SSS", example: "Snake", slowSound: "Sss-sss" },
      { name: "Musical", sound: "S", clearSound: "ESS-OH", example: "Symphony", slowSound: "Sssess" }
    ],
    T: [
      { name: "Standard", sound: "Tee", clearSound: "TEE", example: "Tree", slowSound: "Teee" },
      { name: "Phonics", sound: "Tuh", clearSound: "TUH", example: "Tiger", slowSound: "Tuh-tuh" },
      { name: "Musical", sound: "T", clearSound: "TEE-OH", example: "Tambourine", slowSound: "Ttttee" }
    ],
    U: [
      { name: "Standard", sound: "You", clearSound: "YOO", example: "Umbrella", slowSound: "Yooo" },
      { name: "Phonics", sound: "Uh", clearSound: "UH", example: "Unicorn", slowSound: "Uhh" },
      { name: "Musical", sound: "U", clearSound: "YOO-OH", example: "Up", slowSound: "Uuuuh" }
    ],
    V: [
      { name: "Standard", sound: "Vee", clearSound: "VEE", example: "Violin", slowSound: "Veee" },
      { name: "Phonics", sound: "Vvv", clearSound: "VVV", example: "Volcano", slowSound: "Vvv-vvv" },
      { name: "Musical", sound: "V", clearSound: "VEE-OH", example: "Vibration", slowSound: "Vvvvee" }
    ],
    W: [
      { name: "Standard", sound: "Double you", clearSound: "DOUBLE-YOO", example: "Whale", slowSound: "Double-yooo" },
      { name: "Phonics", sound: "Wuh", clearSound: "WUH", example: "Watermelon", slowSound: "Wuh-wuh" },
      { name: "Musical", sound: "W", clearSound: "WUH-OH", example: "Wave", slowSound: "Wwwwuh" }
    ],
    X: [
      { name: "Standard", sound: "Ex", clearSound: "EKS", example: "Xylophone", slowSound: "Ekss" },
      { name: "Phonics", sound: "Ks", clearSound: "KS", example: "X-ray", slowSound: "Ks-ks" },
      { name: "Musical", sound: "X", clearSound: "EKS-OH", example: "Xylophone", slowSound: "Xxxeks" }
    ],
    Y: [
      { name: "Standard", sound: "Wye", clearSound: "WYE", example: "Yak", slowSound: "Wyyy" },
      { name: "Phonics", sound: "Yuh", clearSound: "YUH", example: "Yo-yo", slowSound: "Yuh-yuh" },
      { name: "Musical", sound: "Y", clearSound: "WYE-OH", example: "Yodel", slowSound: "Yyywye" }
    ],
    Z: [
      { name: "Standard", sound: "Zee", clearSound: "ZEE", example: "Zebra", slowSound: "Zeee" },
      { name: "Phonics", sound: "Zzz", clearSound: "ZZZ", example: "Zipper", slowSound: "Zzz-zzz" },
      { name: "Musical", sound: "Z", clearSound: "ZEE-OH", example: "Buzz", slowSound: "Zzzzee" }
    ]
  };

  // Detect mobile devices
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(isMobileDevice);
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    
    // Add viewport meta for better mobile rendering
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover');
    }
  }, []);

  // Mobile audio/video unlock handler
  useEffect(() => {
    const unlockMedia = async () => {
      if (!userInteracted && document) {
        // Create a silent audio context to unlock audio on mobile
        if (window.AudioContext || window.webkitAudioContext) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const buffer = audioContext.createBuffer(1, 1, 22050);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0);
          
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          setTimeout(() => {
            audioContext.close();
          }, 100);
        }
        
        setVideoUnlocked(true);
      }
    };

    const handleUserInteraction = () => {
      if (!interactionAttempted.current) {
        setUserInteracted(true);
        interactionAttempted.current = true;
        unlockMedia();
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('touchend', handleUserInteraction);
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('touchend', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('touchend', handleUserInteraction);
    };
  }, [userInteracted]);

  // Speech synthesis with mobile fixes
  const speakClear = (text, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel ongoing speech (important for mobile)
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Mobile-friendly settings
      utterance.rate = options.rate || 0.8;
      utterance.pitch = options.pitch || 1.1;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setPlayingAudio(false);
        resolve();
      };
      
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        setPlayingAudio(false);
        reject(e);
      };
      
      speechUtteranceRef.current = utterance;
      
      // Small delay for mobile devices
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Error speaking:', error);
          setPlayingAudio(false);
          reject(error);
        }
      }, 50);
    });
  };

  // Play video with mobile fixes
  const playVideo = async (songKey, songIndex) => {
    const song = songVideos[songKey];
    if (!song) return;
    
    setVideoError(false);
    
    // For mobile, YouTube videos work better
    if (song.youtubeUrl && isMobile) {
      setVideoUrl(song.youtubeUrl);
    } else if (song.videoUrl) {
      setVideoUrl(song.videoUrl);
    } else {
      setVideoError(true);
      alert("Video not available. Please check if the MP4 file exists in the /public/videos/ folder.");
      return;
    }
    
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
    
    setPlayingAudio(true);
    
    const pronunciation = letterPronunciations[letter]?.[pronunciationIndex];
    if (!pronunciation) {
      setPlayingAudio(false);
      return;
    }
    
    let textToSpeak = "";
    let rate = 0.7;
    
    switch(pronunciationIndex) {
      case 0:
        textToSpeak = `${pronunciation.clearSound}! ${letter} is for ${pronunciation.example}. ${pronunciation.clearSound}!`;
        rate = 0.75;
        break;
      case 1:
        textToSpeak = `${pronunciation.clearSound} ${pronunciation.clearSound}! ${letter} makes the ${pronunciation.sound} sound. Like ${pronunciation.example}!`;
        rate = 0.7;
        break;
      case 2:
        textToSpeak = `${pronunciation.slowSound}~ ${letter}~ ${pronunciation.slowSound}~ ${letter} for ${pronunciation.example}!`;
        rate = 0.65;
        break;
      default:
        textToSpeak = `${letter} for ${pronunciation.example}. ${pronunciation.clearSound}!`;
    }
    
    try {
      await speakClear(textToSpeak, { rate });
    } catch (error) {
      console.error('Error pronouncing letter:', error);
      setPlayingAudio(false);
    }
  };

  const handleLetterClick = (letter) => {
    if (showTutorial || playingAudio) return;
    setSelectedLetter(letter);
    setItems(letterItems[letter] || []);
    pronounceLetter(letter, selectedPronunciation);
  };

  const handleItemClick = async (item) => {
    if (showTutorial || playingAudio || !userInteracted) return;
    
    try {
      await speakClear(item, { rate: 0.75 });
    } catch (error) {
      console.error('Error speaking item:', error);
      setPlayingAudio(false);
    }
  };

  const skipTutorial = () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setShowTutorial(false);
    setPlayingAudio(false);
  };

  return (
    <div className="phase-container">
      {/* Mobile Warning / Instruction */}
      {isMobile && !userInteracted && (
        <div className="mobile-warning">
          <p>👆 Please tap anywhere to enable audio and video on your device</p>
        </div>
      )}

      {/* Video Modal - Mobile Optimized */}
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
                  playsInline // Important for iOS
                  webkit-playsinline="true" // For older iOS
                  className="song-video"
                  onEnded={closeVideoModal}
                  onError={() => {
                    setVideoError(true);
                    alert("Video playback error. Please check the file format and path.");
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {videoError && (
                <div className="video-error">
                  <p>⚠️ Video cannot be played</p>
                  <p>Please check if the MP4 file exists in the /public/videos/ folder</p>
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
                  <p>📱 <strong>Mobile Users:</strong> Tap the screen first to enable audio and video playback</p>
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
              <p>👆 Tap once to enable video playback</p>
            </div>
          )}
          
          <div className="song-info">
            <p>💡 <strong>Tip:</strong> Click any song button to watch fun learning videos!</p>
            {isMobile && (
              <p>📱 Videos will play in fullscreen mode on mobile devices</p>
            )}
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
      
      {!userInteracted && (
        <div className="audio-info">
          <p>👆 Tap anywhere to enable audio and video</p>
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
                disabled={playingAudio || !userInteracted}
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
              if (window.speechSynthesis && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
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
    </div>
  );
};

export default Phase1;