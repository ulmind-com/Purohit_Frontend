import { SearchLayout } from "@/components/search/SearchLayout";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Search Purohits | Purohit Booking System",
  description: "Find and directly book the best verified Purohits near you.",
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background pt-12 pb-24">
      {/* We use Suspense because SearchLayout uses useSearchParams() which might suspend during SSR */}
      <Suspense 
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="size-10 animate-spin text-orange-500" />
          </div>
        }
      >
        <SearchLayout />
      </Suspense>
    </div>
  );
}
