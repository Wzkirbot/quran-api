import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { Ayah, PageMetadata } from '../../../src/types/index.js';
import { normalizeArabicForSearch } from '../../../src/utils/arabicNormalizer.js';
import { writeManifest } from '../manifest-generator.js';

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchJson(res.headers.location));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e: any) {
          reject(new Error(`Failed to parse JSON response: ${e.message}`));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

export async function importQuranData(): Promise<{ totalAyahs: number; totalSurahs: number }> {
  console.log('⏳ Starting One-Time Quran Dataset Ingestion & Validation...');

  const dataDir = path.resolve(process.cwd(), 'data/quran');
  const metadataDir = path.resolve(process.cwd(), 'data/metadata');

  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(metadataDir, { recursive: true });

  const endpoint = 'https://api.alquran.cloud/v1/quran/quran-uthmani';
  console.log(`🌐 Fetching verified Quran text from source: ${endpoint}`);

  const response = await fetchJson(endpoint);

  if (!response || !response.data || !Array.isArray(response.data.surahs)) {
    throw new Error('Invalid response structure received from Quran source.');
  }

  const rawSurahs = response.data.surahs;
  if (rawSurahs.length !== 114) {
    throw new Error(`Integrity Error: Expected 114 surahs, but got ${rawSurahs.length}`);
  }

  const ayahs: Ayah[] = [];
  const pagesMap: Map<number, { page: number; startSurah: number; startAyah: number; endSurah: number; endAyah: number }> = new Map();

  let expectedGlobal = 1;

  for (const surah of rawSurahs) {
    const surahId = surah.number;
    const surahAyahs = surah.ayahs;

    for (const item of surahAyahs) {
      const ayahNumber = item.numberInSurah;
      const globalNumber = item.number;

      if (globalNumber !== expectedGlobal) {
        throw new Error(`Integrity Error: Global ayah sequence mismatch. Expected ${expectedGlobal}, got ${globalNumber}`);
      }
      expectedGlobal++;

      // Clean text: strip BOM if present
      let textUthmani = item.text.replace(/^\uFEFF/, '').trim();
      const textSimple = normalizeArabicForSearch(textUthmani);

      const pageNumber = item.page;
      const juzNumber = item.juz;
      const hizbQuarter = item.hizbQuarter;
      const sajda = typeof item.sajda === 'boolean' ? item.sajda : !!item.sajda;

      ayahs.push({
        surah_id: surahId,
        ayah_number: ayahNumber,
        global_number: globalNumber,
        text_uthmani: textUthmani,
        text_simple: textSimple,
        juz: juzNumber,
        hizb_quarter: hizbQuarter,
        page: pageNumber,
        sajda
      });

      // Track page metadata boundaries
      if (!pagesMap.has(pageNumber)) {
        pagesMap.set(pageNumber, {
          page: pageNumber,
          startSurah: surahId,
          startAyah: ayahNumber,
          endSurah: surahId,
          endAyah: ayahNumber
        });
      } else {
        const pageEntry = pagesMap.get(pageNumber)!;
        pageEntry.endSurah = surahId;
        pageEntry.endAyah = ayahNumber;
      }
    }
  }

  if (ayahs.length !== 6236) {
    throw new Error(`Integrity Error: Expected 6236 ayahs in total, but got ${ayahs.length}`);
  }

  // 1. Write data/quran/ayahs.json
  const ayahsJson = JSON.stringify(ayahs, null, 2);
  const ayahsPath = path.join(dataDir, 'ayahs.json');
  fs.writeFileSync(ayahsPath, ayahsJson, 'utf-8');
  console.log(`✅ Saved ${ayahs.length} ayahs to ${ayahsPath}`);

  // 2. Write data/metadata/pages.json (604 pages)
  const pagesList: PageMetadata[] = Array.from(pagesMap.values())
    .sort((a, b) => a.page - b.page)
    .map((p) => ({
      page_number: p.page,
      surah_start: p.startSurah,
      ayah_start: p.startAyah,
      surah_end: p.endSurah,
      ayah_end: p.endAyah
    }));

  const pagesPath = path.join(metadataDir, 'pages.json');
  fs.writeFileSync(pagesPath, JSON.stringify(pagesList, null, 2), 'utf-8');
  console.log(`✅ Saved ${pagesList.length} pages metadata to ${pagesPath}`);

  // 3. Write manifest.json with SHA-256 Checksum and Attribution
  const manifest = writeManifest(
    dataDir,
    {
      dataset: 'quran_uthmani_and_simple',
      version: '1.0.0',
      source: 'Tanzil Project (tanzil.net) & King Fahd Glorious Quran Printing Complex',
      license: 'Tanzil Quran Text License / Creative Commons Attribution 3.0',
      recordsCount: ayahs.length,
      attribution: 'Quran text based on the Tanzil Project verified text and King Fahd Complex Madinah Mushaf page boundaries.'
    },
    ayahsJson
  );

  console.log(`🔒 Checksum (SHA-256): ${manifest.checksum}`);
  console.log('✨ Quran Dataset Ingestion & Validation completed successfully.');

  return { totalAyahs: ayahs.length, totalSurahs: rawSurahs.length };
}
