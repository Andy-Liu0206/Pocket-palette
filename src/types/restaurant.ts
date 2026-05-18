export type RestaurantStatus = '尚未去過' | '已去過' | '我的最愛';

export type SourcePlatform = 'Instagram' | 'Threads' | 'Reels' | 'Google Maps' | 'Website' | 'Other';

export type Restaurant = {
  id: string;
  name: string;
  city: string;
  district: string;
  address?: string;
  signatureFood: string;
  tags: string[];
  status: RestaurantStatus;
  rating?: number;
  comment?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  sourceUrl?: string;
  sourcePlatform?: SourcePlatform;
  sourceCaption?: string;
  aiSummary?: string;
  aiExtractedTags?: string[];
  aiDailyMealTags?: string[];
  aiCuisineTags?: string[];
  aiConfidence?: number;
  isImportedFromSocial?: boolean;
};

export type RestaurantDraft = Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>;
