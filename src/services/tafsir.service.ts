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
    const cacheKey = `tafsir:${tafsirName}:${surahId}:${ayahNumber}`;
    const cached = await cache.get<TafsirItem>(cacheKey);
    if (cached) return cached;

    let res: TafsirItem | null = null;

    if (db.getStatus().connected) {
      try {
        const q = await db.query<TafsirItem>(
          'SELECT surah_id, ayah_number, tafsir_name, content FROM tafsirs WHERE surah_id = $1 AND ayah_number = $2 AND tafsir_name = $3',
          [surahId, ayahNumber, tafsirName]
        );
        if (q.rows.length > 0) res = q.rows[0];
      } catch {}
    }

    if (!res) {
      res = this.tafsirs.find((t) => t.surah_id === surahId && t.ayah_number === ayahNumber && t.tafsir_name === tafsirName) || null;
    }

    if (res) {
      await cache.set(cacheKey, res, 86400);
    }
    return res;
  }
}

export const tafsirService = new TafsirService();
