import { api } from "@/lib/api/axios";
import type {
  BookingResponse,
  BookingStatus,
  BroadcastBookingDoc,
  ETAResponse,
  GeoJSONPoint,
} from "@/types";

export interface DirectBookingPayload {
  purohit_id: string;
  ceremony_type: string;
  booking_date: string; // ISO datetime
  location: string;
  notes?: string;
}

export async function createDirectBooking(payload: DirectBookingPayload) {
  const { data } = await api.post<BookingResponse>("/bookings/", payload);
  return data;
}

export async function getMyBookings(limit = 100) {
  const { data } = await api.get<BookingResponse[]>("/bookings/me", {
    params: { limit },
  });
  return data;
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus
) {
  const { data } = await api.patch<BookingResponse>(
    `/bookings/${bookingId}/status`,
    null,
    { params: { new_status: newStatus } }
  );
  return data;
}

// --- Uber-like broadcast flow ---

export interface UberBookingRequestPayload {
  ceremony_type: string;
  location: GeoJSONPoint;
  budget: number;
}

export async function requestBooking(payload: UberBookingRequestPayload) {
  const { data } = await api.post<BroadcastBookingDoc>(
    "/bookings/request",
    payload
  );
  return data;
}

export async function getNearbyRequests(
  lat: number,
  lng: number,
  radius_km = 200
) {
  const { data } = await api.get<BroadcastBookingDoc[]>(
    "/bookings/nearby-requests",
    { params: { lat, lng, radius_km } }
  );
  return data;
}

export async function acceptBooking(bookingId: string) {
  const { data } = await api.post<BroadcastBookingDoc>(
    `/bookings/${bookingId}/accept`
  );
  return data;
}

export async function getBookingEta(
  bookingId: string,
  purohitLat: number,
  purohitLng: number
) {
  const { data } = await api.get<ETAResponse>(`/bookings/${bookingId}/eta`, {
    params: { purohit_lat: purohitLat, purohit_lng: purohitLng },
  });
  return data;
}
