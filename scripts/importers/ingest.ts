import fs from 'node:fs';
import path from 'node:path';
import { db } from '../../src/database/connection.js';
import { Surah, Ayah, AdhkarCategory, AdhkarItem, DuaItem, TafsirItem, TranslationItem } from '../../src/types/index.js';

function readJson<T>(relPath: string): T {
  const fullPath = path.resolve(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

export async function seedDatabase() {
  console.log('====================================================');
  console.log('🌱 Quran API - Seeding PostgreSQL with Local Data');
  console.log('====================================================');

  const connected = await db.testConnection();
  if (!connected) {
    console.error('❌ Cannot connect to PostgreSQL database.');
    console.error('   Please verify DATABASE_URL in .env or run: docker compose up -d');
    process.exit(1);
  }

  // 1. Run migrations first
  const schemaPath = path.resolve(process.cwd(), 'src/database/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await db.query(schemaSql);
  console.log('✓ Database schema and indexes verified');

  const pool = db.getPool();
  if (!pool) throw new Error('Pool unavailable');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 2. Seed Surahs
    console.log('⏳ Inserting 114 Surahs...');
    const surahs = readJson<Surah[]>('data/quran/surahs.json');
    for (const s of surahs) {
      await client.query(
        `INSERT INTO surahs (id, name_ar, name_en, name_transliteration, type, total_ayahs, order_revelation)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name_ar = EXCLUDED.name_ar,
           name_en = EXCLUDED.name_en,
           name_transliteration = EXCLUDED.name_transliteration,
           type = EXCLUDED.type,
           total_ayahs = EXCLUDED.total_ayahs,
           order_revelation = EXCLUDED.order_revelation`,
        [s.id, s.name_ar, s.name_en, s.name_transliteration, s.type, s.total_ayahs, s.order_revelation]
      );
    }
    console.log(`✓ 114 Surahs seeded.`);

    // 3. Seed Ayahs in batches
    console.log('⏳ Inserting 6236 Ayahs...');
    const ayahs = readJson<Ayah[]>('data/quran/ayahs.json');
    const batchSize = 500;
    for (let i = 0; i < ayahs.length; i += batchSize) {
      const batch = ayahs.slice(i, i + batchSize);
      for (const a of batch) {
        await client.query(
          `INSERT INTO ayahs (surah_id, ayah_number, global_number, text_uthmani, text_simple, juz, hizb_quarter, page, sajda)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (surah_id, ayah_number) DO UPDATE SET
             global_number = EXCLUDED.global_number,
             text_uthmani = EXCLUDED.text_uthmani,
             text_simple = EXCLUDED.text_simple,
             juz = EXCLUDED.juz,
             hizb_quarter = EXCLUDED.hizb_quarter,
             page = EXCLUDED.page,
             sajda = EXCLUDED.sajda`,
          [a.surah_id, a.ayah_number, a.global_number, a.text_uthmani, a.text_simple, a.juz, a.hizb_quarter, a.page, a.sajda]
        );
      }
    }
    console.log(`✓ 6236 Ayahs seeded.`);

    // 4. Seed Adhkar Categories
    console.log('⏳ Inserting Adhkar Categories...');
    const categories = readJson<AdhkarCategory[]>('data/adhkar/categories.json');
    for (const c of categories) {
      await client.query(
        `INSERT INTO adhkar_categories (id, slug, title_ar, title_en, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug,
           title_ar = EXCLUDED.title_ar,
           title_en = EXCLUDED.title_en,
           description = EXCLUDED.description`,
        [c.id, c.slug, c.title_ar, c.title_en, c.description]
      );
    }
    console.log(`✓ ${categories.length} Adhkar Categories seeded.`);

    // 5. Seed Adhkar
    console.log('⏳ Inserting Adhkar items...');
    const adhkar = readJson<AdhkarItem[]>('data/adhkar/adhkar.json');
    for (const d of adhkar) {
      await client.query(
        `INSERT INTO adhkar (id, category_id, text_ar, text_simple, translation_en, repeat_count, virtue, reference, audio_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           category_id = EXCLUDED.category_id,
           text_ar = EXCLUDED.text_ar,
           text_simple = EXCLUDED.text_simple,
           translation_en = EXCLUDED.translation_en,
           repeat_count = EXCLUDED.repeat_count,
           virtue = EXCLUDED.virtue,
           reference = EXCLUDED.reference`,
        [d.id, d.category_id, d.text_ar, d.text_simple, d.translation_en, d.repeat_count, d.virtue, d.reference, d.audio_path]
      );
    }
    console.log(`✓ ${adhkar.length} Adhkar items seeded.`);

    // 6. Seed Duas
    console.log('⏳ Inserting Duas...');
    const duas = readJson<DuaItem[]>('data/dua/duas.json');
    for (const d of duas) {
      await client.query(
        `INSERT INTO duas (id, category, title_ar, text_ar, text_simple, translation_en, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           category = EXCLUDED.category,
           title_ar = EXCLUDED.title_ar,
           text_ar = EXCLUDED.text_ar,
           text_simple = EXCLUDED.text_simple,
           translation_en = EXCLUDED.translation_en,
           source = EXCLUDED.source`,
        [d.id, d.category, d.title_ar, d.text_ar, d.text_simple, d.translation_en, d.source]
      );
    }
    console.log(`✓ ${duas.length} Duas seeded.`);

    // 7. Seed Tafsir
    console.log('⏳ Inserting Tafsir entries...');
    const tafsirs = readJson<TafsirItem[]>('data/tafsir/ar.muyassar.json');
    for (const t of tafsirs) {
      await client.query(
        `INSERT INTO tafsirs (surah_id, ayah_number, tafsir_name, content)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (surah_id, ayah_number, tafsir_name) DO UPDATE SET
           content = EXCLUDED.content`,
        [t.surah_id, t.ayah_number, t.tafsir_name, t.content]
      );
    }
    console.log(`✓ ${tafsirs.length} Tafsir records seeded.`);

    // 8. Seed Translations
    console.log('⏳ Inserting Translation entries...');
    const translations = readJson<TranslationItem[]>('data/translations/en.saheeh.json');
    for (const tr of translations) {
      await client.query(
        `INSERT INTO translations (surah_id, ayah_number, language_code, author_name, content)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (surah_id, ayah_number, language_code, author_name) DO UPDATE SET
           content = EXCLUDED.content`,
        [tr.surah_id, tr.ayah_number, tr.language_code, tr.author_name, tr.content]
      );
    }
    console.log(`✓ ${translations.length} Translation records seeded.`);

    await client.query('COMMIT');
    console.log('====================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('====================================================');
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Database seeding error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await db.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('ingest.ts')) {
  seedDatabase();
}
