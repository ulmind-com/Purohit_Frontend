import { Link } from "@/navigation";
import { SPIRITUAL_LIBRARY } from "@/lib/library";
import { BookOpen, BookText } from "lucide-react";

export default function SpiritualLibraryPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fdf6e3] dark:bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif tracking-tight text-amber-900 dark:text-amber-400 sm:text-5xl">
            Spiritual Library
          </h1>
          <p className="mt-4 text-lg text-amber-800/70 dark:text-slate-400 max-w-2xl mx-auto">
            Discover and read timeless sacred texts, scriptures, and hymns. Choose a book below to start reading.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SPIRITUAL_LIBRARY.map((book) => (
            <Link 
              key={book.id} 
              href={`/library/${book.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-900/10 bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 dark:border-white/10 dark:bg-black/20"
            >
              <div className="mb-6 flex justify-center">
                <div className="relative h-48 w-32 shrink-0 overflow-hidden rounded-md shadow-md ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-105">
                  <div className="absolute inset-0 bg-amber-900/10 flex items-center justify-center">
                    <BookText className="size-12 text-amber-800/40" />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col flex-1 text-center">
                <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">
                  {book.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  {book.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-amber-900/10 dark:border-white/10 pt-4 text-sm font-medium text-amber-700 dark:text-amber-500">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="size-4" />
                  <span>Read Book</span>
                </div>
                <div className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  {book.versions.length} Languages
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
