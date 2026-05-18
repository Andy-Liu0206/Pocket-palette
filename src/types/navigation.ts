import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type TabParamList = {
  Home: undefined;
  List: undefined;
  Map: undefined;
  Add: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  RestaurantDetail: { restaurantId: string };
};

export type RestaurantDetailProps = NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>;
