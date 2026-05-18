import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hasGoogleMapsRuntimeKey } from '../config/googleMaps';
import { useRestaurants } from '../context/RestaurantContext';
import { colors, radius, shadow, spacing } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import type { Restaurant } from '../types/restaurant';
import { calculateDistanceKm, formatDistanceKm } from '../utils/distance';
import { openRestaurantInGoogleMaps } from '../utils/googleMaps';
import { resolveRestaurantLocation, type Coordinate, type ResolvedRestaurantLocation } from '../utils/locationResolver';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type DisplayRestaurant = {
  restaurant: Restaurant;
  coordinate: Coordinate;
  distanceKm: number;
  resolvedLocation: ResolvedRestaurantLocation;
};

const radiusOptions = [1, 3, 5, 10];

const defaultRegion: Region = {
  latitude: 25.0478,
  longitude: 121.5319,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function getRegionForRadius(center: Coordinate, radiusKm: number): Region {
  const latitudeDelta = Math.max(0.018, (radiusKm / 111) * 2.4);
  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta,
    longitudeDelta: latitudeDelta,
  };
}

function getBusinessStatusLabel(location: ResolvedRestaurantLocation) {
  if (location.businessStatus === 'CLOSED_PERMANENTLY') return '永久停業';
  if (location.businessStatus === 'CLOSED_TEMPORARILY') return '暫停營業';
  if (location.openNow === true) return '營業中';
  if (location.openNow === false) return '目前未營業';
  if (location.businessStatus === 'OPERATIONAL') return '正常營業';
  return '營業資訊未提供';
}

function getLocationSourceLabel(source: ResolvedRestaurantLocation['source']) {
  if (source === 'google-url') return '來源連結座標';
  if (source === 'google-places') return 'Google Places 精準定位';
  return '使用已儲存座標';
}

export function MapScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { restaurants } = useRestaurants();
  const mapRef = useRef<MapView | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(true);
  const [isResolvingPins, setIsResolvingPins] = useState(false);
  const [radiusKm, setRadiusKm] = useState(3);
  const [displayRestaurants, setDisplayRestaurants] = useState<DisplayRestaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setIsRequestingLocation(true);
    setPermissionDenied(false);

    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      setPermissionDenied(true);
      setIsRequestingLocation(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setCurrentLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setIsRequestingLocation(false);
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    let cancelled = false;

    async function resolvePins() {
      if (!currentLocation) return;

      setIsResolvingPins(true);
      const resolved = await Promise.all(
        restaurants.map(async (restaurant) => {
          const resolvedLocation = await resolveRestaurantLocation(restaurant);
          if (!resolvedLocation) return undefined;

          const distanceKm = calculateDistanceKm(currentLocation, resolvedLocation.coordinate);
          return {
            restaurant,
            coordinate: resolvedLocation.coordinate,
            distanceKm,
            resolvedLocation,
          };
        }),
      );

      if (!cancelled) {
        setDisplayRestaurants(
          (resolved.filter(Boolean) as DisplayRestaurant[]).sort((a, b) => a.distanceKm - b.distanceKm),
        );
        setIsResolvingPins(false);
      }
    }

    resolvePins();
    return () => {
      cancelled = true;
    };
  }, [currentLocation, restaurants]);

  const visibleRestaurants = useMemo(
    () => displayRestaurants.filter((item) => item.distanceKm <= radiusKm),
    [displayRestaurants, radiusKm],
  );

  const selectedRestaurant = useMemo(
    () => visibleRestaurants.find((item) => item.restaurant.id === selectedRestaurantId) ?? null,
    [selectedRestaurantId, visibleRestaurants],
  );

  const mapRegion = useMemo(
    () => (currentLocation ? getRegionForRadius(currentLocation, radiusKm) : defaultRegion),
    [currentLocation, radiusKm],
  );

  const moveToCurrentLocation = useCallback(() => {
    if (!currentLocation) return;
    mapRef.current?.animateToRegion(getRegionForRadius(currentLocation, radiusKm), 450);
  }, [currentLocation, radiusKm]);

  const changeRadius = (nextRadiusKm: number) => {
    setRadiusKm(nextRadiusKm);
    setSelectedRestaurantId(null);
    if (currentLocation) {
      mapRef.current?.animateToRegion(getRegionForRadius(currentLocation, nextRadiusKm), 450);
    }
  };

  if (permissionDenied) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>需要位置權限</Text>
        <Text style={styles.permissionText}>需要開啟位置權限，才能顯示附近的口袋名單餐廳。</Text>
        <Pressable style={styles.primaryButton} onPress={requestLocation}>
          <Text style={styles.primaryButtonText}>重新請求定位權限</Text>
        </Pressable>
      </View>
    );
  }

  if (isRequestingLocation && !currentLocation) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.permissionText}>正在取得你的位置...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => setSelectedRestaurantId(null)}
      >
        {visibleRestaurants.map(({ restaurant, coordinate }) => (
          <Marker
            key={restaurant.id}
            coordinate={coordinate}
            pinColor={colors.mapPin}
            title={restaurant.name}
            onPress={(event) => {
              event.stopPropagation();
              setSelectedRestaurantId(restaurant.id);
            }}
          />
        ))}
      </MapView>

      <View style={[styles.topCard, { top: Math.max(insets.top + 8, 52) }]}>
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.mapTitle}>Map</Text>
            <Text style={styles.mapSubtitle}>
              {radiusKm} km 內 {visibleRestaurants.length} 間收藏餐廳
              {isResolvingPins ? '，定位中...' : ''}
            </Text>
          </View>
          <Ionicons name="location-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.radiusRow}>
          {radiusOptions.map((option) => (
            <Pressable
              key={option}
              style={[styles.radiusButton, radiusKm === option && styles.radiusButtonActive]}
              onPress={() => changeRadius(option)}
            >
              <Text style={[styles.radiusText, radiusKm === option && styles.radiusTextActive]}>{option} km</Text>
            </Pressable>
          ))}
        </View>
        {!hasGoogleMapsRuntimeKey ? (
          <Text style={styles.keyWarning}>尚未設定 runtime Google Maps API Key，目前使用已儲存座標。</Text>
        ) : null}
      </View>

      <Pressable
        style={[styles.currentLocationButton, { bottom: selectedRestaurant ? 244 + insets.bottom : 34 + insets.bottom }]}
        onPress={moveToCurrentLocation}
      >
        <Ionicons name="locate" size={24} color={colors.primary} />
      </Pressable>

      {selectedRestaurant ? (
        <View style={[styles.restaurantSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleBlock}>
              <Text style={styles.restaurantName} numberOfLines={1}>{selectedRestaurant.restaurant.name}</Text>
              <Text style={styles.restaurantMeta} numberOfLines={1}>
                {selectedRestaurant.restaurant.tags.slice(0, 3).join('、')}
              </Text>
            </View>
            <Pressable onPress={() => setSelectedRestaurantId(null)} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <View style={styles.infoRow}>
            {selectedRestaurant.restaurant.rating ? (
              <Text style={styles.infoPill}>★ {selectedRestaurant.restaurant.rating}</Text>
            ) : null}
            <Text style={styles.infoPill}>{formatDistanceKm(selectedRestaurant.distanceKm)}</Text>
            <Text style={styles.infoPill}>{getBusinessStatusLabel(selectedRestaurant.resolvedLocation)}</Text>
          </View>
          <Text style={styles.sourceText}>
            {getLocationSourceLabel(selectedRestaurant.resolvedLocation.source)}
            {selectedRestaurant.resolvedLocation.placeName ? `：${selectedRestaurant.resolvedLocation.placeName}` : ''}
          </Text>

          <View style={styles.actionRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: selectedRestaurant.restaurant.id })}
            >
              <Text style={styles.secondaryButtonText}>查看詳情</Text>
            </Pressable>
            <Pressable
              style={styles.navigateButton}
              onPress={() => openRestaurantInGoogleMaps(selectedRestaurant.restaurant, selectedRestaurant.coordinate)}
            >
              <Ionicons name="navigate-outline" size={18} color={colors.onPrimary} />
              <Text style={styles.navigateButtonText}>Google Maps</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topCard: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    ...shadow.card,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  mapTitle: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: '900',
  },
  mapSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  keyWarning: {
    color: '#ba1a1a',
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  radiusButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.pill,
    alignItems: 'center',
    paddingVertical: 9,
    backgroundColor: colors.surface,
  },
  radiusButtonActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: colors.primaryContainer,
  },
  radiusText: {
    color: colors.onSurfaceVariant,
    fontWeight: '900',
    fontSize: 12,
  },
  radiusTextActive: {
    color: colors.onPrimaryContainer,
  },
  currentLocationButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  restaurantSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    ...shadow.card,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sheetTitleBlock: {
    flex: 1,
  },
  restaurantName: {
    color: colors.onSurface,
    fontSize: 21,
    fontWeight: '900',
  },
  restaurantMeta: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  infoPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainer,
    color: colors.onSurfaceVariant,
    fontWeight: '900',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  sourceText: {
    color: colors.outline,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '900',
  },
  navigateButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  navigateButtonText: {
    color: colors.onPrimary,
    fontWeight: '900',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  permissionTitle: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: spacing.md,
  },
  permissionText: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    borderRadius: radius.pill,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontWeight: '900',
  },
});
