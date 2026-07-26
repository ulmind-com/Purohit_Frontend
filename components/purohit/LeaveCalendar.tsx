"use client";

import { useFormContext } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarOff } from "lucide-react";
import { isBefore, startOfDay } from "date-fns";

export function LeaveCalendar() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="blocked_dates"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarOff className="size-5 text-destructive" />
                <FormLabel className="text-lg font-semibold">Leave & Unavailable Dates</FormLabel>
              </div>
              <FormDescription className="text-base">
                Select the dates when you will be unavailable for any Pujas. 
                Our matching engine will automatically hide your profile for requests on these dates.
              </FormDescription>
            </div>
            
            <div className="flex justify-center rounded-lg border bg-card p-4 shadow-sm md:justify-start">
              <FormControl>
                <Calendar
                  mode="multiple"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => isBefore(date, startOfDay(new Date()))}
                  className="rounded-md border bg-background"
                  classNames={{
                    selected:
                      "bg-destructive text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground",
                  }}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
