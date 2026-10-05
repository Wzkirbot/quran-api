# Quran API

<p align="center">
  <strong>Free, Open Source & Self-Hosted Quran REST API for Developers</strong><br>
  <em>100% Local Data • Zero External Runtime Dependencies • Blazing-Fast • Production Hardened</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Language-TypeScript%20%28Strict%29-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Runtime-Node.js%20LTS-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Cache-In--Memory%20%2B%20Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Architecture-100%25%20Offline--First-10B981?style=for-the-badge" alt="Offline-First">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License">
</p>

---

## Overview: Why Quran API?

Most religious and Quranic APIs available today act as external proxies or cloud services requiring API keys, payment tiers, or constant internet connectivity. If the external provider goes down, client applications break.

**Quran API** is built on a different philosophy: **Total Autonomy, Ownership & Data Reliability**.
- **Zero External Runtime Dependency:** All 114 Surahs, 6,236 Ayahs, 30 Juz, 604 Madinah Mushaf Pages, authentic Adhkar from *Hisn al-Muslim*, Duas, and Tafsir are stored **locally** in your database and cache.
- **Offline-First:** The server requires zero outbound network calls to serve requests. Even with your server disconnected from the internet, the API, website, and interactive playground operate at 100% performance.
- **Automated Guardrail:** Includes an automated static analysis test that scans the runtime codebase to guarantee no outbound Quran API calls exist.

---

## System Architecture

```text
 ┌────────────────────────────────────────────────────────┐
 │           1. Trusted / Licensed Sources                │
 │  (Tanzil.net, King Fahd Complex, Hisn al-Muslim)       │
 └──────────────────────────┬─────────────────────────────┘
                            │ One-Time Ingestion (Build/Seed)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │    2. Data Acquisition & Integrity Pipeline            │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │ Source Adapters (Quran, Adhkar, Dua, Tafsir)     │  │
 │  │ Validation (Checks 114 Surahs, 6236 Ayahs, UTF8) │  │
 │  │ Normalization (Uthmani + Simple Search Script)   │  │
 │  │ Checksum Manifests (SHA-256 Provenance)          │  │
 │  └──────────────────────────────────────────────────┘  │
 └──────────────────────────┬─────────────────────────────┘
                            │ Stored Locally
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │            3. Local Authoritative Storage              │
 │          Local JSON Files + PostgreSQL Database        │
 └──────────────────────────┬─────────────────────────────┘
                            │ Served Locally (Zero Network Requests)
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │               4. Quran REST API Service                │
 │   Dual Cache (In-Memory LRU / Redis) • Rate Limiting   │
 └──────────────────────────┬─────────────────────────────┘
                            │ REST API Responses
                            ▼
                      [ Developers ]
```

---

## Key Features

- **Complete Holy Quran:**
  - 114 Surahs with revelation order, Arabic/English names, and classification (Meccan/Medinan).
  - 6,236 Ayahs with verified Uthmani script and diacritic-stripped search text.
  - Section mapping: 30 Ajza' (الأجزاء) and 240 Ahzab quarters.
  - Page mapping: 604 standard pages of the Madinah Mushaf.
- **Authentic Adhkar & Duas:**
  - Hisn al-Muslim Remembrance categorized by time and occasion (Morning, Evening, Sleep, Prayer, etc.) with repeat counts, virtues, and authenticated Hadith references.
  - Quranic Rabbana prayers and Prophetic supplications.
- **Tafsir & Meanings:**
  - Al-Tafsir Al-Muyassar (مجمع الملك فهد).
  - Saheeh International English translation.
- **Intelligent Arabic Search:**
  - Fast normalized search converting diacritics, Alef forms, and Waw with dagger Alif (`الصلاة`, `الزكاة`, `الحياة`).
  - PostgreSQL GIN Trigram indexes for sub-millisecond query execution.
- **Enterprise Hardening:**
  - Configurable Rate Limiting via `.env`.
  - Helmet security headers, CORS protection, and request ID tracking (`X-Request-Id`).
  - Parameterized queries to eliminate SQL injection.
- **Interactive Developer Portal:**
  - **Landing Page (`/`):** Modern dark mode showcase.
  - **OpenAPI / Swagger UI (`/docs`):** Interactive API reference.
  - **API Playground (`/playground`):** Test live local queries, inspect response latency, and generate cURL commands.
  - **Status Dashboard (`/status`):** Real-time local health monitoring for API, Database, and Cache.

---

## Quick Start with Docker (Recommended)

Start the complete stack (API + PostgreSQL + Redis) in 30 seconds:

```bash
# 1. Clone the repository
git clone https://github.com/USERNAME/quran-api.git
cd quran-api

# 2. Copy the environment variables
cp .env.example .env

# 3. Start containers with Docker Compose
docker compose up -d
```

Once running, access:
- **API Base:** `http://localhost:3000/v1`
- **Interactive Playground:** `http://localhost:3000/playground`
- **Swagger Documentation:** `http://localhost:3000/docs`
- **System Status:** `http://localhost:3000/status`

---

## Local Development Setup

Prerequisites: **Node.js v20+** and **npm v10+**.

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Validate dataset integrity
npm run validate:data

# 4. Run tests and offline guardrail audit
npm test

# 5. Start development server with live reload
npm run dev
```

---

## REST API Reference (`/v1`)

### Response Envelope
All API endpoints return a standardized JSON response:

```json
// Success Response (200 OK)
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-05T19:30:00.000Z",
    "requestId": "c1f7a240-...",
    "total": 1
  }
}

// Error Response (4xx / 5xx)
{
  "success": false,
  "error": {
    "code": "AYAH_NOT_FOUND",
    "message": "Ayah with reference \"2:999\" was not found."
  },
  "meta": {
    "timestamp": "2026-10-05T19:30:00.000Z",
    "requestId": "c1f7a240-..."
  }
}
```

### Endpoints Table

| Method | Endpoint | Description | Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/v1/surahs` | List all 114 Surahs | `curl http://localhost:3000/v1/surahs` |
| `GET` | `/v1/surahs/:id` | Get single Surah by ID (1-114) | `curl http://localhost:3000/v1/surahs/1` |
| `GET` | `/v1/surahs/:id/ayahs` | Get paginated Ayahs of a Surah | `curl http://localhost:3000/v1/surahs/1/ayahs?page=1&limit=10` |
| `GET` | `/v1/ayahs/:reference` | Get Ayah by reference (`2:255` or global `262`) | `curl http://localhost:3000/v1/ayahs/2:255` |
| `GET` | `/v1/ayahs/random` | Get random Ayah from local database | `curl http://localhost:3000/v1/ayahs/random` |
| `GET` | `/v1/search?q=...` | High-performance Arabic text search | `curl "http://localhost:3000/v1/search?q=الصلاة&limit=10"` |
| `GET` | `/v1/juz` | List all 30 Juz boundaries | `curl http://localhost:3000/v1/juz` |
| `GET` | `/v1/juz/:id` | Get Ayahs of a specific Juz (1-30) | `curl http://localhost:3000/v1/juz/1` |
| `GET` | `/v1/pages/:number` | Get Ayahs on Madinah Mushaf page (1-604) | `curl http://localhost:3000/v1/pages/1` |
| `GET` | `/v1/adhkar/categories` | List all Adhkar categories | `curl http://localhost:3000/v1/adhkar/categories` |
| `GET` | `/v1/adhkar/category/:slug` | Get Adhkar items by category (e.g. `morning`) | `curl http://localhost:3000/v1/adhkar/category/morning` |
| `GET` | `/v1/adhkar/random` | Get a random Dhikr | `curl http://localhost:3000/v1/adhkar/random` |
| `GET` | `/v1/adhkar/duas` | Get Quranic and Prophetic Duas | `curl http://localhost:3000/v1/adhkar/duas?category=quranic` |
| `GET` | `/v1/tafsir/:surah/:ayah` | Get Al-Muyassar Tafsir of an Ayah | `curl http://localhost:3000/v1/tafsir/1/1` |
| `GET` | `/v1/translations/:surah/:ayah` | Get English translation of an Ayah | `curl http://localhost:3000/v1/translations/1/1?lang=en` |
| `GET` | `/health` | Health Liveness probe | `curl http://localhost:3000/health` |
| `GET` | `/ready` | Database & Cache readiness probe | `curl http://localhost:3000/ready` |
| `GET` | `/version` | API version & dataset checksum manifests | `curl http://localhost:3000/version` |

---

## Security & Performance Tuning

Configuration is centralized in `.env`:

```env
# Rate Limiting (Configurable window and max requests)
RATE_LIMIT_WINDOW=1m
RATE_LIMIT_MAX=100

# Cache Configuration
CACHE_TTL_DEFAULT=3600
CACHE_TTL_SURAHS=86400
CACHE_TTL_SEARCH=1800

# Dual Cache Engine
# If REDIS_URL is provided, Redis is used.
# If REDIS_URL is blank or unavailable, the built-in In-Memory LRU cache operates automatically.
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=*
```

---

## Dataset Provenance & Licensing

All data in Quran API is verified, rigorously audited, and complies with open distribution terms:

- **Quran Text:** Tanzil Project ([tanzil.net](https://tanzil.net)) under the Tanzil Quran Text License / CC BY 3.0.
- **Section & Page Boundaries:** King Fahd Glorious Quran Printing Complex (مجمع الملك فهد).
- **Adhkar & Duas:** *Hisn al-Muslim* by Sheikh Saeed Al-Qahtani and Sahih Hadith collections.
- **Tafsir:** Al-Tafsir Al-Muyassar by King Fahd Complex.
- **Translations:** Saheeh International under CC BY-SA 4.0.

For full attribution details and checksums, see [NOTICE.md](NOTICE.md).

---

## Contributing & Community

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

```bash
# Run all tests and validation before submitting a PR
npm run typecheck
npm run validate:data
npm run guard:offline
npm test
```

---

## License

The software code is licensed under the **[MIT License](LICENSE)**.
