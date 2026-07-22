"use client";

import { ProfileFormSkeleton } from "@/components/shared/loading-skeletons";
import { UserProfileForm } from "@/components/dashboard/user-profile-form";
import { AddressManager } from "@/components/dashboard/address-manager";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserResponse } from "@/types";

export default function UserProfilePage() {
  const profile = useAuthStore((s) => s.profile) as UserResponse | null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and saved addresses.
        </p>
      </div>

      {!profile ? (
        <ProfileFormSkeleton />
      ) : (
        <>
          <UserProfileForm profile={profile} />
          <AddressManager addresses={profile.addresses} />
        </>
      )}
    </div>
  );
}
