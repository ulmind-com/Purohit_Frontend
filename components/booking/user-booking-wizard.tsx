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
import { Link } from "@/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
import { RapidoSearchingMap } from "@/components/booking/rapido-searching-map";
import { StepIndicator } from "@/components/booking/step-indicator";
import { SearchingRadar } from "@/components/booking/searching-radar";
import { CeremonySelection } from "@/components/booking/CeremonySelection";
import { SmartMuhuratCalendar } from "@/components/booking/SmartMuhuratCalendar";
import { SmartMuhuratTimePicker } from "@/components/booking/SmartMuhuratTimePicker";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";
import { CEREMONY_TYPES } from "@/lib/constants";
import { bookingWizardSchema, type BookingWizardValues } from "@/lib/validators/booking";
import { requestBooking, cancelSearch } from "@/lib/api/bookings";
import { getPurohitById } from "@/lib/api/purohits";
import { usePusherChannel } from "@/hooks/usePusherChannel";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiError } from "@/lib/api/axios";
import { fetchMyProfile } from "@/lib/api/users";
import type { BookingAcceptedEvent, Address, UserResponse } from "@/types";
import { GotraCombobox, NakshatraSelect } from "@/components/shared/astrology-inputs";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Video } from "lucide-react";

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
  const t = useTranslations("Booking");
  const [step, setStep] = useState<WizardStep>("puja");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [matchedPurohitId, setMatchedPurohitId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userProfile = useAuthStore((s) => s.profile);
  const userId = userProfile?._id;

  const { data: freshProfile } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: fetchMyProfile,
    enabled: !!userId,
  });

  const profile = (freshProfile || userProfile) as UserResponse | null;

  const form = useForm<BookingWizardValues>({
    resolver: zodResolver(bookingWizardSchema),
    mode: "onChange",
    defaultValues: {
      ceremonyType: "Puja",
      offered_dakshina: 2100,
      durationHours: 1,
      isEPuja: false,
      yajmanName: profile?.name || "",
      gotra: profile?.gotra || "",
      purpose: "",
      nakshatra: profile?.rashi || "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        ...form.getValues(),
        yajmanName: form.getValues("yajmanName") || profile.name,
        gotra: form.getValues("gotra") || profile.gotra || "",
        nakshatra: form.getValues("nakshatra") || profile.rashi || "",
      });
    }
  }, [profile, form]);

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
    const valid = await form.trigger(["ceremonyType", "offered_dakshina"]);
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

    const isEPuja = values.isEPuja ?? false;
    const sankalpDetails = isEPuja
      ? {
          yajman_name: values.yajmanName?.trim() || profile?.name || "Yajman",
          gotra: values.gotra?.trim() || profile?.gotra || "Kashyap",
          purpose: values.purpose?.trim() || `${values.ceremonyType} Sankalp`,
          nakshatra: values.nakshatra?.trim() || profile?.rashi || undefined,
        }
      : undefined;

    const preferredLang = values.preferredLanguage && values.preferredLanguage !== "ANY"
      ? (values.preferredLanguage as import("@/types").SupportedLanguage)
      : null;
    const preferredTrad = values.preferredTradition && values.preferredTradition !== "ANY"
      ? (values.preferredTradition as import("@/types").PujaTradition)
      : null;

    requestMutation.mutate({
      ceremony_type: values.ceremonyType,
      budget: values.offered_dakshina,
      scheduled_start_time: scheduledStartTime.toISOString(),
      scheduled_end_time: scheduledEndTime.toISOString(),
      is_e_puja: isEPuja,
      sankalp_details: sankalpDetails,
      preferred_language: preferredLang,
      preferred_tradition: preferredTrad,
      location: {
        type: "Point",
        coordinates: [values.location.lng, values.location.lat],
      },
    });
  }


  async function retrySearch() {
    if (bookingId) {
      try {
        setIsCancelling(true);
        await cancelSearch(bookingId);
      } catch (error) {
        toast.error("Error cancelling search. Trying to reset anyway.");
      } finally {
        setIsCancelling(false);
      }
    }
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
                  <h2 className="text-xl font-semibold">{t("selectCeremony")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("chooseRitual")}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="ceremonyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CeremonySelection value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="offered_dakshina"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offeredDakshina")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Wallet className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            min={1}
                            className="pl-9"
                            {...field}
                            onChange={(e) => {
                              const val = e.target.valueAsNumber;
                              field.onChange(isNaN(val) ? 0 : val);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* E-Puja Virtual Ceremony Option Card */}
                <div className="rounded-2xl border border-saffron-500/30 bg-gradient-to-br from-saffron-500/10 via-amber-500/5 to-transparent p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl saffron-gradient text-white shadow-md">
                        <Video className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{t("ePujaVirtual")}</h3>
                          <Badge variant="secondary" className="gap-1 bg-saffron-500/15 text-saffron-600 dark:text-saffron-400 border-none text-[10px]">
                            <Sparkles className="size-3" /> LiveKit 1-on-1 Call
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t("ePujaDesc")}
                        </p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="isEPuja"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="scale-110"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("isEPuja") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-saffron-500/20 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
                          📜 Digital Sankalp Details (For Panditji Teleprompter)
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="yajmanName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Yajman Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Rahul Sharma" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gotra"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Gotra</FormLabel>
                              <FormControl>
                                <GotraCombobox value={field.value} onChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="purpose"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Sankalp Purpose (Intention)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Family Health & Prosperity" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nakshatra"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Nakshatra (Optional)</FormLabel>
                              <FormControl>
                                <NakshatraSelect value={field.value} onChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <Button
                  type="button"
                  className="h-12 w-full rounded-full text-base font-semibold"
                  size="lg"
                  onClick={goToSchedule}
                >
                  {t("continueBtn")} <ArrowRight className="size-4" />
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
                  <div className="mb-6">
                    <SmartMuhuratCalendar
                      purpose={form.watch("ceremonyType")}
                      lat={DEFAULT_MAP_CENTER.lat}
                      lng={DEFAULT_MAP_CENTER.lng}
                      selectedDate={form.watch("date")}
                      onSelectDate={(date) => {
                        form.setValue("date", date, { shouldValidate: true });
                      }}
                    />
                  </div>

                  <div className="space-y-6">
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
                          <FormControl>
                            <SmartMuhuratTimePicker
                              selectedDate={form.watch("date") || new Date()}
                              selectedTime={field.value}
                              onSelectTime={(time) => {
                                field.onChange(time);
                                form.setValue("time", time, { shouldValidate: true });
                              }}
                            />
                          </FormControl>
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
                  <ArrowLeft className="size-4" /> {t("backBtn")}
                </Button>
                <Button
                  type="button"
                  className="h-12 flex-1 rounded-full text-base font-semibold"
                  size="lg"
                  onClick={goToLocation}
                >
                  {t("continueBtn")} <ArrowRight className="size-4" />
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
                <div className="space-y-4">
                  {profile?.saved_addresses && profile.saved_addresses.length > 0 && (
                    <div className="space-y-2">
                      <FormLabel className="text-sm font-semibold">Saved Addresses</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {profile.saved_addresses.map((addr: Address) => {
                          const isSelected = 
                            form.watch("location")?.lat === addr.location.coordinates[1] &&
                            form.watch("location")?.lng === addr.location.coordinates[0];

                          return (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={addr.address_id}>
                              <Card 
                                className={cn(
                                  "cursor-pointer transition-all border-2",
                                  isSelected 
                                    ? "border-saffron-500 bg-saffron-50/50 dark:bg-saffron-900/10 shadow-md" 
                                    : "border-border/50 hover:border-saffron-300"
                                )}
                                onClick={() => {
                                  form.setValue("location", {
                                    label: addr.tag,
                                    formattedAddress: `${addr.flat ? addr.flat + ", " : ""}${addr.area}, ${addr.city} - ${addr.pincode}`,
                                    lat: addr.location.coordinates[1],
                                    lng: addr.location.coordinates[0],
                                  }, { shouldValidate: true });
                                }}
                              >
                                <CardContent className="p-4 flex items-start gap-3">
                                  <div className={cn("p-2 rounded-full", isSelected ? "bg-saffron-100 text-saffron-600" : "bg-muted text-muted-foreground")}>
                                    <MapPin className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className={cn("font-semibold text-sm", isSelected ? "text-saffron-700 dark:text-saffron-400" : "")}>{addr.tag}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                      {addr.flat ? addr.flat + ", " : ""}{addr.area}, {addr.city} - {addr.pincode}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or pick on map</span></div>
                  </div>

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
                </div>
              </Form>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-full px-6"
                  onClick={() => setStep("schedule")}
                >
                  <ArrowLeft className="size-4" /> {t("backBtn")}
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
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
            <RapidoSearchingMap
              userLocation={{
                lat: form.getValues("location.lat"),
                lng: form.getValues("location.lng"),
                formattedAddress: form.getValues("location.formattedAddress"),
              }}
              ceremonyType={form.getValues("ceremonyType")}
              budget={form.getValues("offered_dakshina")}
              isEPuja={form.getValues("isEPuja")}
              onCancel={retrySearch}
              isCancelling={isCancelling}
            />
          </motion.div>
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
