import { Linking } from 'react-native';
import type { Restaurant } from '../types/restaurant';
import type { Coordinate } from './locationResolver';

export function getGoogleMapsUrl(restaurant: Restaurant, coordinate?: Coordinate) {
  const query =
    [restaurant.name, restaurant.address, restaurant.city, restaurant.district].filter(Boolean).join(' ') ||
    (coordinate ? `${coordinate.latitude},${coordinate.longitude}` : '');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export async function openRestaurantInGoogleMaps(restaurant: Restaurant, coordinate?: Coordinate) {
  await Linking.openURL(getGoogleMapsUrl(restaurant, coordinate));
}
