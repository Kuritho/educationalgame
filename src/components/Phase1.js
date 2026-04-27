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
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  // Song and pronunciation state
  const [selectedSongSet, setSelectedSongSet] = useState(0);
  const [selectedPronunciation, setSelectedPronunciation] = useState(0);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showSongPlayer, setShowSongPlayer] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableChildVoices, setAvailableChildVoices] = useState([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  
  const audioRef = useRef(null);
  const tutorialAudioRef = useRef(null);
  const interactionAttempted = useRef(false);
  const videoRef = useRef(null);
  const currentUtteranceRef = useRef(null);

  // MP4 Video URLs - Place your MP4 files in the public/videos folder
  // Option 1: Using local MP4 files in public folder
  const songVideos = {
    song1: {
      name: "Classic ABC Song 🎵",
      videoUrl: "/videos/abc-song.mp4", // Path to your MP4 file
      thumbnail: "/thumbnails/abc-thumb.jpg", // Optional thumbnail
      lyrics: [
        "A, B, C, D, E, F, G",
        "H, I, J, K, L, M, N, O, P",
        "Q, R, S, T, U, V",
        "W, X, Y, and Z",
        "Now I know my ABC's,",
        "Next time won't you sing with me?"
      ],
      duration: 60
    },
    song2: {
      name: "Phonics Fun Song 🎓",
      videoUrl: "/videos/phonics-song.mp4", // Path to your MP4 file
      thumbnail: "/thumbnails/phonics-thumb.jpg",
      lyrics: [
        "A says ah, A says ah, Every letter makes a sound!",
        "B says buh, B says buh, Let's all sing along!",
        "C says kuh, C says kuh, Learning is so fun!",
        "D says duh, D says duh, We've only just begun!"
      ],
      duration: 45
    },
    song3: {
      name: "Alphabet Adventure 🎪",
      videoUrl: "/videos/alphabet-adventure.mp4", // Path to your MP4 file
      thumbnail: "/thumbnails/adventure-thumb.jpg",
      lyrics: [
        "Come along and sing with me,",
        "Learning letters, A to Z!",
        "Every letter has a sound,",
        "Let's explore and dance around!",
        "A is for Apple, B is for Ball,",
        "Learning letters, standing tall!"
      ],
      duration: 50
    }
  };

  // Alternative: Using YouTube URLs (if you prefer YouTube videos)
  // const songVideos = {
  //   song1: {
  //     name: "Classic ABC Song 🎵",
  //     videoUrl: "https://www.youtube.com/embed/5XEN4cVY5Xs", // YouTube embed URL
  //     isYouTube: true,
  //     lyrics: [...],
  //     duration: 60
  //   },
  //   song2: {
  //     name: "Phonics Fun Song 🎓",
  //     videoUrl: "https://www.youtube.com/embed/BELlZKpi1Zs",
  //     isYouTube: true,
  //     lyrics: [...],
  //     duration: 45
  //   },
  //   song3: {
  //     name: "Alphabet Adventure 🎪",
  //     videoUrl: "https://www.youtube.com/embed/1dkPkL_F8G8",
  //     isYouTube: true,
  //     lyrics: [...],
  //     duration: 50
  //   }
  // };

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

  // Enhanced clear pronunciations for children
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

  // Detect Android and iOS browsers
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(userAgent));
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  // Voice selection for children
  useEffect(() => {
    const loadVoices = () => {
      if (!('speechSynthesis' in window)) {
        setAudioError(true);
        return;
      }
      
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const priorityVoices = [
          'Google UK English Female',
          'Samantha',
          'Karen',
          'Victoria',
          'Microsoft Zira',
          'Google US English',
          'Alex',
          'Daniel'
        ];
        
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));
        const sortedVoices = englishVoices.sort((a, b) => {
          const aIndex = priorityVoices.findIndex(pv => a.name.includes(pv));
          const bIndex = priorityVoices.findIndex(pv => b.name.includes(pv));
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
        
        setAvailableVoices(sortedVoices);
        setAvailableChildVoices(sortedVoices);
        
        if (sortedVoices.length > 0) {
          setSelectedVoice(sortedVoices[0]);
        }
        
        if (voices.length === 0) {
          setAudioError(true);
        }
      } else {
        setTimeout(loadVoices, 500);
      }
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
    const voiceTimer = setTimeout(loadVoices, 2000);
    
    return () => clearTimeout(voiceTimer);
  }, []);

  // Handle user interaction for audio
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!interactionAttempted.current) {
        setUserInteracted(true);
        interactionAttempted.current = true;
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Function to play video
  const playVideo = (songKey, songIndex) => {
    const song = songVideos[songKey];
    if (!song || !song.videoUrl) {
      console.error("No video URL provided");
      return;
    }
    
    setVideoUrl(song.videoUrl);
    setVideoTitle(song.name);
    setShowVideoModal(true);
    setSelectedSongSet(songIndex);
    setIsPlayingSong(true);
    setCurrentSong(song);
  };

  // Close video modal
  const closeVideoModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setShowVideoModal(false);
    setVideoUrl('');
    setIsPlayingSong(false);
  };

  // Speak function for clear pronunciation
  const speakClear = (text, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window) || availableVoices.length === 0) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else if (availableVoices.length > 0) {
        utterance.voice = availableVoices[0];
      }
      
      utterance.rate = options.rate || 0.7;
      utterance.pitch = options.pitch || 1.15;
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
      
      currentUtteranceRef.current = utterance;
      
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

  // Pronounce letter with crystal clarity
  const pronounceLetter = async (letter, pronunciationIndex) => {
    if (playingAudio) return;
    
    setPlayingAudio(true);
    
    const pronunciation = letterPronunciations[letter]?.[pronunciationIndex];
    if (!pronunciation) {
      setPlayingAudio(false);
      return;
    }
    
    let textToSpeak = "";
    let rate = 0.65;
    let pitch = 1.2;
    
    switch(pronunciationIndex) {
      case 0:
        textToSpeak = `The letter ${letter} says ${pronunciation.clearSound}. ${pronunciation.clearSound} is for ${pronunciation.example}. ${letter} for ${pronunciation.example}!`;
        rate = 0.7;
        pitch = 1.15;
        break;
      case 1:
        textToSpeak = `${pronunciation.clearSound}! ${pronunciation.clearSound}! ${pronunciation.clearSound}! The letter ${letter} makes the ${pronunciation.sound} sound. Like in ${pronunciation.example}!`;
        rate = 0.65;
        pitch = 1.25;
        break;
      case 2:
        textToSpeak = `${pronunciation.slowSound}~ ${letter}~ ${pronunciation.slowSound}~ ${letter} is for ${pronunciation.example}~ Let's learn ${letter} together~!`;
        rate = 0.6;
        pitch = 1.3;
        break;
      default:
        textToSpeak = `${letter} is for ${pronunciation.example}. ${letter} says ${pronunciation.clearSound}.`;
    }
    
    try {
      await speakClear(textToSpeak, { rate, pitch });
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
      await speakClear(item, {
        rate: 0.7,
        pitch: 1.15
      });
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
      {/* Video Modal */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>{videoTitle}</h3>
              <button className="close-modal-btn" onClick={closeVideoModal}>✕</button>
            </div>
            <div className="video-container">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                className="song-video"
                onEnded={closeVideoModal}
                onError={(e) => {
                  console.error("Video playback error:", e);
                  alert("Sorry, the video couldn't be played. Please check if the MP4 file exists in the /public/videos/ folder.");
                  closeVideoModal();
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            {currentSong && (
              <div className="video-lyrics">
                <h4>Song Lyrics:</h4>
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
              <p>Let's learn letters with crystal clear sounds and music videos! 📚</p>
              <ol style={{textAlign: 'left', margin: '15px 0', paddingLeft: '20px', fontSize: '16px', lineHeight: '1.6'}}>
                <li>✨ Click any letter to hear it pronounced clearly</li>
                <li>🎬 Click the song buttons to watch fun alphabet music videos!</li>
                <li>🔊 Choose from 3 pronunciation styles (Standard, Phonics, or Musical)</li>
                <li>🎯 Click items to hear their names spoken slowly</li>
                <li>👂 Each sound is optimized for children's learning</li>
              </ol>
              <div className="audio-quality-note">
                <p>🔊 <strong>High-quality voice and video content for maximum engagement</strong></p>
                {selectedVoice && (
                  <p className="voice-info">Using voice: {selectedVoice.name}</p>
                )}
                <p className="voice-info">🎬 Videos will play MP4 files from your local storage</p>
              </div>
            </div>
            <button onClick={skipTutorial} className="skip-tutorial-btn">
              Start Playing! 🚀
            </button>
          </div>
        </div>
      )}
      
      <h2>Exercise: Alphabet Adventure 🎓</h2>
      <p>Click a letter to hear it clearly! 👇</p>
      
      {/* Voice Quality Indicator */}
      {selectedVoice && !showTutorial && (
        <div className="voice-quality-badge">
          🎤 Clear Voice: <span>{selectedVoice.name}</span>
          <button 
            className="change-voice-btn"
            onClick={() => {
              if (availableChildVoices.length > 1) {
                const currentIndex = availableChildVoices.findIndex(v => v.name === selectedVoice.name);
                const nextIndex = (currentIndex + 1) % availableChildVoices.length;
                setSelectedVoice(availableChildVoices[nextIndex]);
                speakClear(`Now using ${availableChildVoices[nextIndex].name} voice`, { rate: 0.8 });
              }
            }}
          >
            Change Voice
          </button>
        </div>
      )}
      
      {/* Video Song Selection Panel */}
      {showSongPlayer && !showTutorial && (
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
          
          {isPlayingSong && (
            <div className="now-playing-banner">
              <p>🎬 Now playing: <strong>{currentSong?.name}</strong> - Watch the video above!</p>
            </div>
          )}
          
          <div className="song-info">
            <p>💡 <strong>Tip:</strong> Click any song button to watch a fun alphabet learning video!</p>
            <p>📁 To add your own videos: Place MP4 files in <code>/public/videos/</code> folder and update the <code>songVideos</code> object.</p>
          </div>
        </div>
      )}
      
      {/* Pronunciation Selection Panel */}
      {!showTutorial && (
        <div className="pronunciation-panel">
          <h3>🔊 Clear Pronunciation Styles 🔊</h3>
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
              📖 Standard (Clear)
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
              🎓 Phonics Sound (Slow)
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
              🎵 Musical Tone (Melodic)
            </button>
          </div>
          {selectedLetter && (
            <div className="current-pronunciation-info">
              <p>Letter <strong className="current-letter">{selectedLetter}</strong> - <strong>{letterPronunciations[selectedLetter]?.[selectedPronunciation]?.name}</strong></p>
              <p className="pronunciation-example">🔊 Saying: <em>"{letterPronunciations[selectedLetter]?.[selectedPronunciation]?.clearSound}"</em> like in <strong>{letterPronunciations[selectedLetter]?.[selectedPronunciation]?.example}</strong></p>
              <button 
                className="replay-pronunciation-btn"
                onClick={() => pronounceLetter(selectedLetter, selectedPronunciation)}
                disabled={playingAudio}
              >
                🔄 Say it Again (Slow & Clear)
              </button>
            </div>
          )}
        </div>
      )}
      
      {!userInteracted && (
        <div className="audio-info">
          <p>👆 Tap anywhere to enable crystal clear audio and videos</p>
        </div>
      )}
      
      <div className="alphabet-grid">
        {alphabet.map(letter => (
          <button 
            key={letter}
            className={`letter-btn ${selectedLetter === letter ? 'active' : ''} ${showTutorial ? 'disabled' : ''}`}
            onClick={() => handleLetterClick(letter)}
            disabled={showTutorial || playingAudio}
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
          <p>🎤 Speaking clearly... 🗣️</p>
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