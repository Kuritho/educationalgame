// median.config.js - Place this in your project root (same folder as package.json)
module.exports = {
  appId: 'co.median.android.pwpazjx',
  appName: 'BeeTrail',
  version: '1.0.0',
  
  // Android configuration
  android: {
    permissions: [
      'android.permission.INTERNET',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS'
    ],
    features: {
      'android.hardware.microphone': true
    },
    manifestExtras: `
      <uses-permission android:name="android.permission.RECORD_AUDIO" />
      <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
      <uses-feature android:name="android.hardware.microphone" android:required="false" />
    `
  },
  
  // iOS configuration
  ios: {
    permissions: {
      microphone: 'This app needs microphone access to recognize your voice for gameplay'
    },
    infoPlist: {
      NSMicrophoneUsageDescription: 'This app needs microphone access to recognize your voice commands to guide the bee through the maze.',
      UIBackgroundModes: ['audio']
    }
  },
  
  // Web/Capacitor configuration
  web: {
    permissions: {
      microphone: true
    },
    settings: {
      webviewSettings: {
        setDomStorageEnabled: true,
        setJavaScriptEnabled: true,
        setAllowFileAccess: true,
        setAllowContentAccess: true,
        setAllowUniversalAccessFromFileURLs: true,
        setMediaPlaybackRequiresUserGesture: false
      }
    }
  },
  
  // App settings
  settings: {
    orientation: 'portrait',
    fullscreen: true,
    backgroundColor: '#1a2a3a',
    statusBar: {
      style: 'light',
      hidden: false
    }
  },
  
  // Splash screen settings
  splash: {
    backgroundColor: '#1a2a3a',
    image: 'assets/splash.png',
    fade: true,
    showDuration: 1500
  }
};