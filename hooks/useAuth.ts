"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth as firebaseAuth, googleProvider } from "@/lib/firebase";

import {
  login,
  logout as logoutRequest,
  roleHomePath,
  signupPurohit,
  signupUser,
  firebaseSync,
  firebaseOnboard,
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
      // Try Firebase Email/Password first
      try {
        const firebaseResult = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const idToken = await firebaseResult.user.getIdToken();
        const syncResponse = await firebaseSync(idToken);

        if (syncResponse.status === "LOGGED_IN" && syncResponse.token && syncResponse.role) {
          setSession(syncResponse.token, syncResponse.role);
          const profile = await hydrateProfile(syncResponse.role);
          setProfile(profile);
          return { role: syncResponse.role };
        }

        // NEW_USER from Firebase — redirect to onboarding
        if (syncResponse.status === "NEW_USER") {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "firebase_onboard_data",
              JSON.stringify({
                firebase_uid: syncResponse.firebase_uid,
                email: syncResponse.email,
                name: syncResponse.name,
                picture: syncResponse.picture,
              })
            );
          }
          return { role: null as unknown as Role, needsOnboard: true };
        }
      } catch {
        // Firebase auth failed — fall back to direct MongoDB login
      }

      // Fallback: direct MongoDB email/password login
      const { access_token, role } = await login(email, password);
      setSession(access_token, role);
      const profile = await hydrateProfile(role);
      setProfile(profile);
      return { role };
    },
    onSuccess: (result: { role: Role; needsOnboard?: boolean }) => {
      if (result.needsOnboard) {
        router.replace("/onboarding");
        return;
      }
      toast.success("Welcome back!", {
        description:
          result.role === "purohit"
            ? "You're signed in as a Purohit."
            : "You're signed in as a Yajman.",
      });
      router.replace(roleHomePath(result.role));
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
    mutationFn: async (payload: SignupUserPayload) => {
      // 1. Create Firebase user first (for unified auth)
      try {
        const fbResult = await createUserWithEmailAndPassword(firebaseAuth, payload.email, payload.password);
        payload.firebase_uid = fbResult.user.uid;
      } catch (err: any) {
        // If the email is already in use in Firebase (e.g., they used Google before),
        // we log it and continue. Our backend will handle syncing if needed,
        // or they might just need to use Google sign-in instead.
        console.warn("Firebase signup warning:", err.message);
      }
      // 2. Create MongoDB user
      return signupUser(payload);
    },
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
    mutationFn: async (payload: SignupPurohitPayload) => {
      // 1. Create Firebase user first (for unified auth)
      try {
        const fbResult = await createUserWithEmailAndPassword(firebaseAuth, payload.email, payload.password);
        payload.firebase_uid = fbResult.user.uid;
      } catch (err: any) {
        // Firebase user might already exist
        console.warn("Firebase signup warning:", err.message);
      }
      // 2. Create MongoDB purohit
      return signupPurohit(payload);
    },
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

export function useGoogleLogin() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async () => {
      // 1. Firebase Google Sign-In popup
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      // 2. Send token to backend for sync
      const syncResponse = await firebaseSync(idToken);

      if (syncResponse.status === "LOGGED_IN" && syncResponse.token && syncResponse.role) {
        // Existing user — set session
        setSession(syncResponse.token, syncResponse.role);
        const profile = await hydrateProfile(syncResponse.role);
        setProfile(profile);
        return { status: "LOGGED_IN" as const, role: syncResponse.role };
      }

      // New user — store temp data for onboarding
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "firebase_onboard_data",
          JSON.stringify({
            firebase_uid: syncResponse.firebase_uid,
            email: syncResponse.email,
            name: syncResponse.name,
            picture: syncResponse.picture,
          })
        );
      }
      return { status: "NEW_USER" as const, role: null };
    },
    onSuccess: ({ status, role }) => {
      if (status === "LOGGED_IN" && role) {
        toast.success("Welcome back!", {
          description: "Signed in with Google successfully.",
        });
        router.replace(roleHomePath(role));
      } else {
        router.replace("/onboarding");
      }
    },
    onError: (error) => {
      toast.error("Google Sign-In failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}

export function useFirebaseOnboard() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: async (payload: import("@/types").FirebaseOnboardPayload) => {
      const response = await firebaseOnboard(payload);
      if (response.status === "SUCCESS" && response.token && response.role) {
        setSession(response.token, response.role);
        const profile = await hydrateProfile(response.role);
        setProfile(profile);
        return { role: response.role };
      }
      throw new Error("Onboarding failed");
    },
    onSuccess: ({ role }) => {
      // Clean up sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("firebase_onboard_data");
      }
      toast.success("Welcome!", {
        description: "Your account has been created successfully.",
      });
      router.replace(roleHomePath(role));
    },
    onError: (error) => {
      toast.error("Onboarding failed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    },
  });
}
