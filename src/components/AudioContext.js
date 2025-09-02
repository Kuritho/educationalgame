// AudioContext.js
import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

const AudioContext = createContext();

export const useAudio = () => {
  return useContext(AudioContext);
};

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/sounds/bgm.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    // Attempt to play automatically
    const attemptPlay = () => {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.log("Auto-play was prevented:", error);
          document.addEventListener('click', handleFirstInteraction);
        });
    };

    const handleFirstInteraction = () => {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Audio play failed even after interaction:", error);
        });
      document.removeEventListener('click', handleFirstInteraction);
    };

    attemptPlay();

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const value = {
    isPlaying
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};