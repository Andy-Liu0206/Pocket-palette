import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { FilterSection, type ListFilters } from '../components/FilterSection';
import { RestaurantCard } from '../components/RestaurantCard';
import { Screen } from '../components/Screen';
import { useRestaurants } from '../context/RestaurantContext';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { calculateDistanceKm, formatDistanceKm } from '../utils/distance';
import { sortByCreatedAtDesc } from '../utils/restaurantSearch';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const defaultFilters: ListFilters = {
  city: '',
  district: '',
  tags: [],
  rating: '',
  status: '',
};

export function ListScreen() {
  const navigation = useNavigation<Navigation>();
  const { restaurants } = useRestaurants();
  const [filters, setFilters] = useState<ListFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function getLocation() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) return;
      const location = await Location.getCurrentPositionAsync({});
      if (!cancelled) {
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    }

    getLocation().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRestaurants = useMemo(() => {
    return sortByCreatedAtDesc(restaurants).filter((restaurant) => {
      if (filters.city && restaurant.city !== filters.city) return false;
      if (filters.district && restaurant.district !== filters.district) return false;
      if (filters.status && restaurant.status !== filters.status) return false;
      if (filters.rating && Math.round(restaurant.rating ?? 0) !== Number(filters.rating)) return false;
      if (filters.tags.length && !filters.tags.every((tag) => restaurant.tags.includes(tag))) return false;
      return true;
    });
  }, [filters, restaurants]);

  const nearbyRestaurants = useMemo(() => {
    if (!currentLocation) return sortByCreatedAtDesc(restaurants);

    return restaurants
      .map((restaurant) => {
        if (!restaurant.latitude || !restaurant.longitude) return { restaurant, distance: Number.POSITIVE_INFINITY };
        return {
          restaurant,
          distance: calculateDistanceKm(currentLocation, {
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }),
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .map(({ restaurant }) => restaurant);
  }, [currentLocation, restaurants]);

  const visibleRestaurants = filtersOpen ? filteredRestaurants : nearbyRestaurants;

  return (
    <Screen title="口袋清單" subtitle="探索附近口袋名單，或展開篩選快速找店。">
      <Pressable style={styles.exploreButton} onPress={() => setFiltersOpen((value) => !value)}>
        <View>
          <Text style={styles.exploreTitle}>探索口袋名單</Text>
          <Text style={styles.exploreSubtitle}>{filtersOpen ? '收合篩選條件' : '點擊放大鏡展開篩選'}</Text>
        </View>
        <Ionicons name={filtersOpen ? 'close' : 'search'} size={26} color={colors.primary} />
      </Pressable>
      {filtersOpen ? <FilterSection filters={filters} onChange={setFilters} /> : null}
      <View style={styles.header}>
        <Text style={styles.title}>{filtersOpen ? '符合條件' : '附近口袋名單'}</Text>
        <Text style={styles.meta}>{visibleRestaurants.length} 間</Text>
      </View>
      {!visibleRestaurants.length ? <EmptyState title={filtersOpen ? '找不到符合條件的餐廳' : '附近尚未有口袋名單餐廳'} /> : null}
      {visibleRestaurants.map((restaurant) => {
        const distance =
          currentLocation && restaurant.latitude && restaurant.longitude
            ? calculateDistanceKm(currentLocation, { latitude: restaurant.latitude, longitude: restaurant.longitude })
            : undefined;
        return (
          <View key={restaurant.id}>
            <RestaurantCard
              restaurant={restaurant}
              showStatus
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
            />
            {!filtersOpen && distance !== undefined ? <Text style={styles.distanceText}>距離約 {formatDistanceKm(distance)}</Text> : null}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  exploreButton: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exploreTitle: {
    color: colors.onSurface,
    fontSize: 19,
    fontWeight: '900',
  },
  exploreSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: '900',
  },
  meta: {
    color: colors.onSurfaceVariant,
    fontWeight: '700',
  },
  distanceText: {
    color: colors.onSurfaceVariant,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.md,
    fontWeight: '700',
  },
});
