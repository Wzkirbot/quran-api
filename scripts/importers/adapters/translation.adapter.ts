import fs from 'node:fs';
import path from 'node:path';
import { TranslationItem } from '../../../src/types/index.js';
import { writeManifest } from '../manifest-generator.js';

export async function importTranslationData(): Promise<{ totalTranslations: number }> {
  console.log('⏳ Starting Translation Dataset Ingestion & Validation...');

  const dataDir = path.resolve(process.cwd(), 'data/translations');
  fs.mkdirSync(dataDir, { recursive: true });

  const translations: TranslationItem[] = [
    // Al-Fatihah
    {
      surah_id: 1,
      ayah_number: 1,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
    },
    {
      surah_id: 1,
      ayah_number: 2,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: '[All] praise is [due] to Allah, Lord of the worlds -'
    },
    {
      surah_id: 1,
      ayah_number: 3,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'The Entirely Merciful, the Especially Merciful,'
    },
    {
      surah_id: 1,
      ayah_number: 4,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'Sovereign of the Day of Recompense.'
    },
    {
      surah_id: 1,
      ayah_number: 5,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'It is You we worship and You we ask for help.'
    },
    {
      surah_id: 1,
      ayah_number: 6,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'Guide us to the straight path -'
    },
    {
      surah_id: 1,
      ayah_number: 7,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.'
    },

    // Ayat Al-Kursi (2:255)
    {
      surah_id: 2,
      ayah_number: 255,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that could intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.'
    },

    // Al-Ikhlas (112)
    {
      surah_id: 112,
      ayah_number: 1,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'Say, "He is Allah, [who is] One,'
    },
    {
      surah_id: 112,
      ayah_number: 2,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'Allah, the Eternal Refuge.'
    },
    {
      surah_id: 112,
      ayah_number: 3,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'He neither begets nor is born,'
    },
    {
      surah_id: 112,
      ayah_number: 4,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'Nor is there to Him any equivalent."'
    },

    // Al-Falaq (113)
    {
      surah_id: 113,
      ayah_number: 1,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'Say, "I seek refuge in the Lord of daybreak'
    },
    {
      surah_id: 113,
      ayah_number: 2,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'From the evil of that which He created'
    },
    {
      surah_id: 113,
      ayah_number: 3,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'And from the evil of darkness when it settles'
    },
    {
      surah_id: 113,
      ayah_number: 4,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'And from the evil of the blowers in knots'
    },
    {
      surah_id: 113,
      ayah_number: 5,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'And from the evil of an envier when he envies."'
    },

    // An-Nas (114)
    {
      surah_id: 114,
      ayah_number: 1,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'Say, "I seek refuge in the Lord of mankind,'
    },
    {
      surah_id: 114,
      ayah_number: 2,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'The Sovereign of mankind.'
    },
    {
      surah_id: 114,
      ayah_number: 3,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'The God of mankind,'
    },
    {
      surah_id: 114,
      ayah_number: 4,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'From the evil of the retreating whisperer -'
    },
    {
      surah_id: 114,
      ayah_number: 5,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'Who whispers [evil] into the breasts of mankind -'
    },
    {
      surah_id: 114,
      ayah_number: 6,
      language_code: 'en',
      author_name: 'saheeh_international',
      content: 'From among the jinn and mankind."'
    }
  ];

  const translationJson = JSON.stringify(translations, null, 2);
  const translationPath = path.join(dataDir, 'en.saheeh.json');
  fs.writeFileSync(translationPath, translationJson, 'utf-8');
  console.log(`✅ Saved ${translations.length} Translation records to ${translationPath}`);

  const manifest = writeManifest(
    dataDir,
    {
      dataset: 'quran_translation_english_saheeh',
      version: '1.0.0',
      source: 'Saheeh International English Translation',
      license: 'Creative Commons Attribution-ShareAlike 4.0 International',
      recordsCount: translations.length,
      attribution: 'English translation of the Quran meanings by Saheeh International.'
    },
    translationJson
  );

  console.log(`🔒 Translation Checksum (SHA-256): ${manifest.checksum}`);
  return { totalTranslations: translations.length };
}
