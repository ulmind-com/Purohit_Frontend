"use client";

import { ProfileFormSkeleton } from "@/components/shared/loading-skeletons";
import { PurohitProfileForm } from "@/components/dashboard/purohit-profile-form";
import { useAuthStore } from "@/store/useAuthStore";
import type { PurohitResponse } from "@/types";

export default function PurohitProfilePage() {
  const profile = useAuthStore((s) => s.profile) as PurohitResponse | null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Keep your service details accurate for better matching.
        </p>
      </div>

      {!profile ? <ProfileFormSkeleton /> : <PurohitProfileForm profile={profile} />}
    </div>
  );
}
