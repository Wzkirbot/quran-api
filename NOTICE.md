# Dataset Attribution, Provenance & Licensing Notice

This document details the provenance, licensing, versioning, and distribution terms for all religious and linguistic datasets included in the **Quran API** project.

---

## 1. The Holy Quran (Arabic Text & Metadata)

- **Primary Source:** [Tanzil Project](https://tanzil.net)
- **Script / Variant:** Hafs from 'Aasim (رواية حفص عن عاصم بالرسم العثماني)
- **Version:** Tanzil Text 1.1
- **License:** Tanzil Quran Text License / Creative Commons Attribution 3.0 Unported (CC BY 3.0)
- **Attribution Notice:**
  > "The Arabic Quran text is provided by the Tanzil Project (https://tanzil.net). Verbatim copying and distribution of this text are permitted provided this notice and link remain intact."
- **Integrity Validation:** Exactly 114 Surahs and 6,236 Ayahs. Verified through `npm run validate:data`.
- **How to Update:** Run `npm run import:quran` to refresh the local dataset.

---

## 2. Madinah Mushaf Page & Section Boundaries

- **Source:** King Fahd Glorious Quran Printing Complex (مجمع الملك فهد لطباعة المصحف الشريف)
- **Boundaries:** 604 standard pages, 30 Ajza' (الأجزاء), and 240 Ahzab quarters (أرباع الأحزاب).
- **License:** Open educational and non-commercial religious reference standard.

---

## 3. Adhkar & Duas (Remembrance & Supplications)

- **Primary Source:** *Hisn al-Muslim (Fortress of the Muslim)* by Sheikh Saeed bin Ali bin Wahf Al-Qahtani, along with primary Sahih Hadith collections (Sahih al-Bukhari, Sahih Muslim, Sunan Abi Dawud, Jami` at-Tirmidhi).
- **License:** Public Domain / Free for open educational and religious distribution.
- **Verification:** Every entry is accompanied by authenticated references and hadith citations.

---

## 4. Quranic Exegesis (Al-Tafsir Al-Muyassar)

- **Source:** King Fahd Glorious Quran Printing Complex (مجمع الملك فهد لطباعة المصحف الشريف - المدينة المنورة)
- **License:** Open for educational and religious non-commercial dissemination.
- **Attribution:** Al-Tafsir Al-Muyassar compiled by an elite committee of Islamic scholars under the supervision of the King Fahd Complex.

---

## 5. English Translation of Quran Meanings

- **Source:** Saheeh International Translation
- **License:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
- **Attribution:** English translation of Quran meanings translated by Saheeh International (Amatullah J. Bantley, Mary M. Kennedy, Aminah Assami).

---

## 6. Software Code License

All software code in this repository (TypeScript, Express server, seeder pipelines, tests, docker configurations, and web playground) is licensed under the **MIT License**. See [LICENSE](LICENSE) for terms.
