export type SourcePlatform = 'Instagram' | 'Threads' | 'Reels' | 'Google Maps' | 'Website' | 'Other';

export type ImportAnalyzeRequest = {
  url?: string;
  platform?: SourcePlatform;
  caption?: string;
  locale?: string;
  schema?: unknown;
};

export type ImportAnalyzeResponse = {
  name?: string;
  city?: string;
  district?: string;
  address?: string;
  signatureFood?: string;
  tags?: string[];
  status?: '尚未去過';
  sourceUrl?: string;
  sourcePlatform?: SourcePlatform;
  sourceCaption?: string;
  aiSummary?: string;
  aiExtractedTags?: string[];
  aiDailyMealTags?: string[];
  aiCuisineTags?: string[];
  aiConfidence?: number;
  isImportedFromSocial?: boolean;
  missingFields: string[];
  normalizedUrl: string;
  warnings?: string[];
};
