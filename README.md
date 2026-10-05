# Quran API

Free, Open Source and Self-Hosted Quran, Adhkar, and Islamic REST API for developers worldwide.

Built with TypeScript and Node.js. 100% Local Data, Zero External Runtime Dependencies, Offline-First Architecture, and Sub-Millisecond In-Memory Indexing.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%20(Strict)-3178C6.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js%20LTS-339933.svg)](https://nodejs.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Offline--First-10B981.svg)](#architecture)
[![Coverage](https://img.shields.io/badge/Tests-27%20Passed%20(100%25)-success.svg)](#testing-and-validation)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Prerequisites](#prerequisites)
- [Installation and Running](#installation-and-running)
  - [Method 1: Local Development (Node.js)](#method-1-local-development-nodejs)
  - [Method 2: Docker Compose (Production)](#method-2-docker-compose-production)
- [API Endpoints Reference](#api-endpoints-reference)
- [Code Examples: How to Fetch Data](#code-examples-how-to-fetch-data)
  - [1. List All Surahs](#1-list-all-surahs)
  - [2. Fetch a Specific Surah and its Verses](#2-fetch-a-specific-surah-and-its-verses)
  - [3. Fetch Verse by Reference or Number](#3-fetch-verse-by-reference-or-number)
  - [4. Fetch a Random Verse](#4-fetch-a-random-verse)
  - [5. Arabic Text Search](#5-arabic-text-search)
  - [6. Fetch Mushaf Pages and Juz](#6-fetch-mushaf-pages-and-juz)
  - [7. Fetch Tafsir (Al-Muyassar)](#7-fetch-tafsir-al-muyassar)
  - [8. Fetch English Translation (Saheeh International)](#8-fetch-english-translation-saheeh-international)
  - [9. Fetch Authentic Adhkar and Duas](#9-fetch-authentic-adhkar-and-duas)
  - [10. Fetch Audio Recitations](#10-fetch-audio-recitations)
- [Standard Response Envelope](#standard-response-envelope)
- [Instant Testing with requests.http](#instant-testing-with-requestshttp)
- [Testing and Validation](#testing-and-validation)
- [Configuration and Environment Variables](#configuration-and-environment-variables)
- [Data Provenance and Attribution](#data-provenance-and-attribution)
- [License and Copyright](#license-and-copyright)

---

## Overview

Most existing Quranic and Islamic APIs act as simple proxies to external cloud services, requiring third-party API keys, strict rate limits, and constant internet connectivity. If the external provider goes down, client applications break.

**Quran API** is built on a different philosophy: **Total Autonomy, Ownership, and Reliability**.

- **Zero External Runtime Dependency:** All 114 Surahs, 6,236 Ayahs, 30 Juz, 604 Madinah Mushaf Pages, authentic Adhkar from *Hisn al-Muslim*, Duas, and Tafsir are stored **locally** in your database and cache.
- **Offline-First:** The server requires zero outbound network calls to serve requests. Even with your server disconnected from the internet, the API operates at 100% capacity.
- **Automated Guardrail:** Includes an automated static analysis test that scans the runtime codebase to guarantee no outbound Quran API calls exist.
- **Sub-Millisecond Speed:** High-performance O(1) in-memory hash indexing delivers instantaneous responses under heavy concurrent loads.

---

## Architecture

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
  - Section mapping: 30 Ajza' (Parts) and 240 Ahzab quarters.
  - Page mapping: 604 standard pages of the Madinah Mushaf.
- **Authentic Adhkar and Duas:**
  - Hisn al-Muslim Remembrance categorized by time and occasion (Morning, Evening, Sleep, Prayer, etc.) with repeat counts, virtues, and authenticated Hadith references.
  - Quranic prayers and Prophetic supplications.
- **Tafsir and Translations:**
  - Al-Tafsir Al-Muyassar (King Fahd Complex).
  - Saheeh International English translation.
- **Audio Recitations:**
  - Audio endpoints for top verified reciters (Mishary Alafasy, Abdulbasit Abdussamad, Mahmud Khalil Al-Husary, Maher Al-Muaiqly, etc.) supporting both full-surah and single-ayah streaming.
- **Intelligent Arabic Search:**
  - Normalized search converting diacritics, Alef forms, and Waw with dagger Alif (`الصلاة`, `الزكاة`, `الحياة`).
- **Enterprise Hardening:**
  - Configurable Rate Limiting via `.env`.
  - Helmet security headers, CORS protection, and request ID tracking (`X-Request-Id`).
  - Parameterized queries to eliminate SQL injection.
  - Timing-safe API Key verification.

---

## Prerequisites

- **Node.js:** version 20.0.0 or higher.
- **npm:** version 10.0.0 or higher.
- *(Optional)* **Docker and Docker Compose:** for containerized deployment.

---

## Installation and Running

### Method 1: Local Development (Node.js)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Wzkirbot/quran-api.git
   cd quran-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Verify dataset integrity:**
   ```bash
   npm run validate:data
   ```

5. **Start the server:**
   - **Development mode (with auto-reload on file edit):**
     ```bash
     npm run dev
     ```
   - **Production mode (compiled TypeScript):**
     ```bash
     npm run build
     npm start
     ```

Once running, the API is available at:
```text
http://localhost:3000/v1
```

### Method 2: Docker Compose (Production)

To run the complete stack (API + PostgreSQL + Redis) in an isolated container:

```bash
# 1. Clone the repository
git clone https://github.com/Wzkirbot/quran-api.git
cd quran-api

# 2. Copy environment file
cp .env.example .env

# 3. Start containers
docker compose up -d
```

To stop the containers:
```bash
docker compose down
```

---

## API Endpoints Reference

All endpoints are prefixed with `/v1`.

| Method | Endpoint | Description | Example Request |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root Discovery & API metadata | `curl http://localhost:3000/` |
| `GET` | `/health` | Server Health & Liveness probe | `curl http://localhost:3000/health` |
| `GET` | `/ready` | Database & Cache readiness status | `curl http://localhost:3000/ready` |
| `GET` | `/version` | Dataset versions & checksum manifests | `curl http://localhost:3000/version` |
| `GET` | `/v1/surahs` | List all 114 Surahs | `curl http://localhost:3000/v1/surahs` |
| `GET` | `/v1/surahs/:id` | Get details for Surah (1-114) | `curl http://localhost:3000/v1/surahs/1` |
| `GET` | `/v1/surahs/:id/ayahs` | Get paginated Ayahs of a Surah | `curl http://localhost:3000/v1/surahs/1/ayahs?page=1&limit=10` |
| `GET` | `/v1/ayahs/:reference` | Get Ayah by `surah:ayah` or global ID | `curl http://localhost:3000/v1/ayahs/2:255` |
| `GET` | `/v1/ayahs/random` | Get a random Ayah | `curl http://localhost:3000/v1/ayahs/random` |
| `GET` | `/v1/search?q=...` | High-performance Arabic text search | `curl "http://localhost:3000/v1/search?q=الصلاة&limit=10"` |
| `GET` | `/v1/juz` | List all 30 Juz boundaries | `curl http://localhost:3000/v1/juz` |
| `GET` | `/v1/juz/:id` | Get Ayahs of Juz (1-30) | `curl http://localhost:3000/v1/juz/1` |
| `GET` | `/v1/pages/:number` | Get Ayahs on Madinah Mushaf page (1-604) | `curl http://localhost:3000/v1/pages/1` |
| `GET` | `/v1/tafsir/:surah/:ayah` | Get Al-Muyassar Tafsir of a verse | `curl http://localhost:3000/v1/tafsir/1/1` |
| `GET` | `/v1/translations/:surah/:ayah`| Get Saheeh International translation | `curl http://localhost:3000/v1/translations/1/1?lang=en` |
| `GET` | `/v1/adhkar/categories` | List all 9 Adhkar categories | `curl http://localhost:3000/v1/adhkar/categories` |
| `GET` | `/v1/adhkar/category/:slug` | Get Adhkar items by slug | `curl http://localhost:3000/v1/adhkar/category/morning` |
| `GET` | `/v1/adhkar/random` | Get random authentic Dhikr | `curl http://localhost:3000/v1/adhkar/random` |
| `GET` | `/v1/adhkar/duas` | List authentic Duas | `curl http://localhost:3000/v1/adhkar/duas` |
| `GET` | `/v1/reciters` | List verified audio reciters | `curl http://localhost:3000/v1/reciters` |
| `GET` | `/v1/audio/surah/:reciterId/:surahId` | Full Surah audio streaming URL | `curl http://localhost:3000/v1/audio/surah/alafasy/1` |
| `GET` | `/v1/audio/ayah/:reciterId/:surahId/:ayahNumber` | Single Ayah audio streaming URL | `curl http://localhost:3000/v1/audio/ayah/alafasy/1/1` |

---

## Code Examples: How to Fetch Data

### 1. List All Surahs

#### cURL
```bash
curl -X GET http://localhost:3000/v1/surahs
```

#### JavaScript / TypeScript
```javascript
const response = await fetch('http://localhost:3000/v1/surahs');
const result = await response.json();
console.log(`Total Surahs: ${result.data.length}`);
result.data.forEach(s => console.log(`${s.id}. ${s.name_ar} (${s.name_en})`));
```

#### Python
```python
import requests

res = requests.get('http://localhost:3000/v1/surahs')
surahs = res.json()['data']
for s in surahs:
    print(f"{s['id']}. {s['name_ar']} - {s['name_en']}")
```

---

### 2. Fetch a Specific Surah and its Verses

#### cURL
```bash
# Get Surah details
curl -X GET http://localhost:3000/v1/surahs/1

# Get all Ayahs of Surah Al-Fatihah
curl -X GET http://localhost:3000/v1/surahs/1/ayahs
```

#### JavaScript
```javascript
// Fetch Ayahs with pagination
const res = await fetch('http://localhost:3000/v1/surahs/1/ayahs?page=1&limit=7');
const { data: ayahs } = await res.json();

ayahs.forEach(ayah => {
  console.log(`[${ayah.ayah_number}] ${ayah.text_uthmani}`);
});
```

---

### 3. Fetch Verse by Reference or Number

#### cURL
```bash
# Ayat Al-Kursi (Surah 2, Verse 255)
curl -X GET http://localhost:3000/v1/ayahs/2:255

# Global Ayah number 1 (First Ayah of Al-Fatihah)
curl -X GET http://localhost:3000/v1/ayahs/1
```

#### JavaScript
```javascript
const res = await fetch('http://localhost:3000/v1/ayahs/2:255');
const { data: ayah } = await res.json();
console.log(ayah.text_uthmani);
// Output: ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ...
```

---

### 4. Fetch a Random Verse

#### cURL
```bash
curl -X GET http://localhost:3000/v1/ayahs/random
```

#### JavaScript
```javascript
const res = await fetch('http://localhost:3000/v1/ayahs/random');
const { data: ayah } = await res.json();
console.log(`Surah ${ayah.surah_id}, Verse ${ayah.ayah_number}: ${ayah.text_uthmani}`);
```

---

### 5. Arabic Text Search

Performs instant normalized search matching diacritics, Alef variants, and orthographic signs.

#### cURL
```bash
curl -X GET "http://localhost:3000/v1/search?q=الصلاة&limit=5"
```

#### JavaScript
```javascript
const query = 'الصلاة';
const res = await fetch(`http://localhost:3000/v1/search?q=${encodeURIComponent(query)}&limit=10`);
const { data: results, meta } = await res.json();

console.log(`Found ${meta.total} matches for "${query}":`);
results.forEach(r => {
  console.log(`Surah ${r.surah_id}:${r.ayah_number} -> ${r.text_uthmani}`);
});
```

---

### 6. Fetch Mushaf Pages and Juz

#### cURL
```bash
# Get Page 1 of Madinah Mushaf (Pages 1 to 604)
curl -X GET http://localhost:3000/v1/pages/1

# Get Juz 30 (Amma)
curl -X GET http://localhost:3000/v1/juz/30
```

#### JavaScript
```javascript
// Fetch page 604 (Surahs Al-Ikhlas, Al-Falaq, An-Nas)
const res = await fetch('http://localhost:3000/v1/pages/604');
const { data: pageData } = await res.json();

pageData.ayahs.forEach(a => console.log(a.text_uthmani));
```

---

### 7. Fetch Tafsir (Al-Muyassar)

#### cURL
```bash
# Tafsir of Surah Al-Fatihah, Verse 1
curl -X GET http://localhost:3000/v1/tafsir/1/1
```

#### JavaScript
```javascript
const res = await fetch('http://localhost:3000/v1/tafsir/1/1');
const { data } = await res.json();
console.log(`التفسير الميسر: ${data.text}`);
```

---

### 8. Fetch English Translation (Saheeh International)

#### cURL
```bash
# Translation of Surah Al-Fatihah, Verse 1
curl -X GET "http://localhost:3000/v1/translations/1/1?lang=en"
```

#### JavaScript
```javascript
const res = await fetch('http://localhost:3000/v1/translations/1/1?lang=en');
const { data } = await res.json();
console.log(`Translation: ${data.text}`);
// In the name of Allah, the Entirely Merciful, the Especially Merciful.
```

---

### 9. Fetch Authentic Adhkar and Duas

#### cURL
```bash
# List all categories (morning, evening, sleep, prayer, wake_up, etc.)
curl -X GET http://localhost:3000/v1/adhkar/categories

# Get Morning Remembrance items
curl -X GET http://localhost:3000/v1/adhkar/category/morning

# Get Authentic Prophetic & Quranic Duas
curl -X GET http://localhost:3000/v1/adhkar/duas
```

#### JavaScript
```javascript
const res = await fetch('http://localhost:3000/v1/adhkar/category/morning');
const { data } = await res.json();

data.items.forEach(item => {
  console.log(`الذكر: ${item.text_ar}`);
  console.log(`التكرار: ${item.repeat_count} | الفضل: ${item.virtue}`);
});
```

---

### 10. Fetch Audio Recitations

#### cURL
```bash
# List all verified reciters
curl -X GET http://localhost:3000/v1/reciters

# Get complete Surah audio URL (e.g. Al-Fatihah by Mishary Alafasy)
curl -X GET http://localhost:3000/v1/audio/surah/alafasy/1

# Get single Ayah audio URL (Surah 1, Ayah 1 by Alafasy)
curl -X GET http://localhost:3000/v1/audio/ayah/alafasy/1/1
```

#### JavaScript
```javascript
const res = await fetch('http://localhost:3000/v1/audio/surah/alafasy/1');
const { data: track } = await res.json();
console.log(`Audio stream URL: ${track.audio_url}`);

// Play audio in HTML5:
const audio = new Audio(track.audio_url);
audio.play();
```

---

## Standard Response Envelope

All API endpoints return predictable, standardized JSON structures.

### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name_ar": "الفاتحة",
    "name_en": "Al-Fatihah",
    "name_transliteration": "Al-Faatiha",
    "type": "meccan",
    "total_ayahs": 7,
    "order_revelation": 5
  },
  "meta": {
    "timestamp": "2026-10-05T19:30:00.000Z",
    "requestId": "4e183788-2920-4a88-8ee8-688d0113f8c5"
  }
}
```

### Error Response (`4xx` / `5xx`)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Parameter 'id' must be an integer between 1 and 114"
  },
  "meta": {
    "timestamp": "2026-10-05T19:30:00.000Z",
    "requestId": "4e183788-2920-4a88-8ee8-688d0113f8c5"
  }
}
```

---

## Instant Testing with requests.http

A ready-to-execute [requests.http](requests.http) file is included at the root of this project.

If you use:
- **VS Code:** Install the `REST Client` extension, open `requests.http`, and click **Send Request** above any endpoint.
- **JetBrains (WebStorm / IntelliJ):** Open `requests.http` directly and click the green Play icon next to any request.

---

## Testing and Validation

Run the automated test suite and integrity audits:

```bash
# 1. Strict TypeScript compilation check
npm run typecheck

# 2. Validate all 114 Surahs, 6,236 Ayahs, and SHA-256 Checksums
npm run validate:data

# 3. Offline Guardrail static analysis test
npm run guard:offline

# 4. Full Jest Integration Test Suite (27 tests)
npm test
```

All 27 integration and integrity tests pass with 100% green coverage.

---

## Configuration and Environment Variables

Configuration is handled cleanly via `.env`:

```env
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database (PostgreSQL - Optional)
# If disconnected, API falls back to in-memory datasets automatically.
DATABASE_URL=postgres://quran_user:quran_pass@localhost:5432/quran_db

# Cache (Redis - Optional)
# If empty, built-in in-memory LRU cache operates automatically.
REDIS_URL=

# Rate Limiting
RATE_LIMIT_WINDOW=1m
RATE_LIMIT_MAX=100

# CORS Origins (Comma-separated or *)
CORS_ORIGIN=*

# API Key Security Guard (Optional)
REQUIRE_API_KEY=false
API_MASTER_KEY=
```

---

## Data Provenance and Attribution

All datasets bundled with Quran API are authentic, verified, and comply with open distribution terms:

- **Quran Text & Script:** Tanzil Project ([tanzil.net](https://tanzil.net)) under Tanzil Quran Text License / CC BY 3.0.
- **Section and Page Boundaries:** King Fahd Glorious Quran Printing Complex (مجمع الملك فهد لطباعة المصحف الشريف).
- **Adhkar & Duas:** *Hisn al-Muslim* (Fortress of the Muslim) by Sheikh Saeed Al-Qahtani and Sahih Hadith collections.
- **Tafsir:** Al-Tafsir Al-Muyassar (مجمع الملك فهد).
- **English Translation:** Saheeh International (CC BY-SA 4.0).

For full details, checksums, and license statements, see [NOTICE.md](NOTICE.md).

---

## License and Copyright

This project is licensed under the **[MIT License](LICENSE)**.

```text
Copyright (c) 2026 Wzkirbot & Quran API Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

Free to use, modify, distribute, and integrate in open-source, non-profit, or commercial applications.
