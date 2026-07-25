import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const STEPS = ["step_puja", "step_schedule", "step_location", "step_matching", "step_confirmed"];

export function StepIndicator({ step }: { step: number }) {
  const t = useTranslations("Booking");
  const progressPct = STEPS.length > 1 ? (step / (STEPS.length - 1)) * 100 : 0;

  return (
    <div className="mx-auto mb-8 max-w-2xl">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span className="text-foreground">{t(STEPS[step] ?? STEPS[STEPS.length - 1])}</span>
        <span>
          {t("step_of", { current: Math.min(step + 1, STEPS.length), total: STEPS.length })}
        </span>
      </div>
      <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="saffron-gradient h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="mt-2 hidden justify-between sm:flex">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={cn(
              "text-[11px]",
              i <= step ? "font-medium text-foreground" : "text-muted-foreground"
            )}
          >
            {t(label)}
          </span>
        ))}
      </div>
    </div>
  );
}
