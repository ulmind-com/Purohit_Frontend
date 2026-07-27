import { Link } from "@/navigation";
import { SPIRITUAL_LIBRARY } from "@/lib/library";
import { BookOpen, BookText } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function SpiritualLibraryPage() {
  const t = useTranslations("Library");
  const tBooks = useTranslations("LibraryBooks");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fdf6e3] dark:bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif tracking-tight text-amber-900 dark:text-amber-400 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-amber-800/70 dark:text-slate-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SPIRITUAL_LIBRARY.map((book) => (
            <Link 
              key={book.id} 
              href={`/library/${book.id}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-amber-900/5 dark:border-white/5 bg-white/10 dark:bg-black/10 shadow-lg backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20"
            >
              {/* Image Section */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.id}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookText className="size-12 text-amber-800/40" />
                    </div>
                  )}
                  {/* Subtle inner shadow / overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Floating pill for languages inside the image */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="text-[10px] uppercase tracking-wider font-semibold px-3 py-1 bg-black/40 text-white backdrop-blur-md rounded-full border border-white/20">
                      {t("languages", { count: book.versions.length })}
                    </div>
                  </div>
              </div>
              
              {/* Content Section */}
              <div className="flex flex-col flex-1 p-6 text-left relative z-10 bg-white dark:bg-slate-900 transition-colors duration-500">
                <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {tBooks(`${book.id}.title`)}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {tBooks(`${book.id}.description`)}
                </p>
                
                {/* Footer Action */}
                <div className="mt-6 flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-500 opacity-90 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                    <BookOpen className="size-4" />
                    <span className="text-sm">{t("readBook")}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
