import { Ionicons } from '@expo/vector-icons';
import { Alert, ImageBackground, Linking, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RatingStars } from '../components/RatingStars';
import { TagChip } from '../components/TagChip';
import { useRestaurants } from '../context/RestaurantContext';
import { colors, radius, shadow, spacing } from '../theme';
import type { Restaurant, RestaurantStatus } from '../types/restaurant';
import type { RestaurantDetailProps } from '../types/navigation';
import { getGoogleMapsUrl, openRestaurantInGoogleMaps } from '../utils/googleMaps';

const statuses: RestaurantStatus[] = ['尚未去過', '已去過', '我的最愛'];

const heroImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
];

export function RestaurantDetailScreen({ route, navigation }: RestaurantDetailProps) {
  const { restaurants, updateRestaurant, deleteRestaurant } = useRestaurants();
  const insets = useSafeAreaInsets();
  const restaurant = restaurants.find((item) => item.id === route.params.restaurantId);

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={styles.title}>找不到這間餐廳</Text>
      </SafeAreaView>
    );
  }

  const heroImage = heroImages[Math.abs(hashString(restaurant.id)) % heroImages.length];

  const updateStatus = async (status: RestaurantStatus) => {
    await updateRestaurant(restaurant.id, { status });
  };

  const updateRating = async (rating?: number) => {
    await updateRestaurant(restaurant.id, { rating });
  };

  const saveComment = async (comment: string) => {
    await updateRestaurant(restaurant.id, { comment });
    Alert.alert('已更新', '評論已同步到你的口袋名單。');
  };

  const shareRestaurant = async () => {
    await Share.share({
      message: `${restaurant.name}\n${restaurant.city}${restaurant.district}\n${getGoogleMapsUrl(restaurant)}`,
    });
  };

  const confirmDeleteRestaurant = () => {
    Alert.alert('刪除此口袋名單？', `確定要刪除「${restaurant.name}」嗎？此動作會同步移除所有頁面中的餐廳資料。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRestaurant(restaurant.id);
            navigation.goBack();
          } catch {
            Alert.alert('刪除失敗', '目前無法刪除此餐廳，請稍後再試。');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 128 + insets.bottom }]}>
        <ImageBackground source={{ uri: heroImage }} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <SafeAreaView style={styles.heroControls}>
            <RoundIconButton icon="arrow-back" onPress={navigation.goBack} />
            <RoundIconButton icon="share-social-outline" onPress={shareRestaurant} />
          </SafeAreaView>
        </ImageBackground>

        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <View style={styles.nameBlock}>
              <Text style={styles.title} numberOfLines={2}>{restaurant.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={18} color={colors.outline} />
                <Text style={styles.locationText}>{restaurant.city}{restaurant.district ? ` ${restaurant.district}` : ''}</Text>
              </View>
            </View>
            {restaurant.rating ? <SolidStarCount rating={restaurant.rating} /> : null}
          </View>

          <View style={styles.tags}>
            {restaurant.tags.slice(0, 4).map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </View>

          <View style={styles.statusTabs}>
            {statuses.map((status) => {
              const active = restaurant.status === status;
              return (
                <Pressable key={status} style={[styles.statusButton, active && styles.statusButtonActive]} onPress={() => updateStatus(status)}>
                  <Ionicons
                    name={status === '我的最愛' ? (active ? 'heart' : 'heart-outline') : active ? 'checkmark-circle' : 'add'}
                    size={18}
                    color={active ? colors.onPrimaryContainer : colors.primary}
                  />
                  <Text style={[styles.statusButtonText, active && styles.statusButtonTextActive]}>{statusShortLabel(status)}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider} />

          {restaurant.signatureFood ? (
            <>
              <SectionTitle title="招牌推薦" />
              <View style={styles.recommendationPill}>
                <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
                <Text style={styles.recommendationText} numberOfLines={1}>{restaurant.signatureFood}</Text>
              </View>
            </>
          ) : null}

          <SectionTitle title="店家資訊" />
          <View style={styles.infoCard}>
            <InfoItem icon="map-outline" title={`${restaurant.city} ${restaurant.district}`} subtitle={restaurant.address || '尚未填寫詳細地址'} />
            <InfoItem icon="calendar-outline" title={formatDate(restaurant.createdAt)} subtitle="加入 Pocket Palette 的日期" />
            {restaurant.signatureFood ? <InfoItem icon="restaurant-outline" title={restaurant.signatureFood} subtitle="招牌食物" /> : null}
          </View>

          <SectionTitle title="我的紀錄" />
          <View style={styles.noteCard}>
            <Text style={styles.label}>評分</Text>
            <RatingStars rating={restaurant.rating} onChange={updateRating} size={30} />
            <Text style={styles.label}>評論</Text>
            <TextInput
              defaultValue={restaurant.comment ?? ''}
              placeholder="寫下這間店值得回訪的理由..."
              placeholderTextColor={colors.outline}
              multiline
              style={styles.commentInput}
              onSubmitEditing={(event) => saveComment(event.nativeEvent.text)}
              onEndEditing={(event) => {
                if ((event.nativeEvent.text ?? '') !== (restaurant.comment ?? '')) {
                  saveComment(event.nativeEvent.text);
                }
              }}
            />
          </View>

          {restaurant.sourceUrl || restaurant.isImportedFromSocial ? <SourceInfo restaurant={restaurant} /> : null}

          <Pressable style={styles.deleteButton} onPress={confirmDeleteRestaurant}>
            <Ionicons name="trash-outline" size={20} color="#b3261e" />
            <Text style={styles.deleteButtonText}>刪除此口袋名單</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.mapButton} onPress={() => openRestaurantInGoogleMaps(restaurant)}>
          <Ionicons name="navigate-outline" size={22} color={colors.onPrimary} />
          <Text style={styles.mapButtonText}>開啟 Google Maps 導航</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RoundIconButton({ icon, onPress }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable style={styles.roundButton} onPress={onPress}>
      <Ionicons name={icon} size={28} color={colors.onSurface} />
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function SolidStarCount({ rating }: { rating: number }) {
  return (
    <View style={styles.solidStars}>
      {Array.from({ length: Math.round(rating) }).map((_, index) => (
        <Ionicons key={index} name="star" size={18} color={colors.primaryContainer} />
      ))}
    </View>
  );
}

function InfoItem({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function SourceInfo({ restaurant }: { restaurant: Restaurant }) {
  return (
    <>
      <SectionTitle title="來源資訊" />
      <View style={styles.sourceCard}>
        <Text style={styles.sourcePlatform}>{restaurant.sourcePlatform ?? 'Other'}</Text>
        {restaurant.sourceUrl ? <Text style={styles.sourceUrl} numberOfLines={2}>{restaurant.sourceUrl}</Text> : null}
        {restaurant.aiSummary ? <Text style={styles.sourceSummary}>{restaurant.aiSummary}</Text> : null}
        {restaurant.aiExtractedTags?.length ? (
          <View style={styles.tags}>
            {restaurant.aiExtractedTags.map((tag) => (
              <TagChip key={tag} label={tag} />
            ))}
          </View>
        ) : null}
        {restaurant.sourceUrl ? (
          <Pressable style={styles.sourceButton} onPress={() => Linking.openURL(restaurant.sourceUrl!)}>
            <Text style={styles.sourceButtonText}>查看原始貼文</Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

function statusShortLabel(status: RestaurantStatus) {
  if (status === '尚未去過') return '尚未去過';
  if (status === '已去過') return '已去過';
  return '我的';
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未知';
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function hashString(value: string) {
  return value.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf2ed',
  },
  scrollContent: {
    backgroundColor: '#fbf2ed',
  },
  hero: {
    height: 360,
    justifyContent: 'flex-start',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.26)',
  },
  heroControls: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fffaf6',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  sheet: {
    marginTop: -28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff8f3',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  nameBlock: {
    flex: 1,
  },
  title: {
    color: colors.onSurface,
    fontSize: 30,
    fontWeight: '900',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  locationText: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
  },
  solidStars: {
    flexDirection: 'row',
    gap: 1,
    paddingTop: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  statusTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statusButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e7cbb8',
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#fff8f3',
  },
  statusButtonActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  statusButtonText: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
  },
  statusButtonTextActive: {
    color: colors.onPrimaryContainer,
  },
  divider: {
    height: 1,
    backgroundColor: '#ead7ca',
    marginVertical: spacing.xl,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: '900',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  recommendationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  recommendationText: {
    color: colors.onSurface,
    fontWeight: '900',
    maxWidth: 260,
  },
  infoCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  infoItem: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff0df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    color: colors.onSurface,
    fontSize: 17,
    fontWeight: '900',
  },
  infoSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 6,
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  label: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  commentInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.onSurface,
    textAlignVertical: 'top',
  },
  deleteButton: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#f0b7b2',
    backgroundColor: '#fff5f4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  deleteButtonText: {
    color: '#b3261e',
    fontWeight: '900',
    fontSize: 16,
  },
  sourceCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  sourcePlatform: {
    color: colors.primary,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  sourceUrl: {
    color: colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  sourceSummary: {
    color: colors.onSurface,
    lineHeight: 22,
  },
  sourceButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: spacing.md,
  },
  sourceButtonText: {
    color: colors.primary,
    fontWeight: '900',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#ead7ca',
    backgroundColor: '#fff8f3',
  },
  mapButton: {
    minHeight: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  mapButtonText: {
    color: colors.onPrimary,
    fontWeight: '900',
    fontSize: 17,
  },
});
