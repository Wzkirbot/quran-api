# 📖 خطة عمل مشروع Quran API (خطة التطوير والتجميع الشاملة)

مشروع **Quran API** هو منصة وواجهة برمجة تطبيقات (RESTful API) متكاملة ومفتوحة المصدر بالكامل (Open Source)، مصممة لتعمل بنظام **Self-Contained / Self-Hosted / Self-Owned Local Religious Data**.

يقوم المشروع على ركيزة جوهرية: **امتلاك واستقلالية البيانات بنسبة 100%** عبر خط أنابيب استيراد وتجميع مخصص (**Data Acquisition & Ingestion Pipeline**)، يجلب البيانات الدينية من مصادرها الموثوقة والمرخصة لمرة واحدة فقط (One-Time Ingestion)، يقوم بتنظيفها، تدقيقها، التحقق من نزاهتها، وتخزينها محلياً في قاعدة البيانات الخاصة بك. وبمجرد اكتمال الاستيراد، يُحظر تماماً على الخادم والـ API التواصل مع أي مصدر خارجي أثناء التشغيل (Zero External Runtime Dependency).

---

## 🏛️ 1. المخطط المعماري الشامل (Architecture & Data Flow)

```text
 ┌────────────────────────────────────────────────────────┐
 │            1. المصادر الموثوقة والمرخصة                │
 │ (Tanzil, مجمع الملك فهد, حصن المسلم, التفاسير المعتمدة)│
 └──────────────────────────┬─────────────────────────────┘
                            │  One-Time Acquisition
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │        2. Data Acquisition & Ingestion Pipeline        │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │ Source Adapters (Quran, Adhkar, Dua, Tafsir)     │  │
 │  │ Validation (Checks 114 Surahs, 6236 Ayahs, UTF8) │  │
 │  │ Normalization (تجريد النص، توحيد الحقول، الضبط)  │  │
 │  │ Deduplication & Checksums (SHA-256 Manifest)     │  │
 │  └──────────────────────────┬───────────────────────┘  │
 └─────────────────────────────┼──────────────────────────┘
                               │ Store Locally
                               ▼
 ┌────────────────────────────────────────────────────────┐
 │           3. التخزين المحلي وقاعدة البيانات            │
 │     Local Dataset Files (JSON/SQL) + PostgreSQL        │
 └──────────────────────────┬─────────────────────────────┘
                            │  Serve Offline
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │                4. Quran & Islamic API                  │
 │   ┌─────────────────┐ ┌───────────────┐ ┌────────────┐ │
 │   │  القرآن والسور  │ │الأذكار والأدعية│ │التفسير والترجمات│
 │   └─────────────────┘ └───────────────┘ └────────────┘ │
 │          Dual Cache Layer (In-Memory / Redis)          │
 │              Rate Limiting & Security                  │
 └──────────────────────────┬─────────────────────────────┘
                            │ REST API Responses
                            ▼
                 [ المطور / التطبيق العميل ]
               (يعمل 100% بدون اتصال خارجي)
```

### 1.1 المبادئ الصارمة للـ Runtime:
1. **عزل تام للـ API (Runtime Isolation):** خادم التطبيق لا يعرف أي عنوان URL خارجي لجلب الآيات أو الأذكار، وكافة استعلامات الـ API تُوجّه حصراً لـ `Local Database` / `Local Cache`.
2. **فحص كودي مانع (Static Guardrail):** اختبار برمجي آلي يفحص شجرة الكود (AST) ويمنع وجود أي طلب شبكي خارجي لجلب البيانات الدينية داخل مسارات الـ API.
3. **وضع غير متصل بالكامل (Offline-First):** الخادم يعمل بكفاءة تامة حتى وإن تم فصل السيرفر تماماً عن شبكة الإنترنت العالمية.

---

## 💻 2. الحزمة التقنية المعتمدة رسميًا (Tech Stack)

| المكون | التقنية المختارة | التبرير التقني |
| :--- | :--- | :--- |
| **لغة البرمجة وبيئة التشغيل** | 🥇 **TypeScript (Strict Mode) + Node.js (v20+ / v24+)** | أداء عالٍ، أمان صارم للأنواع (Type Safety)، سهولة صيانة كود الـ Open Source والمساهمة من المطورين حول العالم. |
| **إطار عمل الـ API** | **Express.js (TypeScript Architecture)** | خفيف، سريع، مع بنية معيارية واضحة (Routes, Controllers, Services)، وتوافق تام مع حزم الأمان. |
| **قاعدة البيانات** | **PostgreSQL (v16)** | دعم فائق لـ UTF-8، وفهارس متقدمة (`GIN`, `pg_trgm`, `B-Tree`) للبحث العربي السريع بدون تشكيل. |
| **طبقة الاتصال بالبيانات** | **Native `pg` Pool (Type-Safe Client)** | وصول مباشر للبيانات بأعلى كفاءة وسرعة استعلامات بدون الـ Overhead للـ ORMs الثقيلة. |
| **الكاش التدرجي (اختياري)** | **Dual Cache (In-Memory LRU + Optional Redis)** | يعمل الـ API محلياً وبشكل فائق السرعة عبر الذاكرة، ويتصل بـ Redis تلقائياً إذا كان معرفاً في `.env`. |
| **التوثيق التفاعلي** | **Swagger UI / OpenAPI 3.0** | توثيق تفاعلي وتصدير مواصفات JSON عبر مسار `/docs`. |
| **الحاويات والتشغيل** | **Docker & Docker Compose** | تشغيل كامل للمنظومة (API + Database + Cache) بأمر واحد: `docker compose up -d`. |
| **البوابة والمختبر** | **Vanilla HTML5 / Modern CSS / Vanilla JS** | واجهة ويب فائقة الخفة والجمالية (Dark Mode, Glassmorphism, Responsive) بدون تعقيد أو Build steps ثقيلة. |

---

## 🔄 3. خط أنابيب استيراد وامتلاك البيانات (Data Acquisition & Ownership Pipeline)

بدلاً من مجرد تضمين ملفات مجهولة، يمتلك المشروع نظام استيراد معياري واحترافي:

```text
scripts/importers/
├── adapters/
│   ├── quran.adapter.ts      # جلب وتنسيق النص القرآني والسور والأجزاء
│   ├── adhkar.adapter.ts     # جلب وتنسيق أذكار اليوم والليلة (حصن المسلم)
│   ├── dua.adapter.ts        # جلب وتنسيق الأدعية القرآنية والنبوية
│   ├── tafsir.adapter.ts     # جلب وتنسيق التفسير الميسر / السعدي
│   └── translation.adapter.ts # جلب وتنسيق الترجمات الإنجليزية وغيرها
├── pipeline/
│   ├── validator.ts          # التدقيق الصارم لسلامة الأعداد والمراجع
│   ├── normalizer.ts         # تنظيف وتجريد النصوص للفهرسة والبحث
│   └── manifest-generator.ts # توليد ملفات البصمة والمصادر والرخص
└── cli.ts                    # أداة سطر الأوامر للاستيراد
```

### 2.1 مراحل الـ Pipeline لكل مصدر:
1. **Source Adapter:** يتصل بالمصدر الأصلي المحدد لجلب النسخة الخام (Raw Data).
2. **Validation:** التحقق الصارم من الحقول الإجبارية وصحة الترقيم (مثل التحقق من وجود 6236 آية بالضبط، و114 سورة).
3. **Normalization:**
   - إنتاج نسختين من النص القرآني: **الرسم العثماني بالتشكيل الكامل**، و**النص المجرد للبحث السريع**.
   - توحيد هيكل الأذكار: النص، الترجمة الصوتية (إن وجدت)، التكرار، الفضل، والسند/التخريج.
4. **Deduplication:** منع أي تكرار عبر Primary Keys و Unique Constraints.
5. **Checksum & Manifest:** حساب تشفير `SHA-256` للملف الناتج وتوليد ملف `manifest.json` يحتوي على:
   ```json
   {
     "dataset": "quran_uthmani",
     "version": "1.0.0",
     "source": "Tanzil Project (tanzil.net)",
     "license": "Creative Commons Attribution 3.0",
     "importedAt": "2026-10-05T19:20:00Z",
     "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
     "recordsCount": 6236,
     "attribution": "Quran text provided by Tanzil under CC-BY license."
   }
   ```
6. **Database Ingestion:** كتابة البيانات محلياً في PostgreSQL بأسلوب Batch Insertion عالي الكفاءة.

### 2.2 أوامر الـ CLI للاستيراد:
```bash
# استيراد كافة البيانات الدينية دفعة واحدة وتخزينها محلياً
npm run import:all

# استيراد مصادر محددة
npm run import:quran
npm run import:adhkar
npm run import:dua
npm run import:tafsir

# التحقق من صحة ونزاهة كافة البيانات المخزنة محلياً
npm run validate:data
```

---

## ⚖️ 4. المصادر، التراخيص والامتثال القانوني (Sources & Licensing)

تلتزم المنصة بتوثيق شفاف لكل مصدر في مجلد `data/` وملف `NOTICE.md`:

| الحزمة | المصدر المعتمد | نوع الرخصة | الاستخدام وإعادة التوزيع |
| :--- | :--- | :--- | :--- |
| **القرآن الكريم والسور** | مشروع **Tanzil Project** ومصحف المدينة (مجمع الملك فهد) | Tanzil License / CC-BY 3.0 | مسموح بإعادة التوزيع مع حفظ حقوق الإسناد والتدقيق. |
| **الأذكار والأدعية** | نصوص **حصن المسلم** وكتب السنة الموثقة (صحيح البخاري ومسلم) | Public Domain / Open Educational | نصوص شرعية عامة لا تخضع لحقوق ملكية حصرية، مع توثيق المصدر والتخريج. |
| **التفسير** | **التفسير الميسر** (مجمع الملك فهد لطباعة المصحف الشريف) | متاح للنشر التعليمي غير التجاري | مسموح بالتضمين كـ Module اختياري مع الإشارة للمصدر. |
| **الترجمات** | **صحيح إنترناشونال (Saheeh International)** | CC-BY-SA / متاح لإعادة التوزيع | مسموح بالاستخدام مع ذكر الإسناد. |

---

## 🗄️ 5. مخطط قاعدة البيانات الشامل (PostgreSQL Schema)

```sql
-- 1. جدول السور
CREATE TABLE surahs (
    id SMALLINT PRIMARY KEY, -- 1 to 114
    name_ar VARCHAR(60) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_transliteration VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('meccan', 'medinan')),
    total_ayahs SMALLINT NOT NULL,
    order_revelation SMALLINT NOT NULL
);

-- 2. جدول الآيات
CREATE TABLE ayahs (
    id SERIAL PRIMARY KEY,
    surah_id SMALLINT NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
    ayah_number SMALLINT NOT NULL, -- الرقم داخل السورة
    global_number INTEGER UNIQUE NOT NULL, -- 1 to 6236
    text_uthmani TEXT NOT NULL, -- بالرسم العثماني والتشكيل
    text_simple TEXT NOT NULL, -- مجرد من التشكيل للبحث الفوري
    juz SMALLINT NOT NULL, -- 1 to 30
    hizb_quarter SMALLINT NOT NULL, -- 1 to 240
    page SMALLINT NOT NULL, -- 1 to 604
    sajda BOOLEAN DEFAULT FALSE,
    search_vector tsvector,
    CONSTRAINT uk_surah_ayah UNIQUE(surah_id, ayah_number)
);

-- 3. تصنيفات الأذكار والأدعية
CREATE TABLE adhkar_categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(60) UNIQUE NOT NULL,
    title_ar VARCHAR(120) NOT NULL,
    title_en VARCHAR(150),
    description TEXT
);

-- 4. جدول الأذكار والأدعية (حصن المسلم والأدعية النبوية)
CREATE TABLE adhkar (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES adhkar_categories(id) ON DELETE CASCADE,
    text_ar TEXT NOT NULL,
    text_simple TEXT NOT NULL, -- للبحث السريع
    translation_en TEXT,
    repeat_count SMALLINT DEFAULT 1,
    virtue TEXT, -- الفضل
    reference TEXT, -- التخريج والسند (مثلاً: رواه البخاري)
    audio_path VARCHAR(255)
);

-- 5. جدول التفاسير
CREATE TABLE tafsirs (
    id SERIAL PRIMARY KEY,
    surah_id SMALLINT NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
    ayah_number SMALLINT NOT NULL,
    tafsir_name VARCHAR(50) NOT NULL DEFAULT 'muyassar',
    content TEXT NOT NULL,
    CONSTRAINT uk_tafsir_ayah UNIQUE(surah_id, ayah_number, tafsir_name)
);

-- 6. جدول الترجمات
CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    surah_id SMALLINT NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
    ayah_number SMALLINT NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    author_name VARCHAR(60) NOT NULL DEFAULT 'saheeh_international',
    content TEXT NOT NULL,
    CONSTRAINT uk_translation_ayah UNIQUE(surah_id, ayah_number, language_code, author_name)
);

-- فهارس السرعة والبحث المتقدم
CREATE INDEX idx_ayahs_surah_id ON ayahs(surah_id);
CREATE INDEX idx_ayahs_lookup ON ayahs(surah_id, ayah_number);
CREATE INDEX idx_ayahs_juz ON ayahs(juz);
CREATE INDEX idx_ayahs_page ON ayahs(page);
CREATE INDEX idx_ayahs_search_vector ON ayahs USING gin(search_vector);
CREATE INDEX idx_ayahs_text_simple_trgm ON ayahs USING gin(text_simple gin_trgm_ops);

CREATE INDEX idx_adhkar_category ON adhkar(category_id);
CREATE INDEX idx_adhkar_text_trgm ON adhkar USING gin(text_simple gin_trgm_ops);
```

---

## ⚡ 6. مسارات الـ REST API والتكامل الشامل (`/v1`)

### 5.1 مسارات القرآن الكريم:
* `GET /v1/surahs` — قائمة بجميع السور الـ 114 مع البيانات الوصفية.
* `GET /v1/surahs/:id` — بيانات سورة محددة حسب الرقم أو الاسم اللاتيني.
* `GET /v1/surahs/:id/ayahs` — آيات السورة مع خيارات التصفية والـ Pagination.
* `GET /v1/ayahs/:reference` — جلب آية بالمرجع (مثل `2:255` أو الرقم التراكمي الشامل).
* `GET /v1/ayahs/random` — آية عشوائية من قاعدة البيانات المحلية.
* `GET /v1/juz` و `GET /v1/juz/:id` — بيانات الأجزاء وآيات كل جزء.
* `GET /v1/pages/:number` — آيات صفحة محددة (1 إلى 604).
* `GET /v1/search?q=...&surah=...&juz=...&limit=20` — بحث نصوص القرآن (مجرد / بالتشكيل).

### 5.2 مسارات التفسير والترجمات:
* `GET /v1/tafsir/:surah/:ayah` — تفسير آية معينة (الميسر / السعدي).
* `GET /v1/translations/:surah/:ayah?lang=en` — ترجمة آية معينة بعدة لغات.

### 5.3 مسارات الأذكار والأدعية:
* `GET /v1/adhkar/categories` — تصنيفات الأذكار (أذكار الصباح، المساء، النوم، الاستيقاظ، الصلاة، إلخ).
* `GET /v1/adhkar/category/:slug` — أذكار تصنيف محدد مع التكرار والفضل والتخريج.
* `GET /v1/adhkar/random` — ذكر أو دعاء عشوائي.
* `GET /v1/adhkar/search?q=...` — بحث في الأذكار والأدعية.

### 5.4 مسارات النظام والجاهزية:
* `GET /health` — فحص عمل الـ API.
* `GET /ready` — فحص اتصال قاعدة البيانات PostgreSQL والكاش.
* `GET /version` — إصدار التطبيق، الإصدارات المحلية للـ Datasets وتواريخ استيرادها.

---

## 🛡️ 7. الأمان والأداء العالي (Security, Performance & Cache)

1. **حماية أمنية شاملة (Production Hardening):**
   - **Rate Limiting:** تحكم كامل عبر `.env` بالحد الأقصى للطلبات بالدقيقة.
   - **Security Headers:** تطبيق `helmet` لمنع هجمات XSS، Clickjacking و MIME-Sniffing.
   - **CORS:** مهيأ بالكامل وقابل للتقييد أو الفتح للمطورين.
   - **SQL Injection Guard:** استعلامات مجهزة بالكامل (Parameterized Queries).
   - **Safe Error Responses:** حجب الـ Stack Traces ورموز الأخطاء الداخلية في وضع الـ Production.
2. **طبقة الكاش المزدوجة (Dual Cache Architecture):**
   - دعم التخزين المؤقت عبر **Redis** تلقائياً في حال توفر `REDIS_URL`.
   - التبديل الآلي والآمن إلى **In-Memory LRU Cache** إذا لم يكن Redis متاحاً، دون أي تعطل للسيرفر.
3. **أداء الفهرسة والبحث العربي:**
   - فهارس `GIN` و `pg_trgm` لتمكين البحث العربي السريع حتى مع الأخطاء الإملائية الشائعة وإسقاط الهمزات والتنوين.

---

## 🌐 8. البوابة التفاعلية والمختبر للمطورين (Developer Portal & Playground)

* **الصفحة الرئيسية (`/`):**
  - تصميم عصري بـ Dark Mode وخطوط عربية ولاتينية راقية وتأثيرات Glassmorphism.
  - استعراض مزايا المشروع: مجاني بالكامل، مفتوح المصدر، بيانات محلية ومملوكة، ذاتي الاستضافة، وبدون أي اتصال خارجي.
  - مقتطفات برمجية تفاعلية للتشغيل السريع بـ cURL, JavaScript, Python.
* **مختبر الـ API التفاعلي (`/playground`):**
  - تجربة حية لجميع مسارات القرآن، الأذكار، والتفاسير مباشرة من المتصفح.
  - عرض زمن الاستجابة بالميلي ثانية (Latency ms)، كود الاستجابة (Status)، ورمز الـ JSON الملون.
  - إمكانية نسخ أمر `cURL` التلقائي للاختبار من الطرفية.
* **التوثيق التفاعلي (`/docs`):**
  - واجهة Swagger / OpenAPI تفاعلية توثق كل Endpoint والمعاملات والنماذج.
* **لوحة المراقبة والحالة (`/status`):**
  - لوحة حية ومستقلة تعرض حالة السيرفر، الاتصال بقاعدة البيانات، الكاش، واستخدام الذاكرة.

---

## 🐳 9. التشغيل السهل عبر الحاويات (Docker & Self-Hosting)

تشغيل المشروع بالكامل عبر أمر واحد:
```bash
git clone https://github.com/USERNAME/quran-api.git
cd quran-api
cp .env.example .env
docker compose up -d
```
يتولى الـ Container:
1. تشغيل خادم قاعدة البيانات PostgreSQL.
2. إنشاء الجداول وتطبيق الفهارس التلقائية.
3. استيراد وتدقيق البيانات المحلية تلقائياً (Auto-Seed on First Run).
4. تشغيل خادم الـ API والواجهة على المنفذ `3000`.

---

## 🧪 10. الاختبارات وضمان الجودة وحماية الـ Offline (Testing & CI)

1. **فحص النزاهة الدينية للبيانات (`validate:data`):**
   - التأكد من سلامة 114 سورة و 6236 آية بالتسلسل الدقيق.
   - التحقق من تكامل أرقام الأجزاء والأحزاب والصفحات.
2. **اختبارات التكامل والمسارات (Integration Tests):**
   - فحص استجابات الـ REST API وسرعة الاستعلامات والبحث.
   - اختبار الـ Rate Limiter ومعالجة المدخلات الخاطئة (400 Bad Request, 404 Not Found).
3. **اختبار منع الاعتماد الخارجي (Offline Guardrail Test):**
   - فحص شجرة الملفات والتأكد التام من خلو الكود من أي طلبات شبكية خارجية موجهة لمواقع أو خدمات قرآنية أخرى.
4. **سير العمل الآلي (GitHub Actions):**
   - تشغيل الـ Linter واختبارات النزاهة وبناء صورة Docker في كل Pull Request و Push.

---

## 📂 11. الهيكلية الكاملة لمجلدات المشروع

```text
quran-api/
├── .github/
│   └── workflows/
│       └── ci.yml
├── data/
│   ├── quran/
│   │   ├── surahs.json
│   │   ├── ayahs_uthmani.json
│   │   ├── ayahs_simple.json
│   │   └── manifest.json
│   ├── adhkar/
│   │   ├── categories.json
│   │   ├── adhkar.json
│   │   └── manifest.json
│   ├── dua/
│   │   ├── dua.json
│   │   └── manifest.json
│   ├── metadata/
│   │   ├── juz.json
│   │   └── pages.json
│   ├── translations/
│   │   └── en.saheeh.json
│   └── tafsir/
│       └── ar.muyassar.json
├── docker/
│   └── init-db.sql
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   └── playground.js
│   ├── index.html
│   ├── playground.html
│   └── status.html
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/
│   │       │   ├── surahs.routes.ts
│   │       │   ├── ayahs.routes.ts
│   │       │   ├── juz.routes.ts
│   │       │   ├── pages.routes.ts
│   │       │   ├── search.routes.ts
│   │       │   ├── adhkar.routes.ts
│   │       │   ├── tafsir.routes.ts
│   │       │   └── system.routes.ts
│   │       └── controllers/
│   ├── cache/
│   │   └── cache.service.ts
│   ├── config/
│   │   └── env.ts
│   ├── database/
│   │   ├── connection.ts
│   │   └── schema.sql
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── requestId.ts
│   │   └── security.ts
│   ├── services/
│   │   ├── quran.service.ts
│   │   ├── adhkar.service.ts
│   │   └── search.service.ts
│   ├── utils/
│   │   ├── arabicNormalizer.ts
│   │   ├── responseEnvelope.ts
│   │   └── logger.ts
│   ├── app.ts
│   └── server.ts
├── scripts/
│   ├── importers/
│   │   ├── adapters/
│   │   ├── validator.ts
│   │   ├── normalizer.ts
│   │   └── ingest.ts
│   ├── validate-data.ts
│   └── guard-no-external-calls.ts
├── tests/
│   ├── api.test.ts
│   ├── adhkar.test.ts
│   ├── data-integrity.test.ts
│   └── guardrail.test.ts
├── .dockerignore
├── .env.example
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── Dockerfile
├── docker-compose.yml
├── LICENSE
├── NOTICE.md
├── package.json
├── README.md
├── SECURITY.md
└── tsconfig.json
```

---

## 🚀 12. خارطة طريق التنفيذ خطوة بخطوة

* **المرحلة 1: خط أنابيب التجميع والبيانات المحلية الموثوقة (Data Pipeline & Integrity):**
  - بناء محولات الاستيراد (`Source Adapters`) للقرآن الكريم، الأذكار، الأدعية، والتفاسير.
  - بناء سكربت التحقق الشامل `npm run validate:data` وتوليد ملفات الـ `manifest.json` مع البصمات والرخص.
* **المرحلة 2: إعداد بيئة التطوير وقاعدة البيانات (Node.js/TypeScript + PostgreSQL):**
  - تجهيز `package.json` و `tsconfig.json` ومكتبات الأمان والأداء.
  - كتابة مخطط قاعدة البيانات والفهارس الذكية، وسكربت التغذية التلقائية عالي الكفاءة (`npm run db:seed`).
* **المرحلة 3: بناء الـ RESTful API ومحرك البحث (API Core & Search Engine):**
  - تطوير كافة مسارات القرآن، الأذكار، الأدعية، التفسير، والبحث العربي المتقدم.
  - تطبيق الـ Middleware (الأمان، Rate Limiting، الكاش المزدوج In-Memory/Redis، معالجة الأخطاء الآمنة).
* **المرحلة 4: البوابة التفاعلية والمختبر (Web Portal & Playground):**
  - تطوير الصفحة الرئيسية العصرية، مختبر التجارب الحي (`/playground`)، صفحة الحالة (`/status`)، وتوثيق Swagger (`/docs`).
* **المرحلة 5: بيئة التشغيل السحابي والحاويات (Docker & Compose):**
  - إعداد `Dockerfile` متعدد المراحل و `docker-compose.yml` مع تفعيل التهيئة الآلية لأول تشغيل.
* **المرحلة 6: الاختبارات الشاملة والـ Guardrails:**
  - كتابة اختبارات المسارات والوحدات، واختبار فحص الكود لمنع أي اتصال خارجي.
* **المرحلة 7: توثيق النشر وOpen Source Readiness:**
  - صياغة ملف `README.md` الاحترافي، `NOTICE.md`، `LICENSE`، وإعداد GitHub Actions CI.
