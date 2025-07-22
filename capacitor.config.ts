import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memorychallenge.app',
  appName: 'Memory Color Challenge',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
