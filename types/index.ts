/**
 * Types mirror the FastAPI/Pydantic models 1:1 so the frontend never drifts
 * from the wire contract. See `Purohit_Backend/app/models/*.py`.
 */

export type Role = "user" | "purohit";

/** GeoJSON Point — coordinates are always [longitude, latitude]. */
export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface Address {
  address_id: string;
  tag: string;
  flat: string | null;
  area: string;
  city: string;
  pincode: string;
  is_default: boolean;
  location: GeoJSONPoint;
}

export interface FamilyMember {
  member_id: string;
  name: string;
  relation: string;
  gotra: string | null;
  rashi: string | null;
}

export interface CurrentDasha {
  dasha_name: string;
  end_date: string;
  recommended_puja_name: string;
  updated_at: string;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  fcm_device_token: string | null;
  profile_picture: string | null;
  gotra: string | null;
  rashi: string | null;
  dob: string | null;
  birth_time: string | null;
  birth_place: { lat: number; lng: number; address: string } | null;
  family_members: FamilyMember[];
  saved_addresses: Address[];
  current_dasha: CurrentDasha | null;
  created_at: string;
  updated_at: string | null;
}

export interface UserUpdatePayload {
  name?: string;
  phone?: string;
  email?: string;
  profile_picture?: string;
  gotra?: string | null;
  rashi?: string | null;
  dob?: string | null;
  birth_time?: string | null;
  birth_place?: { lat: number; lng: number; address: string } | null;
  family_members?: FamilyMember[] | null;
  saved_addresses?: Address[] | null;
}

export const EXPERTISE_OPTIONS = [
  "Marriage",
  "Puja",
  "Griha Pravesh",
  "Satyanarayan Katha",
  "Shraddha",
  "Upanayana",
] as const;

export type Expertise = (typeof EXPERTISE_OPTIONS)[number];

export const SUPPORTED_LANGUAGES = [
  "Bengali",
  "Hindi",
  "Sanskrit",
  "English",
  "Telugu",
  "Tamil",
  "Marathi",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const PUJA_TRADITIONS = [
  "Bengali",
  "North Indian",
  "South Indian",
  "Arya Samaj",
  "Vedic",
] as const;

export type PujaTradition = (typeof PUJA_TRADITIONS)[number];

export interface PurohitResponse {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  expertise: Expertise[];
  languages?: SupportedLanguage[];
  tradition?: PujaTradition;
  service_zones: any[];
  address_text: string | null;
  rating: number;
  price: number;
  is_available: boolean;
  is_online: boolean;
  fcm_device_token: string | null;
  created_at: string;
}

export interface PurohitUpdatePayload {
  name?: string;
  mobile_number?: string;
  expertise?: Expertise[];
  languages?: SupportedLanguage[];
  tradition?: PujaTradition;
  service_zones?: any[];
  address_text?: string;
  price?: number;
  is_available?: boolean;
  is_online?: boolean;
}

export interface NearbyPurohitResponse extends PurohitResponse {
  distance_in_km: number;
}

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  // Uber-flow broadcast statuses (app/db/booking_crud.py)
  | "SEARCHING"
  | "ACCEPTED"
  | "COMPLETION_PENDING";

export interface SankalpDetails {
  yajman_name: string;
  gotra: string;
  purpose: string;
  nakshatra?: string;
}

export interface EPujaTokenResponse {
  token: string;
  room_name: string;
  livekit_url?: string;
  role: Role;
  sankalp_details?: SankalpDetails;
}

export interface BookingResponse {
  _id: string;
  purohit_id?: string;
  ceremony_type: string;
  location: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  notes: string | null;
  budget?: number;
  user_id: string;
  status: BookingStatus;
  total_amount?: number;
  completion_otp?: string;
  is_e_puja?: boolean;
  sankalp_details?: SankalpDetails;
  preferred_language?: SupportedLanguage | null;
  preferred_tradition?: PujaTradition | null;
  created_at: string;
  updated_at: string;
}

/** Doc shape returned by POST /bookings/request and /bookings/{id}/accept (raw Mongo doc, not BookingResponse). */
export interface BroadcastBookingDoc {
  _id: string;
  user_id: string;
  ceremony_type: string;
  location: GeoJSONPoint;
  budget: number;
  status: "SEARCHING" | "ACCEPTED";
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  purohit_id?: string;
  is_e_puja?: boolean;
  sankalp_details?: SankalpDetails;
  preferred_language?: SupportedLanguage | null;
  preferred_tradition?: PujaTradition | null;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  distance_in_km?: number;
}


export interface BookingHistoryResponse {
  booking_id: string;
  purohit_name: string;
  puja_category: string;
  status: string;
  timestamp: string;
}

export interface ETAResponse {
  distance_text: string;
  duration_text: string;
  eta_minutes: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: Role;
}

export interface ApiErrorBody {
  detail: string | { msg: string; loc: (string | number)[] }[];
}

/** Realtime Pusher event payloads */
export interface NewBookingRequestEvent {
  booking_id: string;
  ceremony_type: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
}

export interface BookingAcceptedEvent {
  booking_id: string;
  purohit_id: string;
}

/** Emitted on every PATCH /purohits/me location update while the Purohit has an active booking. */
export interface PurohitLocationUpdateEvent {
  booking_id: string;
  lat: number;
  lng: number;
}

/** Smart Muhurat Engine response */
export interface AuspiciousDatesResponse {
  geo_key: string;
  month: number;
  year: number;
  purpose: string;
  auspicious_dates: string[];
}

export interface ShubhTimeSlot {
  time: string;
  is_auspicious: boolean;
  muhurat_name: string | null;
  category: string | null;
}

export interface DayShubhMuhuratResponse {
  date: string;
  auspicious_count: number;
  slots: ShubhTimeSlot[];
  auspicious_summary: string[];
}

export interface AstrologyMetadata {
  rashis: string[];
  gotras: string[];
  nakshatras: string[];
}

