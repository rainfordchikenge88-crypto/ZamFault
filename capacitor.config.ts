import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'zm.co.zamfault.app',
  appName: 'ZamFault',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
