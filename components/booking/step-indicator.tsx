import { cn } from "@/lib/utils";

const STEPS = ["Puja", "Location", "Matching", "Confirmed"];

export function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              i < step
                ? "saffron-gradient text-white"
                : i === step
                  ? "border-2 border-saffron-500 text-saffron-600 dark:text-saffron-400"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "hidden text-sm sm:inline",
              i === step ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-px w-6 sm:w-10",
                i < step ? "bg-saffron-400" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
