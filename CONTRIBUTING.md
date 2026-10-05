# Contributing to Quran API

Thank you for your interest in contributing to **Quran API**! This project is 100% open source, community-driven, and designed for developers worldwide.

---

## 🏛️ Guiding Architectural Principle

> **CRITICAL RULE:** This project is strictly **Self-Hosted & Offline-First**.  
> **NO external Quran API calls are permitted during runtime.**  
> Any PR introducing `fetch()`, `axios()`, or external HTTP requests for Quranic text inside `src/` will be rejected by our automated offline guardrail.

---

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/USERNAME/quran-api.git
   cd quran-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Validate local dataset integrity:**
   ```bash
   npm run validate:data
   ```

4. **Run tests & guardrail:**
   ```bash
   npm test
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the landing page and playground.

---

## 📋 Pull Request Guidelines

1. Ensure all TypeScript types are strictly checked: `npm run typecheck`.
2. Ensure all tests pass: `npm test`.
3. Verify the offline guardrail: `npm run guard:offline`.
4. Keep commit messages clear, concise, and descriptive.
