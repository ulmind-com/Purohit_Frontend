import { notFound } from "next/navigation";
import { SPIRITUAL_LIBRARY } from "@/lib/library";
import { FlipBookViewer } from "@/components/gita/FlipBookViewer";
import { Link } from "@/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

interface LibraryBookPageProps {
  params: {
    bookId: string;
    locale: string;
  };
}

export default async function LibraryBookPage({ params }: LibraryBookPageProps) {
  const unwrappedParams = await params;
  const book = SPIRITUAL_LIBRARY.find((b) => b.id === unwrappedParams.bookId);
  const t = await getTranslations({ locale: unwrappedParams.locale, namespace: "Library" });
  const tBooks = await getTranslations({ locale: unwrappedParams.locale, namespace: "LibraryBooks" });

  if (!book) {
    notFound();
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      {/* Ambient glowing background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-600/20 rounded-full blur-[128px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-700/20 rounded-full blur-[128px] opacity-40 mix-blend-screen pointer-events-none" />
      
      {/* Background Image of Cover (Blurred highly for ambient theme) */}
      {book.coverImage && (
        <div className="absolute inset-0 z-0 opacity-10 blur-3xl saturate-200">
          <Image src={book.coverImage} alt="background" fill className="object-cover" />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 flex flex-col">
        
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" className="text-amber-100 hover:text-amber-50 hover:bg-amber-900/30 backdrop-blur-md border border-white/10 rounded-full px-6 transition-all shadow-lg">
            <Link href="/library">
              <ArrowLeft className="size-4 mr-2" />
              {t("backToLibrary")}
            </Link>
          </Button>
        </div>

        <div className="w-full flex-1 min-h-[600px] flex">
          <FlipBookViewer 
            title={tBooks(`${book.id}.title`)}
            books={book.versions} 
            defaultBook={book.defaultLanguage}
            audioUrl={book.audioUrl}
          />
        </div>
        
      </div>
    </div>
  );
}
