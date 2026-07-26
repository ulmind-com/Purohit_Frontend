"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Globe, Sparkles, User, Phone, Coins, Compass } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  SUPPORTED_LANGUAGES,
  PUJA_TRADITIONS,
  EXPERTISE_OPTIONS,
  type SupportedLanguage,
  type PujaTradition,
  type Expertise,
  type PurohitResponse,
} from "@/types";
import { updateMyPurohitProfile } from "@/lib/api/purohits";
import { cn } from "@/lib/utils";

// --- Zod Schema ---
export const purohitProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile_number: z.string().min(10, "Mobile number must be at least 10 digits"),
  price: z.number().gt(0, "Base price must be greater than 0"),
  service_radius_km: z.number().gt(0, "Service radius must be greater than 0"),
  expertise: z.array(z.enum(EXPERTISE_OPTIONS)).min(1, "Select at least one expertise"),
  languages: z
    .array(z.enum(SUPPORTED_LANGUAGES))
    .min(1, "Select at least one spoken language"),
  tradition: z.enum(PUJA_TRADITIONS, {
    message: "Select your followed puja tradition",
  }),
});

export type PurohitProfileFormValues = z.infer<typeof purohitProfileSchema>;

interface PurohitProfileFormProps {
  initialData?: PurohitResponse | null;
  onSuccess?: () => void;
}

// --- Custom BadgeToggleGroup for Multi-Select ---
interface BadgeToggleGroupProps {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function BadgeToggleGroup({ options, value = [], onChange }: BadgeToggleGroupProps) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      // Don't allow unchecking if it's the last selected item (min 1 rule)
      if (value.length > 1) {
        onChange(value.filter((val) => val !== option));
      } else {
        toast.warning("At least one language must remain selected");
      }
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {options.map((option) => {
        const isSelected = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleOption(option)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm",
              isSelected
                ? "saffron-gradient text-white ring-2 ring-saffron-500/50 shadow-md"
                : "border border-border bg-card text-muted-foreground hover:border-saffron-400 hover:text-foreground"
            )}
          >
            {isSelected && <Check className="size-3.5 stroke-[3]" />}
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PurohitProfileForm({ initialData, onSuccess }: PurohitProfileFormProps) {
  const form = useForm<PurohitProfileFormValues>({
    resolver: zodResolver(purohitProfileSchema),
    defaultValues: {
      name: initialData?.name || "",
      mobile_number: initialData?.mobile_number || "",
      price: initialData?.price || 1500,
      service_radius_km: (initialData as any)?.service_radius_km || 15,
      expertise: (initialData?.expertise as Expertise[]) || ["Puja"],
      languages: (initialData?.languages as SupportedLanguage[]) || ["Bengali"],
      tradition: (initialData?.tradition as PujaTradition) || "Bengali",
    },
  });

  const onSubmit = async (values: PurohitProfileFormValues) => {
    try {
      await updateMyPurohitProfile(values);
      toast.success("Profile updated successfully", {
        description: "Your language, tradition, and expertise preferences are now live.",
      });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error("Failed to update profile", {
        description: error?.message || "Please check your network connection.",
      });
    }
  };

  return (
    <Card className="rounded-3xl border bg-card/80 backdrop-blur-md shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl saffron-gradient text-white shadow-sm">
            <Globe className="size-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Purohit Profile & Culture Preferences</CardTitle>
            <CardDescription className="text-xs">
              Manage your spoken languages, Puja tradition, and service details for smart matching.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" placeholder="Pandit Ram Sharma" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input className="pl-9" placeholder="9876543210" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing & Service Radius */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Dakshina (₹)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Coins className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_radius_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Radius (KM)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Compass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Spoken Languages (Custom Multi-Select Badge Toggle) */}
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-1.5">
                    <span>Spoken Languages</span>
                    <span className="text-xs font-normal text-muted-foreground">(Select all that apply)</span>
                  </FormLabel>
                  <FormControl>
                    <BadgeToggleGroup
                      options={SUPPORTED_LANGUAGES}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Puja Tradition */}
            <FormField
              control={form.control}
              name="tradition"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Followed Sampradaya / Tradition</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your tradition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PUJA_TRADITIONS.map((tradition) => (
                        <SelectItem key={tradition} value={tradition}>
                          {tradition} Tradition
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expertise Multi-Select */}
            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-1.5">
                    <span>Ceremony Expertise</span>
                    <span className="text-xs font-normal text-muted-foreground">(Select all rituals you perform)</span>
                  </FormLabel>
                  <FormControl>
                    <BadgeToggleGroup
                      options={EXPERTISE_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12 w-full rounded-full text-base font-semibold saffron-gradient text-white shadow-md hover:shadow-lg transition-all"
            >
              {form.formState.isSubmitting ? "Saving Preferences..." : "Save Profile & Preferences"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
