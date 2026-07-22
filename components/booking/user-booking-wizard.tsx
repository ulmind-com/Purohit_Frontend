"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  PartyPopper,
  Phone,
  Star,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LocationMapPicker, type PickedLocation } from "@/components/map/location-map-picker";
import { StepIndicator } from "@/components/booking/step-indicator";
import { SearchingRadar } from "@/components/booking/searching-radar";
import { CEREMONY_TYPES } from "@/lib/constants";
import { bookingWizardSchema, type BookingWizardValues } from "@/lib/validators/booking";
import { requestBooking } from "@/lib/api/bookings";
import { getPurohitById } from "@/lib/api/purohits";
import { usePusherChannel } from "@/hooks/usePusherChannel";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/axios";
import type { BookingAcceptedEvent } from "@/types";
import { cn } from "@/lib/utils";

type WizardStep = "puja" | "location" | "searching" | "matched" | "timeout";

const SEARCH_TIMEOUT_MS = 45_000;

export function UserBookingWizard() {
  const [step, setStep] = useState<WizardStep>("puja");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [matchedPurohitId, setMatchedPurohitId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userId = useAuthStore((s) => s.profile?._id);

  const form = useForm<BookingWizardValues>({
    resolver: zodResolver(bookingWizardSchema),
    mode: "onChange",
    defaultValues: {
      budget: 2100,
    },
  });

  const requestMutation = useMutation({
    mutationFn: requestBooking,
    onSuccess: (doc) => {
      setBookingId(doc._id);
      timeoutRef.current = setTimeout(() => setStep("timeout"), SEARCH_TIMEOUT_MS);
    },
    onError: (error) => {
      toast.error("Couldn't start the search", {
        description: error instanceof ApiError ? error.message : "Please try again.",
      });
      setStep("location");
    },
  });

  usePusherChannel<BookingAcceptedEvent>(
    userId ? `user_${userId}` : null,
    "booking_accepted",
    useCallback(
      (data) => {
        if (bookingId && data.booking_id !== bookingId) return;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setMatchedPurohitId(data.purohit_id);
        setStep("matched");
      },
      [bookingId]
    )
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function goToLocation() {
    const valid = await form.trigger(["ceremonyType", "budget"]);
    if (valid) setStep("location");
  }

  async function startSearching() {
    const valid = await form.trigger(["location"]);
    if (!valid) return;
    setStep("searching");
    const values = form.getValues();
    requestMutation.mutate({
      ceremony_type: values.ceremonyType,
      budget: values.budget,
      location: {
        type: "Point",
        coordinates: [values.location.lng, values.location.lat],
      },
    });
  }

  function retrySearch() {
    setBookingId(null);
    setStep("location");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator
        step={["puja", "location", "searching", "matched"].indexOf(
          step === "timeout" ? "searching" : step
        )}
      />

      <AnimatePresence mode="wait">
        {step === "puja" && (
          <StepShell key="puja">
            <Form {...form}>
              <form className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">Select your ceremony</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose the ritual you need a Purohit for.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="ceremonyType"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {CEREMONY_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => field.onChange(type)}
                            className={cn(
                              "rounded-xl border p-4 text-left text-sm font-medium transition-all hover:border-saffron-400 hover:shadow-sm",
                              field.value === type
                                ? "border-saffron-500 bg-saffron-50 text-saffron-900 shadow-sm dark:bg-saffron-950/30 dark:text-saffron-100"
                                : "border-border bg-card"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offered Dakshina (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Wallet className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="number" min={1} className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="button" className="w-full" size="lg" onClick={goToLocation}>
                  Continue <ArrowRight className="size-4" />
                </Button>
              </form>
            </Form>
          </StepShell>
        )}

        {step === "location" && (
          <StepShell key="location">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Where is the ceremony?</h2>
                <p className="text-sm text-muted-foreground">
                  Drop a pin or search for the venue address.
                </p>
              </div>

              <Form {...form}>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <LocationMapPicker
                          value={
                            field.value
                              ? {
                                  lat: field.value.lat,
                                  lng: field.value.lng,
                                  formattedAddress: field.value.formattedAddress,
                                }
                              : undefined
                          }
                          onChange={(loc: PickedLocation) =>
                            field.onChange({
                              label: loc.formattedAddress || "Selected location",
                              formattedAddress: loc.formattedAddress,
                              lat: loc.lat,
                              lng: loc.lng,
                            })
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("puja")}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button type="button" className="flex-1" size="lg" onClick={startSearching}>
                  Find a Purohit <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </StepShell>
        )}

        {step === "searching" && (
          <StepShell key="searching">
            <div className="flex flex-col items-center py-6 text-center">
              <SearchingRadar label="Searching for nearby Purohits..." />
              <p className="mt-8 max-w-sm text-sm text-muted-foreground">
                We&apos;ve broadcast your request to every verified Purohit within
                range for <span className="font-medium text-foreground">{form.getValues("ceremonyType")}</span>.
                The first to accept will be matched with you.
              </p>
            </div>
          </StepShell>
        )}

        {step === "timeout" && (
          <StepShell key="timeout">
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Loader2 className="size-7 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">No Purohits available right now</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nobody accepted within your area. Try widening your budget or
                  search again in a few minutes.
                </p>
              </div>
              <Button onClick={retrySearch}>Try again</Button>
            </div>
          </StepShell>
        )}

        {step === "matched" && matchedPurohitId && (
          <StepShell key="matched">
            <MatchedPanel purohitId={matchedPurohitId} bookingId={bookingId} />
          </StepShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="glass-panel">
        <CardContent className="p-6 sm:p-8">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function MatchedPanel({
  purohitId,
  bookingId,
}: {
  purohitId: string;
  bookingId: string | null;
}) {
  const { data: purohit, isLoading, error } = useQuery({
    queryKey: ["purohit", purohitId],
    queryFn: () => getPurohitById(purohitId),
  });

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      >
        <PartyPopper className="size-8" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-semibold">Matched!</h2>
        <p className="text-sm text-muted-foreground">
          A Purohit has accepted your request.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading Purohit details...
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">Couldn&apos;t load Purohit details, but your booking is confirmed.</p>
      )}

      {purohit && (
        <Card className="w-full text-left">
          <CardContent className="flex items-center gap-4 py-5">
            <Avatar className="size-14">
              <AvatarFallback className="saffron-gradient text-lg text-white">
                {purohit.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold">{purohit.name}</p>
                <Badge variant="secondary" className="gap-1">
                  <Star className="size-3 fill-current text-saffron-500" />
                  {purohit.rating.toFixed(1)}
                </Badge>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="size-3.5" /> {purohit.mobile_number}
              </p>
              {purohit.address_text && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" /> {purohit.address_text}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex w-full items-center gap-2 rounded-lg bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        Booking ID: <span className="font-mono">{bookingId}</span>
      </div>

      <Button asChild className="w-full" size="lg">
        <Link href="/user/bookings">View my bookings</Link>
      </Button>
    </div>
  );
}
