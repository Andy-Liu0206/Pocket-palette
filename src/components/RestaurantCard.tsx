import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';
import type { Restaurant } from '../types/restaurant';
import { getCuisineIcon } from '../utils/cuisineIcons';
import { RatingStars } from './RatingStars';
import { TagChip } from './TagChip';

type RestaurantCardProps = {
  restaurant: Restaurant;
  onPress: () => void;
  showStatus?: boolean;
};

const statusColors = {
  尚未去過: colors.surfaceVariant,
  已去過: '#dff4e8',
  我的最愛: '#ffe1e8',
};

export function RestaurantCard({ restaurant, onPress, showStatus = false }: RestaurantCardProps) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Ionicons name={getCuisineIcon(restaurant)} size={24} color={colors.primary} />
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {restaurant.city} / {restaurant.district}
            {restaurant.signatureFood ? ` / ${restaurant.signatureFood}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.ratingRow}>
        <RatingStars rating={restaurant.rating} size={16} />
        {showStatus ? (
          <View style={[styles.statusPill, { backgroundColor: statusColors[restaurant.status] }]}>
            <Text style={styles.statusText}>{restaurant.status}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tags}>
        {restaurant.tags.slice(0, 4).map((tag) => (
          <TagChip key={tag} label={tag} />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: {
    flex: 1,
  },
  name: {
    color: colors.onSurface,
    fontSize: 19,
    fontWeight: '800',
  },
  meta: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
    fontSize: 13,
  },
  ratingRow: {
    marginTop: spacing.md,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusText: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: '800',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
});
