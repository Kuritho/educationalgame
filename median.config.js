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
    },
    manifestExtras: `
      <uses-permission android:name="android.permission.RECORD_AUDIO" />
      <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
      <uses-feature android:name="android.hardware.microphone" android:required="false" />
      
      <!-- For better touch response -->
      <uses-permission android:name="android.permission.VIBRATE" />
      <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    `,
    // Improve touch sensitivity
    webviewSettings: {
      setDomStorageEnabled: true,
      setJavaScriptEnabled: true,
      setAllowFileAccess: true,
      setAllowContentAccess: true,
      setAllowUniversalAccessFromFileURLs: true,
      setMediaPlaybackRequiresUserGesture: false,
      setUseWideViewPort: true,
      setLoadWithOverviewMode: true
    }
  },
  
  ios: {
    permissions: {
      microphone: 'This app needs microphone access to recognize your voice to guide the bee through the maze.'
    },
    infoPlist: {
      NSMicrophoneUsageDescription: 'This app needs microphone access to recognize your voice commands to guide the bee through the maze.',
      UIViewControllerBasedStatusBarAppearance: false,
      UIStatusBarHidden: false
    }
  },
  
  web: {
    permissions: {
      microphone: true
    }
  },
  
  settings: {
    orientation: 'portrait',
    fullscreen: true,
    backgroundColor: '#1a2a3a',
    // Improve touch sensitivity
    touchEvents: {
      enabled: true,
      zoom: false,
      scroll: true
    },
    statusBar: {
      style: 'light',
      hidden: false
    },
    // Disable pull-to-refresh to prevent interference
    pullToRefresh: false
  }
};