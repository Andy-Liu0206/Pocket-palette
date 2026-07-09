import 'react-native-gesture-handler';

import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useShareIntent } from 'expo-share-intent';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RestaurantProvider } from './src/context/RestaurantContext';
import { AddScreen } from './src/screens/AddScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ListScreen } from './src/screens/ListScreen';
import { MapScreen } from './src/screens/MapScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RestaurantDetailScreen } from './src/screens/RestaurantDetailScreen';
import { colors } from './src/theme';
import type { RootStackParamList, TabParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navigationRef = createNavigationContainerRef<RootStackParamList>();

// 監聽從其他 App（IG / Threads…）分享進來的內容，帶著連結跳到 Add 分頁。
function ShareIntentBridge() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (!hasShareIntent) return;
    const sharedText = shareIntent.webUrl ?? shareIntent.text ?? '';
    if (!sharedText.trim()) return;

    let cancelled = false;
    const routeToAdd = () => {
      if (cancelled) return;
      if (navigationRef.isReady()) {
        navigationRef.navigate('MainTabs', {
          screen: 'Add',
          params: { sharedText, sharedAt: Date.now() },
        });
        resetShareIntent();
      } else {
        // NavigationContainer 尚未掛載完成時稍後再試一次。
        setTimeout(routeToAdd, 250);
      }
    };
    routeToAdd();

    return () => {
      cancelled = true;
    };
  }, [hasShareIntent, shareIntent, resetShareIntent]);

  return null;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceContainer,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, focused, size }) => {
          const iconMap: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: focused ? 'home' : 'home-outline',
            List: focused ? 'list' : 'list-outline',
            Map: focused ? 'map' : 'map-outline',
            Add: focused ? 'add-circle' : 'add-circle-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="List" component={ListScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RestaurantProvider>
        <NavigationContainer ref={navigationRef}>
          <ShareIntentBridge />
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: colors.surface },
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="RestaurantDetail"
              component={RestaurantDetailScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </RestaurantProvider>
    </GestureHandlerRootView>
  );
}
