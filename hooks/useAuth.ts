"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  login,
  logout as logoutRequest,
  roleHomePath,
  signupPurohit,
  signupUser,
  type SignupPurohitPayload,
  type SignupUserPayload,
} from "@/lib/api/auth";
import { fetchMyProfile } from "@/lib/api/users";
import { fetchMyPurohitProfile } from "@/lib/api/purohits";
import { ApiError } from "@/lib/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import type { Role } from "@/types";

async function hydrateProfile(role: Role) {
  return role === "purohit" ? fetchMyPurohitProfile() : fetchMyProfile();
}

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { access_token, role } = await login(email, password);
      setSession(access_token, role);
      const profile = await hydrateProfile(role);
      setProfile(profile);
      return { role };
    },
    onSuccess: ({ role }, _vars, _ctx) => {
      toast.success("Welcome back!", {
        description:
          role === "purohit"
            ? "You're signed in as a Purohit."
            : "You're signed in as a Yajman.",
      });
      router.replace(roleHomePath(role));
    },
    onError: (error) => {
      toast.error("Login failed", {
        description:
          error instanceof ApiError ? error.message : "Please try again.",
      });
    },
  });
}

export function useSignupUser() {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: SignupUserPayload) => signupUser(payload),
    onSuccess: () => {
      toast.success("Account created", {
        description: "You can now sign in as a Yajman.",
      });
      router.replace("/login?role=user");
    },
    onError: (error) => {
      toast.error("Sign up failed", {
        description:
          error instanceof ApiError ? error.message : "Please try again.",
      });
    },
  });
}

export function useSignupPurohit() {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: SignupPurohitPayload) => signupPurohit(payload),
    onSuccess: () => {
      toast.success("Purohit profile created", {
        description: "You can now sign in and start accepting bookings.",
      });
      router.replace("/login?role=purohit");
    },
    onError: (error) => {
      toast.error("Sign up failed", {
        description:
          error instanceof ApiError ? error.message : "Please try again.",
      });
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      // Clear client state even if the network call fails — the user's intent
      // to sign out should never be blocked by a flaky logout endpoint.
      clearSession();
      queryClient.clear();
      router.replace("/login");
    },
  });
}

/**
 * Ensures `useAuthStore.profile` is populated after a hard refresh (when
 * only the persisted token/role survive but the in-memory profile doesn't
 * need refetching). Dashboards should read `profile` from the store and rely
 * on this hook running once near the root of the dashboard layout.
 */
export function useHydrateProfile() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const query = useQuery({
    queryKey: ["me", role],
    queryFn: () => hydrateProfile(role as Role),
    enabled: Boolean(accessToken && role && !profile),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data && !profile) {
      setProfile(query.data);
    }
  }, [query.data, profile, setProfile]);

  return { ...query, profile };
}
