import { Chapter } from "@/types/gita";
import { Link } from "@/navigation";
import { BookOpen } from "lucide-react";

async function getChapters(): Promise<Chapter[]> {
  const headers = {
    'x-rapidapi-host': 'bhagavad-gita3.p.rapidapi.com',
    'x-rapidapi-key': 'ffd7d6359cmsha5a4e11f9edc048p118a83jsnc244b22c7e87',
    'Accept': 'application/json'
  };
  try {
    const res = await fetch(`https://bhagavad-gita3.p.rapidapi.com/v2/chapters/?skip=0&limit=18`, {
      headers,
      cache: 'force-cache' // Chapters don't change, safe to cache
    });
    if (!res.ok) {
      console.error("Failed to fetch chapters:", res.status);
      return [];
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function GitaChaptersPage() {
  const chapters = await getChapters();
  
  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-[#0f172a] py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-serif tracking-tight text-amber-900 dark:text-amber-400 sm:text-5xl">
          Srimad Bhagavad Gita
        </h1>
        <p className="mt-4 text-lg text-amber-800/70 dark:text-slate-400">
          Explore all 18 chapters of divine wisdom.
        </p>
      </div>
      
      <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter) => (
          <Link 
            key={chapter.id} 
            href={`/gita/read/${chapter.chapter_number}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-900/10 bg-white/40 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 dark:border-white/10 dark:bg-black/20"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-wider text-amber-600 dark:text-amber-500 uppercase">
                  Chapter {chapter.chapter_number}
                </span>
                <BookOpen className="size-4 text-amber-900/40 transition-colors group-hover:text-amber-500 dark:text-amber-100/30" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-200">
                {chapter.name_translated}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {chapter.name_meaning}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-amber-900/10 dark:border-white/10 pt-4 text-sm text-slate-500">
              <span className="font-serif text-amber-800 dark:text-amber-400/80">{chapter.name}</span>
              <span>{chapter.verses_count} Verses</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
