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
import { RatingModal } from "@/components/bookings/RatingModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function UserBookingsPage() {
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ id: string, purohitName: string } | null>(null);

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
              <div className="flex flex-col items-end gap-2">
                <Badge variant={STATUS_BADGE_VARIANT[booking.status] ?? "secondary"}>
                  {statusLabel(booking.status)}
                </Badge>
                {booking.status === "Completed" && !booking.is_rated && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-saffron-500 text-saffron-600 hover:bg-saffron-50 dark:border-saffron-400 dark:text-saffron-400 dark:hover:bg-saffron-500/10 shadow-[0_0_10px_rgba(249,115,22,0.3)] animate-pulse"
                    onClick={() => {
                      setSelectedBooking({ id: booking.booking_id, purohitName: booking.purohit_name || "Purohit" });
                      setRatingModalOpen(true);
                    }}
                  >
                    Rate Purohit
                  </Button>
                )}
                {booking.status === "Completed" && booking.is_rated && (
                  <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400">
                    Rated ✓
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBooking && (
        <RatingModal 
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          bookingId={selectedBooking.id}
          purohitName={selectedBooking.purohitName}
        />
      )}
    </div>
  );
}
