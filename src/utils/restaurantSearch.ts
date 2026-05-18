import type { Restaurant } from '../types/restaurant';

export function fuzzyMatchRestaurant(restaurant: Restaurant, query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return true;

  const haystack = [
    restaurant.name,
    restaurant.signatureFood,
    restaurant.city,
    restaurant.district,
    restaurant.status,
    restaurant.comment ?? '',
    ...restaurant.tags,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(keyword);
}

export function sortByCreatedAtDesc(restaurants: Restaurant[]) {
  return [...restaurants].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
