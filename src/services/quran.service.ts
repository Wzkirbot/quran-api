import fs from 'node:fs';
import path from 'node:path';
import { Surah, Ayah, JuzMetadata, PageMetadata } from '../types/index.js';
import { db } from '../database/connection.js';
import { cache } from '../cache/cache.service.js';
import { config } from '../config/env.js';
import { normalizeArabicForSearch, parseAyahReference } from '../utils/arabicNormalizer.js';
import { logger } from '../utils/logger.js';

class QuranService {
  // In-memory local authoritative datasets (loaded once at startup)
  private surahs: Surah[] = [];
  private ayahs: Ayah[] = [];
  private juzList: JuzMetadata[] = [];
  private pagesList: PageMetadata[] = [];
  private isDataLoaded = false;

  constructor() {
    this.loadLocalDatasets();
  }

  private loadLocalDatasets(): void {
    try {
      const dataDir = path.resolve(process.cwd(), 'data');
      const surahsPath = path.join(dataDir, 'quran/surahs.json');
      const ayahsPath = path.join(dataDir, 'quran/ayahs.json');
      const juzPath = path.join(dataDir, 'metadata/juz.json');
      const pagesPath = path.join(dataDir, 'metadata/pages.json');

      if (fs.existsSync(surahsPath)) {
        this.surahs = JSON.parse(fs.readFileSync(surahsPath, 'utf-8'));
      }
      if (fs.existsSync(ayahsPath)) {
        this.ayahs = JSON.parse(fs.readFileSync(ayahsPath, 'utf-8'));
      }
      if (fs.existsSync(juzPath)) {
        this.juzList = JSON.parse(fs.readFileSync(juzPath, 'utf-8'));
      }
      if (fs.existsSync(pagesPath)) {
        this.pagesList = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));
      }

      this.isDataLoaded = this.surahs.length === 114 && this.ayahs.length === 6236;
      logger.info(`Loaded local Quran datasets: ${this.surahs.length} surahs, ${this.ayahs.length} ayahs.`);
    } catch (err: any) {
      logger.error(`Error loading local Quran datasets: ${err.message}`);
    }
  }

  public async getSurahs(): Promise<Surah[]> {
    const cacheKey = 'quran:surahs:all';
    const cached = await cache.get<Surah[]>(cacheKey);
    if (cached) return cached;

    let result: Surah[] = [];

    // Try PostgreSQL first if connected
    if (db.getStatus().connected) {
      try {
        const queryRes = await db.query<Surah>(
          'SELECT id, name_ar, name_en, name_transliteration, type, total_ayahs, order_revelation FROM surahs ORDER BY id ASC'
        );
        if (queryRes.rows.length === 114) {
          result = queryRes.rows;
        }
      } catch (err: any) {
        logger.debug(`PostgreSQL getSurahs fallback to memory: ${err.message}`);
      }
    }

    if (result.length === 0) {
      result = this.surahs;
    }

    await cache.set(cacheKey, result, config.cache.ttlSurahs);
    return result;
  }

  public async getSurahById(id: number): Promise<Surah | null> {
    const cacheKey = `quran:surah:${id}`;
    const cached = await cache.get<Surah>(cacheKey);
    if (cached) return cached;

    if (id < 1 || id > 114) return null;

    let surah: Surah | null = null;

    if (db.getStatus().connected) {
      try {
        const queryRes = await db.query<Surah>(
          'SELECT id, name_ar, name_en, name_transliteration, type, total_ayahs, order_revelation FROM surahs WHERE id = $1',
          [id]
        );
        if (queryRes.rows.length > 0) {
          surah = queryRes.rows[0];
        }
      } catch (err: any) {
        logger.debug(`PostgreSQL getSurahById fallback to memory: ${err.message}`);
      }
    }

    if (!surah) {
      surah = this.surahs.find((s) => s.id === id) || null;
    }

    if (surah) {
      await cache.set(cacheKey, surah, config.cache.ttlSurahs);
    }

    return surah;
  }

  public async getSurahAyahs(
    surahId: number,
    page = 1,
    limit = 50
  ): Promise<{ surah: Surah; ayahs: Ayah[]; total: number; page: number; limit: number }> {
    const surah = await this.getSurahById(surahId);
    if (!surah) {
      throw new Error(`Surah with ID ${surahId} not found.`);
    }

    const safeLimit = Math.min(Math.max(limit, 1), 300);
    const safePage = Math.max(page, 1);
    const offset = (safePage - 1) * safeLimit;

    const cacheKey = `quran:surah:${surahId}:ayahs:p${safePage}:l${safeLimit}`;
    const cached = await cache.get<{ surah: Surah; ayahs: Ayah[]; total: number; page: number; limit: number }>(cacheKey);
    if (cached) return cached;

    let ayahsResult: Ayah[] = [];
    let total = surah.total_ayahs;

    if (db.getStatus().connected) {
      try {
        const queryRes = await db.query<Ayah>(
          `SELECT surah_id, ayah_number, global_number, text_uthmani, text_simple, juz, hizb_quarter, page, sajda
           FROM ayahs WHERE surah_id = $1
           ORDER BY ayah_number ASC
           LIMIT $2 OFFSET $3`,
          [surahId, safeLimit, offset]
        );
        ayahsResult = queryRes.rows;
      } catch (err: any) {
        logger.debug(`PostgreSQL getSurahAyahs fallback to memory: ${err.message}`);
      }
    }

    if (ayahsResult.length === 0) {
      const allSurahAyahs = this.ayahs.filter((a) => a.surah_id === surahId);
      total = allSurahAyahs.length;
      ayahsResult = allSurahAyahs.slice(offset, offset + safeLimit);
    }

    const res = { surah, ayahs: ayahsResult, total, page: safePage, limit: safeLimit };
    await cache.set(cacheKey, res, config.cache.ttlDefault);
    return res;
  }

  public async getAyahByReference(ref: string): Promise<Ayah | null> {
    const parsed = parseAyahReference(ref);
    if (!parsed) return null;

    const cacheKey = `quran:ayah:ref:${ref}`;
    const cached = await cache.get<Ayah>(cacheKey);
    if (cached) return cached;

    let ayah: Ayah | null = null;

    if (db.getStatus().connected) {
      try {
        if (parsed.globalNumber) {
          const res = await db.query<Ayah>(
            `SELECT surah_id, ayah_number, global_number, text_uthmani, text_simple, juz, hizb_quarter, page, sajda
             FROM ayahs WHERE global_number = $1`,
            [parsed.globalNumber]
          );
          if (res.rows.length > 0) ayah = res.rows[0];
        } else if (parsed.surahId && parsed.ayahNumber) {
          const res = await db.query<Ayah>(
            `SELECT surah_id, ayah_number, global_number, text_uthmani, text_simple, juz, hizb_quarter, page, sajda
             FROM ayahs WHERE surah_id = $1 AND ayah_number = $2`,
            [parsed.surahId, parsed.ayahNumber]
          );
          if (res.rows.length > 0) ayah = res.rows[0];
        }
      } catch (err: any) {
        logger.debug(`PostgreSQL getAyahByReference fallback to memory: ${err.message}`);
      }
    }

    if (!ayah) {
      if (parsed.globalNumber) {
        ayah = this.ayahs.find((a) => a.global_number === parsed.globalNumber) || null;
      } else if (parsed.surahId && parsed.ayahNumber) {
        ayah = this.ayahs.find((a) => a.surah_id === parsed.surahId && a.ayah_number === parsed.ayahNumber) || null;
      }
    }

    if (ayah) {
      await cache.set(cacheKey, ayah, config.cache.ttlDefault);
    }

    return ayah;
  }

  public async getRandomAyah(): Promise<Ayah> {
    const randomGlobalNumber = Math.floor(Math.random() * 6236) + 1;
    const ayah = await this.getAyahByReference(String(randomGlobalNumber));
    if (!ayah) {
      // Fallback
      return this.ayahs[randomGlobalNumber - 1];
    }
    return ayah;
  }

  public async getJuzList(): Promise<JuzMetadata[]> {
    return this.juzList;
  }

  public async getJuzAyahs(
    juzId: number,
    page = 1,
    limit = 50
  ): Promise<{ juz: number; ayahs: Ayah[]; total: number; page: number; limit: number }> {
    if (juzId < 1 || juzId > 30) {
      throw new Error('Juz number must be between 1 and 30.');
    }

    const safeLimit = Math.min(Math.max(limit, 1), 300);
    const safePage = Math.max(page, 1);
    const offset = (safePage - 1) * safeLimit;

    let ayahsResult: Ayah[] = [];
    let total = 0;

    if (db.getStatus().connected) {
      try {
        const countRes = await db.query<{ count: string }>('SELECT COUNT(*) FROM ayahs WHERE juz = $1', [juzId]);
        total = parseInt(countRes.rows[0].count, 10);

        const queryRes = await db.query<Ayah>(
          `SELECT surah_id, ayah_number, global_number, text_uthmani, text_simple, juz, hizb_quarter, page, sajda
           FROM ayahs WHERE juz = $1
           ORDER BY global_number ASC
           LIMIT $2 OFFSET $3`,
          [juzId, safeLimit, offset]
        );
        ayahsResult = queryRes.rows;
      } catch (err: any) {
        logger.debug(`PostgreSQL getJuzAyahs fallback to memory: ${err.message}`);
      }
    }

    if (ayahsResult.length === 0) {
      const allJuzAyahs = this.ayahs.filter((a) => a.juz === juzId);
      total = allJuzAyahs.length;
      ayahsResult = allJuzAyahs.slice(offset, offset + safeLimit);
    }

    return { juz: juzId, ayahs: ayahsResult, total, page: safePage, limit: safeLimit };
  }

  public async getPageAyahs(pageNumber: number): Promise<{ page: number; ayahs: Ayah[]; total: number }> {
    if (pageNumber < 1 || pageNumber > 604) {
      throw new Error('Page number must be between 1 and 604.');
    }

    const cacheKey = `quran:page:${pageNumber}`;
    const cached = await cache.get<{ page: number; ayahs: Ayah[]; total: number }>(cacheKey);
    if (cached) return cached;

    let ayahsResult: Ayah[] = [];

    if (db.getStatus().connected) {
      try {
        const queryRes = await db.query<Ayah>(
          `SELECT surah_id, ayah_number, global_number, text_uthmani, text_simple, juz, hizb_quarter, page, sajda
           FROM ayahs WHERE page = $1
           ORDER BY global_number ASC`,
          [pageNumber]
        );
        ayahsResult = queryRes.rows;
      } catch (err: any) {
        logger.debug(`PostgreSQL getPageAyahs fallback to memory: ${err.message}`);
      }
    }

    if (ayahsResult.length === 0) {
      ayahsResult = this.ayahs.filter((a) => a.page === pageNumber);
    }

    const res = { page: pageNumber, ayahs: ayahsResult, total: ayahsResult.length };
    await cache.set(cacheKey, res, config.cache.ttlDefault);
    return res;
  }

  public async search(
    queryStr: string,
    options: { surahId?: number; juzId?: number; page?: number; limit?: number } = {}
  ): Promise<{ query: string; ayahs: Ayah[]; total: number; page: number; limit: number }> {
    const rawQuery = (queryStr || '').trim();
    if (rawQuery.length < 2) {
      throw new Error('Search query must be at least 2 characters long.');
    }

    const normalizedQuery = normalizeArabicForSearch(rawQuery);
    const safeLimit = Math.min(Math.max(options.limit || 20, 1), 100);
    const safePage = Math.max(options.page || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const cacheKey = `quran:search:${normalizedQuery}:s${options.surahId || 0}:j${options.juzId || 0}:p${safePage}:l${safeLimit}`;
    const cached = await cache.get<{ query: string; ayahs: Ayah[]; total: number; page: number; limit: number }>(cacheKey);
    if (cached) return cached;

    let matchedAyahs: Ayah[] = [];
    let totalCount = 0;

    if (db.getStatus().connected) {
      try {
        const whereClauses: string[] = ['text_simple ILIKE $1'];
        const params: any[] = [`%${normalizedQuery}%`];

        if (options.surahId) {
          params.push(options.surahId);
          whereClauses.push(`surah_id = $${params.length}`);
        }
        if (options.juzId) {
          params.push(options.juzId);
          whereClauses.push(`juz = $${params.length}`);
        }

        const whereSql = whereClauses.join(' AND ');

        // Count total matches
        const countRes = await db.query<{ count: string }>(`SELECT COUNT(*) FROM ayahs WHERE ${whereSql}`, params);
        totalCount = parseInt(countRes.rows[0].count, 10);

        // Fetch paginated results
        params.push(safeLimit);
        params.push(offset);
        const queryRes = await db.query<Ayah>(
          `SELECT surah_id, ayah_number, global_number, text_uthmani, text_simple, juz, hizb_quarter, page, sajda
           FROM ayahs WHERE ${whereSql}
           ORDER BY global_number ASC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );
        matchedAyahs = queryRes.rows;
      } catch (err: any) {
        logger.debug(`PostgreSQL search fallback to memory: ${err.message}`);
      }
    }

    if (matchedAyahs.length === 0 && totalCount === 0) {
      let filtered = this.ayahs.filter((a) => a.text_simple.includes(normalizedQuery));

      if (options.surahId) {
        filtered = filtered.filter((a) => a.surah_id === options.surahId);
      }
      if (options.juzId) {
        filtered = filtered.filter((a) => a.juz === options.juzId);
      }

      totalCount = filtered.length;
      matchedAyahs = filtered.slice(offset, offset + safeLimit);
    }

    const result = {
      query: rawQuery,
      ayahs: matchedAyahs,
      total: totalCount,
      page: safePage,
      limit: safeLimit
    };

    await cache.set(cacheKey, result, config.cache.ttlSearch);
    return result;
  }

  public getPagesList(): PageMetadata[] {
    return this.pagesList;
  }

  public isReady(): boolean {
    return this.isDataLoaded;
  }
}

export const quranService = new QuranService();
