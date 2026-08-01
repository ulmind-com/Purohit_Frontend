"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, differenceInHours } from "date-fns";
import { CalendarCheck2, CalendarClock, Loader2, IndianRupee, MapPin, Phone, Clock, Mail, Stars } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

      <div className="space-y-6">
        {query.data?.map((booking) => (
          <Card key={booking._id} className="overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-white/10 bg-background/60 backdrop-blur-xl shadow-lg relative group">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron-500 via-orange-400 to-amber-500 opacity-80" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 border-b border-white/10 gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-saffron-500/20 shadow-sm">
                  <AvatarImage src={booking.user_image || undefined} alt={booking.user_name || "Yajman"} className="object-cover" />
                  <AvatarFallback className="bg-saffron-500/10 text-saffron-600 font-semibold text-lg">
                    {booking.user_name ? booking.user_name.charAt(0).toUpperCase() : "Y"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-semibold text-xl tracking-tight text-foreground/90 group-hover:text-saffron-500 transition-colors">
                      {booking.user_name || "Yajman"}
                    </h3>
                    {booking.user_phone ? (
                      <Badge variant="outline" className="bg-background/50 border-white/10 text-foreground/70 gap-1.5 px-2 py-0.5">
                        <Phone className="size-3" />
                        {booking.user_phone}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Booking ID: {booking._id.slice(-8)}</p>
                    {booking.user_email && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70 mt-1">
                        <Mail className="size-3.5 text-saffron-500" />
                        {booking.user_email}
                      </div>
                    )}
                    {booking.user_gotra && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Stars className="size-3.5 text-saffron-500" />
                        Gotra: <span className="font-medium text-foreground/90">{booking.user_gotra}</span>
                      </div>
                    )}
                    {booking.user_rashi && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Stars className="size-3.5 text-purple-500" />
                        Rashi: <span className="font-medium text-foreground/90">{booking.user_rashi}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Badge variant={STATUS_BADGE_VARIANT[booking.status] ?? "secondary"} className="w-fit text-sm px-4 py-1.5 shadow-sm rounded-full font-medium">
                {statusLabel(booking.status)}
              </Badge>
            </div>
            
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 p-6">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 bg-saffron-500/15 p-2.5 rounded-xl border border-saffron-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                      <MapPin className="size-5 text-saffron-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/60 mb-0.5">Ceremony Type & Location</p>
                      <p className="text-base font-semibold text-foreground/90">{booking.ceremony_type}</p>
                      <p className="text-sm text-foreground/70 mt-0.5">{booking.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 bg-blue-500/15 p-2.5 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <CalendarClock className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/60 mb-0.5">Scheduled For</p>
                      <p className="text-base font-semibold text-foreground/90">
                        {booking.scheduled_start_time ? format(new Date(booking.scheduled_start_time), "MMM do, yyyy 'at' h:mm a") : "TBD"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 bg-emerald-500/15 p-2.5 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <IndianRupee className="size-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/60 mb-0.5">Total Amount</p>
                      <p className="text-base font-bold text-emerald-500">
                        {booking.total_amount ? `₹${booking.total_amount.toLocaleString('en-IN')}` : "TBD"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 bg-purple-500/15 p-2.5 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                      <Clock className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/60 mb-0.5">Booked On</p>
                      <p className="text-base font-medium text-foreground/90">
                        {booking.created_at ? format(new Date(booking.created_at), "MMM do, yyyy 'at' h:mm a") : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="flex items-center justify-between p-5 bg-white/[0.02] border-t border-white/10">
              <div className="flex items-center gap-2">
                {booking.scheduled_start_time && booking.scheduled_end_time ? (
                  <Badge variant="outline" className="bg-background/50 border-white/10 text-foreground/70 rounded-md">
                    Duration: ~{differenceInHours(new Date(booking.scheduled_end_time), new Date(booking.scheduled_start_time))} hrs
                  </Badge>
                ) : <div />}
              </div>
              
              <div className="flex items-center gap-3">
                {(booking.status === "ACCEPTED" || booking.status === "Confirmed") && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border border-emerald-500/50"
                    onClick={() => completeMutation.mutate(booking._id)}
                    disabled={completeMutation.isPending}
                  >
                    {completeMutation.isPending ? (
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    ) : (
                      <CalendarCheck2 className="size-3.5 mr-1.5" />
                    )}
                    Mark Completed
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
