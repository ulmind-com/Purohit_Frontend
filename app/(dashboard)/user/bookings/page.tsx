"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/shared/loading-skeletons";
import { ApiErrorAlert } from "@/components/shared/api-error-alert";
import { getMyBookingHistory } from "@/lib/api/users";
import { STATUS_BADGE_VARIANT, statusLabel } from "@/lib/booking-status";

export default function UserBookingsPage() {
  const query = useQuery({
    queryKey: ["booking-history", 0, 50],
    queryFn: () => getMyBookingHistory(0, 50),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">My Bookings</h1>
        <p className="mt-1 text-muted-foreground">
          Every ceremony you&apos;ve booked, past and upcoming.
        </p>
      </div>

      {query.isLoading && <ListSkeleton rows={5} />}
      {query.isError && (
        <ApiErrorAlert error={query.error} onRetry={() => query.refetch()} />
      )}
      {query.data?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <CalendarClock className="size-8 text-muted-foreground" />
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm text-muted-foreground">
              Book your first ceremony to see it here.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {query.data?.map((booking) => (
          <Card key={booking.booking_id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{booking.puja_category}</p>
                <p className="text-sm text-muted-foreground">
                  with {booking.purohit_name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {format(new Date(booking.timestamp), "PPP p")}
                </p>
              </div>
              <Badge variant={STATUS_BADGE_VARIANT[booking.status] ?? "secondary"}>
                {statusLabel(booking.status)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
