import { GOOGLE_MAPS_API_KEY } from "@/lib/constants";

/**
 * `@react-google-maps/api`'s `useJsApiLoader` backs onto a single global
 * loader instance keyed by `id`. Every call across the whole app — no
 * matter which page/component — MUST pass byte-identical options, or it
 * throws "Loader must not be called again with different options" the
 * moment a second component mounts with a different `libraries` array.
 * Import this one constant everywhere instead of inlining the options.
 */
import type { Libraries } from "@react-google-maps/api";

const LIBRARIES: Libraries = ["places"];

export const GOOGLE_MAPS_LOADER_OPTIONS = {
  id: "purohit-booking-google-maps",
  googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  libraries: LIBRARIES,
};
