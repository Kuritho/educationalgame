// components/MicrophonePermission.js
import React, { useState, useEffect } from 'react';

const MicrophonePermission = ({ children, onPermissionGranted, onPermissionDenied }) => {
  const [permission, setPermission] = useState('prompt');
  const [showPrompt, setShowPrompt] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermission = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    
    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported');
        setPermission('denied');
        if (onPermissionDenied) onPermissionDenied();
        setIsRequesting(false);
        return false;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      setPermission('granted');
      setShowPrompt(false);
      if (onPermissionGranted) onPermissionGranted();
      setIsRequesting(false);
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setPermission('denied');
      if (onPermissionDenied) onPermissionDenied();
      setIsRequesting(false);
      return false;
    }
  };

  // Auto-request permission on mount (with user interaction simulation)
  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // For mobile apps, we need user interaction first
      // So we don't auto-request, we just show the button
      console.log('Permission component ready');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (permission === 'granted') {
    return <>{children}</>;
  }

  return (
    <div className="permission-overlay">
      <div className="permission-modal">
        <div className="permission-icon">🎤</div>
        <h2>Microphone Required</h2>
        <p>This game needs microphone access to recognize your voice commands and guide the bee through the maze.</p>
        <button 
          onClick={requestPermission} 
          className="permission-allow-btn"
          disabled={isRequesting}
        >
          {isRequesting ? 'Requesting...' : 'Allow Microphone Access'}
        </button>
        <p className="permission-privacy">
          🔒 Your voice is processed locally and never stored or sent to any server.
        </p>
      </div>
    </div>
  );
};

export default MicrophonePermission;