import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/lib/constants";
import type { PurohitResponse, Role, UserResponse } from "@/types";

interface DecodedToken {
  sub: string; // email
  role: Role;
  exp: number;
}

type Profile = UserResponse | PurohitResponse;

interface AuthState {
  accessToken: string | null;
  role: Role | null;
  email: string | null;
  profile: Profile | null;
  isHydrated: boolean;
  setSession: (accessToken: string, role: Role) => void;
  setProfile: (profile: Profile) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

/**
 * Mirrors the token into a plain cookie (in addition to the persisted
 * localStorage copy) purely so `middleware.ts` can read auth state at the
 * edge for route protection — the cookie is not marked httpOnly since it is
 * written from the client, so treat it as a routing hint, not a security
 * boundary. All real authorization still happens against the FastAPI JWT.
 */
function syncCookies(accessToken: string | null, role: Role | null) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7; // 7 days, matches ACCESS_TOKEN_EXPIRE_MINUTES
  if (accessToken && role) {
    document.cookie = `${AUTH_COOKIE_NAME}=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
    document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0`;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      email: null,
      profile: null,
      isHydrated: false,
      setSession: (accessToken, role) => {
        let email: string | null = null;
        try {
          email = jwtDecode<DecodedToken>(accessToken).sub;
        } catch {
          email = null;
        }
        syncCookies(accessToken, role);
        set({ accessToken, role, email, profile: null });
      },
      setProfile: (profile) => set({ profile }),
      clearSession: () => {
        syncCookies(null, null);
        set({ accessToken: null, role: null, email: null, profile: null });
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "purohit-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        role: state.role,
        email: state.email,
        profile: state.profile,
      }),
      onRehydrateStorage: () => (state) => {
        // Re-sync cookies on load in case localStorage survived a cookie clear.
        if (state) {
          syncCookies(state.accessToken, state.role);
          state.setHydrated();
        }
      },
    }
  )
);

/** Non-hook accessor for use inside the axios interceptor (outside React). */
export function getAuthSnapshot() {
  return useAuthStore.getState();
}
