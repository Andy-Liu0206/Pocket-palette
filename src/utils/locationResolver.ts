import { googleMapsApiKey } from '../config/googleMaps';
import type { Restaurant } from '../types/restaurant';
import { calculateDistanceKm } from './distance';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type ResolvedRestaurantLocation = {
  coordinate: Coordinate;
  source: 'google-url' | 'google-places' | 'stored';
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  openNow?: boolean;
  placeName?: string;
  placeAddress?: string;
  placeId?: string;
};

type GooglePlaceTextSearchResult = {
  business_status?: ResolvedRestaurantLocation['businessStatus'];
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
  };
  name?: string;
  opening_hours?: {
    open_now?: boolean;
  };
  place_id?: string;
  rating?: number;
};

const TAIWAN_BOUNDS = {
  minLatitude: 21.8,
  maxLatitude: 26.5,
  minLongitude: 118,
  maxLongitude: 123,
};

function isTaiwanCoordinate(coordinate: Coordinate) {
  return (
    coordinate.latitude >= TAIWAN_BOUNDS.minLatitude &&
    coordinate.latitude <= TAIWAN_BOUNDS.maxLatitude &&
    coordinate.longitude >= TAIWAN_BOUNDS.minLongitude &&
    coordinate.longitude <= TAIWAN_BOUNDS.maxLongitude
  );
}

export function hasCoordinate(restaurant: Restaurant): restaurant is Restaurant & { latitude: number; longitude: number } {
  return typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number';
}

export function extractCoordinateFromUrl(sourceUrl?: string): Coordinate | undefined {
  if (!sourceUrl) return undefined;

  const decoded = decodeURIComponent(sourceUrl);
  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (match?.[1] && match?.[2]) {
      const coordinate = {
        latitude: Number(match[1]),
        longitude: Number(match[2]),
      };
      if (Number.isFinite(coordinate.latitude) && Number.isFinite(coordinate.longitude) && isTaiwanCoordinate(coordinate)) {
        return coordinate;
      }
    }
  }

  return undefined;
}

function getStoredCoordinate(restaurant: Restaurant): Coordinate | undefined {
  if (!hasCoordinate(restaurant)) return undefined;
  return {
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
  };
}

function normalizeText(value?: string) {
  return (value ?? '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\p{Script=Han}a-z0-9]/gu, '');
}

function buildPlacesQuery(restaurant: Restaurant) {
  const parts = [restaurant.name, restaurant.address, restaurant.city, restaurant.district, '台灣'];
  return parts.filter(Boolean).join(' ');
}

function toCoordinate(result: GooglePlaceTextSearchResult): Coordinate | undefined {
  const location = result.geometry?.location;
  if (!location) return undefined;
  const coordinate = {
    latitude: location.lat,
    longitude: location.lng,
  };
  return isTaiwanCoordinate(coordinate) ? coordinate : undefined;
}

function scorePlaceResult(restaurant: Restaurant, result: GooglePlaceTextSearchResult, fallback?: Coordinate) {
  const coordinate = toCoordinate(result);
  if (!coordinate) return Number.NEGATIVE_INFINITY;

  let score = 0;
  const normalizedRestaurantName = normalizeText(restaurant.name);
  const normalizedPlaceName = normalizeText(result.name);
  const normalizedAddress = normalizeText(result.formatted_address);

  if (normalizedPlaceName === normalizedRestaurantName) score += 80;
  if (normalizedPlaceName.includes(normalizedRestaurantName) || normalizedRestaurantName.includes(normalizedPlaceName)) score += 45;
  if (restaurant.city && normalizedAddress.includes(normalizeText(restaurant.city))) score += 18;
  if (restaurant.district && normalizedAddress.includes(normalizeText(restaurant.district))) score += 18;
  if (restaurant.address && normalizedAddress.includes(normalizeText(restaurant.address).slice(0, 8))) score += 20;
  if (result.business_status === 'OPERATIONAL') score += 8;

  if (fallback) {
    const distanceFromFallback = calculateDistanceKm(fallback, coordinate);
    if (distanceFromFallback > 40) return Number.NEGATIVE_INFINITY;
    score += Math.max(0, 30 - distanceFromFallback);
  }

  return score;
}

async function resolveWithGooglePlaces(restaurant: Restaurant): Promise<ResolvedRestaurantLocation | undefined> {
  if (!googleMapsApiKey) return undefined;

  const fallback = getStoredCoordinate(restaurant);
  const params = new URLSearchParams({
    query: buildPlacesQuery(restaurant),
    key: googleMapsApiKey,
    language: 'zh-TW',
    region: 'tw',
  });

  if (fallback) {
    params.set('location', `${fallback.latitude},${fallback.longitude}`);
    params.set('radius', '50000');
  }

  const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`);
  const payload = (await response.json()) as {
    status: string;
    error_message?: string;
    results?: GooglePlaceTextSearchResult[];
  };

  if (!response.ok || (payload.status !== 'OK' && payload.status !== 'ZERO_RESULTS')) {
    throw new Error(payload.error_message || `Google Places failed: ${payload.status}`);
  }

  const best = (payload.results ?? [])
    .map((result) => ({
      result,
      score: scorePlaceResult(restaurant, result, fallback),
      coordinate: toCoordinate(result),
    }))
    .filter((item): item is { result: GooglePlaceTextSearchResult; score: number; coordinate: Coordinate } => Boolean(item.coordinate))
    .sort((a, b) => b.score - a.score)[0];

  if (!best || best.score === Number.NEGATIVE_INFINITY) return undefined;

  return {
    coordinate: best.coordinate,
    source: 'google-places',
    businessStatus: best.result.business_status,
    openNow: best.result.opening_hours?.open_now,
    placeName: best.result.name,
    placeAddress: best.result.formatted_address,
    placeId: best.result.place_id,
  };
}

export async function resolveRestaurantLocation(restaurant: Restaurant): Promise<ResolvedRestaurantLocation | undefined> {
  const googleCoordinate = extractCoordinateFromUrl(restaurant.sourceUrl);
  if (googleCoordinate) {
    return { coordinate: googleCoordinate, source: 'google-url' };
  }

  try {
    const googlePlace = await resolveWithGooglePlaces(restaurant);
    if (googlePlace) return googlePlace;
  } catch {
    // Keep the app usable if the key is missing, restricted, over quota, or temporarily unavailable.
  }

  const fallback = getStoredCoordinate(restaurant);
  return fallback ? { coordinate: fallback, source: 'stored' } : undefined;
}
