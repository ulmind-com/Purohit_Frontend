"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BentoGridSkeleton } from "@/components/shared/loading-skeletons";
import { ApiErrorAlert } from "@/components/shared/api-error-alert";
import { getMyBookingHistory } from "@/lib/api/users";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserResponse } from "@/types";
import { STATUS_BADGE_VARIANT } from "@/lib/booking-status";

export function UserBentoDashboard() {
  const profile = useAuthStore((s) => s.profile) as UserResponse | null;

  const historyQuery = useQuery({
    queryKey: ["booking-history", 0, 5],
    queryFn: () => getMyBookingHistory(0, 5),
  });

  if (!profile || historyQuery.isLoading) {
    return <BentoGridSkeleton />;
  }

  const upcoming = historyQuery.data?.filter((b) => b.status !== "Completed" && b.status !== "Cancelled") ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Hero CTA tile */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:col-span-2 lg:col-span-2"
      >
        <Card className="saffron-gradient h-full overflow-hidden border-none text-white">
          <CardContent className="flex h-full flex-col justify-between gap-4 py-6">
            <div>
              <p className="flex items-center gap-1.5 text-sm text-white/85">
                <Sparkles className="size-4" /> Namaste, {profile.name.split(" ")[0]}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Ready for your next ceremony?
              </h2>
              <p className="mt-1 max-w-sm text-sm text-white/85">
                Get matched with a verified Purohit in real time.
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="w-fit text-foreground">
              <Link href="/user/book">
                <CalendarPlus className="size-4" /> Book a Puja
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <StatTile
        icon={Clock}
        label="Upcoming"
        value={String(upcoming.length)}
        delay={0.05}
      />
      <StatTile
        icon={MapPin}
        label="Saved addresses"
        value={String(profile.addresses.length)}
        delay={0.1}
      />

      {/* Recent bookings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="sm:col-span-2 lg:col-span-3"
      >
        <Card className="h-full">
          <CardContent className="py-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">Recent bookings</h3>
              <Link href="/user/bookings" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>

            {historyQuery.isError && (
              <ApiErrorAlert error={historyQuery.error} onRetry={() => historyQuery.refetch()} />
            )}

            {historyQuery.data?.length === 0 && (
              <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                No bookings yet. Start by booking your first Puja.
              </p>
            )}

            <div className="space-y-2">
              {historyQuery.data?.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{booking.puja_category}</p>
                    <p className="text-xs text-muted-foreground">
                      with {booking.purohit_name}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANT[booking.status] ?? "secondary"}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="h-full">
          <CardContent className="flex h-full flex-col justify-center gap-2 py-5 text-center">
            <CheckCircle2 className="mx-auto size-6 text-emerald-500" />
            <p className="text-sm text-muted-foreground">
              Keep your profile and addresses up to date for faster matching.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/user/profile">Manage profile</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="h-full">
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="size-4" />
            <span className="text-sm">{label}</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
