"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api/axios";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  purohitName: string;
  onSuccess?: () => void;
}

export function RatingModal({ isOpen, onClose, bookingId, purohitName, onSuccess }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post(`/bookings/${bookingId}/rate`, {
        rating,
        comment: comment.trim() || null
      });
      setIsSuccess(true);
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setRating(0);
        setComment("");
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-2xl border border-border"
        >
          {/* Close button */}
          {!isSuccess && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-muted-foreground backdrop-blur-md transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
          )}

          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <CheckCircle2 className="size-20 text-green-500 mb-6" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
              <p className="mt-2 text-muted-foreground">Your feedback helps us improve our services.</p>
            </motion.div>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-foreground">Rate your experience</h2>
                <p className="mt-2 text-muted-foreground">How was your puja with {purohitName}?</p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-8" onMouseLeave={() => setHoveredRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    className="relative focus:outline-none"
                  >
                    <Star
                      className={`size-10 sm:size-12 transition-all duration-300 ${
                        (hoveredRating || rating) >= star
                          ? "fill-saffron-500 text-saffron-500"
                          : "fill-muted text-muted-foreground"
                      }`}
                    />
                    {/* Sparkle effect on select */}
                    <AnimatePresence>
                      {rating === star && (
                        <motion.div
                          initial={{ scale: 0, opacity: 1 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 rounded-full bg-saffron-400"
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>

              <div className="mb-6">
                <Textarea
                  placeholder="Share details of your experience (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px] resize-none focus-visible:ring-saffron-500"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full bg-gradient-to-r from-saffron-500 to-marigold-500 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-saffron-500/25 transition-all"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
