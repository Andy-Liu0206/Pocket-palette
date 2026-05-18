import type { ExpoConfig } from 'expo/config';

const googleMapsApiKey = process.env.GOOGLE_MAPS_IOS_API_KEY ?? process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const config: ExpoConfig = {
  name: 'Pocket Palette',
  slug: 'pocket-palette',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'pocketpalette',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    config: googleMapsApiKey
      ? {
          googleMapsApiKey,
        }
      : undefined,
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'Pocket Palette 需要位置權限來顯示附近的口袋名單餐廳。',
    },
  },
  extra: {
    googleMapsApiKey,
  },
  android: {
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
  },
  plugins: ['expo-location', 'expo-font'],
};

export default config;
