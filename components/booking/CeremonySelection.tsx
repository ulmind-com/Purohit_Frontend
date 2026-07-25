"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Search, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { getCeremonies, addCeremony, type Ceremony } from "@/lib/api/ceremonies";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CeremonySelectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function CeremonySelection({ value, onChange }: CeremonySelectionProps) {
  const t = useTranslations("Booking");
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { data: ceremonies = [], isLoading } = useQuery({
    queryKey: ["ceremonies"],
    queryFn: getCeremonies,
  });

  const { mutate: handleAddCeremony, isPending: isAdding } = useMutation({
    mutationFn: addCeremony,
    onMutate: async (newCeremonyName) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["ceremonies"] });

      // Snapshot the previous value
      const previousCeremonies = queryClient.getQueryData<Ceremony[]>(["ceremonies"]);

      // Optimistically update to the new value
      const optimisticCeremony: Ceremony = {
        _id: `temp-${Date.now()}`,
        name: newCeremonyName,
        normalized_name: newCeremonyName.toLowerCase().replace(/[^a-z0-9]/g, ""),
        popularity_score: 1,
        is_user_added: true,
      };

      queryClient.setQueryData<Ceremony[]>(["ceremonies"], (old) => {
        return old ? [optimisticCeremony, ...old] : [optimisticCeremony];
      });

      // Optimistically select the newly created one
      onChange(newCeremonyName);
      setOpen(false);
      setInputValue("");
      
      toast.success(`"${newCeremonyName}" added as a custom ceremony!`);

      return { previousCeremonies };
    },
    onError: (err, newCeremonyName, context) => {
      // Rollback to previous state on error
      if (context?.previousCeremonies) {
        queryClient.setQueryData(["ceremonies"], context.previousCeremonies);
      }
      toast.error("Failed to add custom ceremony. Please try again.");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["ceremonies"] });
    },
  });

  const handleSelect = (ceremonyName: string) => {
    onChange(ceremonyName);
    setOpen(false);
  };

  const handleCreate = (ceremonyName: string) => {
    if (!ceremonyName.trim()) return;
    handleAddCeremony(ceremonyName.trim());
  };

  const trendingCeremonies = ceremonies.slice(0, 6);
  
  // Check if current input exists in the list (case-insensitive exact match)
  const isExactMatch = ceremonies.some(
    (c) => c.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  return (
    <div className="space-y-4">
      {/* Quick Select Trending Buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[54px] animate-pulse rounded-2xl bg-muted" />
          ))}
          
        {!isLoading &&
          trendingCeremonies.map((ceremony) => {
            const selected = value === ceremony.name;
            return (
              <button
                key={ceremony._id}
                type="button"
                onClick={() => onChange(ceremony.name)}
                className={cn(
                  "relative flex items-center justify-between overflow-hidden rounded-2xl border p-3.5 text-left text-sm font-medium transition-all hover:border-saffron-400 hover:shadow-sm",
                  selected
                    ? "glass border-saffron-500 bg-saffron-50/70 text-saffron-900 shadow-sm dark:bg-saffron-950/30 dark:text-saffron-100"
                    : "border-border bg-card"
                )}
              >
                <span className="truncate pr-4">{ceremony.name}</span>
                {selected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="saffron-gradient absolute right-2 flex size-5 items-center justify-center rounded-full text-white shadow-sm"
                  >
                    <Check className="size-3.5" />
                  </motion.span>
                )}
              </button>
            );
          })}
      </div>

      {/* Advanced Selection & Custom Addition */}
      <div className="pt-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-12 w-full justify-between rounded-xl bg-card hover:bg-card/90"
            >
              <div className="flex items-center gap-2">
                <Search className="size-4 text-muted-foreground" />
                <span className={cn("truncate", !value && "text-muted-foreground")}>
                  {value || t("searchOrType")}
                </span>
              </div>
              <ChevronDown className="size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-xl rounded-xl" align="start">
            <Command
              shouldFilter={false} // We handle filtering via command input value internally
            >
              <CommandInput 
                placeholder={t("searchCeremonies")} 
                value={inputValue}
                onValueChange={setInputValue}
              />
              <CommandList>
                {/* Standard List */}
                <CommandGroup heading={t("suggestions")}>
                  {ceremonies
                    .filter(c => c.name.toLowerCase().includes(inputValue.toLowerCase()))
                    .map((ceremony) => (
                      <CommandItem
                        key={ceremony._id}
                        value={ceremony.name}
                        onSelect={() => handleSelect(ceremony.name)}
                        className="flex items-center justify-between py-2.5"
                      >
                        {ceremony.name}
                        {value === ceremony.name && (
                          <Check className="size-4 text-saffron-500" />
                        )}
                      </CommandItem>
                    ))}
                  
                  {ceremonies.filter(c => c.name.toLowerCase().includes(inputValue.toLowerCase())).length === 0 && !inputValue && (
                    <CommandEmpty>{t("noCeremoniesFound")}</CommandEmpty>
                  )}
                </CommandGroup>

                {/* Custom Addition Option */}
                {inputValue.trim().length > 0 && !isExactMatch && (
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => handleCreate(inputValue)}
                      className="flex cursor-pointer items-center gap-2 text-saffron-600 focus:bg-saffron-50 focus:text-saffron-700 py-3"
                    >
                      {isAdding ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      <span className="font-medium">
                        {t("addNewCeremony", { name: inputValue.trim() })}
                      </span>
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
