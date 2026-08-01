"use client";

import { useQuery } from "@tanstack/react-query";
import { format, differenceInHours } from "date-fns";
import { CalendarClock, Star, Clock, IndianRupee, MapPin, Phone, Mail, Award } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

      <div className="space-y-6">
        {query.data?.map((booking) => (
          <Card key={booking.booking_id} className="overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-white/10 bg-background/60 backdrop-blur-xl shadow-lg relative group">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron-500 via-orange-400 to-amber-500 opacity-80" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 border-b border-white/10 gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-saffron-500/20 shadow-sm">
                  <AvatarImage src={booking.purohit_image || undefined} alt={booking.purohit_name || "Purohit"} className="object-cover" />
                  <AvatarFallback className="bg-saffron-500/10 text-saffron-600 font-semibold text-lg">
                    {booking.purohit_name ? booking.purohit_name.charAt(0).toUpperCase() : "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-semibold text-xl tracking-tight text-foreground/90 group-hover:text-saffron-500 transition-colors">
                      {booking.purohit_name || "Looking for Purohit"}
                    </h3>
                    {booking.purohit_rating ? (
                      <Badge variant="secondary" className="bg-green-500/15 text-green-500 hover:bg-green-500/25 border border-green-500/20 shadow-sm gap-1.5 px-2 py-0.5">
                        <Star className="size-3.5 fill-current" />
                        <span className="font-medium">{booking.purohit_rating.toFixed(1)}</span>
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Booking ID: {booking.booking_id.slice(-8)}</p>
                    {booking.purohit_phone && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70 mt-1">
                        <Phone className="size-3.5 text-saffron-500" />
                        {booking.purohit_phone}
                      </div>
                    )}
                    {booking.purohit_email && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Mail className="size-3.5 text-saffron-500" />
                        {booking.purohit_email}
                      </div>
                    )}
                    {booking.purohit_experience !== undefined && booking.purohit_experience !== null && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Award className="size-3.5 text-saffron-500" />
                        {booking.purohit_experience} Years Experience
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
                      <p className="text-sm font-medium text-foreground/60 mb-0.5">Ceremony Type</p>
                      <p className="text-base font-semibold text-foreground/90">{booking.puja_category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 bg-blue-500/15 p-2.5 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <CalendarClock className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/60 mb-0.5">Scheduled For</p>
                      <p className="text-base font-semibold text-foreground/90">
                        {booking.scheduled_start_time ? format(new Date(booking.scheduled_start_time), "MMM do, yyyy 'at' h:mm a") : format(new Date(booking.timestamp), "MMM do, yyyy 'at' h:mm a")}
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
                      <p className="text-sm font-medium text-foreground/60 mb-0.5">Dakshina / Amount</p>
                      <p className="text-base font-bold text-emerald-500">
                        {booking.budget ? `₹${booking.budget.toLocaleString('en-IN')}` : "TBD"}
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
                {booking.status === "Completed" && !booking.is_rated && (
                  <Button 
                    size="sm" 
                    className="bg-saffron-500 hover:bg-saffron-600 text-white shadow-md animate-pulse"
                    onClick={() => {
                      setSelectedBooking({ id: booking.booking_id, purohitName: booking.purohit_name || "Purohit" });
                      setRatingModalOpen(true);
                    }}
                  >
                    Rate Experience
                  </Button>
                )}
                {booking.status === "Completed" && booking.is_rated && (
                  <Badge variant="outline" className="border-green-500/50 text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400">
                    Rated ✓
                  </Badge>
                )}
              </div>
            </div>
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
