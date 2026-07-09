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
    bundleIdentifier: 'com.pocketpalette.app',
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
    package: 'com.pocketpalette.app',
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
  },
  plugins: [
    'expo-location',
    'expo-font',
    [
      'expo-share-intent',
      {
        // 讓 Pocket Palette 出現在 IG / Threads 等 App 的「分享」選單，
        // 接收分享過來的網址或純文字（例如 IG Reels 連結）。
        iosActivationRules: {
          NSExtensionActivationSupportsWebURLWithMaxCount: 1,
          NSExtensionActivationSupportsWebPageWithMaxCount: 1,
          NSExtensionActivationSupportsText: true,
        },
        androidIntentFilters: ['text/*'],
      },
    ],
  ],
};

export default config;
