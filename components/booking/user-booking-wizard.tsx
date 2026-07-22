"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format, addHours, parse } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  CheckCircle2,
  Clock,
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type WizardStep = "puja" | "schedule" | "location" | "searching" | "matched" | "timeout";

const SEARCH_TIMEOUT_MS = 45_000;

const TIME_OPTIONS = [
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", 
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"
];

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
      durationHours: 1,
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

  async function goToSchedule() {
    const valid = await form.trigger(["ceremonyType", "budget"]);
    if (valid) setStep("schedule");
  }

  async function goToLocation() {
    const valid = await form.trigger(["date", "time", "durationHours"]);
    if (valid) setStep("location");
  }

  async function startSearching() {
    const valid = await form.trigger(["location"]);
    if (!valid) return;
    
    const values = form.getValues();
    
    // Combine Date and Time into UTC ISO strings
    const parsedTime = parse(values.time, "hh:mm a", new Date());
    const scheduledStartTime = new Date(values.date);
    scheduledStartTime.setHours(parsedTime.getHours(), parsedTime.getMinutes(), 0, 0);
    
    const scheduledEndTime = addHours(scheduledStartTime, values.durationHours);

    setStep("searching");
    
    requestMutation.mutate({
      ceremony_type: values.ceremonyType,
      budget: values.budget,
      scheduled_start_time: scheduledStartTime.toISOString(),
      scheduled_end_time: scheduledEndTime.toISOString(),
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
        step={["puja", "schedule", "location", "searching", "matched"].indexOf(
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
                        {CEREMONY_TYPES.map((type) => {
                          const selected = field.value === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => field.onChange(type)}
                              className={cn(
                                "relative rounded-2xl border p-4 text-left text-sm font-medium transition-all hover:border-saffron-400 hover:shadow-sm",
                                selected
                                  ? "glass border-saffron-500 bg-saffron-50/70 text-saffron-900 dark:bg-saffron-950/30 dark:text-saffron-100"
                                  : "border-border bg-card"
                              )}
                            >
                              {type}
                              {selected && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="saffron-gradient absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full text-white shadow-sm"
                                >
                                  <CheckCircle2 className="size-3.5" />
                                </motion.span>
                              )}
                            </button>
                          );
                        })}
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

                <Button
                  type="button"
                  className="h-12 w-full rounded-full text-base font-semibold"
                  size="lg"
                  onClick={goToSchedule}
                >
                  Continue <ArrowRight className="size-4" />
                </Button>
              </form>
            </Form>
          </StepShell>
        )}

        {step === "schedule" && (
          <StepShell key="schedule">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">When do you need the Purohit?</h2>
                <p className="text-sm text-muted-foreground">
                  Select a date, start time, and estimated duration.
                </p>
              </div>

              <Form {...form}>
                <form className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto size-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a time" />
                                <Clock className="absolute right-3 size-4 opacity-50" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIME_OPTIONS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="durationHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Duration (Hours)</FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 Hour</SelectItem>
                            <SelectItem value="2">2 Hours</SelectItem>
                            <SelectItem value="3">3 Hours</SelectItem>
                            <SelectItem value="4">4 Hours</SelectItem>
                            <SelectItem value="5">5 Hours</SelectItem>
                            <SelectItem value="6">6+ Hours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full px-6"
                  onClick={() => setStep("puja")}
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button
                  type="button"
                  className="h-12 flex-1 rounded-full text-base font-semibold"
                  size="lg"
                  onClick={goToLocation}
                >
                  Continue <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
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
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full px-6"
                  onClick={() => setStep("schedule")}
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button
                  type="button"
                  className="h-12 flex-1 rounded-full text-base font-semibold"
                  size="lg"
                  onClick={startSearching}
                >
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
              <Button onClick={retrySearch} className="h-12 rounded-full px-8 text-base font-semibold">
                Try again
              </Button>
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
      <Card className="trip-sheet border-none">
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

      <Button asChild className="h-12 w-full rounded-full text-base font-semibold" size="lg">
        <Link href="/user/bookings">View my bookings</Link>
      </Button>
    </div>
  );
}
