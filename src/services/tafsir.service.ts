import fs from 'node:fs';
import path from 'node:path';
import { TafsirItem } from '../types/index.js';
import { db } from '../database/connection.js';
import { cache } from '../cache/cache.service.js';

class TafsirService {
  private tafsirs: TafsirItem[] = [];

  constructor() {
    this.loadLocal();
  }

  private loadLocal(): void {
    try {
      const p = path.resolve(process.cwd(), 'data/tafsir/ar.muyassar.json');
      if (fs.existsSync(p)) {
        this.tafsirs = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch {}
  }

  public async getTafsir(surahId: number, ayahNumber: number, tafsirName = 'muyassar'): Promise<TafsirItem | null> {
    const cleanName = tafsirName.replace(/^ar\./, '');
    const cacheKey = `tafsir:${cleanName}:${surahId}:${ayahNumber}`;
    const cached = await cache.get<TafsirItem>(cacheKey);
    if (cached) return cached;

    let res: TafsirItem | null = null;

    if (db.getStatus().connected) {
      try {
        const q = await db.query<TafsirItem>(
          'SELECT surah_id, ayah_number, tafsir_name, content FROM tafsirs WHERE surah_id = $1 AND ayah_number = $2 AND (tafsir_name = $3 OR tafsir_name = $4)',
          [surahId, ayahNumber, cleanName, tafsirName]
        );
        if (q.rows.length > 0) res = q.rows[0];
      } catch {}
    }

    if (!res) {
      res = this.tafsirs.find((t) => t.surah_id === surahId && t.ayah_number === ayahNumber && (t.tafsir_name === cleanName || t.tafsir_name === tafsirName)) || null;
    }

    if (res) {
      await cache.set(cacheKey, res, 86400);
    }
    return res;
  }

  public async getSurahTafsir(surahId: number, tafsirName = 'muyassar'): Promise<TafsirItem[]> {
    const cleanName = tafsirName.replace(/^ar\./, '');
    const cacheKey = `tafsir:${cleanName}:surah:${surahId}`;
    const cached = await cache.get<TafsirItem[]>(cacheKey);
    if (cached) return cached;

    let res: TafsirItem[] = [];

    if (db.getStatus().connected) {
      try {
        const q = await db.query<TafsirItem>(
          'SELECT surah_id, ayah_number, tafsir_name, content FROM tafsirs WHERE surah_id = $1 AND (tafsir_name = $2 OR tafsir_name = $3) ORDER BY ayah_number ASC',
          [surahId, cleanName, tafsirName]
        );
        res = q.rows;
      } catch {}
    }

    if (res.length === 0) {
      res = this.tafsirs.filter((t) => t.surah_id === surahId && (t.tafsir_name === cleanName || t.tafsir_name === tafsirName));
    }

    if (res.length > 0) {
      await cache.set(cacheKey, res, 86400);
    }
    return res;
  }
}

export const tafsirService = new TafsirService();
