import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabParamList = {
  Home: undefined;
  List: undefined;
  Map: undefined;
  // sharedText：從外部 App（IG / Threads…）分享進來的連結或文字。
  // sharedAt：時間戳記，讓每次分享都能重新觸發匯入，即使內容相同。
  Add: { sharedText?: string; sharedAt?: number } | undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  RestaurantDetail: { restaurantId: string };
};

export type RestaurantDetailProps = NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>;
