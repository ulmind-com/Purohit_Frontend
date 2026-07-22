import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="saffron-gradient flex size-8 items-center justify-center rounded-xl text-lg leading-none text-white shadow-sm">
        🪔
      </span>
      <span className="text-lg tracking-tight">Purohit</span>
    </div>
  );
}
