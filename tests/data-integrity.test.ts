import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from '@jest/globals';
import { Surah, Ayah } from '../src/types/index.js';

describe('Quran API - Dataset Integrity Unit Tests', () => {
  const surahs: Surah[] = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'data/quran/surahs.json'), 'utf-8'));
  const ayahs: Ayah[] = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'data/quran/ayahs.json'), 'utf-8'));

  it('must contain exactly 114 Surahs', () => {
    expect(surahs).toHaveLength(114);
  });

  it('must contain exactly 6,236 Ayahs', () => {
    expect(ayahs).toHaveLength(6236);
  });

  it('must have correct sequential ordering of Surahs from 1 to 114', () => {
    surahs.forEach((surah, idx) => {
      expect(surah.id).toBe(idx + 1);
      expect(surah.name_ar).toBeTruthy();
      expect(surah.name_en).toBeTruthy();
      expect(['meccan', 'medinan']).toContain(surah.type);
    });
  });

  it('must not have duplicate Ayah references or duplicate global numbers', () => {
    const refs = new Set<string>();
    const globals = new Set<number>();

    ayahs.forEach((a) => {
      const ref = `${a.surah_id}:${a.ayah_number}`;
      expect(refs.has(ref)).toBe(false);
      refs.add(ref);

      expect(globals.has(a.global_number)).toBe(false);
      globals.add(a.global_number);
    });

    expect(refs.size).toBe(6236);
    expect(globals.size).toBe(6236);
  });

  it('must have valid Juz (1-30) and Page (1-604) ranges', () => {
    ayahs.forEach((a) => {
      expect(a.juz).toBeGreaterThanOrEqual(1);
      expect(a.juz).toBeLessThanOrEqual(30);

      expect(a.hizb_quarter).toBeGreaterThanOrEqual(1);
      expect(a.hizb_quarter).toBeLessThanOrEqual(240);

      expect(a.page).toBeGreaterThanOrEqual(1);
      expect(a.page).toBeLessThanOrEqual(604);
    });
  });
});
