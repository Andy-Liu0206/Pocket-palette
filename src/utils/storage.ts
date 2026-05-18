import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockRestaurants } from '../data/mockRestaurants';
import { getAreaCoordinate, taiwanAreas } from '../data/taiwanAreas';
import type { Restaurant, RestaurantStatus } from '../types/restaurant';
import { extractCoordinateFromUrl } from './locationResolver';

const STORAGE_KEY = 'pocket_palette_restaurants_v1';
const validStatuses: RestaurantStatus[] = ['尚未去過', '已去過', '我的最愛'];

function normalizeStatus(status: unknown): RestaurantStatus {
  if (validStatuses.includes(status as RestaurantStatus)) return status as RestaurantStatus;
  const text = String(status);
  if (text.includes('最愛')) return '我的最愛';
  if (text.includes('已去')) return '已去過';
  return '尚未去過';
}

function normalizeRestaurant(restaurant: Restaurant): Restaurant {
  const mockReplacement = mockRestaurants.find((item) => item.id === restaurant.id);
  if (mockReplacement) return mockReplacement;

  const city = taiwanAreas[restaurant.city] ? restaurant.city : '台北市';
  const district = taiwanAreas[city]?.includes(restaurant.district) ? restaurant.district : taiwanAreas[city][0];
  const areaCoordinate = getAreaCoordinate(city, district);
  const sourceCoordinate = extractCoordinateFromUrl(restaurant.sourceUrl);

  return {
    ...restaurant,
    city,
    district,
    status: normalizeStatus(restaurant.status),
    tags: Array.isArray(restaurant.tags) ? restaurant.tags : [],
    signatureFood: restaurant.signatureFood ?? '',
    latitude: sourceCoordinate?.latitude ?? restaurant.latitude ?? areaCoordinate?.latitude,
    longitude: sourceCoordinate?.longitude ?? restaurant.longitude ?? areaCoordinate?.longitude,
    createdAt: restaurant.createdAt ?? new Date().toISOString(),
    updatedAt: restaurant.updatedAt ?? restaurant.createdAt ?? new Date().toISOString(),
  };
}

export async function loadRestaurants(): Promise<Restaurant[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await saveRestaurants(mockRestaurants);
    return mockRestaurants;
  }

  try {
    const parsed = JSON.parse(raw) as Restaurant[];
    if (!Array.isArray(parsed)) return mockRestaurants;
    const migrated = parsed.map(normalizeRestaurant);
    await saveRestaurants(migrated);
    return migrated;
  } catch {
    return mockRestaurants;
  }
}

export async function saveRestaurants(restaurants: Restaurant[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
}

export async function resetRestaurants() {
  await saveRestaurants(mockRestaurants);
  return mockRestaurants;
}
