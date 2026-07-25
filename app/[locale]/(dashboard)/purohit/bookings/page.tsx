"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarCheck2, CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/shared/loading-skeletons";
import { ApiErrorAlert } from "@/components/shared/api-error-alert";
import { getMyBookings, updateBookingStatus } from "@/lib/api/bookings";
import { STATUS_BADGE_VARIANT, statusLabel } from "@/lib/booking-status";
import { ApiError } from "@/lib/api/axios";

export default function PurohitBookingsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["purohit-bookings"],
    queryFn: () => getMyBookings(100),
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, "Completed"),
    onSuccess: () => {
      toast.success("Booking marked as completed");
      queryClient.invalidateQueries({ queryKey: ["purohit-bookings"] });
    },
    onError: (error) => {
      toast.error("Couldn't update booking", {
        description: error instanceof ApiError ? error.message : undefined,
      });
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">My Bookings</h1>
        <p className="mt-1 text-muted-foreground">
          Ceremonies you&apos;ve accepted, in progress, and completed.
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
              Go online from your dashboard to start accepting requests.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {query.data?.map((booking) => (
          <Card key={booking._id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{booking.ceremony_type}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.location} · ₹{booking.total_amount}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {format(new Date(booking.created_at), "PPP p")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_BADGE_VARIANT[booking.status] ?? "secondary"}>
                  {statusLabel(booking.status)}
                </Badge>
                {(booking.status === "ACCEPTED" || booking.status === "Confirmed") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => completeMutation.mutate(booking._id)}
                    disabled={completeMutation.isPending}
                  >
                    {completeMutation.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <CalendarCheck2 className="size-3.5" />
                    )}
                    Mark completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
