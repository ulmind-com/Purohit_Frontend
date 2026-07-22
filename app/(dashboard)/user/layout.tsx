"use client";

import { Navbar } from "@/components/shared/navbar";
import { PageTransition } from "@/components/shared/page-transition";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useHydrateProfile } from "@/hooks/useAuth";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useHydrateProfile();

  return (
    <div className="min-h-screen bg-radial-glow">
      <Navbar role="user" />
      <main className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 md:pb-8 lg:px-8">
        <ErrorBoundary>
          <PageTransition>{children}</PageTransition>
        </ErrorBoundary>
      </main>
    </div>
  );
}
