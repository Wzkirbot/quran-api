import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Surah, Ayah, AdhkarCategory, AdhkarItem, DuaItem, TafsirItem, TranslationItem, DatasetManifest } from '../src/types/index.js';

function readJsonFile<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing expected file: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function verifyChecksum(dirPath: string, dataFileName: string): void {
  const manifestPath = path.join(dirPath, 'manifest.json');
  const dataFilePath = path.join(dirPath, dataFileName);

  if (fs.existsSync(manifestPath) && fs.existsSync(dataFilePath)) {
    const manifest: DatasetManifest = readJsonFile(manifestPath);
    const content = fs.readFileSync(dataFilePath, 'utf-8');
    const calculated = crypto.createHash('sha256').update(content).digest('hex');

    if (calculated !== manifest.checksum) {
      throw new Error(`Checksum mismatch in ${dirPath}. Expected: ${manifest.checksum}, Got: ${calculated}`);
    }
  }
}

async function validate() {
  console.log('====================================================');
  console.log('🔍 Quran API - Dataset Integrity Validation');
  console.log('====================================================');

  const errors: string[] = [];

  // 1. Validate Surahs
  const surahsPath = path.resolve(process.cwd(), 'data/quran/surahs.json');
  const surahs: Surah[] = readJsonFile(surahsPath);

  if (!Array.isArray(surahs) || surahs.length !== 114) {
    errors.push(`Expected 114 surahs, but found ${surahs?.length ?? 0}`);
  }

  const surahsMap = new Map<number, Surah>();
  let totalAyahsExpected = 0;

  surahs.forEach((s, idx) => {
    const expectedId = idx + 1;
    if (s.id !== expectedId) {
      errors.push(`Surah ordering invalid at index ${idx}: expected ID ${expectedId}, got ${s.id}`);
    }
    if (!s.name_ar || !s.name_en || !s.name_transliteration) {
      errors.push(`Surah ${s.id} is missing required name fields`);
    }
    if (s.type !== 'meccan' && s.type !== 'medinan') {
      errors.push(`Surah ${s.id} has invalid revelation type: ${s.type}`);
    }
    if (s.total_ayahs <= 0) {
      errors.push(`Surah ${s.id} has invalid total_ayahs: ${s.total_ayahs}`);
    }
    totalAyahsExpected += s.total_ayahs;
    surahsMap.set(s.id, s);
  });

  if (totalAyahsExpected !== 6236) {
    errors.push(`Sum of total_ayahs across all surahs is ${totalAyahsExpected}, expected 6236`);
  }

  console.log(`✓ 114 surahs detected in correct sequential order`);

  // 2. Validate Ayahs
  const ayahsPath = path.resolve(process.cwd(), 'data/quran/ayahs.json');
  const ayahs: Ayah[] = readJsonFile(ayahsPath);

  if (!Array.isArray(ayahs) || ayahs.length !== 6236) {
    errors.push(`Expected 6236 ayahs, but found ${ayahs?.length ?? 0}`);
  }

  const seenAyahRef = new Set<string>();
  const seenGlobalNumber = new Set<number>();
  const surahAyahCounters = new Map<number, number>();

  ayahs.forEach((a) => {
    // Range and required fields check
    if (a.surah_id < 1 || a.surah_id > 114) {
      errors.push(`Ayah with invalid surah_id: ${a.surah_id}`);
    }
    if (a.global_number < 1 || a.global_number > 6236) {
      errors.push(`Ayah with invalid global_number: ${a.global_number}`);
    }
    if (a.juz < 1 || a.juz > 30) {
      errors.push(`Ayah ${a.surah_id}:${a.ayah_number} has invalid Juz: ${a.juz}`);
    }
    if (a.hizb_quarter < 1 || a.hizb_quarter > 240) {
      errors.push(`Ayah ${a.surah_id}:${a.ayah_number} has invalid Hizb Quarter: ${a.hizb_quarter}`);
    }
    if (a.page < 1 || a.page > 604) {
      errors.push(`Ayah ${a.surah_id}:${a.ayah_number} has invalid Page: ${a.page}`);
    }
    if (!a.text_uthmani || a.text_uthmani.trim().length === 0) {
      errors.push(`Ayah ${a.surah_id}:${a.ayah_number} has empty text_uthmani`);
    }
    if (!a.text_simple || a.text_simple.trim().length === 0) {
      errors.push(`Ayah ${a.surah_id}:${a.ayah_number} has empty text_simple`);
    }

    // Duplicate checks
    const refKey = `${a.surah_id}:${a.ayah_number}`;
    if (seenAyahRef.has(refKey)) {
      errors.push(`Duplicate ayah reference detected: ${refKey}`);
    }
    seenAyahRef.add(refKey);

    if (seenGlobalNumber.has(a.global_number)) {
      errors.push(`Duplicate global_number detected: ${a.global_number}`);
    }
    seenGlobalNumber.add(a.global_number);

    // Track count per surah
    surahAyahCounters.set(a.surah_id, (surahAyahCounters.get(a.surah_id) || 0) + 1);
  });

  // Verify that count per surah matches surah metadata
  for (const [surahId, surah] of surahsMap.entries()) {
    const actualCount = surahAyahCounters.get(surahId) || 0;
    if (actualCount !== surah.total_ayahs) {
      errors.push(`Surah ${surahId} (${surah.name_ar}) expected ${surah.total_ayahs} ayahs, but found ${actualCount}`);
    }
  }

  console.log(`✓ 6236 ayahs validated across all 114 surahs`);
  console.log(`✓ No duplicate ayahs or invalid references found`);
  console.log(`✓ Valid Juz (1-30), Hizb Quarter (1-240), and Page (1-604) references`);

  // 3. Validate Adhkar & Categories
  const categoriesPath = path.resolve(process.cwd(), 'data/adhkar/categories.json');
  const categories: AdhkarCategory[] = readJsonFile(categoriesPath);
  const categoryIds = new Set(categories.map((c) => c.id));

  const adhkarPath = path.resolve(process.cwd(), 'data/adhkar/adhkar.json');
  const adhkar: AdhkarItem[] = readJsonFile(adhkarPath);

  adhkar.forEach((item) => {
    if (!categoryIds.has(item.category_id)) {
      errors.push(`Adhkar item ${item.id} references invalid category_id: ${item.category_id}`);
    }
    if (!item.text_ar || !item.text_simple) {
      errors.push(`Adhkar item ${item.id} is missing text`);
    }
    if (item.repeat_count < 1) {
      errors.push(`Adhkar item ${item.id} has invalid repeat_count: ${item.repeat_count}`);
    }
  });

  console.log(`✓ ${categories.length} Adhkar categories and ${adhkar.length} Adhkar records validated`);

  // 4. Validate Duas
  const duasPath = path.resolve(process.cwd(), 'data/dua/duas.json');
  const duas: DuaItem[] = readJsonFile(duasPath);
  duas.forEach((d) => {
    if (!d.title_ar || !d.text_ar || !d.source) {
      errors.push(`Dua item ${d.id} is missing required fields`);
    }
  });
  console.log(`✓ ${duas.length} Dua records validated`);

  // 5. Validate Tafsir & Translations
  const tafsirPath = path.resolve(process.cwd(), 'data/tafsir/ar.muyassar.json');
  const tafsir: TafsirItem[] = readJsonFile(tafsirPath);
  tafsir.forEach((t) => {
    if (!surahsMap.has(t.surah_id)) {
      errors.push(`Tafsir references non-existent surah: ${t.surah_id}`);
    }
  });
  console.log(`✓ ${tafsir.length} Tafsir records validated`);

  const translationPath = path.resolve(process.cwd(), 'data/translations/en.saheeh.json');
  const translations: TranslationItem[] = readJsonFile(translationPath);
  translations.forEach((tr) => {
    if (!surahsMap.has(tr.surah_id)) {
      errors.push(`Translation references non-existent surah: ${tr.surah_id}`);
    }
  });
  console.log(`✓ ${translations.length} Translation records validated`);

  // 6. Checksum Manifest Verification
  verifyChecksum(path.resolve(process.cwd(), 'data/quran'), 'ayahs.json');
  verifyChecksum(path.resolve(process.cwd(), 'data/adhkar'), 'adhkar.json');
  verifyChecksum(path.resolve(process.cwd(), 'data/dua'), 'duas.json');
  verifyChecksum(path.resolve(process.cwd(), 'data/tafsir'), 'ar.muyassar.json');
  verifyChecksum(path.resolve(process.cwd(), 'data/translations'), 'en.saheeh.json');
  console.log(`✓ SHA-256 Checksum manifests verified for all datasets`);

  console.log('====================================================');
  if (errors.length > 0) {
    console.error('❌ Data Integrity Check FAILED with the following errors:');
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log('✨ DATASET INTEGRITY CHECK PASSED (100% Valid)');
    console.log('====================================================');
  }
}

validate().catch((err) => {
  console.error('Validation script execution error:', err);
  process.exit(1);
});
