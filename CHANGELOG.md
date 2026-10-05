# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-05

### Added
- **Core REST API (`/v1`):**
  - Surahs listing (`GET /v1/surahs`) and details (`GET /v1/surahs/:id`).
  - Ayahs listing per Surah (`GET /v1/surahs/:id/ayahs`) with pagination.
  - Reference lookup (`GET /v1/ayahs/:reference`) by verse index (e.g. `2:255`) and global number.
  - Random Ayah generator (`GET /v1/ayahs/random`).
  - High-performance Arabic text search (`GET /v1/search`) with diacritics normalization.
  - Section endpoints: Juz boundaries (`GET /v1/juz`, `GET /v1/juz/:id`) and 604 Madinah Mushaf Pages (`GET /v1/pages/:number`).
  - Authentic Adhkar endpoints (`GET /v1/adhkar/categories`, `GET /v1/adhkar/category/:slug`, `GET /v1/adhkar/random`, `GET /v1/adhkar/search`).
  - Quranic & Prophetic Duas (`GET /v1/adhkar/duas`).
  - Al-Muyassar Tafsir and Saheeh International English translation endpoints.
  - System diagnostics (`GET /health`, `GET /ready`, `GET /version`).
- **Data Acquisition & Ownership Pipeline:**
  - One-time data acquisition adapters for Tanzil, Hisn al-Muslim, and King Fahd Complex.
  - SHA-256 Checksum manifests for data verification and legal provenance.
  - Automated integrity validator (`npm run validate:data`).
  - Automated runtime offline guardrail audit (`npm run guard:offline`).
- **Architecture & Infrastructure:**
  - Strict TypeScript + Node.js LTS setup.
  - PostgreSQL schema with B-Tree and GIN Trigram indexes.
  - Dual-layer cache with In-Memory LRU fallback and automatic Redis detection.
  - Rate limiting, Helmet security headers, CORS, and request ID tracking.
  - Multi-stage Dockerfile and Docker Compose configuration.
- **Web Portal & Developer Tools:**
  - Interactive Landing Page (`/`).
  - Live API Request Studio / Playground (`/playground`).
  - Real-time self-hosted Status Dashboard (`/status`).
  - Swagger UI OpenAPI documentation (`/docs`).
