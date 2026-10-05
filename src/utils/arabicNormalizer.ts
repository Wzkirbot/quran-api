/**
 * Utility functions for Arabic text normalization, diacritics removal,
 * and search preparation.
 */

// Arabic Tashkeel / Harakat regex (Fatha, Damma, Kasra, Sukun, Shadda, Tanween, etc.)
const ARABIC_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

// Quranic annotation signs (small high jeem, meem, salla, qala, etc.)
const QURANIC_SIGNS_REGEX = /[\u06D6-\u06E8\u06DF-\u06E4\u06EA-\u06ED]/g;

// Tatweel / Kashida
const TATWEEL_REGEX = /\u0640/g;

/**
 * Remove all diacritical marks (Tashkeel) from Arabic text
 */
export function removeTashkeel(text: string): string {
  if (!text) return '';
  return text
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(QURANIC_SIGNS_REGEX, '')
    .replace(TATWEEL_REGEX, '');
}

/**
 * Normalize Arabic text for search matching:
 * - Removes diacritics
 * - Normalizes various forms of Alef (أ, إ, آ, ٱ -> ا)
 * - Normalizes Alif Maqsura (ى -> ي)
 * - Normalizes Ta Marbuta (ة -> ه)
 * - Normalizes Hamza forms (ؤ, ئ -> ء)
 * - Removes Tatweel / Kashida
 * - Normalizes whitespace
 */
export function normalizeArabicForSearch(text: string): string {
  if (!text) return '';

  // Convert Waw carrying superscript Dagger Alef (e.g. الصلوة -> الصلاة, الزكوة -> الزكاة, الحيوة -> الحياة)
  let normalized = text.replace(/و[\u0670]/g, 'ا');

  normalized = removeTashkeel(normalized);

  // Normalize Alef forms (أ, إ, آ, ٱ, ٲ, ٳ -> ا)
  normalized = normalized.replace(/[أإآٱٲٳ]/g, 'ا');

  // Normalize Alif Maqsura to Ya
  normalized = normalized.replace(/ى/g, 'ي');

  // Normalize Ta Marbuta to Ha
  normalized = normalized.replace(/ة/g, 'ه');

  // Normalize Waw with Hamza and Ya with Hamza
  normalized = normalized.replace(/[ؤئ]/g, 'ء');

  // Collapse multiple whitespaces and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Format reference string into surah and ayah numbers
 * Accepts: "2:255", "2/255", "2-255", or integer global ayah number
 */
export function parseAyahReference(ref: string): { surahId?: number; ayahNumber?: number; globalNumber?: number } | null {
  const trimmed = ref.trim();

  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    return { globalNumber: num };
  }

  const parts = trimmed.split(/[:\/-]/);
  if (parts.length === 2) {
    const surahId = parseInt(parts[0], 10);
    const ayahNumber = parseInt(parts[1], 10);
    if (!isNaN(surahId) && !isNaN(ayahNumber)) {
      return { surahId, ayahNumber };
    }
  }

  return null;
}
