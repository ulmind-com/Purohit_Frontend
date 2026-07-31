import { api } from "@/lib/api/axios";
import type { LoginResponse, PurohitResponse, Role, UserResponse, FirebaseSyncResponse, FirebaseOnboardPayload } from "@/types";

export interface SignupUserPayload {
  name: string;
  email: string;
  mobile_number: string;
  password: string;
  firebase_uid?: string;
}

export interface SignupPurohitPayload {
  name: string;
  email: string;
  mobile_number: string;
  password: string;
  expertise: string[];
  location: { type: "Point"; coordinates: [number, number] };
  address_text?: string;
  service_radius_km: number;
  price: number;
  firebase_uid?: string;
}

/**
 * FastAPI's OAuth2PasswordRequestForm expects `application/x-www-form-urlencoded`
 * with `username` / `password` fields — NOT JSON — so this one call intentionally
 * bypasses the default JSON content-type used everywhere else.
 */
export async function login(email: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const { data } = await api.post<LoginResponse>("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function signupUser(payload: SignupUserPayload) {
  const { data } = await api.post<UserResponse>("/auth/signup/user", payload);
  return data;
}

export async function signupPurohit(payload: SignupPurohitPayload) {
  const { data } = await api.post<PurohitResponse>(
    "/auth/signup/purohit",
    payload
  );
  return data;
}

export async function logout() {
  const { data } = await api.post<{ message: string }>("/auth/logout");
  return data;
}

export async function firebaseSync(idToken: string) {
  const { data } = await api.post<FirebaseSyncResponse>("/auth/firebase-sync", {
    id_token: idToken,
  });
  return data;
}

export async function firebaseOnboard(payload: FirebaseOnboardPayload) {
  const { data } = await api.post<FirebaseSyncResponse>(
    "/auth/firebase-onboard",
    payload
  );
  return data;
}

export function roleHomePath(role: Role) {
  if (role === "SUPER_ADMIN") return "/admin";
  return role === "purohit" ? "/purohit" : "/user";
}
