import fs from 'node:fs';
import path from 'node:path';
import { TranslationItem } from '../types/index.js';
import { db } from '../database/connection.js';
import { cache } from '../cache/cache.service.js';

class TranslationService {
  private translations: TranslationItem[] = [];

  constructor() {
    this.loadLocal();
  }

  private loadLocal(): void {
    try {
      const p = path.resolve(process.cwd(), 'data/translations/en.saheeh.json');
      if (fs.existsSync(p)) {
        this.translations = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch {}
  }

  public async getTranslation(surahId: number, ayahNumber: number, lang = 'en'): Promise<TranslationItem | null> {
    const cacheKey = `trans:${lang}:${surahId}:${ayahNumber}`;
    const cached = await cache.get<TranslationItem>(cacheKey);
    if (cached) return cached;

    let res: TranslationItem | null = null;

    if (db.getStatus().connected) {
      try {
        const q = await db.query<TranslationItem>(
          'SELECT surah_id, ayah_number, language_code, author_name, content FROM translations WHERE surah_id = $1 AND ayah_number = $2 AND language_code = $3',
          [surahId, ayahNumber, lang]
        );
        if (q.rows.length > 0) res = q.rows[0];
      } catch {}
    }

    if (!res) {
      res = this.translations.find((t) => t.surah_id === surahId && t.ayah_number === ayahNumber && t.language_code === lang) || null;
    }

    if (res) {
      await cache.set(cacheKey, res, 86400);
    }
    return res;
  }
}

export const translationService = new TranslationService();
