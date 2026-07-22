import { api } from "@/lib/api/axios";
import type {
  Address,
  BookingHistoryResponse,
  UserResponse,
  UserUpdatePayload,
} from "@/types";

/**
 * There is no dedicated `GET /users/me`. `PATCH /users/me` accepts an
 * all-optional body (`UserUpdate`, `exclude_unset=True` server-side), so an
 * empty patch is a safe no-op round trip that returns the full current
 * `UserResponse` — this is how we hydrate the profile right after login.
 */
export async function fetchMyProfile() {
  const { data } = await api.patch<UserResponse>("/users/me", {});
  return data;
}

export async function updateMyProfile(payload: UserUpdatePayload) {
  const { data } = await api.patch<UserResponse>("/users/me", payload);
  return data;
}

export async function addAddress(address: Omit<Address, "address_id">) {
  const { data } = await api.post<Address>("/users/me/addresses", address);
  return data;
}

export async function removeAddress(addressId: string) {
  await api.delete(`/users/me/addresses/${addressId}`);
}

export async function getMyBookingHistory(skip = 0, limit = 20) {
  const { data } = await api.get<BookingHistoryResponse[]>(
    "/users/me/bookings",
    { params: { skip, limit } }
  );
  return data;
}
