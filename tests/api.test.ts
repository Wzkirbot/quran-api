import request from 'supertest';
import { createApp } from '../src/app.js';
import { describe, it, expect } from '@jest/globals';

const app = createApp();

describe('Quran API - Integration Test Suite', () => {
  // 1. Surahs Endpoints
  describe('GET /v1/surahs', () => {
    it('should return all 114 surahs in sequential order', async () => {
      const res = await request(app).get('/v1/surahs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(114);
      expect(res.body.data[0].id).toBe(1);
      expect(res.body.data[0].name_ar).toBe('الفاتحة');
      expect(res.body.data[113].id).toBe(114);
      expect(res.body.data[113].name_ar).toBe('الناس');
    });

    it('should return details for Surah Al-Baqarah (ID: 2)', async () => {
      const res = await request(app).get('/v1/surahs/2');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(2);
      expect(res.body.data.name_ar).toBe('البقرة');
      expect(res.body.data.total_ayahs).toBe(286);
      expect(res.body.data.type).toBe('medinan');
    });

    it('should return 400 when invalid Surah ID is requested', async () => {
      const res = await request(app).get('/v1/surahs/999');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PARAMETER');
    });

    it('should return paginated Ayahs of Surah Al-Fatihah', async () => {
      const res = await request(app).get('/v1/surahs/1/ayahs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(7);
      expect(res.body.data[0].ayah_number).toBe(1);
      expect(res.body.data[0].text_uthmani).toContain('بِسْمِ ٱللَّهِ');
    });
  });

  // 2. Ayahs Endpoints
  describe('GET /v1/ayahs/:reference', () => {
    it('should fetch Ayat Al-Kursi by reference "2:255"', async () => {
      const res = await request(app).get('/v1/ayahs/2:255');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.surah_id).toBe(2);
      expect(res.body.data.ayah_number).toBe(255);
      expect(res.body.data.text_uthmani).toContain('ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ');
      expect(res.body.data.surah.name_ar).toBe('البقرة');
    });

    it('should fetch Ayah by global ayah number 1', async () => {
      const res = await request(app).get('/v1/ayahs/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.surah_id).toBe(1);
      expect(res.body.data.ayah_number).toBe(1);
    });

    it('should return 404 for non-existent Ayah reference "2:999"', async () => {
      const res = await request(app).get('/v1/ayahs/2:999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AYAH_NOT_FOUND');
    });

    it('should return a random Ayah without error', async () => {
      const res = await request(app).get('/v1/ayahs/random');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.surah_id).toBeGreaterThanOrEqual(1);
      expect(res.body.data.surah_id).toBeLessThanOrEqual(114);
      expect(res.body.data.text_uthmani).toBeTruthy();
    });
  });

  // 3. Search Endpoints
  describe('GET /v1/search', () => {
    it('should search for "الصلاة" and return matches', async () => {
      const res = await request(app).get('/v1/search').query({ q: 'الصلاة' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('should return 400 when search query is shorter than 2 characters', async () => {
      const res = await request(app).get('/v1/search').query({ q: 'a' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_QUERY');
    });
  });

  // 4. Juz & Pages Endpoints
  describe('GET /v1/juz and /v1/pages', () => {
    it('should return list of all 30 Juz', async () => {
      const res = await request(app).get('/v1/juz');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(30);
    });

    it('should return Ayahs for Juz 1', async () => {
      const res = await request(app).get('/v1/juz/1');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].juz).toBe(1);
    });

    it('should return Ayahs for Madinah Mushaf Page 1', async () => {
      const res = await request(app).get('/v1/pages/1');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(7);
      expect(res.body.meta.page).toBe(1);
    });

    it('should return 400 for invalid page number 700', async () => {
      const res = await request(app).get('/v1/pages/700');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_PARAMETER');
    });
  });

  // 5. Adhkar & Duas Endpoints
  describe('GET /v1/adhkar', () => {
    it('should return Adhkar categories', async () => {
      const res = await request(app).get('/v1/adhkar/categories');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);
    });

    it('should return morning Adhkar items', async () => {
      const res = await request(app).get('/v1/adhkar/category/morning');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].text_ar).toBeTruthy();
    });

    it('should return Duas', async () => {
      const res = await request(app).get('/v1/adhkar/duas');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);
    });
  });

  // 6. Security & Health Endpoints
  describe('Security & System', () => {
    it('should return 200 on /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ok');
    });

    it('should return 200 on /ready', async () => {
      const res = await request(app).get('/ready');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ready');
    });

    it('should return 404 for unknown route in standard envelope', async () => {
      const res = await request(app).get('/non-existent-route-xyz');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should include X-Request-Id header in responses', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-request-id']).toBeDefined();
    });
  });
});
