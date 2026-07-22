'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { usePusherChannel } from '@/hooks/usePusherChannel';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookingStore } from '@/store/useBookingStore';
import { api } from '@/lib/api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LiveTrackingPanel } from '@/components/booking/live-tracking-panel';

export function ActiveBooking() {
  const { profile: user } = useAuthStore();
  const { 
    activeBooking, 
    bookingStatus,
    setBookingStatus,
    isVerifying,
    setIsVerifying
  } = useBookingStore();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const controls = useAnimation();

  const channelName = user?._id ? `purohit_${user._id}` : null;

  usePusherChannel<{ booking_id: string }>(
    channelName,
    'booking_completed',
    (data) => {
      if (activeBooking && data.booking_id === activeBooking._id) {
        setBookingStatus('COMPLETED');
        toast.success("Verification successful! Booking is now complete.");
      }
    }
  );

  const handleEndPuja = async () => {
    if (!activeBooking) return;
    
    try {
      setIsInitiating(true);
      await api.post(`/bookings/${activeBooking._id}/initiate-completion`);
      setBookingStatus('COMPLETION_PENDING');
      toast.success("OTP sent to Yajman. Please ask them for it.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to initiate completion");
    } finally {
      setIsInitiating(false);
    }
  };

  const handleVerifyOtp = async (value: string) => {
    if (value.length !== 4 || !activeBooking) return;
    
    try {
      setIsVerifying(true);
      setError(null);
      await api.post(`/bookings/${activeBooking._id}/verify-completion`, { otp: value });
      // The Pusher event will handle setting status to COMPLETED
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Invalid OTP";
      setError(errMsg);
      setOtp(''); // Clear input
      
      // Trigger horizontal shake
      controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!activeBooking) return null;

  if (bookingStatus === 'COMPLETION_PENDING') {
    return (
      <Card className="max-w-md mx-auto mt-8 trip-sheet border-none">
        <CardHeader className="text-center">
          <CardTitle>Verify Completion</CardTitle>
          <CardDescription>
            Enter the 4-digit OTP provided by the Yajman to complete this booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <motion.div animate={controls}>
            <InputOTP
              maxLength={4}
              value={otp}
              onChange={(v) => {
                setOtp(v);
                if (v.length === 4) handleVerifyOtp(v);
              }}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-12 h-14 text-2xl rounded-xl" />
                <InputOTPSlot index={1} className="w-12 h-14 text-2xl rounded-xl" />
                <InputOTPSlot index={2} className="w-12 h-14 text-2xl rounded-xl" />
                <InputOTPSlot index={3} className="w-12 h-14 text-2xl rounded-xl" />
              </InputOTPGroup>
            </InputOTP>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2 text-destructive text-sm font-medium"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isVerifying && (
            <div className="flex items-center space-x-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (bookingStatus === 'COMPLETED') {
    return (
      <Card className="max-w-md mx-auto mt-8 trip-sheet border-none">
        <CardHeader>
          <CardTitle className="text-green-600">Booking Completed</CardTitle>
          <CardDescription>
            You have successfully finished the ceremony. Earnings will be transferred to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
            <span className="font-medium text-muted-foreground">Total Earnings</span>
            <span className="text-xl font-bold">₹{activeBooking.total_amount}</span>
          </div>
          <Button
            className="w-full mt-6 h-12 rounded-full text-base font-semibold"
            onClick={() => setBookingStatus('FINISHED')} // Move to past bookings view
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      <Card className="trip-sheet border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
          <CardTitle>Current Ceremony</CardTitle>
          <span className="status-pill">
            <span className="size-1.5 rounded-full bg-saffron-500 animate-pulse" />
            {bookingStatus || activeBooking.status}
          </span>
          </div>
          <CardDescription>
            {activeBooking.ceremony_type}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* End Puja Button */}
          <Button
            className="w-full h-12 rounded-full text-lg font-semibold"
            onClick={handleEndPuja}
            disabled={isInitiating}
          >
            {isInitiating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Initiating...
              </>
            ) : (
              "End Puja"
            )}
          </Button>
        </CardContent>
      </Card>

      {user?._id && (
        <LiveTrackingPanel
          bookingId={activeBooking._id}
          purohitId={user._id}
          userId={activeBooking.user_id}
          destination={activeBooking.location}
          viewerRole="purohit"
        />
      )}
    </div>
  );
}
