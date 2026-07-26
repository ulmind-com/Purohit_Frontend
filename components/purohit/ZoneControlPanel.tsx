"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Trash2, MapPin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ZoneFormValues } from "./ZoneFormSchema";

export function ZoneControlPanel() {
  const { control, setValue, watch } = useFormContext<ZoneFormValues>();
  const { fields, remove } = useFieldArray({ control, name: "service_zones" });
  const zones = watch("service_zones");

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-orange-300/40 bg-orange-50/30 dark:bg-orange-950/10 p-10 text-center">
        <MapPin className="size-10 text-orange-400 animate-bounce" />
        <p className="text-sm font-medium text-muted-foreground">
          Click on the map to add your first service zone
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {fields.map((field, index) => {
        const zone = zones?.[index];
        if (!zone) return null;

        return (
          <Card
            key={field.id}
            className={cn(
              "relative overflow-hidden transition-all duration-300",
              "border-orange-200/50 dark:border-orange-800/30",
              "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
              "hover:border-orange-400/60 hover:shadow-lg hover:shadow-orange-500/10"
            )}
          >
            {/* Glowing accent bar */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-400 to-amber-500" />

            <CardContent className="p-4 pl-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-4">
                  {/* Zone name */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="shrink-0 border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300 font-mono text-xs"
                    >
                      {index + 1}
                    </Badge>
                    <Input
                      value={zone.name}
                      onChange={(e) =>
                        setValue(`service_zones.${index}.name`, e.target.value)
                      }
                      className="h-8 border-none bg-transparent px-1 text-sm font-semibold shadow-none focus-visible:ring-0"
                    />
                  </div>

                  {/* Radius slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Radius</span>
                      <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                        {zone.radius_km} km
                      </span>
                    </div>
                    <Slider
                      value={[zone.radius_km]}
                      min={1}
                      max={500}
                      step={1}
                      onValueChange={(value) =>
                        setValue(`service_zones.${index}.radius_km`, value[0])
                      }
                      className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-600 [&_.range]:bg-orange-400"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>1 km</span>
                      <span>500 km</span>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                  </p>
                </div>

                {/* Delete button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
