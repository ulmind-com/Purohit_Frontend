"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Check, Loader2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { NewBookingRequestEvent } from "@/types";

const AUTO_DISMISS_SECONDS = 25;

interface IncomingRequestModalProps {
  request: NewBookingRequestEvent | null;
  onAccept: () => void;
  onDismiss: () => void;
  isAccepting: boolean;
}

export function IncomingRequestModal({
  request,
  onAccept,
  onDismiss,
  isAccepting,
}: IncomingRequestModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_DISMISS_SECONDS);

  useEffect(() => {
    if (!request) return;
    setSecondsLeft(AUTO_DISMISS_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart the countdown only when a new request comes in
  }, [request?.booking_id]);

  return (
    <Dialog open={Boolean(request)} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent
        className="max-w-sm overflow-hidden border-none p-0 [&>button]:text-white/80 [&>button]:hover:text-white"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="saffron-gradient relative flex flex-col items-center gap-4 px-6 py-10 text-center text-white">
          <DialogHeader className="sr-only">
            <DialogTitle>Incoming booking request</DialogTitle>
          </DialogHeader>

          <div className="relative flex size-20 items-center justify-center">
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                className="absolute inset-0 rounded-full bg-white/40"
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.5,
                }}
              />
            ))}
            <motion.div
              animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
              className="relative z-10 flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur"
            >
              <Bell className="size-8" />
            </motion.div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wide text-white/80">
              New booking request
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {request?.ceremony_type ?? "Ceremony"}
            </p>
            {request?.scheduled_start_time && request?.scheduled_end_time && (
              <div className="mt-2 text-sm text-white/90 bg-white/10 rounded-md py-1 px-3 inline-block">
                {new Intl.DateTimeFormat('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                }).format(new Date(request.scheduled_start_time))}
                {" - "}
                {new Intl.DateTimeFormat('en-US', {
                  hour: 'numeric', minute: '2-digit'
                }).format(new Date(request.scheduled_end_time))}
              </div>
            )}
          </div>

          <p className="text-xs text-white/75">
            Auto-declines in {secondsLeft}s if no one responds
          </p>
        </div>

        <div className="flex gap-3 p-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onDismiss}
            disabled={isAccepting}
          >
            <X className="size-4" /> Decline
          </Button>
          <Button className="flex-1" onClick={onAccept} disabled={isAccepting}>
            {isAccepting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
