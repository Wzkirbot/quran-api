-- ==============================================================
-- Quran API - PostgreSQL Database Schema
-- ==============================================================

-- Enable trigram extension for efficient Arabic text search if available
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Surahs Table (السور)
CREATE TABLE IF NOT EXISTS surahs (
    id SMALLINT PRIMARY KEY, -- 1 to 114
    name_ar VARCHAR(80) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_transliteration VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('meccan', 'medinan')),
    total_ayahs SMALLINT NOT NULL,
    order_revelation SMALLINT NOT NULL
);

-- 2. Ayahs Table (الآيات)
CREATE TABLE IF NOT EXISTS ayahs (
    id SERIAL PRIMARY KEY,
    surah_id SMALLINT NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
    ayah_number SMALLINT NOT NULL,
    global_number INTEGER UNIQUE NOT NULL, -- 1 to 6236
    text_uthmani TEXT NOT NULL,
    text_simple TEXT NOT NULL,
    juz SMALLINT NOT NULL CHECK (juz >= 1 AND juz <= 30),
    hizb_quarter SMALLINT NOT NULL CHECK (hizb_quarter >= 1 AND hizb_quarter <= 240),
    page SMALLINT NOT NULL CHECK (page >= 1 AND page <= 604),
    sajda BOOLEAN DEFAULT FALSE,
    CONSTRAINT uk_surah_ayah UNIQUE (surah_id, ayah_number)
);

-- 3. Adhkar Categories (تصنيفات الأذكار)
CREATE TABLE IF NOT EXISTS adhkar_categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(60) UNIQUE NOT NULL,
    title_ar VARCHAR(120) NOT NULL,
    title_en VARCHAR(150),
    description TEXT
);

-- 4. Adhkar Table (الأذكار والأدعية)
CREATE TABLE IF NOT EXISTS adhkar (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES adhkar_categories(id) ON DELETE CASCADE,
    text_ar TEXT NOT NULL,
    text_simple TEXT NOT NULL,
    translation_en TEXT,
    repeat_count SMALLINT DEFAULT 1,
    virtue TEXT,
    reference TEXT,
    audio_path VARCHAR(255)
);

-- 5. Duas Table (الأدعية القرآنية والنبوية)
CREATE TABLE IF NOT EXISTS duas (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'quranic' or 'prophetic'
    title_ar VARCHAR(200) NOT NULL,
    text_ar TEXT NOT NULL,
    text_simple TEXT NOT NULL,
    translation_en TEXT,
    source VARCHAR(200) NOT NULL
);

-- 6. Tafsirs Table (التفاسير)
CREATE TABLE IF NOT EXISTS tafsirs (
    id SERIAL PRIMARY KEY,
    surah_id SMALLINT NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
    ayah_number SMALLINT NOT NULL,
    tafsir_name VARCHAR(60) NOT NULL DEFAULT 'muyassar',
    content TEXT NOT NULL,
    CONSTRAINT uk_tafsir_entry UNIQUE (surah_id, ayah_number, tafsir_name)
);

-- 7. Translations Table (الترجمات)
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    surah_id SMALLINT NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
    ayah_number SMALLINT NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    author_name VARCHAR(60) NOT NULL DEFAULT 'saheeh_international',
    content TEXT NOT NULL,
    CONSTRAINT uk_translation_entry UNIQUE (surah_id, ayah_number, language_code, author_name)
);

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_ayahs_surah_id ON ayahs(surah_id);
CREATE INDEX IF NOT EXISTS idx_ayahs_lookup ON ayahs(surah_id, ayah_number);
CREATE INDEX IF NOT EXISTS idx_ayahs_global ON ayahs(global_number);
CREATE INDEX IF NOT EXISTS idx_ayahs_juz ON ayahs(juz);
CREATE INDEX IF NOT EXISTS idx_ayahs_page ON ayahs(page);

-- Trigram index for fast normalized Arabic text search
CREATE INDEX IF NOT EXISTS idx_ayahs_text_simple_trgm ON ayahs USING gin (text_simple gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_adhkar_text_simple_trgm ON adhkar USING gin (text_simple gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_duas_text_simple_trgm ON duas USING gin (text_simple gin_trgm_ops);
