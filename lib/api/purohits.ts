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
  address_text?: string;
  price?: number;
  is_available?: boolean;
  is_online?: boolean;
  service_zones?: any[];
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

export async function setOnlineStatus(is_online: boolean) {
  return updateMyPurohitProfile({ is_online });
}

export interface PayoutSetupPayload {
  payout_method: "UPI" | "BANK";
  upi_id?: string;
  bank_account_number?: string;
  ifsc_code?: string;
}

export async function setupPayout(payload: PayoutSetupPayload) {
  const { data } = await api.post("/purohits/payout-setup", payload);
  return data;
}

export async function getPurohitById(purohitId: string) {
  const { data } = await api.get<PurohitResponse>(`/purohits/${purohitId}`);
  return data;
}
