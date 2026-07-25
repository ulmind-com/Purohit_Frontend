"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api/axios";
import { EXPERTISE_OPTIONS } from "@/types";

interface DirectBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  purohitId: string;
  purohitName: string;
}

export function DirectBookModal({ isOpen, onClose, purohitId, purohitName }: DirectBookModalProps) {
  const [date, setDate] = useState<Date>();
  const [ceremonyType, setCeremonyType] = useState<string>("");
  const [time, setTime] = useState<string>("09:00");
  const [address, setAddress] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!date || !ceremonyType || !time || !address) {
        throw new Error("Please fill all required fields");
      }
      
      const [hours, minutes] = time.split(":");
      const scheduledStart = new Date(date);
      scheduledStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const scheduledEnd = new Date(scheduledStart);
      scheduledEnd.setHours(scheduledEnd.getHours() + 2); // Assume 2 hours

      const payload = {
        purohit_id: purohitId,
        ceremony_type: ceremonyType,
        scheduled_start_time: scheduledStart.toISOString(),
        scheduled_end_time: scheduledEnd.toISOString(),
        location: address,
        is_e_puja: false, // Could be added to form
      };

      const res = await api.post("/bookings/direct", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Booking request sent!", {
        description: `We have notified ${purohitName}. You will be updated once they accept.`,
      });
      onClose();
    },
    onError: (err: any) => {
      toast.error("Failed to send booking request", {
        description: err.response?.data?.detail || err.message,
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Direct Booking Request</DialogTitle>
          <DialogDescription>
            Send a direct request to {purohitName}. They will have 15 minutes to accept your booking.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ceremony">Ceremony Type</Label>
            <Select onValueChange={setCeremonyType}>
              <SelectTrigger>
                <SelectValue placeholder="Select ceremony" />
              </SelectTrigger>
              <SelectContent>
                {EXPERTISE_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="time">Time</Label>
            <Input 
              id="time" 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Full Address</Label>
            <Input 
              id="address" 
              placeholder="e.g. 123 Main St, Kolkata" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
