import { StyleSheet } from 'react-native';

export const colors = {
  surface: '#fff8f4',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#fff1e7',
  surfaceContainer: '#fcebdd',
  surfaceContainerHigh: '#f6e5d7',
  surfaceVariant: '#f0e0d2',
  onSurface: '#221a12',
  onSurfaceVariant: '#544434',
  outline: '#877462',
  outlineVariant: '#dac2ae',
  primary: '#895100',
  primaryContainer: '#ff9f1c',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#683c00',
  success: '#1c7c54',
  favorite: '#d1495b',
  mapPin: '#d62828',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export const shadow = StyleSheet.create({
  card: {
    shadowColor: '#221a12',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
