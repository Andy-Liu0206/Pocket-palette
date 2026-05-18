import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useRestaurants } from '../context/RestaurantContext';
import { colors, radius, shadow, spacing } from '../theme';

export function ProfileScreen() {
  const { restaurants, restoreMockData } = useRestaurants();
  const ratedCount = restaurants.filter((restaurant) => restaurant.rating).length;
  const favoriteCount = restaurants.filter((restaurant) => restaurant.status === '我的最愛').length;
  const visitedCount = restaurants.filter((restaurant) => restaurant.status === '已去過').length;
  const notVisitedCount = restaurants.filter((restaurant) => restaurant.status === '尚未去過').length;
  const importedCount = restaurants.filter((restaurant) => restaurant.isImportedFromSocial).length;

  return (
    <Screen title="Profile" subtitle="你的探店統計，讓口袋名單慢慢長成美食地圖。">
      <View style={styles.grid}>
        <StatCard label="已探店家數" value={ratedCount} />
        <StatCard label="收藏總數" value={restaurants.length} />
        <StatCard label="我的最愛" value={favoriteCount} />
        <StatCard label="已去過" value={visitedCount} />
        <StatCard label="尚未去過" value={notVisitedCount} />
        <StatCard label="社群匯入" value={importedCount} />
      </View>
      <Pressable style={styles.resetButton} onPress={restoreMockData}>
        <Text style={styles.resetText}>重置 mock data</Text>
      </Pressable>
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '47%',
    minHeight: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.lg,
    justifyContent: 'space-between',
    ...shadow.card,
  },
  statValue: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    fontWeight: '800',
  },
  resetButton: {
    marginTop: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainer,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  resetText: {
    color: colors.primary,
    fontWeight: '900',
  },
});
