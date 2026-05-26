import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { EmptyState } from '../components/EmptyState';
import { FilterSection, type ListFilters } from '../components/FilterSection';
import { RestaurantCard } from '../components/RestaurantCard';
import { Screen } from '../components/Screen';
import { useRestaurants } from '../context/RestaurantContext';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import type { Restaurant } from '../types/restaurant';
import { calculateDistanceKm, formatDistanceKm } from '../utils/distance';
import { sortByCreatedAtDesc } from '../utils/restaurantSearch';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ResultSortMode = 'status' | 'rating';
type RatingSortDirection = 'desc' | 'asc';

const defaultFilters: ListFilters = {
  city: '',
  districts: [],
  tags: [],
};

const statusSortOrder: Record<string, number> = {
  尚未去過: 0,
  已去過: 1,
  我的最愛: 2,
};

function updatedTime(restaurant: { updatedAt: string; createdAt: string }) {
  return Date.parse(restaurant.updatedAt || restaurant.createdAt);
}

function compareRating(a?: number, b?: number, direction: RatingSortDirection = 'desc') {
  const aHasRating = typeof a === 'number';
  const bHasRating = typeof b === 'number';
  if (aHasRating && !bHasRating) return -1;
  if (!aHasRating && bHasRating) return 1;
  if (!aHasRating && !bHasRating) return 0;

  const diff = (a ?? 0) - (b ?? 0);
  return direction === 'desc' ? -diff : diff;
}

export function ListScreen() {
  const navigation = useNavigation<Navigation>();
  const { restaurants, deleteRestaurant } = useRestaurants();
  const [filters, setFilters] = useState<ListFilters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [resultSortMode, setResultSortMode] = useState<ResultSortMode>('status');
  const [ratingSortDirection, setRatingSortDirection] = useState<RatingSortDirection>('desc');
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
    const matches = restaurants.filter((restaurant) => {
      if (filters.city && restaurant.city !== filters.city) return false;
      if (filters.districts.length && !filters.districts.includes(restaurant.district)) return false;
      if (filters.tags.length && !filters.tags.every((tag) => restaurant.tags.includes(tag))) return false;
      return true;
    });

    return [...matches].sort((a, b) => {
      if (resultSortMode === 'status') {
        const statusDiff = (statusSortOrder[a.status] ?? 99) - (statusSortOrder[b.status] ?? 99);
        if (statusDiff !== 0) return statusDiff;
      } else {
        const ratingDiff = compareRating(a.rating, b.rating, ratingSortDirection);
        if (ratingDiff !== 0) return ratingDiff;
      }
      return updatedTime(b) - updatedTime(a);
    });
  }, [filters, ratingSortDirection, restaurants, resultSortMode]);

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

  const selectRatingSort = () => {
    if (resultSortMode === 'rating') {
      setRatingSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'));
      return;
    }
    setResultSortMode('rating');
    setRatingSortDirection('desc');
  };

  const confirmDeleteRestaurant = (restaurant: Restaurant) => {
    Alert.alert('刪除此口袋名單？', `確定要刪除「${restaurant.name}」嗎？刪除後會同步從 Home、Map 與 Profile 移除。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          deleteRestaurant(restaurant.id).catch(() => {
            Alert.alert('刪除失敗', '目前無法刪除此餐廳，請稍後再試。');
          });
        },
      },
    ]);
  };

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
      {filtersOpen ? (
        <>
          <View style={styles.resultHeader}>
            <View style={styles.resultTitleBlock}>
              <Text style={styles.title}>符合條件</Text>
              <Text style={styles.meta}>{visibleRestaurants.length} 間</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortBar}>
              <Text style={styles.sortLabel}>排序</Text>
              <SortButton
                label="全部狀態"
                selected={resultSortMode === 'status'}
                onPress={() => setResultSortMode('status')}
              />
              <SortButton
                label="星星數"
                selected={resultSortMode === 'rating'}
                direction={resultSortMode === 'rating' ? ratingSortDirection : undefined}
                onPress={selectRatingSort}
              />
            </ScrollView>
          </View>
        </>
      ) : (
        <View style={styles.header}>
          <Text style={styles.title}>附近口袋名單</Text>
          <Text style={styles.meta}>{visibleRestaurants.length} 間</Text>
        </View>
      )}
      {!visibleRestaurants.length ? <EmptyState title={filtersOpen ? '找不到符合條件的餐廳' : '附近尚未有口袋名單餐廳'} /> : null}
      {visibleRestaurants.map((restaurant) => {
        const distance =
          currentLocation && restaurant.latitude && restaurant.longitude
            ? calculateDistanceKm(currentLocation, { latitude: restaurant.latitude, longitude: restaurant.longitude })
            : undefined;
        return (
          <View key={restaurant.id}>
            <Swipeable
              overshootRight={false}
              rightThreshold={42}
              renderRightActions={(progress) => (
                <SwipeDeleteAction progress={progress} onPress={() => confirmDeleteRestaurant(restaurant)} />
              )}
            >
              <RestaurantCard
                restaurant={restaurant}
                showStatus
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
              />
            </Swipeable>
            {!filtersOpen && distance !== undefined ? <Text style={styles.distanceText}>距離約 {formatDistanceKm(distance)}</Text> : null}
          </View>
        );
      })}
    </Screen>
  );
}

function SwipeDeleteAction({ progress, onPress }: { progress: Animated.AnimatedInterpolation<number>; onPress: () => void }) {
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [96, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.deleteActionWrap, { transform: [{ translateX }] }]}>
      <Pressable style={styles.deleteAction} onPress={onPress}>
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteActionText}>刪除</Text>
      </Pressable>
    </Animated.View>
  );
}

function SortButton({
  label,
  selected,
  direction,
  onPress,
}: {
  label: string;
  selected: boolean;
  direction?: RatingSortDirection;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.sortButton} onPress={onPress}>
      <Text style={[styles.sortButtonText, selected && styles.sortButtonTextActive]}>{label}</Text>
      {direction ? (
        <Ionicons name={direction === 'desc' ? 'arrow-down' : 'arrow-up'} size={15} color={colors.primaryContainer} />
      ) : null}
    </Pressable>
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
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  resultTitleBlock: {
    minWidth: 76,
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
  sortBar: {
    alignItems: 'center',
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  sortLabel: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
  },
  sortButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sortButtonText: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
  },
  sortButtonTextActive: {
    color: colors.primaryContainer,
  },
  distanceText: {
    color: colors.onSurfaceVariant,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    marginLeft: spacing.md,
    fontWeight: '700',
  },
  deleteActionWrap: {
    width: 96,
    marginBottom: spacing.md,
  },
  deleteAction: {
    flex: 1,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#d93b30',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteActionText: {
    color: '#fff',
    fontWeight: '900',
  },
});
