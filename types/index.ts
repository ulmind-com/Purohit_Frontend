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
  title: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  location: GeoJSONPoint;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  fcm_device_token: string | null;
  profile_picture: string | null;
  addresses: Address[];
  created_at: string;
  updated_at: string | null;
}

export interface UserUpdatePayload {
  name?: string;
  phone?: string;
  email?: string;
  profile_picture?: string;
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

export interface PurohitResponse {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  expertise: Expertise[];
  location: GeoJSONPoint;
  address_text: string | null;
  service_radius_km: number;
  rating: number;
  price: number;
  is_available: boolean;
  is_online: boolean;
  fcm_device_token: string | null;
  created_at: string;
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

export interface BookingResponse {
  _id: string;
  purohit_id: string;
  ceremony_type: string;
  booking_date: string;
  location: string;
  notes: string | null;
  user_id: string;
  status: BookingStatus;
  total_amount: number;
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
  purohit_id?: string;
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
}

export interface BookingAcceptedEvent {
  booking_id: string;
  purohit_id: string;
}
