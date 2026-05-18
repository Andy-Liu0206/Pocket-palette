export const googleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_IOS_API_KEY ?? '';

export const hasGoogleMapsRuntimeKey = Boolean(googleMapsApiKey);
