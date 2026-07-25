"use client";

import { useTransition } from "react";
import { Globe, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English" },
  { code: "bn", name: "বাংলা" },
  { code: "hi", name: "हिन्दी" },
];

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-colors"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Globe className="h-4 w-4 text-white" />}
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-xl border-white/20">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onSelectChange(lang.code)}
            className={cn(
              "cursor-pointer font-medium hover:bg-white/10 focus:bg-white/10",
              locale === lang.code ? "text-primary" : "text-white"
            )}
          >
            <span className="flex-1">{lang.name}</span>
            {locale === lang.code && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
