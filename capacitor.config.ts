import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.clipped',
  appName: 'clipped',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000',
      WKWebViewOnly: 'true',
      GOOGLE_MAPS_ANDROID_API_KEY: 'AIzaSyAuEOgKmk4Xr1YYqwriKqdtDqd7QJTnd8k',
      GOOGLE_MAPS_IOS_API_KEY: 'AIzaSyAupMpZlmScttUOFbQdZ7KWLXG5p7twtsg',
      WEB_APPLICATION_CLIENT_ID: '607609406851-5bqhbo8gtciujiqlgl7rmgrin1uf04l9.apps.googleusercontent.com'
    }
  }
};

export default config;
