import React, { useState, useEffect } from 'react';

const MicrophonePermission = ({ children, onPermissionGranted, onPermissionDenied }) => {
  const [permission, setPermission] = useState('prompt');
  const [showPrompt, setShowPrompt] = useState(true);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermission('granted');
      setShowPrompt(false);
      if (onPermissionGranted) onPermissionGranted();
      return true;
    } catch (error) {
      setPermission('denied');
      if (onPermissionDenied) onPermissionDenied();
      return false;
    }
  };

  if (permission === 'granted') {
    return children;
  }

  return (
    <div className="permission-container">
      <div className="permission-card">
        <h2>🎤 Microphone Required</h2>
        <p>This game needs microphone access to recognize your voice commands.</p>
        <button onClick={requestPermission} className="permission-button">
          Allow Microphone Access
        </button>
        <p className="permission-note">
          Your voice is processed locally and never stored.
        </p>
      </div>
    </div>
  );
};

export default MicrophonePermission;