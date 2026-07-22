"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Loader2,
  MapPinned,
  Radar,
  Star,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiErrorAlert } from "@/components/shared/api-error-alert";
import { ListSkeleton } from "@/components/shared/loading-skeletons";
import { PurohitRadiusMap } from "@/components/map/purohit-radius-map";
import { IncomingRequestModal } from "@/components/booking/incoming-request-modal";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { usePusherChannel } from "@/hooks/usePusherChannel";
import { acceptBooking, getNearbyRequests, getMyBookings } from "@/lib/api/bookings";
import { getPurohitById } from "@/lib/api/purohits";
import { ApiError } from "@/lib/api/axios";
import type {
  BroadcastBookingDoc,
  NewBookingRequestEvent,
  PurohitResponse,
} from "@/types";
import { ActiveBooking } from "@/app/(dashboard)/purohit/components/ActiveBooking";
import { useEffect } from "react";
import { OnlineToggle } from "@/app/(dashboard)/purohit/components/OnlineToggle";

export function PurohitDashboard() {
  const profile = useAuthStore((s) => s.profile) as PurohitResponse | null;
  const setProfile = useAuthStore((s) => s.setProfile);
  const setActiveBooking = useBookingStore((s) => s.setActiveBooking);
  const queryClient = useQueryClient();

  const [incomingRequest, setIncomingRequest] =
    useState<NewBookingRequestEvent | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const isOnline = profile?.is_online ?? false;
  const lat = profile?.location.coordinates[1] ?? 0;
  const lng = profile?.location.coordinates[0] ?? 0;
  const radiusKm = profile?.service_radius_km ?? 10;

  // Removed availabilityMutation as it's now inside OnlineToggle
  const nearbyQuery = useQuery({
    queryKey: ["nearby-requests", lat, lng, radiusKm],
    queryFn: () => getNearbyRequests(lat, lng, radiusKm),
    enabled: Boolean(profile) && isOnline,
    refetchInterval: 15_000,
  });

  const myBookingsQuery = useQuery({
    queryKey: ["purohit-bookings"],
    queryFn: () => getMyBookings(10),
    enabled: Boolean(profile),
  });

  useEffect(() => {
    if (myBookingsQuery.data) {
      const active = myBookingsQuery.data.find(
        (b) => b.status === "ACCEPTED" || b.status === "COMPLETION_PENDING" || b.status === "SEARCHING"
      );
      if (active) {
        setActiveBooking(active);
      }
    }
  }, [myBookingsQuery.data, setActiveBooking]);

  const acceptMutation = useMutation({
    mutationFn: acceptBooking,
    onSuccess: (doc) => {
      toast.success("Booking confirmed!", {
        description: `${doc.ceremony_type} booking locked in.`,
      });
      setIncomingRequest(null);
      queryClient.invalidateQueries({ queryKey: ["nearby-requests"] });
      queryClient.invalidateQueries({ queryKey: ["purohit-bookings"] });
    },
    onError: (error) => {
      const message =
        error instanceof ApiError && error.status === 409
          ? "Too slow — another Purohit already accepted this booking."
          : error instanceof ApiError
            ? error.message
            : "Please try again.";
      toast.error("Couldn't accept booking", { description: message });
      setIncomingRequest(null);
    },
  });

  usePusherChannel<NewBookingRequestEvent>(
    profile ? `purohit_${profile._id}` : null,
    "new_booking_request",
    useCallback(
      (data) => {
        if (!isOnline) return;
        if (dismissedIds.has(data.booking_id)) return;
        setIncomingRequest(data);
        queryClient.invalidateQueries({ queryKey: ["nearby-requests"] });
      },
      [isOnline, dismissedIds, queryClient]
    )
  );

  function handleDismiss(bookingId?: string) {
    if (bookingId) setDismissedIds((prev) => new Set(prev).add(bookingId));
    setIncomingRequest(null);
  }

  if (!profile) {
    return <ListSkeleton rows={3} />;
  }

  return (
    <div className="space-y-6">
      <IncomingRequestModal
        request={incomingRequest}
        isAccepting={acceptMutation.isPending}
        onAccept={() => incomingRequest && acceptMutation.mutate(incomingRequest.booking_id)}
        onDismiss={() => handleDismiss(incomingRequest?.booking_id)}
      />

      {/* Active Booking Component */}
      <ActiveBooking />

      {/* Bento top row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel sm:col-span-2 lg:col-span-2">
          <CardContent className="flex items-center justify-between gap-4 py-6">
            <OnlineToggle />
          </CardContent>
        </Card>

        <StatCard icon={Star} label="Rating" value={profile.rating.toFixed(1)} />
        <StatCard icon={Wallet} label="Base Dakshina" value={`₹${profile.price}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 font-medium">
                <MapPinned className="size-4 text-saffron-500" />
                Your service radius
              </h3>
              <Badge variant="secondary">{radiusKm} km</Badge>
            </div>
            <PurohitRadiusMap center={{ lat, lng }} radiusKm={radiusKm} online={isOnline} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <h3 className="mb-3 flex items-center gap-1.5 font-medium">
              <Radar className="size-4 text-saffron-500" />
              Nearby requests
            </h3>

            {!isOnline && (
              <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                Go online to see live booking requests near you.
              </p>
            )}

            {isOnline && nearbyQuery.isLoading && <ListSkeleton rows={2} />}

            {isOnline && nearbyQuery.isError && (
              <ApiErrorAlert error={nearbyQuery.error} onRetry={() => nearbyQuery.refetch()} />
            )}

            {isOnline && nearbyQuery.data && (
              <NearbyRequestsList
                requests={nearbyQuery.data.filter((r) => !dismissedIds.has(r._id))}
                onAccept={(id) => acceptMutation.mutate(id)}
                isAccepting={acceptMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" />
          <span className="text-sm">{label}</span>
        </div>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function NearbyRequestsList({
  requests,
  onAccept,
  isAccepting,
}: {
  requests: BroadcastBookingDoc[];
  onAccept: (id: string) => void;
  isAccepting: boolean;
}) {
  if (requests.length === 0) {
    return (
      <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        No active requests in your radius right now.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((req) => (
        <motion.div
          key={req._id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{req.ceremony_type}</p>
            <p className="text-xs text-muted-foreground">
              ₹{req.budget}
              {req.distance_in_km != null && ` · ${req.distance_in_km.toFixed(1)} km away`}
            </p>
          </div>
          <Button size="sm" onClick={() => onAccept(req._id)} disabled={isAccepting}>
            {isAccepting ? <Loader2 className="size-3.5 animate-spin" /> : <CalendarCheck className="size-3.5" />}
            Accept
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
