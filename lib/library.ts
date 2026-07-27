export interface BookOption {
  label: string;
  value: string;
  url: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  defaultLanguage: string;
  versions: BookOption[];
}

export const SPIRITUAL_LIBRARY: LibraryBook[] = [
  {
    id: "gita",
    title: "Srimad Bhagavad Gita",
    description: "The divine wisdom of Lord Krishna, guiding humanity through the battlefield of life with profound spiritual philosophy.",
    coverImage: "/images/gita-cover.jpg", // We can use a generic placeholder or an actual image if it exists
    defaultLanguage: "bn",
    versions: [
      { label: "Bengali (বাংলা)", value: "bn", url: "/Bhagavad-gita Bengali.pdf" },
      { label: "English", value: "en", url: "/Bhagavad-gita-English.pdf" },
      { label: "Hindi (हिन्दी)", value: "hi", url: "/Bhagavad-gita-Hindi.pdf" },
    ]
  },
  {
    id: "hanuman-chalisa",
    title: "Hanuman Chalisa",
    description: "A Hindu devotional hymn addressed to Lord Hanuman, composed by Tulsidas, invoking courage, devotion, and divine protection.",
    coverImage: "/images/hanuman-cover.jpg",
    defaultLanguage: "bn",
    versions: [
      { label: "Bengali (বাংলা)", value: "bn", url: "/HANUMAN-CHALISA-BENGALI.pdf" },
      { label: "Hindi (हिन्दी)", value: "hi", url: "/Sri_Hanuman_Chalisa_Hindi.pdf" },
    ]
  }
];
