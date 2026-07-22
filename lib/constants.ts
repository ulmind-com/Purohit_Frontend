export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY ?? "";
export const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2";

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

/** Cookie name mirrored alongside localStorage so `middleware.ts` can read auth state at the edge. */
export const AUTH_COOKIE_NAME = "purohit_access_token";
export const ROLE_COOKIE_NAME = "purohit_role";

export const DEFAULT_MAP_CENTER = { lat: 22.5726, lng: 88.3639 }; // Kolkata, as in backend example fixtures

export const CEREMONY_TYPES = [
  "Marriage",
  "Puja",
  "Griha Pravesh",
  "Satyanarayan Katha",
  "Shraddha",
  "Upanayana",
] as const;

export const NEARBY_SEARCH_RADIUS_KM = 20;
