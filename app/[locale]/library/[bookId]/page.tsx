import { notFound } from "next/navigation";
import { SPIRITUAL_LIBRARY } from "@/lib/library";
import { FlipBookViewer } from "@/components/gita/FlipBookViewer";
import { Link } from "@/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

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
    <div className="min-h-[calc(100vh-4rem)] bg-[#fdf6e3] dark:bg-[#0f172a] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        <div className="mb-8 flex items-center justify-between">
          <Button asChild variant="ghost" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-500 dark:hover:text-amber-400 dark:hover:bg-amber-900/50">
            <Link href="/library">
              <ArrowLeft className="size-4 mr-2" />
              {t("backToLibrary")}
            </Link>
          </Button>
        </div>

        <div className="w-full h-[80vh] min-h-[600px]">
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
