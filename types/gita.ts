export interface Verse {
  id: string | number;
  sloka: string;
  transliteration: string;
  meaning: string;
  audio_url?: string;
}

export interface Chapter {
  id: number;
  name: string;
  name_transliterated: string;
  name_translated: string;
  verses_count: number;
  chapter_number: number;
  name_meaning: string;
  chapter_summary: string;
}
