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

  // O(1) Index Maps
  private categoriesBySlug = new Map<string, AdhkarCategory>();
  private categoriesById = new Map<number, AdhkarCategory>();
  private adhkarByCatId = new Map<number, AdhkarItem[]>();
  private duasByCategory = new Map<string, DuaItem[]>();

  constructor() {
    this.loadLocalDatasets();
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

  private loadLocalDatasets(): void {
    try {
      const categoriesPath = this.resolveDataPath('adhkar/categories.json');
      const adhkarPath = this.resolveDataPath('adhkar/adhkar.json');
      const duasPath = this.resolveDataPath('dua/duas.json');

      if (fs.existsSync(categoriesPath)) {
        this.categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
      }
      if (fs.existsSync(adhkarPath)) {
        this.adhkar = JSON.parse(fs.readFileSync(adhkarPath, 'utf-8'));
      }
      if (fs.existsSync(duasPath)) {
        this.duas = JSON.parse(fs.readFileSync(duasPath, 'utf-8'));
      }

      this.categoriesBySlug.clear();
      this.categoriesById.clear();
      for (const c of this.categories) {
        this.categoriesBySlug.set(c.slug.toLowerCase(), c);
        this.categoriesById.set(c.id, c);
      }

      this.adhkarByCatId.clear();
      for (const a of this.adhkar) {
        let list = this.adhkarByCatId.get(a.category_id);
        if (!list) {
          list = [];
          this.adhkarByCatId.set(a.category_id, list);
        }
        list.push(a);
      }

      this.duasByCategory.clear();
      for (const d of this.duas) {
        const cat = d.category.toLowerCase();
        let list = this.duasByCategory.get(cat);
        if (!list) {
          list = [];
          this.duasByCategory.set(cat, list);
        }
        list.push(d);
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
    const s = slug.toLowerCase();
    if (!db.getStatus().connected && this.categoriesBySlug.has(s)) {
      return this.categoriesBySlug.get(s) || null;
    }
    const categories = await this.getCategories();
    return categories.find((c) => c.slug.toLowerCase() === s) || null;
  }

  public async getAdhkarByCategory(
    categorySlugOrId: string | number
  ): Promise<{ category: AdhkarCategory; items: AdhkarItem[]; total: number }> {
    let category: AdhkarCategory | undefined;

    if (!db.getStatus().connected) {
      if (typeof categorySlugOrId === 'number') {
        category = this.categoriesById.get(categorySlugOrId);
      } else {
        const num = Number(categorySlugOrId);
        if (!isNaN(num) && this.categoriesById.has(num)) {
          category = this.categoriesById.get(num);
        } else {
          category = this.categoriesBySlug.get(String(categorySlugOrId).toLowerCase());
        }
      }
    }

    if (!category) {
      const categories = await this.getCategories();
      category = categories.find((c) =>
        typeof categorySlugOrId === 'number'
          ? c.id === categorySlugOrId
          : c.slug.toLowerCase() === String(categorySlugOrId).toLowerCase() || c.id === Number(categorySlugOrId)
      );
    }

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
      items = this.adhkarByCatId.get(category.id) || [];
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
      return this.duasByCategory.get(category.toLowerCase()) || [];
    }
    return this.duas;
  }

  public async searchAdhkar(queryStr: string): Promise<AdhkarItem[]> {
    const norm = normalizeArabicForSearch(queryStr);
    return this.adhkar.filter((item) => item.text_simple.includes(norm));
  }
}

export const adhkarService = new AdhkarService();
