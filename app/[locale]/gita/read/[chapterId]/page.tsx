import { AnimatedReader } from "@/components/gita/AnimatedReader";
import { Verse, Chapter } from "@/types/gita";

interface GitaReadPageProps {
  params: Promise<{
    locale: string;
    chapterId: string;
  }>;
}

// Fetch data from RapidAPI
async function getChapterVerses(chapterId: string): Promise<{ chapter: Chapter; verses: Verse[] }> {
  const headers = {
    'x-rapidapi-host': 'bhagavad-gita3.p.rapidapi.com',
    'x-rapidapi-key': 'ffd7d6359cmsha5a4e11f9edc048p118a83jsnc244b22c7e87',
  };

  try {
    const chapterRes = await fetch(`https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${chapterId}/`, { 
      headers,
      cache: 'no-store'
    });
    const chapterData = await chapterRes.json();

    const versesRes = await fetch(`https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${chapterId}/verses/`, {
      headers,
      cache: 'no-store'
    });
    const versesData = await versesRes.json();

    if (!Array.isArray(versesData)) {
      console.error("RapidAPI returned invalid verses data. Status:", versesRes.status, versesData);
      return { chapter: chapterData, verses: [] };
    }

    const verses: Verse[] = versesData.map((v: any) => {
      // Find the first english translation, preferably by Swami Adidevananda or just any english one
      const englishTranslation = v.translations?.find((t: any) => t.language === "english");
      
      return {
        id: v.id,
        sloka: v.text,
        transliteration: v.transliteration,
        meaning: englishTranslation ? englishTranslation.description : "Translation not available.",
        audio_url: undefined // RapidAPI doesn't provide audio for these endpoints by default
      };
    });

    return { chapter: chapterData, verses };
  } catch (error) {
    console.error("Error fetching Gita data:", error);
    // Return empty fallback if API fails
    return {
      chapter: {
        id: parseInt(chapterId),
        name: "Error",
        name_transliterated: "Error",
        name_translated: "Error",
        verses_count: 0,
        chapter_number: parseInt(chapterId),
        name_meaning: "Error",
        chapter_summary: "Failed to load chapter data."
      },
      verses: []
    };
  }
}

export default async function GitaReadPage({ params }: GitaReadPageProps) {
  const resolvedParams = await params;
  const { chapter, verses } = await getChapterVerses(resolvedParams.chapterId);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col bg-background">
      <AnimatedReader 
        verses={verses} 
        chapterName={`Chapter ${chapter.chapter_number}: ${chapter.name_transliterated}`} 
        chapterId={parseInt(resolvedParams.chapterId)}
      />
    </div>
  );
}
