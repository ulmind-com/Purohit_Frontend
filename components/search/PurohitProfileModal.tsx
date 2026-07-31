"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, MapPin, CheckCircle2, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api/axios";
import { ReviewResponse } from "@/types";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface PurohitProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  purohit: any;
}

export function PurohitProfileModal({ isOpen, onClose, purohit }: PurohitProfileModalProps) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && purohit._id) {
      fetchReviews();
    }
  }, [isOpen, purohit._id]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/purohits/${purohit._id}/reviews`);
      setReviews(res.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const profilePic = purohit.gallery_urls?.length > 0 
    ? purohit.gallery_urls[0] 
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + purohit._id;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-background shadow-2xl border border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30">
            <h2 className="text-xl font-semibold">Purohit Profile</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
            {/* Left Column: Details */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
                <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-saffron-500/20">
                  <Image src={profilePic} alt={purohit.name} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{purohit.name}</h1>
                    <CheckCircle2 className="size-5 text-blue-500" />
                  </div>
                  <p className="text-muted-foreground mt-1">{purohit.tradition} • {purohit.experience_years} Yrs Exp</p>
                  <p className="text-muted-foreground">{purohit.education_upadhi}</p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full text-sm font-medium">
                      <Star className="size-4 fill-amber-500 text-amber-500" />
                      <span>{purohit.rating?.toFixed(1) || "0.0"} ({purohit.total_reviews || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      <span>{purohit.distance_in_km?.toFixed(1) || 0} km away</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {purohit.bio || "No biography provided by the purohit."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {purohit.expertise?.map((exp: string) => (
                    <Badge key={exp} variant="secondary">{exp}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {purohit.languages?.map((lang: string) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Reviews */}
            <div className="flex-1 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                User Reviews
                <Badge variant="secondary" className="rounded-full bg-saffron-500/10 text-saffron-600">
                  {purohit.total_reviews || 0}
                </Badge>
              </h3>
              
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-3">
                      <div className="size-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                        <div className="h-16 bg-muted rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-muted/20">
                  <Star className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No reviews yet for this purohit.</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {reviews.map((review) => (
                    <motion.div 
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="size-10 border border-border">
                          {review.user_avatar ? (
                            <AvatarImage src={review.user_avatar} alt={review.user_name || "User"} />
                          ) : null}
                          <AvatarFallback>
                            <UserCircle2 className="size-6 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm truncate">{review.user_name || "Anonymous User"}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`size-3 ${
                                  review.rating >= star ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground"
                                }`} 
                              />
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
