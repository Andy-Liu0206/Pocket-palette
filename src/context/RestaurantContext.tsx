import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAreaCoordinate } from '../data/taiwanAreas';
import type { Restaurant, RestaurantDraft } from '../types/restaurant';
import { loadRestaurants, resetRestaurants, saveRestaurants } from '../utils/storage';

type RestaurantContextValue = {
  restaurants: Restaurant[];
  isLoading: boolean;
  addRestaurant: (draft: RestaurantDraft) => Promise<Restaurant>;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => Promise<void>;
  restoreMockData: () => Promise<void>;
};

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

function createRestaurantFromDraft(draft: RestaurantDraft): Restaurant {
  const now = new Date().toISOString();
  const coordinate = getAreaCoordinate(draft.city, draft.district);

  return {
    ...draft,
    id: `restaurant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    latitude: draft.latitude ?? coordinate?.latitude,
    longitude: draft.longitude ?? coordinate?.longitude,
    createdAt: now,
    updatedAt: now,
  };
}

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRestaurants()
      .then(setRestaurants)
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (nextRestaurants: Restaurant[]) => {
    setRestaurants(nextRestaurants);
    await saveRestaurants(nextRestaurants);
  }, []);

  const addRestaurant = useCallback(
    async (draft: RestaurantDraft) => {
      const restaurant = createRestaurantFromDraft(draft);
      await persist([restaurant, ...restaurants]);
      return restaurant;
    },
    [persist, restaurants],
  );

  const updateRestaurant = useCallback(
    async (id: string, updates: Partial<Restaurant>) => {
      const now = new Date().toISOString();
      const nextRestaurants = restaurants.map((restaurant) =>
        restaurant.id === id ? { ...restaurant, ...updates, updatedAt: now } : restaurant,
      );
      await persist(nextRestaurants);
    },
    [persist, restaurants],
  );

  const restoreMockData = useCallback(async () => {
    const restored = await resetRestaurants();
    setRestaurants(restored);
  }, []);

  const value = useMemo(
    () => ({ restaurants, isLoading, addRestaurant, updateRestaurant, restoreMockData }),
    [addRestaurant, isLoading, restaurants, restoreMockData, updateRestaurant],
  );

  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>;
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurants must be used within RestaurantProvider');
  }
  return context;
}
