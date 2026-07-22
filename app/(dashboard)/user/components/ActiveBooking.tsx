'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePusherChannel } from '@/hooks/usePusherChannel';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookingStore } from '@/store/useBookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveTrackingPanel } from '@/components/booking/live-tracking-panel';

export function ActiveBooking() {
  const { profile: user } = useAuthStore();
  const { 
    activeBooking, 
    bookingStatus, 
    currentOtp, 
    setBookingStatus, 
    setCurrentOtp 
  } = useBookingStore();

  const channelName = user?._id ? `user_${user._id}` : null;

  usePusherChannel<{ booking_id: string; otp: string }>(
    channelName,
    'otp_generated',
    (data) => {
      if (activeBooking && data.booking_id === activeBooking._id) {
        setBookingStatus('COMPLETION_PENDING');
        setCurrentOtp(data.otp);
      }
    }
  );

  usePusherChannel<{ booking_id: string }>(
    channelName,
    'booking_completed',
    (data) => {
      if (activeBooking && data.booking_id === activeBooking._id) {
        setBookingStatus('COMPLETED');
        setCurrentOtp(null);
      }
    }
  );

  // Sync OTP from booking if already pending completion (e.g., after page refresh)
  useEffect(() => {
    if (activeBooking && (bookingStatus || activeBooking.status) === 'COMPLETION_PENDING' && !currentOtp && activeBooking.completion_otp) {
      setCurrentOtp(activeBooking.completion_otp);
    }
  }, [activeBooking, bookingStatus, currentOtp, setCurrentOtp]);

  if (!activeBooking) return null;

  const currentStatus = bookingStatus || activeBooking.status;
  const showTracking =
    activeBooking.purohit_id &&
    (currentStatus === 'ACCEPTED' || currentStatus === 'Confirmed' || currentStatus === 'COMPLETION_PENDING');

  return (
    <>
      <Card className="mb-6 trip-sheet border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{activeBooking.ceremony_type}</CardTitle>
            <span className="status-pill">
              <span className="size-1.5 rounded-full bg-saffron-500 animate-pulse" />
              {currentStatus}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {activeBooking.purohit_id && (
              <div className="text-sm text-muted-foreground">
                Purohit is on the way or currently performing the ceremony.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showTracking && activeBooking.purohit_id && (
        <div className="mb-6">
          <LiveTrackingPanel
            bookingId={activeBooking._id}
            purohitId={activeBooking.purohit_id}
            userId={user!._id}
            destination={activeBooking.location}
            viewerRole="user"
          />
        </div>
      )}

      <AnimatePresence>
        {bookingStatus === 'COMPLETION_PENDING' && currentOtp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 dark:bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="trip-sheet border-none p-8 max-w-sm w-full text-center space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">End Puja</h2>
                <p className="text-muted-foreground text-sm">
                  Please share this 4-digit OTP with your Purohit to verify the completion of the ceremony.
                </p>
              </div>
              
              <div className="flex justify-center gap-2 py-2">
                {currentOtp.split("").map((digit, i) => (
                  <span
                    key={i}
                    className="saffron-gradient flex size-14 items-center justify-center rounded-2xl text-3xl font-bold text-white"
                  >
                    {digit}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Waiting for Purohit to verify...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookingStatus === 'COMPLETED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/30 dark:bg-black/40 backdrop-blur-md"
          >
            <motion.div className="trip-sheet border-none p-8 max-w-sm w-full text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Puja Completed!</h2>
                <p className="text-muted-foreground text-sm">
                  The ceremony has been successfully completed. May the blessings be with you.
                </p>
              </div>
              <Button
                onClick={() => setBookingStatus('FINISHED')}
                className="h-12 w-full rounded-full text-base font-semibold"
              >
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
