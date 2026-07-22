import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-semibold", className)}>
      <div className="relative flex size-8 items-center justify-center">
        <Image 
          src="/pujaconnect-mark.svg" 
          alt="Purohit Logo" 
          fill
          className="object-contain"
        />
      </div>
      <span className="text-lg tracking-tight">Purohit</span>
    </div>
  );
}
