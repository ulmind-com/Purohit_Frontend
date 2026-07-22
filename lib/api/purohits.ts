import { api } from "@/lib/api/axios";
import type { GeoJSONPoint, NearbyPurohitResponse, PurohitResponse } from "@/types";

export interface NearbyPurohitParams {
  lat: number;
  lng: number;
  radius_km?: number;
  expertise?: string;
}

export async function getNearbyPurohits(params: NearbyPurohitParams) {
  const { data } = await api.get<NearbyPurohitResponse[]>("/purohits/nearby", {
    params,
  });
  return data;
}

export async function listPurohits(limit = 100) {
  const { data } = await api.get<PurohitResponse[]>("/purohits/", {
    params: { limit },
  });
  return data;
}

/** Requires the `GET /purohits/me` addition documented in the project README. */
export async function fetchMyPurohitProfile() {
  const { data } = await api.get<PurohitResponse>("/purohits/me");
  return data;
}

export interface UpdatePurohitProfilePayload {
  name?: string;
  mobile_number?: string;
  expertise?: string[];
  location?: GeoJSONPoint;
  address_text?: string;
  service_radius_km?: number;
  price?: number;
  is_available?: boolean;
}

/** Requires the `PATCH /purohits/me` addition documented in the project README. */
export async function updateMyPurohitProfile(
  payload: UpdatePurohitProfilePayload
) {
  const { data } = await api.patch<PurohitResponse>("/purohits/me", payload);
  return data;
}

export async function setAvailability(is_available: boolean) {
  return updateMyPurohitProfile({ is_available });
}

/**
 * There is no `GET /purohits/{id}` endpoint, so once a Yajman's booking is
 * accepted (the Pusher `booking_accepted` event only carries `purohit_id`),
 * we resolve the display details by scanning the public purohit list. Fine
 * at this dataset size; swap for a dedicated `GET /purohits/{id}` if the
 * Purohit collection grows large enough for this to matter.
 */
export async function getPurohitById(purohitId: string) {
  const all = await listPurohits(500);
  return all.find((p) => p._id === purohitId) ?? null;
}
