// median.config.js - Place this in your project root folder
module.exports = {
  appId: 'com.wordgame.beemaze',
  appName: 'Bee Word Maze',
  version: '1.0.0',
  
  android: {
    // CRITICAL: These permissions must be declared
    permissions: [
      'android.permission.INTERNET',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS'
    ],
    features: {
      'android.hardware.microphone': true
    },
    // This is the most important part - adds microphone to manifest
    manifestExtras: `
      <!-- Microphone permissions -->
      <uses-permission android:name="android.permission.RECORD_AUDIO" />
      <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
      <uses-feature android:name="android.hardware.microphone" android:required="false" />
      
      <!-- For better compatibility -->
      <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
      <uses-permission android:name="android.permission.VIBRATE" />
    `
  },
  
  ios: {
    permissions: {
      microphone: 'This app needs microphone access to recognize your voice commands to guide the bee through the maze.'
    },
    infoPlist: {
      NSMicrophoneUsageDescription: 'This app needs microphone access to recognize your voice commands to guide the bee through the maze.'
    }
  },
  
  settings: {
    orientation: 'portrait',
    fullscreen: true,
    backgroundColor: '#1a2a3a'
  }
};