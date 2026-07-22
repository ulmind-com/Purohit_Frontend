'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Pusher from 'pusher-js';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookingStore } from '@/store/useBookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActiveBooking() {
  const { profile: user } = useAuthStore();
  const { 
    activeBooking, 
    bookingStatus, 
    currentOtp, 
    setBookingStatus, 
    setCurrentOtp 
  } = useBookingStore();

  useEffect(() => {
    if (!user?._id) return;

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user_${user._id}`);

    // Listen for OTP generation
    channel.bind('otp_generated', (data: { booking_id: string; otp: string }) => {
      if (activeBooking && data.booking_id === activeBooking._id) {
        setBookingStatus('COMPLETION_PENDING');
        setCurrentOtp(data.otp);
      }
    });

    // Listen for successful completion
    channel.bind('booking_completed', (data: { booking_id: string }) => {
      if (activeBooking && data.booking_id === activeBooking._id) {
        setBookingStatus('COMPLETED');
        setCurrentOtp(null);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user_${user._id}`);
    };
  }, [user?._id, activeBooking, setBookingStatus, setCurrentOtp]);

  if (!activeBooking) return null;

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Active Booking: {activeBooking.ceremony_type}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Status</span>
              <span className="text-primary font-semibold">{bookingStatus || activeBooking.status}</span>
            </div>
            
            {activeBooking.purohit_id && (
              <div className="text-sm text-muted-foreground">
                Purohit is on the way or currently performing the ceremony.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              className="bg-background border shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">End Puja</h2>
                <p className="text-muted-foreground text-sm">
                  Please share this 4-digit OTP with your Purohit to verify the completion of the ceremony.
                </p>
              </div>
              
              <div className="py-6 bg-muted/50 rounded-xl">
                <span className="text-5xl font-mono font-bold tracking-[0.25em] text-primary ml-4">
                  {currentOtp}
                </span>
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
            <motion.div className="bg-background border shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center space-y-6">
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
                className="w-full"
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
