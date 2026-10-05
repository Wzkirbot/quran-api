import fs from 'node:fs';
import path from 'node:path';
import { TranslationItem } from '../types/index.js';
import { db } from '../database/connection.js';
import { cache } from '../cache/cache.service.js';

class TranslationService {
  private translations: TranslationItem[] = [];
  private translationByAyah = new Map<string, TranslationItem>();
  private translationBySurah = new Map<string, TranslationItem[]>();

  constructor() {
    this.loadLocal();
  }

  private resolveDataPath(relPath: string): string {
    const candidates = [
      path.resolve(process.cwd(), 'data', relPath),
      path.resolve(process.cwd(), '../data', relPath),
      path.resolve(process.cwd(), '../../data', relPath),
      path.resolve(process.cwd(), relPath)
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return path.resolve(process.cwd(), 'data', relPath);
  }

  private loadLocal(): void {
    try {
      const p = this.resolveDataPath('translations/en.saheeh.json');
      if (fs.existsSync(p)) {
        this.translations = JSON.parse(fs.readFileSync(p, 'utf-8'));

        this.translationByAyah.clear();
        this.translationBySurah.clear();

        for (const item of this.translations) {
          const cleanLang = item.language_code.startsWith('en') ? 'en' : item.language_code;
          const ayahKey = `${cleanLang}:${item.surah_id}:${item.ayah_number}`;
          this.translationByAyah.set(ayahKey, item);

          const surahKey = `${cleanLang}:${item.surah_id}`;
          let list = this.translationBySurah.get(surahKey);
          if (!list) {
            list = [];
            this.translationBySurah.set(surahKey, list);
          }
          list.push(item);
        }
      }
    } catch {}
  }

  public async getTranslation(surahId: number, ayahNumber: number, lang = 'en'): Promise<TranslationItem | null> {
    const cleanLang = lang.startsWith('en') ? 'en' : lang;
    const cacheKey = `trans:${cleanLang}:${surahId}:${ayahNumber}`;
    const cached = await cache.get<TranslationItem>(cacheKey);
    if (cached) return cached;

    let res: TranslationItem | null = null;

    if (db.getStatus().connected) {
      try {
        const q = await db.query<TranslationItem>(
          'SELECT surah_id, ayah_number, language_code, author_name, content FROM translations WHERE surah_id = $1 AND ayah_number = $2 AND language_code = $3',
          [surahId, ayahNumber, cleanLang]
        );
        if (q.rows.length > 0) res = q.rows[0];
      } catch {}
    }

    if (!res) {
      res = this.translationByAyah.get(`${cleanLang}:${surahId}:${ayahNumber}`) || null;
    }

    if (res) {
      await cache.set(cacheKey, res, 86400);
    }
    return res;
  }

  public async getSurahTranslation(surahId: number, lang = 'en'): Promise<TranslationItem[]> {
    const cleanLang = lang.startsWith('en') ? 'en' : lang;
    const cacheKey = `trans:${cleanLang}:surah:${surahId}`;
    const cached = await cache.get<TranslationItem[]>(cacheKey);
    if (cached) return cached;

    let res: TranslationItem[] = [];

    if (db.getStatus().connected) {
      try {
        const q = await db.query<TranslationItem>(
          'SELECT surah_id, ayah_number, language_code, author_name, content FROM translations WHERE surah_id = $1 AND language_code = $2 ORDER BY ayah_number ASC',
          [surahId, cleanLang]
        );
        res = q.rows;
      } catch {}
    }

    if (res.length === 0) {
      res = this.translationBySurah.get(`${cleanLang}:${surahId}`) || [];
    }

    if (res.length > 0) {
      await cache.set(cacheKey, res, 86400);
    }
    return res;
  }
}

export const translationService = new TranslationService();
