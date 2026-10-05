import fs from 'node:fs';
import path from 'node:path';
import { AdhkarCategory, AdhkarItem, DuaItem } from '../types/index.js';
import { db } from '../database/connection.js';
import { cache } from '../cache/cache.service.js';
import { normalizeArabicForSearch } from '../utils/arabicNormalizer.js';
import { logger } from '../utils/logger.js';

class AdhkarService {
  private categories: AdhkarCategory[] = [];
  private adhkar: AdhkarItem[] = [];
  private duas: DuaItem[] = [];

  constructor() {
    this.loadLocalDatasets();
  }

  private loadLocalDatasets(): void {
    try {
      const dataDir = path.resolve(process.cwd(), 'data');
      const categoriesPath = path.join(dataDir, 'adhkar/categories.json');
      const adhkarPath = path.join(dataDir, 'adhkar/adhkar.json');
      const duasPath = path.join(dataDir, 'dua/duas.json');

      if (fs.existsSync(categoriesPath)) {
        this.categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
      }
      if (fs.existsSync(adhkarPath)) {
        this.adhkar = JSON.parse(fs.readFileSync(adhkarPath, 'utf-8'));
      }
      if (fs.existsSync(duasPath)) {
        this.duas = JSON.parse(fs.readFileSync(duasPath, 'utf-8'));
      }

      logger.info(`Loaded local Adhkar: ${this.categories.length} categories, ${this.adhkar.length} items, ${this.duas.length} duas.`);
    } catch (err: any) {
      logger.error(`Error loading local Adhkar datasets: ${err.message}`);
    }
  }

  public async getCategories(): Promise<AdhkarCategory[]> {
    const cacheKey = 'adhkar:categories:all';
    const cached = await cache.get<AdhkarCategory[]>(cacheKey);
    if (cached) return cached;

    let result: AdhkarCategory[] = [];

    if (db.getStatus().connected) {
      try {
        const queryRes = await db.query<AdhkarCategory>('SELECT id, slug, title_ar, title_en, description FROM adhkar_categories ORDER BY id ASC');
        if (queryRes.rows.length > 0) result = queryRes.rows;
      } catch (err: any) {
        logger.debug(`PostgreSQL getCategories fallback: ${err.message}`);
      }
    }

    if (result.length === 0) {
      result = this.categories;
    }

    await cache.set(cacheKey, result, 86400);
    return result;
  }

  public async getCategoryBySlug(slug: string): Promise<AdhkarCategory | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.slug === slug.toLowerCase()) || null;
  }

  public async getAdhkarByCategory(
    categorySlugOrId: string | number
  ): Promise<{ category: AdhkarCategory; items: AdhkarItem[]; total: number }> {
    const categories = await this.getCategories();
    const category = categories.find((c) =>
      typeof categorySlugOrId === 'number' ? c.id === categorySlugOrId : c.slug === String(categorySlugOrId).toLowerCase()
    );

    if (!category) {
      throw new Error(`Category not found: ${categorySlugOrId}`);
    }

    const cacheKey = `adhkar:items:cat:${category.id}`;
    const cached = await cache.get<{ category: AdhkarCategory; items: AdhkarItem[]; total: number }>(cacheKey);
    if (cached) return cached;

    let items: AdhkarItem[] = [];

    if (db.getStatus().connected) {
      try {
        const queryRes = await db.query<AdhkarItem>(
          `SELECT id, category_id, text_ar, text_simple, translation_en, repeat_count, virtue, reference, audio_path
           FROM adhkar WHERE category_id = $1 ORDER BY id ASC`,
          [category.id]
        );
        if (queryRes.rows.length > 0) items = queryRes.rows;
      } catch (err: any) {
        logger.debug(`PostgreSQL getAdhkarByCategory fallback: ${err.message}`);
      }
    }

    if (items.length === 0) {
      items = this.adhkar.filter((a) => a.category_id === category.id);
    }

    const res = { category, items, total: items.length };
    await cache.set(cacheKey, res, 86400);
    return res;
  }

  public async getRandomAdhkar(): Promise<AdhkarItem> {
    const randomIndex = Math.floor(Math.random() * this.adhkar.length);
    return this.adhkar[randomIndex];
  }

  public async getDuas(category?: string): Promise<DuaItem[]> {
    if (category) {
      return this.duas.filter((d) => d.category.toLowerCase() === category.toLowerCase());
    }
    return this.duas;
  }

  public async searchAdhkar(queryStr: string): Promise<AdhkarItem[]> {
    const norm = normalizeArabicForSearch(queryStr);
    return this.adhkar.filter((item) => item.text_simple.includes(norm));
  }
}

export const adhkarService = new AdhkarService();
