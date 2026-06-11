// median.config.js
module.exports = {
  appId: 'com.wordgame.beemaze',
  appName: 'Bee Word Maze',
  version: '1.0.0',
  
  android: {
    permissions: [
      'android.permission.INTERNET',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS'
    ],
    features: {
      'android.hardware.microphone': true
    }
  },
  
  ios: {
    permissions: {
      microphone: 'This app needs microphone access to recognize your voice commands to guide the bee through the maze.'
    }
  },
  
  settings: {
    orientation: 'portrait',
    fullscreen: true,
    backgroundColor: '#1a2a3a'
  }
};