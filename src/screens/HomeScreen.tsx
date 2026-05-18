import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { RestaurantCard } from '../components/RestaurantCard';
import { Screen } from '../components/Screen';
import { TagChip } from '../components/TagChip';
import { useRestaurants } from '../context/RestaurantContext';
import { categoryGroups } from '../data/categories';
import { colors, radius, shadow, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { fuzzyMatchRestaurant, sortByCreatedAtDesc } from '../utils/restaurantSearch';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const { restaurants, isLoading } = useRestaurants();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [nearbyArea, setNearbyArea] = useState<{ city: string; district: string } | null>(null);

  const sortedRestaurants = useMemo(() => sortByCreatedAtDesc(restaurants), [restaurants]);
  const searchResults = useMemo(
    () => sortedRestaurants.filter((restaurant) => fuzzyMatchRestaurant(restaurant, query)),
    [query, sortedRestaurants],
  );
  const popularCategories = useMemo(
    () =>
      categoryGroups
        .filter((group) => group.title === '日常餐食' || group.title === '料理種類')
        .flatMap((group) => group.tags),
    [],
  );
  const suggestions = useMemo(() => {
    const keyword = query.trim();
    if (!searchFocused && !keyword) return [];
    if (!keyword) return popularCategories;
    return popularCategories.filter((tag) => tag.includes(keyword)).slice(0, 10);
  }, [popularCategories, query, searchFocused]);

  const visibleRestaurants = query.trim() ? searchResults : sortedRestaurants.slice(0, 8);
  const nearbyRecommendationTags = useMemo(() => ['咖啡廳', '早午餐', '拉麵', '甜點'], []);

  useEffect(() => {
    let cancelled = false;

    async function detectArea() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) return;

      const position = await Location.getCurrentPositionAsync({});
      const places = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const place = places[0];
      if (!place || cancelled) return;

      setNearbyArea({
        city: place.city || place.region || '附近',
        district: place.district || place.subregion || '',
      });
    }

    detectArea().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const openNearbySearch = (tag: string) => {
    const area = nearbyArea ? `${nearbyArea.city}${nearbyArea.district}` : '附近';
    const queryText = `${area} ${tag} 推薦餐廳`;
    Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(queryText)}`);
  };

  return (
    <Screen title="Pocket Palette" subtitle="收藏想吃的店，快速找到附近口袋名單。">
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.outline} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setSearchFocused(true)}
          placeholder="搜尋類別、城市、區域或招牌食物"
          placeholderTextColor={colors.outline}
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.outline} />
          </Pressable>
        ) : null}
      </View>

      {suggestions.length ? (
        <View style={styles.suggestionBlock}>
          <Text style={styles.suggestionTitle}>熱門類別</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionScroll}>
            {suggestions.map((suggestion) => (
              <TagChip key={suggestion} label={suggestion} selected={query === suggestion} onPress={() => setQuery(suggestion)} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.nearbyBox}>
        <View style={styles.nearbyHeader}>
          <View>
            <Text style={styles.nearbyTitle}>附近推薦美食</Text>
            <Text style={styles.nearbySubtitle}>
              {nearbyArea ? `${nearbyArea.city}${nearbyArea.district}` : '允許定位後，依你所在區域搜尋推薦餐廳'}
            </Text>
          </View>
          <Ionicons name="location-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.nearbyChips}>
          {nearbyRecommendationTags.map((tag) => (
            <TagChip key={tag} label={`${tag} 推薦`} onPress={() => openNearbySearch(tag)} />
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{query.trim() ? 'Search Results' : 'Recently Added'}</Text>
        <Text style={styles.sectionMeta}>{visibleRestaurants.length} 間</Text>
      </View>

      {isLoading ? <Text style={styles.loading}>載入中...</Text> : null}
      {!isLoading && !visibleRestaurants.length ? (
        <EmptyState title="找不到符合條件的餐廳" message="可以到 Add 新增一間口袋名單。" />
      ) : null}
      {visibleRestaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 15,
  },
  suggestionScroll: {
    marginBottom: spacing.md,
  },
  suggestionBlock: {
    marginBottom: spacing.sm,
  },
  suggestionTitle: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  nearbyBox: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  nearbyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  nearbyTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '900',
  },
  nearbySubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  nearbyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: '900',
  },
  sectionMeta: {
    color: colors.onSurfaceVariant,
    fontWeight: '700',
  },
  loading: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
});
