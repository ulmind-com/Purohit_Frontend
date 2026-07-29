import { MOCK_TEMPLES } from "@/types/darshan";
import { Link } from "@/navigation";
import Image from "next/image";

export default function DarshanIndexPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black/90 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Virtual Darshan
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Experience divine presence from anywhere in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_TEMPLES.map((temple) => (
            <Link 
              key={temple.id} 
              href={`/darshan/${temple.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-white/5 shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={temple.deity_image_url}
                  alt={temple.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm shadow-sm">
                    {temple.type === 'SATI_PITH' ? 'Shakti Peeth' : 'Popular Temple'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {temple.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {temple.description}
                </p>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {temple.location}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
