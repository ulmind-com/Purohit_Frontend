"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getAstrologyMetadata } from "@/lib/api/metadata";
import { Loader2 } from "lucide-react";

function useAstrologyData() {
  return useQuery({
    queryKey: ["astrology_metadata"],
    queryFn: getAstrologyMetadata,
    staleTime: Infinity, // Data doesn't change often
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

interface GotraComboboxProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function GotraCombobox({ value, onChange, disabled }: GotraComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const { data, isLoading } = useAstrologyData();
  const gotras = data?.gotras || [];

  if (isLoading) {
    return <Button variant="outline" disabled className="w-full justify-between"><Loader2 className="h-4 w-4 animate-spin" /></Button>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {value
            ? gotras.find((gotra) => gotra === value) || value
            : "Select gotra..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search gotra..." />
          <CommandList>
            <CommandEmpty>No gotra found.</CommandEmpty>
            <CommandGroup>
              {gotras.map((gotra) => (
                <CommandItem
                  key={gotra}
                  value={gotra}
                  onSelect={(currentValue) => {
                    const original = gotras.find((g) => g.toLowerCase() === currentValue) || gotra;
                    onChange(original);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === gotra ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {gotra}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface RashiSelectProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RashiSelect({ value, onChange, disabled }: RashiSelectProps) {
  const { data, isLoading } = useAstrologyData();
  const rashis = data?.rashis || [];

  if (isLoading) {
    return <Button variant="outline" disabled className="w-full justify-between"><Loader2 className="h-4 w-4 animate-spin" /></Button>;
  }

  return (
    <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full font-normal", !value && "text-muted-foreground")}>
        <SelectValue placeholder="Select rashi..." />
      </SelectTrigger>
      <SelectContent>
        {rashis.map((rashi) => (
          <SelectItem key={rashi} value={rashi}>
            {rashi}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface NakshatraSelectProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function NakshatraSelect({ value, onChange, disabled }: NakshatraSelectProps) {
  const { data, isLoading } = useAstrologyData();
  const nakshatras = data?.nakshatras || [];

  if (isLoading) {
    return <Button variant="outline" disabled className="w-full justify-between"><Loader2 className="h-4 w-4 animate-spin" /></Button>;
  }

  return (
    <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full font-normal", !value && "text-muted-foreground")}>
        <SelectValue placeholder="Select nakshatra..." />
      </SelectTrigger>
      <SelectContent>
        {nakshatras.map((nakshatra) => (
          <SelectItem key={nakshatra} value={nakshatra}>
            {nakshatra}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
