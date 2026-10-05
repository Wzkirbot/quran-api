/**
 * Core Domain Types and Interfaces for Quran API
 */

export type RevelationType = 'meccan' | 'medinan';

export interface Surah {
  id: number;
  name_ar: string;
  name_en: string;
  name_transliteration: string;
  type: RevelationType;
  total_ayahs: number;
  order_revelation: number;
}

export interface Ayah {
  id?: number;
  surah_id: number;
  ayah_number: number;
  global_number: number;
  text_uthmani: string;
  text_simple: string;
  juz: number;
  hizb_quarter: number;
  page: number;
  sajda: boolean;
}

export interface JuzMetadata {
  id: number;
  start: { surah: number; ayah: number };
  end: { surah: number; ayah: number };
}

export interface PageMetadata {
  page_number: number;
  surah_start: number;
  ayah_start: number;
  surah_end: number;
  ayah_end: number;
}

export interface AdhkarCategory {
  id: number;
  slug: string;
  title_ar: string;
  title_en?: string;
  description?: string;
}

export interface AdhkarItem {
  id: number;
  category_id: number;
  category_slug?: string;
  text_ar: string;
  text_simple: string;
  translation_en?: string;
  repeat_count: number;
  virtue?: string;
  reference?: string;
  audio_path?: string;
}

export interface DuaItem {
  id: number;
  category: string;
  title_ar: string;
  text_ar: string;
  text_simple: string;
  translation_en?: string;
  source: string; // e.g. "Quran [2:201]" or "Sahih Muslim"
}

export interface TafsirItem {
  surah_id: number;
  ayah_number: number;
  tafsir_name: string;
  content: string;
}

export interface TranslationItem {
  surah_id: number;
  ayah_number: number;
  language_code: string;
  author_name: string;
  content: string;
}

export interface DatasetManifest {
  dataset: string;
  version: string;
  source: string;
  license: string;
  importedAt: string;
  checksum: string;
  recordsCount: number;
  attribution: string;
}

/**
 * Standard API Response Envelopes
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
    query?: string;
    cached?: boolean;
    requestId?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId?: string;
    timestamp: string;
  };
}
