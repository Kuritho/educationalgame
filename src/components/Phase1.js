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
  
  // Song and pronunciation state
  const [selectedSongSet, setSelectedSongSet] = useState(0);
  const [selectedPronunciation, setSelectedPronunciation] = useState(0);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [audioLoadError, setAudioLoadError] = useState(false);
  
  const videoRef = useRef(null);
  const audioElementRef = useRef(null);
  const interactionAttempted = useRef(false);

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
      { name: "Standard", sound: "AY", example: "Apple", fullText: "A says AY. A is for Apple.", audioFile: "/audio/letters/A_standard.mp3" },
      { name: "Phonics", sound: "AH", example: "Ant", fullText: "AH! AH! A makes the AH sound. Like Ant!", audioFile: "/audio/letters/A_phonics.mp3" },
      { name: "Musical", sound: "AY-EE", example: "Amazing", fullText: "AY-EE~ A~ AY-EE~ A is for Amazing~", audioFile: "/audio/letters/A_musical.mp3" }
    ],
    B: [
      { name: "Standard", sound: "BEE", example: "Ball", fullText: "B says BEE. B is for Ball.", audioFile: "/audio/letters/B_standard.mp3" },
      { name: "Phonics", sound: "BUH", example: "Bear", fullText: "BUH! BUH! B makes the BUH sound. Like Bear!", audioFile: "/audio/letters/B_phonics.mp3" },
      { name: "Musical", sound: "BEE-OH", example: "Bumblebee", fullText: "BEE-OH~ B~ BEE-OH~ B is for Bumblebee~", audioFile: "/audio/letters/B_musical.mp3" }
    ],
    // ... add all other letters with their audio file paths
  };

  // Helper function to get audio file path for items
  const getItemAudioPath = (item) => {
    // Sanitize item name for filename (remove spaces, special characters)
    const fileName = item.replace(/\s+/g, '_');
    return `/audio/items/${fileName}.mp3`;
  };

  // Play MP3 audio using HTML5 Audio
  const playMP3 = (audioPath) => {
    return new Promise((resolve, reject) => {
      setPlayingAudio(true);
      setAudioLoadError(false);
      
      // Stop any currently playing audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
      
      // Create new audio element
      const audio = new Audio(audioPath);
      audioElementRef.current = audio;
      
      audio.oncanplaythrough = () => {
        audio.play().catch(error => {
          console.error("Playback failed:", error);
          setAudioLoadError(true);
          setPlayingAudio(false);
          reject(error);
        });
      };
      
      audio.onended = () => {
        setPlayingAudio(false);
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error("Audio loading error:", error);
        setAudioLoadError(true);
        setPlayingAudio(false);
        reject(error);
      };
      
      // If the audio is already loaded, try to play
      if (audio.readyState >= 2) {
        audio.play().catch(error => {
          console.error("Playback failed:", error);
          setAudioLoadError(true);
          setPlayingAudio(false);
          reject(error);
        });
      }
      
      // Load the audio
      audio.load();
    });
  };

  // Play letter pronunciation
  const pronounceLetter = async (letter, pronunciationIndex) => {
    if (playingAudio) return;
    
    const pronunciation = letterPronunciations[letter]?.[pronunciationIndex];
    if (!pronunciation || !pronunciation.audioFile) {
      console.error("No audio file found for:", letter, pronunciationIndex);
      // Fallback to visual feedback
      showFallbackMessage(`No audio file for ${letter}`);
      return;
    }
    
    try {
      await playMP3(pronunciation.audioFile);
    } catch (error) {
      console.error("Failed to play audio:", error);
      showFallbackMessage(`Could not play audio for ${letter}`);
    }
  };

  // Play item name audio
  const handleItemClick = async (item) => {
    if (playingAudio) return;
    
    const audioPath = getItemAudioPath(item);
    try {
      await playMP3(audioPath);
    } catch (error) {
      console.error("Failed to play item audio:", error);
      showFallbackMessage(`Could not play audio for ${item}`);
    }
  };

  // Fallback visual feedback when audio fails
  const showFallbackMessage = (message) => {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'fallback-speech-message';
    fallbackDiv.innerHTML = `🔊 ${message}`;
    document.body.appendChild(fallbackDiv);
    
    setTimeout(() => {
      fallbackDiv.remove();
    }, 2000);
  };

  const handleLetterClick = (letter) => {
    if (showTutorial || playingAudio) return;
    setSelectedLetter(letter);
    setItems(letterItems[letter] || []);
    pronounceLetter(letter, selectedPronunciation);
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
      
      // Preload first audio to enable audio context on iOS
      const silentAudio = new Audio();
      silentAudio.volume = 0;
      silentAudio.play().catch(() => {});
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

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

  return (
    <div className="phase-container" onClick={handleUserInteraction} onTouchStart={handleUserInteraction}>
      {/* Audio load error warning */}
      {audioLoadError && (
        <div className="audio-error">
          <p>⚠️ Some audio files couldn't be loaded. Please check that all MP3 files are in the correct location.</p>
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
          
          <div className="song-info">
            <p>💡 <strong>Tip:</strong> Click any song button to watch fun learning videos!</p>
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
          <p>🎤 Playing... 🗣️</p>
          <div className="audio-wave"></div>
          <button 
            className="stop-audio-btn"
            onClick={() => {
              if (audioElementRef.current) {
                audioElementRef.current.pause();
                audioElementRef.current.currentTime = 0;
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