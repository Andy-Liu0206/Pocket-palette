import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { Restaurant } from '../types/restaurant';

export type CuisineIconName = ComponentProps<typeof Ionicons>['name'];

const cuisineIconMap: Record<string, CuisineIconName> = {
  台式: 'fast-food-outline',
  日式: 'fish-outline',
  燒肉: 'flame-outline',
  韓式: 'restaurant-outline',
  拉麵: 'egg-outline',
  火鍋: 'bonfire-outline',
  牛排: 'restaurant-outline',
  素食: 'leaf-outline',
  港式: 'basket-outline',
  健康餐: 'fitness-outline',
  泰式: 'flower-outline',
  義式: 'pizza-outline',
  咖啡廳: 'cafe-outline',
  甜點: 'ice-cream-outline',
  飲料: 'beer-outline',
  小吃: 'storefront-outline',
};

const cuisinePriority = [
  '台式',
  '日式',
  '燒肉',
  '韓式',
  '拉麵',
  '火鍋',
  '牛排',
  '素食',
  '港式',
  '健康餐',
  '泰式',
  '義式',
  '咖啡廳',
  '甜點',
  '飲料',
  '小吃',
];

export function getCuisineIcon(restaurant: Pick<Restaurant, 'tags'>): CuisineIconName {
  const tag = cuisinePriority.find((item) => restaurant.tags.includes(item));
  return tag ? cuisineIconMap[tag] : 'restaurant-outline';
}
